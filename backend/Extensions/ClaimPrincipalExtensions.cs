

using System.Security.Claims;
using backend.Enums;

namespace backend.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (value is null)
            throw new UnauthorizedAccessException("User is not authenticated.");

        return Guid.Parse(value);
    }

    public static string GetEmail(this ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.Email)!;
    }

    public static string GetRole(this ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.Role)!;
    }
    public static Roles GetAppRole(this ClaimsPrincipal user)
    {
        var value = user.GetRole();

        if (!Enum.TryParse<Roles>(value, ignoreCase: true, out var role))
            throw new UnauthorizedAccessException($"Unrecognized role claim: '{value}'.");

        return role;
    }
}