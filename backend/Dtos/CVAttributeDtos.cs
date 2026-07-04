namespace backend.Dtos;

public class CVAttributeDto
{
    public Guid Id { get; set; }

    public Guid AttributeId { get; set; }

    public string? AttributeValue { get; set; }

    public Guid? AttributeValueId { get; set; }
}


public class UpsertCVAttributeDto
{
    public Guid AttributeId { get; set; }

    public string? AttributeValue { get; set; }

    public Guid? AttributeValueId { get; set; }
}


public class DeleteCVAttributeDto
{
    public Guid AttributeId { get; set; }
}