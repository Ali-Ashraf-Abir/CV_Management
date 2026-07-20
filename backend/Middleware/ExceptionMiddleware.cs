using System.Text.Json;
using backend.Exceptions;

namespace backend.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            context.Response.ContentType = "application/json";

            var response = new
            {
                message = ex.Message
            };

            switch (ex)
            {
                case BadRequestException:
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    break;

                case UnauthorizedException:
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    break;

                case NotFoundException:
                    context.Response.StatusCode = StatusCodes.Status404NotFound;
                    break;

                case ConflictException:
                    context.Response.StatusCode = StatusCodes.Status409Conflict;
                    break;

                default:
                    logger.LogError(ex, "Unhandled exception processing {Method} {Path}",
                        context.Request.Method, context.Request.Path + context.Request.QueryString);

                    context.Response.StatusCode = StatusCodes.Status500InternalServerError;

                    response = new
                    {
                        message = "An unexpected error occurred."
                    };
                    break;
            }

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}