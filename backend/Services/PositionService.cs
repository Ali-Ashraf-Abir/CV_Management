using backend.Data;
using backend.Dtos;
using backend.Enums;
using backend.Exceptions;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class PositionService(ApplicationDbContext _db) : IPositionService
{
    public async Task<PositionDto> PositionByIdAsync(Guid id)
    {
        var position = await _db.Positions.Include(p => p.CreatedBy).Include(p=>p.Applications).FirstOrDefaultAsync(p => p.Id == id) ?? throw new NotFoundException("Position was not found.");
        var requirementsCount = await _db.PositionsRequirement.CountAsync(r => r.PositionId == id);
        return MapToDto(position, requirementsCount);
    }
    public async Task<List<PositionSummaryDto>> AllPositionsAsync(Guid userId, Roles role, PositionStatus? status)
    {
        var query = _db.Positions.AsQueryable();
        if (role == Roles.Recruiter)
            query = query.Where(p => p.CreatedById == userId);
        if (status is not null)
            query = query.Where(p => p.Status == status);
        return await query.OrderByDescending(p => p.CreatedAt).Select(p => new PositionSummaryDto
        {
            Id = p.Id,
            Title = p.Title,
            Status = p.Status,
            IsPublished = p.IsPublished,
            Deadline = p.Deadline,
            CreatedAt = p.CreatedAt,
            Version = p.Version,
            RequirementsCount = p.Requirements.Count
        })
            .ToListAsync();
    }

    public async Task<List<PositionSummaryDto>> MyPositionsAsync(Guid userId, PositionStatus? status)
    {
        var query = _db.Positions.Where(p => p.CreatedById == userId);
        if (status is not null)
            query = query.Where(p => p.Status == status);
        return await query.OrderByDescending(p => p.CreatedAt).Include(p=>p.Applications).Select(p => new PositionSummaryDto
        {
            Id = p.Id,
            Title = p.Title,
            Status = p.Status,
            IsPublished = p.IsPublished,
            Deadline = p.Deadline,
            CreatedAt = p.CreatedAt,
            Version = p.Version,
            RequirementsCount = p.Requirements.Count
        })
            .ToListAsync();
    }

    public async Task<PositionDto> CreatePositionAsync(CreatePositionDto dto, Guid userId)
    {

        var position = new Position
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            CreatedById = userId,
            Status = PositionStatus.Draft,
            IsPublished = false,
            Deadline = dto.Deadline,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Version = 1
        };

        _db.Positions.Add(position);
        await _db.SaveChangesAsync();

        return await PositionByIdAsync(position.Id);
    }

    public async Task<PositionDto> UpdatePositionAsnyac(UpdatePositionDto dto, Guid id, Guid userId, Roles role)
    {

        var pos = await _db.Positions.FirstOrDefaultAsync(u => u.Id == id);

        if (pos == null)
        {
            throw new NotFoundException("Positon Not Found");
        }
        if (pos.Version != dto.Version)
        {
            throw new ConflictException("A user already edited the position");
        }
        if (pos.CreatedById != userId && role != Roles.Administrator)
        {
            throw new UnauthorizedException("You do not have permission for this");
        }
        pos.Title = dto.Title.Trim();
        pos.Description = dto.Description.Trim();
        pos.Deadline = dto.Deadline;
        pos.UpdatedAt = DateTime.UtcNow;
        pos.Version += 1;
        await _db.SaveChangesAsync();
        return await PositionByIdAsync(id);


    }


    public async Task DeletePositionAsync(Guid id, Guid userId, Roles role)
    {
        var position = await _db.Positions.FirstOrDefaultAsync(p => p.Id == id) ?? throw new NotFoundException("Position was not found.");
        if (position.CreatedById != userId && role != Roles.Administrator)
        {
            throw new UnauthorizedException("You do not have permission for this");
        }
        _db.Positions.Remove(position);
        await _db.SaveChangesAsync();
    }
    public async Task<PositionDto> ChangeStatusAsync(Guid id, Guid userId, Roles role, PositionStatus newStatus)
    {
        var position = await _db.Positions.FirstOrDefaultAsync(p => p.Id == id) ?? throw new NotFoundException("Position was not found.");
        if (position.CreatedById != userId && role != Roles.Administrator)
        {
            throw new UnauthorizedException("You do not have permission for this");
        }
        ValidateStatusTransition(position.Status, newStatus);
        position.Status = newStatus;
        position.IsPublished = newStatus == PositionStatus.Published;
        position.UpdatedAt = DateTime.UtcNow;
        position.Version += 1;
        await _db.SaveChangesAsync();
        return await PositionByIdAsync(id);
    }

    private static readonly Dictionary<PositionStatus, PositionStatus[]> AllowedTransitions = new()
    {
        [PositionStatus.Draft] = new[] { PositionStatus.Published, PositionStatus.Archived },
        [PositionStatus.Published] = new[] { PositionStatus.Closed, PositionStatus.Archived },
        [PositionStatus.Closed] = new[] { PositionStatus.Published, PositionStatus.Archived },
        [PositionStatus.Archived] = Array.Empty<PositionStatus>()
    };

    private static void ValidateStatusTransition(PositionStatus current, PositionStatus next)
    {
        if (current == next)
            throw new ConflictException($"Position is already {current}.");
        if (!AllowedTransitions.TryGetValue(current, out var allowedNext) || !allowedNext.Contains(next))
            throw new ConflictException($"Cannot move a position from {current} to {next}.");
    }
    private static PositionDto MapToDto(Models.Position position, int requirementsCount)
    {
        return new PositionDto
        {
            Id = position.Id,
            Title = position.Title,
            Description = position.Description,
            CreatedById = position.CreatedById,
            CreatedByName = position.CreatedBy is null ? string.Empty : $"{position.CreatedBy.FirstName} {position.CreatedBy.LastName}".Trim(),
            Status = position.Status,
            Deadline = position.Deadline,
            IsPublished = position.IsPublished,
            CreatedAt = position.CreatedAt,
            UpdatedAt = position.UpdatedAt,
            Version = position.Version,
            RequirementsCount = requirementsCount
        };
    }
}