namespace backend.Services;

using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dtos;
using backend.Enums;
using backend.Exceptions;
using backend.Models;
using backend.Services.Interfaces;

public class ApplicationService(ApplicationDbContext _db, ICVService _cvService) : IApplicationService
{
    public async Task<ApplicationResponseDto> ApplyAsync(Guid userId, Guid positionId)
    {
        var position = await _db.Positions.FirstOrDefaultAsync(p => p.Id == positionId)
            ?? throw new NotFoundException("Position was not found.");

        if (position.Status != PositionStatus.Published)
            throw new InvalidOperationException("This position is not currently accepting applications.");

        var alreadyApplied = await _db.AppliedPositions
            .AnyAsync(a => a.UserId == userId && a.PositionId == positionId);

        if (alreadyApplied)
            throw new InvalidOperationException("You have already applied to this position.");

        var application = new AppliedPosition
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PositionId = positionId,
            AppliedAt = DateTime.UtcNow,
            Status = ApplicationStatus.Pending
        };

        _db.AppliedPositions.Add(application);
        await _db.SaveChangesAsync();

        return new ApplicationResponseDto
        {
            Id = application.Id,
            PositionId = position.Id,
            PositionTitle = position.Title,
            AppliedAt = application.AppliedAt,
            Status = application.Status
        };
    }

    public async Task<List<ApplicationResponseDto>> GetMyApplicationsAsync(Guid userId)
    {
        return await _db.AppliedPositions
            .Include(a => a.Position)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.AppliedAt)
            .Select(a => new ApplicationResponseDto
            {
                Id = a.Id,
                PositionId = a.PositionId,
                PositionTitle = a.Position.Title,
                AppliedAt = a.AppliedAt,
                Status = a.Status
            })
            .ToListAsync();
    }

    public async Task<List<ApplicantResponseDto>> GetApplicantsAsync(Guid positionId, Guid recruiterId)
    {
        var position = await _db.Positions.FirstOrDefaultAsync(p => p.Id == positionId)
            ?? throw new NotFoundException("Position was not found.");

        if (position.CreatedById != recruiterId)
            throw new ForbiddenException("You do not have access to this position's applicants.");

        return await _db.AppliedPositions
            .Include(a => a.User)
            .Where(a => a.PositionId == positionId)
            .OrderByDescending(a => a.AppliedAt)
            .Select(a => new ApplicantResponseDto
            {
                ApplicationId = a.Id,
                UserId = a.UserId,
                FirstName = a.User.FirstName,
                LastName = a.User.LastName,
                Email = a.User.Email,
                PhotoUrl = a.User.PhotoUrl,
                AppliedAt = a.AppliedAt,
                Status = a.Status
            })
            .ToListAsync();
    }

    public async Task<ApplicantResponseDto> UpdateStatusAsync(Guid applicationId, Guid recruiterId, ApplicationStatus status)
    {
        var application = await _db.AppliedPositions
            .Include(a => a.User)
            .Include(a => a.Position)
            .FirstOrDefaultAsync(a => a.Id == applicationId)
            ?? throw new NotFoundException("Application was not found.");

        if (application.Position.CreatedById != recruiterId)
            throw new ForbiddenException("You do not have access to this application.");

        application.Status = status;
        await _db.SaveChangesAsync();

        return new ApplicantResponseDto
        {
            ApplicationId = application.Id,
            UserId = application.UserId,
            FirstName = application.User.FirstName,
            LastName = application.User.LastName,
            Email = application.User.Email,
            PhotoUrl = application.User.PhotoUrl,
            AppliedAt = application.AppliedAt,
            Status = application.Status
        };
    }

    public async Task<CVDto> GetApplicantCvAsync(Guid applicationId, Guid recruiterId)
    {
        var application = await _db.AppliedPositions
            .Include(a => a.Position)
            .FirstOrDefaultAsync(a => a.Id == applicationId)
            ?? throw new NotFoundException("Application was not found.");

        if (application.Position.CreatedById != recruiterId)
            throw new ForbiddenException("You do not have access to this applicant's CV.");


        return await _cvService.GetOrCreateMyCVAsync(application.UserId);
    }
}