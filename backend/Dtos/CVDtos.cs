namespace backend.Dtos;

public class CVDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public List<CVAttributeDto> Attributes { get; set; } = [];
}

public class CreateCVDto
{
    public Guid UserId { get; set; }
}


public class UpdateCVDto
{
}