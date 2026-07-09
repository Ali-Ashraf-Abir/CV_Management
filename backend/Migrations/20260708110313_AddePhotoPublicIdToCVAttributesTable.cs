using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddePhotoPublicIdToCVAttributesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhotoUrlPublicId",
                table: "AttributeValue");

            migrationBuilder.AddColumn<string>(
                name: "PhotoUrlPublicId",
                table: "CVAttributes",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhotoUrlPublicId",
                table: "CVAttributes");

            migrationBuilder.AddColumn<string>(
                name: "PhotoUrlPublicId",
                table: "AttributeValue",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
