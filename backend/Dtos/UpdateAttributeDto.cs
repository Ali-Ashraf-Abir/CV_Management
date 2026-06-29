namespace backend.Dtos;

using System.ComponentModel.DataAnnotations;
using backend.Enums;

public class UpdateAttributeDto
{  
    public string Title { get; set; } = string.Empty;

    public AttributeCategory Category { get; set; }

    public AttributeType Type { get; set; }

    public string? Description { get; set; }

    public bool IsFilterable { get; set; }

    public int Version { get; set; }
}