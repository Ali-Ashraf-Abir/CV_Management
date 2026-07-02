using backend.Enums;

namespace backend.Models;
public class PositionRequirement
{
    public Guid Id { get; set; }

    public Guid PositionId { get; set; }
    public Position Position { get; set; } = null!;

    public Guid AttributeId { get; set; }
    public Attribute Attribute { get; set; } = null!;

    public RequirementOperator Operator { get; set; }

    public string? Value { get; set; }

    public string? SecondValue { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public int Version { get; set; }
}