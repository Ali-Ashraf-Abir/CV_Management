using backend.Dtos;
using Microsoft.AspNetCore.Http;

namespace backend.Services.Interfaces;

public interface ICVImageService
{
    Task<CVAttributeDto> UploadImageAsync(
        Guid userId,
        Guid attributeId,
        IFormFile file);

    Task DeleteImageAsync(
        Guid userId,
        Guid attributeId);
}