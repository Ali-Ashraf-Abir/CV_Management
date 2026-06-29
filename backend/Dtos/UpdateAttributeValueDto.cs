namespace backend.Dtos;

public class UpdateAttributeValueDto
{
    public string Value { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}