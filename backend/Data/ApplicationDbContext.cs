namespace backend.Data;

using backend.Models;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {

    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Attribute> Attribute => Set<Attribute>();
    public DbSet<AttributeValue> AttributeValue => Set<AttributeValue>();
    public DbSet<Position> Positions => Set<Position>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>().Property(u => u.Role).HasConversion<string>();
        modelBuilder.Entity<Attribute>().Property(u => u.Category).HasConversion<string>();
        modelBuilder.Entity<Attribute>().Property(u => u.Type).HasConversion<string>();
        modelBuilder.Entity<Attribute>().HasIndex(a => a.Title).IsUnique();
        modelBuilder.Entity<Position>().Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
        modelBuilder.Entity<User>().Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
        modelBuilder.Entity<Attribute>().Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
        modelBuilder.Entity<AttributeValue>().Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
    }
}