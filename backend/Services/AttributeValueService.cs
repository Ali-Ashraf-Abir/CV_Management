using backend.Data;
using backend.Dtos;
using backend.Exceptions;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AttributeValueService(ApplicationDbContext _db) : IAttributeValueService
{

    public async Task<List<AttributeValueDto>> GetAllAttributesValueByAttributeIdAsync(Guid id)
    {
        return await _db.AttributeValue
            .Where(av => av.AttributeId == id)
            .Select(av => new AttributeValueDto
            {
                Id = av.Id,
                AttributeId = av.AttributeId,
                Value = av.Value,
                SortOrder = av.SortOrder,
            })
            .ToListAsync();
    }
    public async Task<AttributeValueDto> GetAttributeValueByIdAsync(Guid id)
    {
        var result = await _db.AttributeValue.FirstOrDefaultAsync(u => u.Id == id);
        if (result == null)
        {
            throw new NotFoundException("Attribute Value Not Found");
        }
        return new AttributeValueDto
        {
            Id = result.Id,
            Value = result.Value,
            AttributeId = result.AttributeId,
            SortOrder = result.SortOrder
        };

    }
    public async Task<AttributeValueDto> CreateAttributeValueAsync(CreateAttributeValueDto dto)
    {
        var newAttribute = new AttributeValue
        {
            AttributeId = dto.AttributeId,
            Value = dto.Value,
            SortOrder = dto.SortOrder

        };
        _db.Add(newAttribute);
        await _db.SaveChangesAsync();
        return new AttributeValueDto
        {
            Id = newAttribute.Id,
            Value = newAttribute.Value,
            AttributeId = newAttribute.AttributeId,
            SortOrder = newAttribute.SortOrder
        };
    }
    public async Task<AttributeValueDto> UpdateAttributeValueAsync(UpdateAttributeValueDto dto, Guid id)
    {
        var attributeValue = await _db.AttributeValue.FirstOrDefaultAsync(u => u.Id == id);
        if (attributeValue == null)
        {
            throw new NotFoundException("Attribute Value Not Found");
        }

        attributeValue.Value = dto.Value;
        attributeValue.SortOrder = dto.SortOrder;

        await _db.SaveChangesAsync();
        return new AttributeValueDto
        {
            Id = attributeValue.Id,
            Value = attributeValue.Value,
            AttributeId = attributeValue.AttributeId,
            SortOrder = attributeValue.SortOrder
        };

    }
    public async Task DeleteAttributeValueAsync(Guid id)
    {
        var attributeValue = await _db.AttributeValue.FirstOrDefaultAsync(u=>u.Id == id);
        if(attributeValue == null)
        {
            throw new NotFoundException("Attribute Not Found");
        }    
        _db.Remove(attributeValue);
        await _db.SaveChangesAsync();
    }
}