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
            .Include(x => x.Attribute)
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
                Version = 0,
                CreatedAt = DateTime.UtcNow
            };

            db.CVAttributes.Add(attribute);
        }
        else if (dto.Version.HasValue && dto.Version.Value != attribute.Version)
        {
            throw new Exception("This value was updated elsewhere. Please refresh and try again.");
        }

        attribute.AttributeValue = dto.AttributeValue;
        attribute.AttributeValueId = dto.AttributeValueId;
        attribute.Version += 1;
        attribute.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return new CVAttributeDto
        {
            Id = attribute.Id,
            AttributeId = attribute.AttributeId,
            AttributeTitle = attribute.Attribute?.Title ?? string.Empty,
            AttributeType = attribute.Attribute?.Type ?? default,
            AttributeCategory = attribute.Attribute?.Category ?? default,
            AttributeValue = attribute.AttributeValue,
            AttributeValueId = attribute.AttributeValueId,
            Version = attribute.Version
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