
using backend.Data;
using backend.Dtos;
using backend.Enums;
using backend.Exceptions;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using ModelAttribute = backend.Models.Attribute;

namespace backend.Services;

public class PositionsRequirementService(ApplicationDbContext _db) : IPositionRequirementService
{


    public async Task<List<PositionRequirementDto>> GetForPositionAsync(Guid positionId)
    {
        var positionExists = await _db.Positions.AnyAsync(p => p.Id == positionId);
        if (!positionExists)
        {
            throw new NotFoundException("Position was not found.");
        }

        var requirements = await _db.PositionsRequirement.Include(r => r.Attribute).Where(r => r.PositionId == positionId).OrderBy(r => r.CreatedAt).ToListAsync();
        return requirements.Select(r => MapToDto(r, r.Attribute)).ToList();
    }

    public async Task<PositionRequirementDto> AddAsync(Guid positionId, Guid userId, Roles role, CreatePositionRequirementDto dto)
    {
        var position = await _db.Positions.FirstOrDefaultAsync(p => p.Id == positionId)
            ?? throw new NotFoundException("Position was not found.");


        var attribute = await _db.Attribute.Include(a => a.Values).FirstOrDefaultAsync(a => a.Id == dto.AttributeId) ?? throw new NotFoundException("Attribute was not found.");

        var duplicate = await _db.PositionsRequirement.AnyAsync(r => r.PositionId == positionId && r.AttributeId == dto.AttributeId);
        if (duplicate)
        {
            throw new ConflictException("A requirement for this attribute already exists on this position.");
        }

        var requirement = BuildRequirement(positionId, attribute, dto.Operator, dto.Value, dto.SecondValue,dto.HasRequirement);
        _db.PositionsRequirement.Add(requirement);
        position.UpdatedAt = DateTime.UtcNow;
        position.Version += 1;
        await _db.SaveChangesAsync();
        return MapToDto(requirement, attribute);
    }

    public async Task<PositionRequirementDto> UpdateAsync(Guid positionId, Guid requirementId, Guid userId, Roles role, UpdatePositionRequirementDto dto)
    {
        var position = await _db.Positions.FirstOrDefaultAsync(p => p.Id == positionId) ?? throw new NotFoundException("Position was not found.");
        var requirement = await _db.PositionsRequirement.Include(r => r.Attribute).ThenInclude(a => a.Values)
        .FirstOrDefaultAsync(r => r.Id == requirementId && r.PositionId == positionId)
            ?? throw new NotFoundException("Requirement was not found.");

        if (requirement.Version != dto.Version)
        {
            throw new ConflictException("Requirement was modified by someone else since you loaded it. Refresh and try again.");
        }
        ValidateOperatorForAttribute(requirement.Attribute,dto.HasRequirement, dto.Operator, dto.Value, dto.SecondValue);
        requirement.Operator = dto.Operator;
        requirement.Value = dto.Value?.Trim();
        requirement.SecondValue = dto.SecondValue?.Trim();
        requirement.UpdatedAt = DateTime.UtcNow;
        requirement.Version += 1;
        requirement.HasRequirement= dto.HasRequirement;
        position.UpdatedAt = DateTime.UtcNow;
        position.Version += 1;
        await _db.SaveChangesAsync();
        return MapToDto(requirement, requirement.Attribute);
    }

    public async Task DeleteAsync(Guid positionId, Guid requirementId, Guid userId, Roles role)
    {
        var position = await _db.Positions.FirstOrDefaultAsync(p => p.Id == positionId)
            ?? throw new NotFoundException("Position was not found.");


        var requirement = await _db.PositionsRequirement.FirstOrDefaultAsync(r => r.Id == requirementId && r.PositionId == positionId)
            ?? throw new NotFoundException("Requirement was not found.");
        _db.PositionsRequirement.Remove(requirement);
        position.UpdatedAt = DateTime.UtcNow;
        position.Version += 1;

        await _db.SaveChangesAsync();
    }


