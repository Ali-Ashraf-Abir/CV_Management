namespace backend.Services.Interfaces;

using backend.Dtos;
using backend.Enums;

public interface IApplicationService
{
    Task<ApplicationResponseDto> ApplyAsync(Guid userId, Guid positionId);
    Task<List<ApplicationResponseDto>> GetMyApplicationsAsync(Guid userId);
    Task<List<ApplicantResponseDto>> GetApplicantsAsync(Guid positionId, Guid recruiterId);
    Task<ApplicantResponseDto> UpdateStatusAsync(Guid applicationId, Guid recruiterId, ApplicationStatus status);
    Task<CVDto> GetApplicantCvAsync(Guid applicationId, Guid recruiterId);
}