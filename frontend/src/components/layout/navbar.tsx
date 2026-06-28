"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X, Briefcase } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();
  const {user,isAuthenticated}=useAuth();
  const base = `/${locale}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href={base}
            className="flex items-center gap-2 font-semibold text-foreground hover:opacity-80 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">SkillSync</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
            <div className="mx-2 h-5 w-px bg-border" />
            {isAuthenticated?<span>{user?.firstName}</span>:<div><Button variant="ghost" size="sm" asChild>
              <Link href={`${base}/login`}>{t("login")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`${base}/register`}>{t("register")}</Link>
            </Button></div>}
          </nav>

          {/* Mobile: toggles + hamburger */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-200 border-t border-border/60",
          open ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href={`${base}/login`}>{t("login")}</Link>
          </Button>
          <Button
            className="w-full"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href={`${base}/register`}>{t("register")}</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
