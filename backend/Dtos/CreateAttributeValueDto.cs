namespace backend.Dtos;
public class CreateAttributeValueDto
{
    public Guid AttributeId { get; set; }

    public string Value { get; set; } = string.Empty;

    public int SortOrder { get; set; }


}