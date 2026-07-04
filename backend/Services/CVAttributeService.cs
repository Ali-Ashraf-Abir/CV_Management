using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class CVAttributeService(
    ApplicationDbContext db
) : ICVAttributeService
{
    public async Task<CVAttributeDto> UpsertAttributeAsync(
        Guid userId,
        UpsertCVAttributeDto dto)
    {
        var cv = await db.CVs
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (cv == null)
            throw new Exception("CV not found.");

        var attribute = await db.CVAttributes
            .FirstOrDefaultAsync(x =>
                x.CVId == cv.Id &&
                x.AttributeId == dto.AttributeId);

        if (attribute == null)
        {
            attribute = new CVAttributes
            {
                Id = Guid.NewGuid(),
                CVId = cv.Id,
                AttributeId = dto.AttributeId,
                CreatedAt = DateTime.UtcNow
            };

            db.CVAttributes.Add(attribute);
        }

        attribute.AttributeValue = dto.AttributeValue;
        attribute.AttributeValueId = dto.AttributeValueId;
        attribute.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return new CVAttributeDto
        {
            Id = attribute.Id,
            AttributeId = attribute.AttributeId,
            AttributeValue = attribute.AttributeValue,
            AttributeValueId = attribute.AttributeValueId
        };
    }

    public async Task DeleteAttributeAsync(
        Guid userId,
        Guid attributeId)
    {
        var cv = await db.CVs
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (cv == null)
            throw new Exception("CV not found.");

        var attribute = await db.CVAttributes
            .FirstOrDefaultAsync(x =>
                x.CVId == cv.Id &&
                x.AttributeId == attributeId);

        if (attribute == null)
            throw new Exception("Attribute not found.");

        db.CVAttributes.Remove(attribute);

        await db.SaveChangesAsync();
    }
}