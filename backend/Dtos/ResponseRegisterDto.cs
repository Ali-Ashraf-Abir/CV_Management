namespace backend.Dtos;

public class ResponseRegisterDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = "";

    public string LastName { get; set; } = "";

    public string Email { get; set; } = "";
    public string? PhotoUrl { get; set; } = string.Empty;
    public string? PhotoUrlPublicId { get; set; } = string.Empty;

}