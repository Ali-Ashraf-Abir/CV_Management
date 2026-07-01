using backend.Enums;

namespace backend.Dtos;
using System.ComponentModel.DataAnnotations;

public class CreateAttributeDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public AttributeCategory Category { get; set; }

    [Required]
    public AttributeType Type { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsFilterable { get; set; }

}