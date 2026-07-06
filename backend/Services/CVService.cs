using backend.Data;
using backend.Dtos;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class CVService(
    ApplicationDbContext db
) : ICVService
{
   public async Task<CVDto> GetOrCreateMyCVAsync(Guid userId)
    {
        var cv = await db.CVs
            .Include(x => x.Attributes)
                .ThenInclude(a => a.Attribute)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (cv == null)
        {
            cv = new Models.CV
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.CVs.Add(cv);
            await db.SaveChangesAsync();

            return new CVDto { Id = cv.Id, UserId = cv.UserId, Attributes = [] };
        }

        return MapToDto(cv);
    }

    private static CVDto MapToDto(Models.CV cv) => new()
    {
        Id = cv.Id,
        UserId = cv.UserId,
        Attributes = cv.Attributes.Select(a => new CVAttributeDto
        {
            Id = a.Id,
            AttributeId = a.AttributeId,
            AttributeTitle = a.Attribute.Title,
            AttributeType = a.Attribute.Type,
            AttributeCategory = a.Attribute.Category,
            AttributeValue = a.AttributeValue,
            AttributeValueId = a.AttributeValueId,
            Version = a.Version
        }).ToList()
    };

    public async Task<CVDto> CreateCVAsync(Guid userId)
    {
        var cv = new Models.CV
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.CVs.Add(cv);

        await db.SaveChangesAsync();

        return await GetOrCreateMyCVAsync(userId);
    }
}