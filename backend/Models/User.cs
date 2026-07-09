
namespace backend.Models;

using backend.Enums;

public class User
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Roles Role { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
    public string PhotoUrlPublicId {get;set;}=string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<Position> Positions { get; set; } = [];
}