namespace backend.Models;

public class CV
{
    public Guid Id{get;set;}
    public Guid UserId{get;set;}

    public int Version{get;set;}
    public DateTime CreatedAt{get;set;}
    public DateTime UpdatedAt{get;set;}
    public ICollection<CVAttributes> Attributes { get; set; } = [];
}