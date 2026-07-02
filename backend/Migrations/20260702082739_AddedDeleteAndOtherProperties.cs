using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedDeleteAndOtherProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Positions_Users_CreatedById",
                table: "Positions");

            migrationBuilder.DropForeignKey(
                name: "FK_PositionsRequirement_Attribute_AttributeId",
                table: "PositionsRequirement");

            migrationBuilder.AddForeignKey(
                name: "FK_Positions_Users_CreatedById",
                table: "Positions",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PositionsRequirement_Attribute_AttributeId",
                table: "PositionsRequirement",
                column: "AttributeId",
                principalTable: "Attribute",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Positions_Users_CreatedById",
                table: "Positions");

            migrationBuilder.DropForeignKey(
                name: "FK_PositionsRequirement_Attribute_AttributeId",
                table: "PositionsRequirement");

            migrationBuilder.AddForeignKey(
                name: "FK_Positions_Users_CreatedById",
                table: "Positions",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PositionsRequirement_Attribute_AttributeId",
                table: "PositionsRequirement",
                column: "AttributeId",
                principalTable: "Attribute",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