    private static readonly Dictionary<AttributeType, RequirementOperator[]> AllowedOperators = new()
    {
        [AttributeType.String] = new[] { RequirementOperator.Equals, RequirementOperator.NotEquals, RequirementOperator.Contains, RequirementOperator.StartsWith, RequirementOperator.EndsWith, RequirementOperator.In },
        [AttributeType.Text] = new[] { RequirementOperator.Equals, RequirementOperator.NotEquals, RequirementOperator.Contains, RequirementOperator.StartsWith, RequirementOperator.EndsWith },
        [AttributeType.Numeric] = new[] { RequirementOperator.Equals, RequirementOperator.NotEquals, RequirementOperator.GreaterThan, RequirementOperator.GreaterThanOrEqual, RequirementOperator.LessThan, RequirementOperator.LessThanOrEqual, RequirementOperator.Between },
        [AttributeType.Date] = new[] { RequirementOperator.Equals, RequirementOperator.NotEquals, RequirementOperator.GreaterThan, RequirementOperator.GreaterThanOrEqual, RequirementOperator.LessThan, RequirementOperator.LessThanOrEqual, RequirementOperator.Between },
        [AttributeType.Period] = new[] { RequirementOperator.GreaterThan, RequirementOperator.GreaterThanOrEqual, RequirementOperator.LessThan, RequirementOperator.LessThanOrEqual, RequirementOperator.Between },
        [AttributeType.Boolean] = new[] { RequirementOperator.Equals, RequirementOperator.NotEquals },
        [AttributeType.Dropdown] = new[] { RequirementOperator.Equals, RequirementOperator.NotEquals, RequirementOperator.In }
    };

    private static PositionRequirement BuildRequirement(Guid positionId, ModelAttribute attribute, RequirementOperator? op, string? value, string? secondValue,bool HasRequirement)
    {
        ValidateOperatorForAttribute(attribute,HasRequirement, op, value, secondValue);

        return new PositionRequirement
        {
            Id = Guid.NewGuid(),
            PositionId = positionId,
            AttributeId = attribute.Id,
            Operator = op,
            Value = value?.Trim(),
            SecondValue = secondValue?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            HasRequirement = HasRequirement,
            Version = 1
        };
    }

    private static void ValidateOperatorForAttribute(ModelAttribute attribute,bool hasRequirement, RequirementOperator? op, string? value, string? secondValue)
    {
        if (hasRequirement==true && !attribute.IsFilterable)
            throw new ConflictException($"Attribute '{attribute.Title}' is not filterable and cannot be used as a position requirement.");

        if (op is null)
        {
            return ;
        }

        if (!AllowedOperators.TryGetValue(attribute.Type, out var operators) || !operators.Contains(op.Value))
            throw new ConflictException($"Operator '{op}' is not valid for attribute type '{attribute.Type}'.");

        if (string.IsNullOrWhiteSpace(value))
            throw new ConflictException("A value is required for this requirement.");

        if (op == RequirementOperator.Between && string.IsNullOrWhiteSpace(secondValue))
            throw new ConflictException("Operator 'Between' requires a second value.");

        switch (attribute.Type)
        {
            case AttributeType.Numeric:
                ValidateNumeric(value);
                if (op == RequirementOperator.Between) ValidateNumeric(secondValue!);
                break;

            case AttributeType.Date:
            case AttributeType.Period:
                ValidateDate(value);
                if (op == RequirementOperator.Between) ValidateDate(secondValue!);
                break;

            case AttributeType.Boolean:
                if (!bool.TryParse(value, out _))
                    throw new ConflictException("A Boolean attribute value must be 'true' or 'false'.");
                break;

            case AttributeType.Dropdown:
                ValidateDropdownValue(attribute, value, op);
                break;
        }
    }

    private static void ValidateNumeric(string value)
    {
        if (!decimal.TryParse(value, out _))
            throw new ConflictException($"'{value}' is not a valid number.");
    }

    private static void ValidateDate(string value)
    {
        if (!DateTime.TryParse(value, out _))
            throw new ConflictException($"'{value}' is not a valid date.");
    }

    private static void ValidateDropdownValue(ModelAttribute attribute, string value, RequirementOperator? op)
    {
        var validValues = attribute.Values.Select(v => v.Value).ToHashSet(StringComparer.OrdinalIgnoreCase);

        var tokens = op == RequirementOperator.In
            ? value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            : new[] { value };

        if (tokens.Length == 0)
            throw new ConflictException("At least one option value is required.");

        foreach (var token in tokens)
        {
            if (!validValues.Contains(token))
                throw new ConflictException($"'{token}' is not a valid option for attribute '{attribute.Title}'.");
        }
    }

    private static PositionRequirementDto MapToDto(PositionRequirement requirement, ModelAttribute attribute)
    {
        return new PositionRequirementDto
        {
            Id = requirement.Id,
            AttributeId = requirement.AttributeId,
            AttributeTitle = attribute.Title,
            AttributeCategory = attribute.Category,
            AttributeType = attribute.Type,
            Operator = requirement.Operator,
            Value = requirement.Value,
            HasRequirement = requirement.HasRequirement,
            SecondValue = requirement.SecondValue,
            Version = requirement.Version,
            CreatedAt = requirement.CreatedAt,
            UpdatedAt = requirement.UpdatedAt
        };
    }
}