using backend.Data;
using backend.Dtos;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class CVService(
    ApplicationDbContext db
) : ICVService
{
    public async Task<CVDto> GetMyCVAsync(Guid userId)
    {
        var cv = await db.CVs
            .Include(x => x.Attributes)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (cv == null)
            throw new Exception("CV not found.");

        return new CVDto
        {
            Id = cv.Id,
            UserId = cv.UserId,
            Attributes = cv.Attributes.Select(a => new CVAttributeDto
            {
                Id = a.Id,
                AttributeId = a.AttributeId,
                AttributeValue = a.AttributeValue,
                AttributeValueId = a.AttributeValueId
            }).ToList()
        };
    }

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

        return await GetMyCVAsync(userId);
    }
}