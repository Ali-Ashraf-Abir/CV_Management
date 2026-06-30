using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class UpdateAttributeValueDto
{
    [Required]
    public string Value { get; set; } = string.Empty;
    [Required]
    public int SortOrder { get; set; }
}