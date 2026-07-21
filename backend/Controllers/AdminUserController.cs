using backend.Dtos;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Administrator")]
public class AdminUserController(IAdminUserService adminUserService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll()
    {
        var users = await adminUserService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetById(Guid id)
    {
        var user = await adminUserService.GetUserByIdAsync(id);
        return Ok(user);
    }

    [HttpPatch("{id:guid}/role")]
    public async Task<ActionResult<UserDto>> UpdateRole(Guid id, UpdateUserRoleDto dto)
    {
        var user = await adminUserService.UpdateUserRoleAsync(id, dto);
        return Ok(user);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UserDto>> Update(Guid id, AdminUpdateUserDto dto)
    {
        var user = await adminUserService.UpdateUserAsync(id, dto);
        return Ok(user);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await adminUserService.DeleteUserAsync(id);
        return NoContent();
    }


    [HttpPatch("role")]
    public async Task<ActionResult<List<UserDto>>> UpdateRoles(BulkUpdateUserRoleDto dto)
    {
        var users = await adminUserService.UpdateUsersRoleAsync(dto.Ids, dto.Role);
        return Ok(users);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteMany([FromBody] List<Guid> ids)
    {
        await adminUserService.DeleteUsersAsync(ids);
        return NoContent();
    }
}