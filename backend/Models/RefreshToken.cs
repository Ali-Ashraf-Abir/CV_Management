namespace backend.Models;
public class RefreshToken
{
    public Guid Id { get; set; }

    public string TokenHash { get; set; } = "";

    public DateTime ExpiresAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool Revoked { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;
}