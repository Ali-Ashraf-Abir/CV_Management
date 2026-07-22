using System.ComponentModel.DataAnnotations;
using backend.Enums;

namespace backend.Dtos;

public class PositionDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CreatedById { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public PositionStatus Status { get; set; }
    public DateTime? Deadline { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int Version { get; set; }

    public int RequirementsCount { get; set; }
    public List<PositionRequirementDto> Requirements { get; set; } = new();
}


public class PositionSummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public PositionStatus Status { get; set; }
    public bool IsPublished { get; set; }
    public DateTime? Deadline { get; set; }
    public DateTime CreatedAt { get; set; }
    public int Version { get; set; }
    public int RequirementsCount { get; set; }
    public int ApplicationsCount { get; set; }
}

public class CreatePositionDto
{
    [Required, StringLength(200, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(5000, MinimumLength = 10)]
    public string Description { get; set; } = string.Empty;

    public DateTime? Deadline { get; set; }

    public List<CreatePositionRequirementDto>? Requirements { get; set; }
}

public class UpdatePositionDto
{
    [Required, StringLength(200, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(5000, MinimumLength = 10)]
    public string Description { get; set; } = string.Empty;

    public DateTime? Deadline { get; set; }

    [Required]
    public int Version { get; set; }
}

public class ChangePositionStatusDto
{
    [Required]
    public PositionStatus Status { get; set; }
}