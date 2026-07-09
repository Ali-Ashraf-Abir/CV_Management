using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/images")]
public class ImagesController : ControllerBase
{
    private readonly IImageService _imageService;

    public ImagesController(IImageService imageService)
    {
        _imageService = imageService;
    }
    [HttpPost]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        var url = await _imageService.UploadImageAsync(file);
        return Ok(url);
    }
}