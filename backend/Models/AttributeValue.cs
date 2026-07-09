
namespace backend.Models;
public class AttributeValue
{
    public Guid Id { get; set; }
    public Guid AttributeId { get; set; }
    public Attribute Attribute { get; set; } = null!;
    public string Value { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public int Version {get;set;}
    public DateTime CreatedAt{get;set;}
    public DateTime UpdatedAt{get;set;}
}