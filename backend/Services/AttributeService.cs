using backend.Data;
using backend.Dtos;
using backend.Exceptions;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;


public class AttributeService(ApplicationDbContext _db) : IAttributeService
{
    public async Task<List<AttributeListDto>> GetAllAttributeAsync()
    {
        return await _db.Attribute.Select(a => new AttributeListDto
        {
            Id = a.Id,
            Title = a.Title,
            Category = a.Category,
            Type = a.Type,
        })
        .ToListAsync();
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
}