namespace backend.Models;

public class CVAttributes
{
    public Guid Id{get;set;}
    public Guid CVId{get;set;}
    public Guid AttributeId{get;set;}
    public string? AttributeValue{get;set;}
    public Guid? AttributeValueId{get;set;}
    public string PhotoUrlPublicId{get;set;}=string.Empty;
    public int Version{get;set;}
    public DateTime CreatedAt{get;set;}
    public DateTime UpdatedAt{get;set;}
    public Attribute Attribute { get; set; } = default!;

}