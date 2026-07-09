public interface IImageService
{
    Task<ImageUploadResultDto> UploadImageAsync(IFormFile file);
    Task DeleteImageAsync(string publicId);
}