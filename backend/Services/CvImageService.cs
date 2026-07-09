using backend.Data;
using backend.Dtos;
using backend.Enums;
using backend.Exceptions;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class CVImageService(
    ApplicationDbContext db,IImageService cloudinary): ICVImageService
{
    public async Task<CVAttributeDto> UploadImageAsync(Guid userId,Guid attributeId,IFormFile file)
    {
        var cv = await db.CVs.FirstOrDefaultAsync(x => x.UserId == userId);
        if (cv == null) throw new NotFoundException("CV not found.");
        var definition = await db.Attribute.FirstOrDefaultAsync(x => x.Id == attributeId);
        if (definition == null)
            throw new NotFoundException("Attribute not found.");
        if (definition.Type != AttributeType.Image)
            throw new BadRequestException("This attribute is not an image.");
        var attribute = await db.CVAttributes.FirstOrDefaultAsync(x =>x.CVId == cv.Id && x.AttributeId == attributeId);
        if (attribute == null)
        {
            attribute = new CVAttributes
            {
                Id = Guid.NewGuid(),
                CVId = cv.Id,
                AttributeId = attributeId,
                CreatedAt = DateTime.UtcNow,
                Version = 0
            };

            db.CVAttributes.Add(attribute);
        }

        if (!string.IsNullOrWhiteSpace(attribute.AttributeValue))
        {
            await cloudinary.DeleteImageAsync(attribute.AttributeValue);
        }

        var image = await cloudinary.UploadImageAsync(file);

        attribute.AttributeValue = image.Url;
        attribute.AttributeValueId = null;
        attribute.PhotoUrlPublicId = image.PublicId;
        attribute.UpdatedAt = DateTime.UtcNow;
        attribute.Version++;

        await db.SaveChangesAsync();

        return new CVAttributeDto
        {
            Id = attribute.Id,
            AttributeId = attribute.AttributeId,
            AttributeTitle = definition.Title,
            AttributeType = definition.Type,
            AttributeCategory = definition.Category,
            AttributeValue = attribute.AttributeValue,
            Version = attribute.Version
        };
    }

    public async Task DeleteImageAsync(
        Guid userId,
        Guid attributeId)
    {
        var cv = await db.CVs
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (cv == null)
            throw new NotFoundException("CV not found.");

        var attribute = await db.CVAttributes
            .Include(x => x.Attribute)
            .FirstOrDefaultAsync(x =>
                x.CVId == cv.Id &&
                x.AttributeId == attributeId);

        if (attribute == null)
            throw new NotFoundException("Image not found.");

        if (attribute.Attribute?.Type != AttributeType.Image)
            throw new BadRequestException("This attribute is not an image.");

        if (!string.IsNullOrWhiteSpace(attribute.AttributeValue))
        {
            await cloudinary.DeleteImageAsync(attribute.PhotoUrlPublicId);
        }

        db.CVAttributes.Remove(attribute);

        await db.SaveChangesAsync();
    }
}