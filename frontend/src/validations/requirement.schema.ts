import { z } from "zod";

import { ALLOWED_OPERATORS_BY_TYPE, RequirementOperator } from "@/types/position";
import { AttributeSummaryDto } from "@/types/attribute";

const isNumeric = (v: string) => v.trim() !== "" && !Number.isNaN(Number(v));
const isDate = (v: string) => !Number.isNaN(new Date(v).getTime());
export function buildRequirementSchema(attribute: AttributeSummaryDto | null) {
  return z
    .object({
      attributeId: z.string().uuid("Choose an attribute."),
      operator: z.string().optional() as z.ZodType<RequirementOperator>,
      value: z.string().trim().optional(),
      hasRequirement: z.boolean(),
      secondValue: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
      if (!attribute) return;
      if (!data.hasRequirement) {
        return;
      }

      const allowed = ALLOWED_OPERATORS_BY_TYPE[attribute.type];
      if (!allowed.includes(data.operator)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["operator"],
          message: `"${data.operator}" isn't valid for ${attribute.type} attributes.`,
        });
      }

      if (data.operator === "Between" && !data.secondValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["secondValue"],
          message: "Between requires a second value.",
        });
      }

      const checkValue = (value: string, path: "value" | "secondValue") => {
        switch (attribute.type) {
          case "Numeric":
            if (!isNumeric(value)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [path],
                message: `"${value}" isn't a valid number.`,
              });
            }
            break;
          case "Date":
          case "Period":
            if (!isDate(value)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [path],
                message: `"${value}" isn't a valid date.`,
              });
            }
            break;
          case "Boolean":
            if (!["true", "false"].includes(value.toLowerCase())) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [path],
                message: "Must be true or false.",
              });
            }
            break;
          case "Dropdown": {
            const validValues = new Set(
              attribute.values.map((v) => v.value.toLowerCase())
            );
            const tokens =
              data.operator === "In"
                ? value.split(",").map((t) => t.trim()).filter(Boolean)
                : [value];
            if (tokens.length === 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [path],
                message: "At least one option is required.",
              });
            }
            for (const token of tokens) {
              if (!validValues.has(token.toLowerCase())) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  path: [path],
                  message: `"${token}" isn't a valid option for ${attribute.title}.`,
                });
              }
            }
            break;
          }
        }
      };

      if(data.value){
        checkValue(data.value, "value");
      }
      if (data.operator === "Between" && data.secondValue) {
        checkValue(data.secondValue, "secondValue");
      }
    });
}

export type RequirementFormValues = {
  attributeId: string;
  operator: RequirementOperator | "";
  value: string;
  hasRequirement:boolean;
  secondValue: string;
};
