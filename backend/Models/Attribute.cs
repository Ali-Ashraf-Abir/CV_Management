using System.ComponentModel.DataAnnotations;
using backend.Enums;

namespace backend.Models;

public class Attribute
{
    public Guid Id { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public AttributeCategory Category { get; set; }

    [Required]
    public AttributeType Type { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsFilterable { get; set; } = true;

    [Range(0, int.MaxValue)]
    public int Version { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AttributeValue> Values { get; set; } = new List<AttributeValue>();
}