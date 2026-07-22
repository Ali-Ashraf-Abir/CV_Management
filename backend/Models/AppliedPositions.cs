namespace backend.Models;
using backend.Enums;

public class AppliedPosition
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid PositionId { get; set; }
    public Position Position { get; set; } = null!;

    public DateTime AppliedAt { get; set; } = DateTime.Now;

    public ApplicationStatus Status { get; set; }
}