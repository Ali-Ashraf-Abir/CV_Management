using backend.Enums;

namespace backend.Dtos;

public class BulkUpdateUserRoleDto
{
    public List<Guid> Ids { get; set; } = [];
    public Roles Role { get; set; }
}