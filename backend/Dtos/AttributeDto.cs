using backend.Enums;

namespace backend.Dtos;
public class AttributeDto
{
    public Guid Id{get;set;}
    public string Title { get; set; } = string.Empty;

    public AttributeCategory Category { get; set; }

    public AttributeType Type { get; set; }

    public string? Description { get; set; }
    public int Version{get;set;}
    public bool IsFilterable { get; set; }
    public List<AttributeValueDto> Values{get;set;}=[];
}