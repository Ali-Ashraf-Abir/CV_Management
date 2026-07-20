using backend.Data;
using backend.Dtos;
using backend.Enums;
using backend.Exceptions;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AttributeService(ApplicationDbContext _db) : IAttributeService
{
    public async Task<PagedResultDto<AttributeListDto>> GetAllAttributeAsync(
        string? search, string? category, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 20 : pageSize;

        var query = _db.Attribute.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category) && category != "all")
        {
            if (!Enum.TryParse<AttributeCategory>(category, ignoreCase: true, out var categoryEnum))
            {
                throw new BadRequestException($"Invalid category '{category}'.");
            }
            query = query.Where(a => a.Category == categoryEnum);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query
                .Where(a => a.SearchVector.Matches(EF.Functions.WebSearchToTsQuery("english", search)))
                .OrderByDescending(a => a.SearchVector.Rank(EF.Functions.WebSearchToTsQuery("english", search)));
        }
        else
        {
            query = query.OrderBy(a => a.Title);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AttributeListDto
            {
                Id = a.Id,
                Title = a.Title,
                Category = a.Category,
                Type = a.Type,
            })
            .ToListAsync();

        return new PagedResultDto<AttributeListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<List<string>> GetCategoriesAsync()
    {
        var categories = await _db.Attribute
            .Select(a => a.Category)
            .Distinct()
            .ToListAsync();

        return categories
            .Select(c => c.ToString())
            .OrderBy(c => c)
            .ToList();
    }

    public async Task<AttributeDto> GetByIdAsync(Guid id)
    {
        var result = await _db.Attribute.Include(a => a.Values).FirstOrDefaultAsync(a => a.Id == id);

        if (result == null)
            throw new NotFoundException("No Attribute Found");

        return new AttributeDto
        {
            Id = result.Id,
            Title = result.Title,
            Category = result.Category,
            Type = result.Type,
            Description = result.Description,
            IsFilterable = result.IsFilterable,
            Version = result.Version,
            Values = result.Values
                .OrderBy(v => v.SortOrder)
                .Select(v => new AttributeValueDto
                {
                    Id = v.Id,
                    Value = v.Value,
                    SortOrder = v.SortOrder,
                    Version = v.Version
                })
                .ToList()
        };
    }

    public async Task<AttributeDto> CreateAsync(CreateAttributeDto dto)
    {
        var attribute = new Models.Attribute
        {
            Title = dto.Title,
            Category = dto.Category,
            Type = dto.Type,
            Description = dto.Description,
            IsFilterable = dto.IsFilterable
        };

        _db.Attribute.Add(attribute);
        await _db.SaveChangesAsync();

        return new AttributeDto
        {
            Id = attribute.Id,
            Title = attribute.Title,
            Category = attribute.Category,
            Type = attribute.Type,
            Description = attribute.Description,
            IsFilterable = attribute.IsFilterable,
            Values = []
        };
    }

    public async Task<AttributeDto> UpdateAsync(UpdateAttributeDto dto, Guid id)
    {
        var attribute = await _db.Attribute.Include(a => a.Values).FirstOrDefaultAsync(a => a.Id == id);
        if (attribute == null)
            throw new NotFoundException("Attribute not found.");
        if (attribute.Version != dto.Version)
        {
            throw new ConflictException(
                "This attribute has already been modified by another user.");
        }
        attribute.Title = dto.Title;
        attribute.Category = dto.Category;
        attribute.Type = dto.Type;
        attribute.Description = dto.Description;
        attribute.IsFilterable = dto.IsFilterable;
        attribute.UpdatedAt = DateTime.UtcNow;
        attribute.Version++;

        await _db.SaveChangesAsync();

        return new AttributeDto
        {
            Title = attribute.Title,
            Category = attribute.Category,
            Type = attribute.Type,
            Description = attribute.Description,
            IsFilterable = attribute.IsFilterable,
            Version = attribute.Version,
            Values = attribute.Values.OrderBy(v => v.SortOrder)
                .Select(v => new AttributeValueDto
                {
                    Id = v.Id,
                    Value = v.Value,
                    SortOrder = v.SortOrder
                })
                .ToList()
        };
    }

    public async Task DeleteAttribute(Guid id)
    {
        var attribute = await _db.Attribute.Include(a => a.Values).FirstOrDefaultAsync(a => a.Id == id);
        var isUsed = await _db.PositionsRequirement.AnyAsync(pr => pr.AttributeId == id);
        if (isUsed)
        {
            throw new ConflictException("This attribute is used by one or more positions and cannot be deleted.");
        }
        if (attribute == null)
            throw new KeyNotFoundException("Attribute not found.");

        _db.Attribute.Remove(attribute);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAttributes(List<Guid> ids)
    {
        if (ids == null || ids.Count == 0)
            throw new KeyNotFoundException("No attribute ids provided.");

        var attributes = await _db.Attribute.Where(a => ids.Contains(a.Id)).ToListAsync();
        if (attributes.Count == 0)
            throw new KeyNotFoundException("Attributes not found.");

        var usedIds = await _db.PositionsRequirement
            .Where(pr => ids.Contains(pr.AttributeId))
            .Select(pr => pr.AttributeId)
            .Distinct()
            .ToListAsync();

        if (usedIds.Count > 0)
        {
            throw new ConflictException(
                "One or more selected attributes are used by positions and cannot be deleted.");
        }

        _db.Attribute.RemoveRange(attributes);
        await _db.SaveChangesAsync();
    }
}