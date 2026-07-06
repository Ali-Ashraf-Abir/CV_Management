using backend.Enums;

namespace backend.Dtos;

public class CVAttributeDto
{
    public Guid Id { get; set; }
    public Guid AttributeId { get; set; }
    public string AttributeTitle { get; set; } = default!;
    public AttributeType AttributeType { get; set; }
    public AttributeCategory AttributeCategory { get; set; }
    public string? AttributeValue { get; set; }
    public Guid? AttributeValueId { get; set; }
    public int Version{get;set;}
}


public class UpsertCVAttributeDto
{
    public Guid AttributeId { get; set; }
    public string? AttributeValue { get; set; }
    public Guid? AttributeValueId { get; set; }
    public int? Version { get; set; } // null = skip concurrency check
}

public class DeleteCVAttributeDto
{
    public Guid AttributeId { get; set; }
}