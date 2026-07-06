using backend.Dtos;

namespace backend.Services.Interfaces;

public interface ICVService
{
    Task<CVDto> GetOrCreateMyCVAsync(Guid userId);

    Task<CVDto> CreateCVAsync(Guid userId);
}