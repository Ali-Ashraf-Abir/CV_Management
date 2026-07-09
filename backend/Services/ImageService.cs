using backend.Exceptions;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

public class ImageService : IImageService
{
    private readonly Cloudinary _cloudinary;

    public ImageService(Cloudinary cloudinary)
    {
        _cloudinary = cloudinary;
    }

    public async Task<ImageUploadResultDto> UploadImageAsync(IFormFile file)
    {
        if (file.Length == 0)
            throw new Exception("Empty file");
        if (!file.ContentType.StartsWith("image/"))
            throw new BadRequestException("Only image files are allowed.");

        if (file.Length > 5 * 1024 * 1024)
            throw new BadRequestException("Maximum file size is 5 MB.");
        await using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = "cv-images"
        };
        var result = await _cloudinary.UploadAsync(uploadParams);
        if (result.Error != null)
            throw new Exception(result.Error.Message);
        return new ImageUploadResultDto
        {
            Url = result.SecureUrl.ToString(),
            PublicId = result.PublicId
        };
    }
    public async Task DeleteImageAsync(string publicId)
    {
        if (string.IsNullOrWhiteSpace(publicId))
            return;

        var deleteParams = new DeletionParams(publicId);

        var result = await _cloudinary.DestroyAsync(deleteParams);

        if (result.Error != null)
        {
            throw new Exception(result.Error.Message);
        }
    }
}