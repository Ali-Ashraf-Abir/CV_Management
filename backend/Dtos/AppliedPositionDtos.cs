using backend.Enums;

namespace backend.Dtos;

public class ApplyToPositionDto
{
    public Guid PositionId { get; set; }
}

public class ApplicationResponseDto
{
    public Guid Id { get; set; }
    public Guid PositionId { get; set; }
    public string PositionTitle { get; set; } = null!;
    public DateTime AppliedAt { get; set; }
    public ApplicationStatus Status { get; set; }
}

public class ApplicantResponseDto
{
    public Guid ApplicationId { get; set; }
    public Guid UserId { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? PhotoUrl { get; set; }
    public DateTime AppliedAt { get; set; }
    public ApplicationStatus Status { get; set; }
}

public class UpdateApplicationStatusDto
{
    public ApplicationStatus Status { get; set; }
}