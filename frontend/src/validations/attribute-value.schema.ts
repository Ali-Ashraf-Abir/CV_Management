import { z } from "zod";
import { PositionRequirementDto } from "@/types/position";

const isNumeric = (v: string) => v.trim() !== "" && !Number.isNaN(Number(v));
const isDate = (v: string) => !Number.isNaN(new Date(v).getTime());

export function buildAttributeValueSchema(
  requirement: PositionRequirementDto,

  resolveDropdownLabel: (id: string) => string | undefined = () => undefined
) {
  const { attributeType: type, operator, value: ruleValue, secondValue, hasRequirement } = requirement;

  return z.string().trim().min(1, "This field is required.").superRefine((value, ctx) => {
    if (!hasRequirement) return;

    switch (type) {
      case "Numeric":
        if (!isNumeric(value)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid number." });
        }
        break;
      case "Date":
      case "Period":
        if (!isDate(value)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid date." });
        }
        break;
      case "Boolean":
        if (!["true", "false"].includes(value.toLowerCase())) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Choose yes or no." });
        }
        break;
      case "Dropdown": {
        const label = resolveDropdownLabel(value)?.toLowerCase() ?? value.toLowerCase();
        const allowed =
          operator === "In"
            ? ruleValue.split(",").map((v) => v.trim().toLowerCase())
            : [ruleValue.trim().toLowerCase()];

        const isMatch = allowed.includes(label);

        if ((operator === "Equals" || operator === "In") && !isMatch) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Choose a valid option." });
        }
        if (operator === "NotEquals" && isMatch) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "This option isn't allowed." });
        }
        break;
      }
      case "String":
        if (value.length > 500) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "500 characters max." });
        }
        break;
      case "Text":
        if (value.length > 5000) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "5000 characters max." });
        }
        break;
    }
  });
}