import { z } from "zod";
import { AttributeType } from "@/types/position";

const isNumeric = (v: string) => v.trim() !== "" && !Number.isNaN(Number(v));
const isDate = (v: string) => !Number.isNaN(new Date(v).getTime());

export function buildAttributeValueSchema(type: AttributeType, dropdownOptions: string[] = []) {
  return z.string().trim().min(1, "This field is required.").superRefine((value, ctx) => {
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
        const valid = new Set(dropdownOptions.map((o) => o.toLowerCase()));
        if (!valid.has(value.toLowerCase())) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Choose a valid option." });
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
