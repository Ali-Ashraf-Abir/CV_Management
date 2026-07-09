using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedImageuploadToRegisterAndAttributes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhotoUrlPublicId",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhotoUrlPublicId",
                table: "AttributeValue",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_CVAttributes_AttributeId",
                table: "CVAttributes",
                column: "AttributeId");

            migrationBuilder.AddForeignKey(
                name: "FK_CVAttributes_Attribute_AttributeId",
                table: "CVAttributes",
                column: "AttributeId",
                principalTable: "Attribute",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CVAttributes_Attribute_AttributeId",
                table: "CVAttributes");

            migrationBuilder.DropIndex(
                name: "IX_CVAttributes_AttributeId",
                table: "CVAttributes");

            migrationBuilder.DropColumn(
                name: "PhotoUrlPublicId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PhotoUrlPublicId",
                table: "AttributeValue");
        }
    }
}
