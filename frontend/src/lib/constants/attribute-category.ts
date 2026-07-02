import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Sparkles,
  Cpu,
  FolderKanban,
  Languages,
  BadgeCheck,
  HeartHandshake,
  Settings2,
  CalendarClock,
  Tag,
  LucideIcon,
} from "lucide-react";
import { AttributeCategory } from "@/types/position";

export const CATEGORY_LABEL: Record<AttributeCategory, string> = {
  Personal: "Personal details",
  Contact: "Contact",
  Education: "Education",
  Experience: "Experience",
  Skills: "Skills",
  Technologies: "Technologies",
  Projects: "Projects",
  Languages: "Languages",
  Certifications: "Certifications",
  SoftSkills: "Soft skills",
  Preferences: "Preferences",
  Availability: "Availability",
  Custom: "Additional details",
};

export const CATEGORY_ICON: Record<AttributeCategory, LucideIcon> = {
  Personal: User,
  Contact: Mail,
  Education: GraduationCap,
  Experience: Briefcase,
  Skills: Sparkles,
  Technologies: Cpu,
  Projects: FolderKanban,
  Languages: Languages,
  Certifications: BadgeCheck,
  SoftSkills: HeartHandshake,
  Preferences: Settings2,
  Availability: CalendarClock,
  Custom: Tag,
};

/** Order categories appear in on the CV — roughly resume order. */
export const CATEGORY_ORDER: AttributeCategory[] = [
  "Personal",
  "Contact",
  "Experience",
  "Education",
  "Skills",
  "Technologies",
  "Projects",
  "Certifications",
  "Languages",
  "SoftSkills",
  "Availability",
  "Preferences",
  "Custom",
];
