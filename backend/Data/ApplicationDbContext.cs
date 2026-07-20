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
    public DbSet<PositionRequirement> PositionsRequirement => Set<PositionRequirement>();
    public DbSet<CV> CVs => Set<CV>();
    public DbSet<CVAttributes> CVAttributes => Set<CVAttributes>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Models.Attribute>(entity =>{entity.HasGeneratedTsVectorColumn(
            a => a.SearchVector,
            "english",
            a => new { a.Title, a.Description })
          .HasIndex(a => a.SearchVector)
          .HasMethod("GIN");});
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>().Property(u => u.Role).HasConversion<string>();
        modelBuilder.Entity<Attribute>().Property(u => u.Category).HasConversion<string>();
        modelBuilder.Entity<Attribute>().Property(u => u.Type).HasConversion<string>();
        modelBuilder.Entity<Position>().Property(u => u.Status).HasConversion<string>();
        modelBuilder.Entity<PositionRequirement>().Property(u => u.Operator).HasConversion<string>();
        modelBuilder.Entity<Attribute>().HasIndex(a => a.Title).IsUnique();
        modelBuilder.Entity<Position>().Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
        modelBuilder.Entity<PositionRequirement>().Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
        modelBuilder.Entity<User>().Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
        modelBuilder.Entity<Attribute>().Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
        modelBuilder.Entity<AttributeValue>().Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
        modelBuilder.Entity<CV>().Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
        modelBuilder.Entity<CVAttributes>().Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
        modelBuilder.Entity<RefreshToken>().HasOne(rt => rt.User).WithMany(u => u.RefreshTokens).HasForeignKey(rt => rt.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Position>().HasOne(p => p.CreatedBy).WithMany(u => u.Positions).HasForeignKey(p => p.CreatedById).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<PositionRequirement>().HasOne(pr => pr.Position).WithMany(p => p.Requirements).HasForeignKey(pr => pr.PositionId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<AttributeValue>().HasOne(av => av.Attribute).WithMany(a => a.Values).HasForeignKey(av => av.AttributeId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<PositionRequirement>().HasOne(pr => pr.Attribute).WithMany(a => a.PositionRequirements).HasForeignKey(pr => pr.AttributeId).OnDelete(DeleteBehavior.Restrict);
    }
}