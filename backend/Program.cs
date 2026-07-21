using System.Text;
using System.Text.Json.Serialization;
using backend.Configuration;
using backend.Data;
using backend.JwtSettings;
using backend.Middleware;
using backend.Models;
using backend.Services;
using backend.Services.Interfaces;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration["CORS_ALLOWED_ORIGINS"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers().AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IAuthService,AuthService>();
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IRefreshTokenService,RefreshTokenService>();
builder.Services.AddScoped<IUserService,UserService>();
builder.Services.AddScoped<IAttributeService,AttributeService>();
builder.Services.AddScoped<IAttributeValueService,AttributeValueService>();
builder.Services.AddScoped<IPositionService,PositionService>();
builder.Services.AddScoped<ICVService,CVService>();
builder.Services.AddScoped<ICVImageService,CVImageService>();
builder.Services.AddScoped<ICVAttributeService,CVAttributeService>();
builder.Services.AddScoped<IUserProfileService,UserProfileService>();
builder.Services.AddScoped<IPositionRequirementService,PositionsRequirementService>();
builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.Configure<CloudinaryOptions>(builder.Configuration.GetSection("Cloudinary"));
builder.Services.AddSingleton(sp =>
{
    var options = sp.GetRequiredService<IOptions<CloudinaryOptions>>().Value;
    var account = new Account(
        options.CloudName,
        options.ApiKey,
        options.ApiSecret);
    return new Cloudinary(account);
});
builder.Services.AddScoped<IImageService, ImageService>();
// jwt setting
builder.Services.AddJwtAuthentication(builder.Configuration);


var app = builder.Build();
app.UseCors("AllowFrontend");
app.UseMiddleware<ExceptionMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Hello World!");
app.MapControllers();
app.Run();
