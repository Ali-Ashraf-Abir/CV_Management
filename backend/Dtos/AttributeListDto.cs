namespace backend.Dtos;
using backend.Enums;

public class AttributeListDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public AttributeCategory Category { get; set; }
    public AttributeType Type { get; set; }
}