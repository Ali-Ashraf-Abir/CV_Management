
namespace backend.Dtos;
public class AttributeValueDto
{
    public Guid Id { get; set; }
    public Guid AttributeId { get; set; }
    public AttributeDto Attribute { get; set; } = null!;
    public string Value { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}