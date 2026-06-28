using backend.Enums;

namespace backend.Dtos;

public class UserResponseDto
{
    public Guid Id {get;set;} 
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Roles Role { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
}