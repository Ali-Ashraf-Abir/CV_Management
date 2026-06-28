import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Briefcase, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const t = await getTranslations("nav");
  const locale = await getLocale();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16 text-center">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground">
        <Zap className="h-3.5 w-3.5 text-primary" />
        Connecting talent with opportunity
      </div>

      {/* Headline */}
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
        Where great careers{" "}
        <span className="text-primary">begin</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
        SkillSync brings candidates and recruiters together on a platform built for speed,
        clarity, and meaningful connections.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button size="lg" asChild>
          <Link href={`/${locale}/register`}>{t("register")}</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href={`/${locale}/login`}>{t("login")}</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl w-full">
        {[
          { icon: Users, label: "Active candidates", value: "12,000+" },
          { icon: Briefcase, label: "Open positions", value: "3,400+" },
          { icon: Zap, label: "Placements this month", value: "280" },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-6"
          >
            <Icon className="h-5 w-5 text-primary" />
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
