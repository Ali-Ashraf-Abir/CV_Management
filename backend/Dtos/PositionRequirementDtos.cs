using System.ComponentModel.DataAnnotations;
using backend.Enums;

namespace backend.Dtos;

public class PositionRequirementDto
{
    public Guid Id { get; set; }
    public Guid AttributeId { get; set; }
    public string AttributeTitle { get; set; } = string.Empty;
    public AttributeCategory AttributeCategory { get; set; }
    public AttributeType AttributeType { get; set; }
    public RequirementOperator Operator { get; set; }
    public string? Value { get; set; }
    public string? SecondValue { get; set; }
    public int Version { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreatePositionRequirementDto
{
    [Required]
    public Guid AttributeId { get; set; }
    [Required]
    public RequirementOperator Operator { get; set; }

    [StringLength(500)]
    public string? Value { get; set; }

    [StringLength(500)]
    public string? SecondValue { get; set; }
}

public class UpdatePositionRequirementDto
{
    [Required]
    public RequirementOperator Operator { get; set; }

    [StringLength(500)]
    public string? Value { get; set; }

    [StringLength(500)]
    public string? SecondValue { get; set; }

    [Required]
    public int Version { get; set; }
}