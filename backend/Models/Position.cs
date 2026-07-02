
using backend.Enums;

namespace backend.Models;

public class Position
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;

    public PositionStatus Status { get; set; }

    public DateTime? Deadline { get; set; }

    public bool IsPublished { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public int Version { get; set; }

    public ICollection<PositionRequirement> Requirements { get; set; } = [];
}