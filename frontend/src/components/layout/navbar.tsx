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
import { NavOverflowMenu } from "./nav-overflow-menu";

type NavLink = { href: string; label: string };
const MAX_VISIBLE_LINKS = 6;

function getRoleLinks(role: string | undefined, base: string, t: any): NavLink[] {
  const candidateLinks: NavLink[] = [
    { href: `${base}/dashboard`, label: t("dashboard") },
    { href: `${base}/jobs`, label: t("jobs") },
    { href: `${base}/applied-jobs`, label: t("appliedJobs") },
    { href: `${base}/cv`, label: t("cv") },
    { href: `${base}/profile`, label: t("profile") },
  ];

  const recruiterLinks: NavLink[] = [
    { href: `${base}/dashboard`, label: t("dashboard") },
    { href: `${base}/jobs`, label: t("jobs") },
    { href: `${base}/my-positions`, label: t("myPositions") },
    { href: `${base}/all-positions`, label: t("allPositions") },
    { href: `${base}/attributes`, label: t("attributes") },

    { href: `${base}/profile`, label: t("profile") },
  ];
  const adminExtraLinks: NavLink[] = [{ href: `${base}/users`, label: t("users") }];

  const adminLinks: NavLink[] = Array.from(
    new Map([...candidateLinks, ...recruiterLinks, ...adminExtraLinks].map((l) => [l.href, l])).values()
  );

  switch (role) {
    case "Candidate":
      return candidateLinks;
    case "Recruiter":
      return recruiterLinks;
    case "Administrator":
      return adminLinks;
    default:
      return [];
  }
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const base = `/${locale}`;

  if (isLoading) {
    return <></>;
  }

  const roleLinks = isAuthenticated ? getRoleLinks(user?.role, base, t) : [];
  const visibleLinks = roleLinks.slice(0, MAX_VISIBLE_LINKS);
  const overflowLinks = roleLinks.slice(MAX_VISIBLE_LINKS);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center gap-2">

          <Link
            href={base}
            className="flex shrink-0 items-center gap-2 font-semibold text-foreground hover:opacity-80 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">SkillSync</span>
          </Link>

    
          <nav className="hidden md:flex min-w-0 flex-1 items-center justify-center gap-1 ">
            {visibleLinks.map((link) => (
              <Button key={link.href} variant="ghost" size="sm" asChild className="shrink-0">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
            <NavOverflowMenu links={overflowLinks} label={t("more")} />
          </nav>

 
          <nav className="hidden md:flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
            <div className="mx-2 h-5 w-px bg-border" />
            {isAuthenticated ? (
              <div className="flex items-center justify-center gap-3">
                <span className="max-w-[8rem] truncate">{user?.firstName}</span>
                {user?.photoUrl && (
                  <img src={user?.photoUrl} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                )}
                <Button size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`${base}/login`}>{t("login")}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`${base}/register`}>{t("register")}</Link>
                </Button>
              </div>
            )}
          </nav>


          <div className="flex md:hidden items-center gap-1 ml-auto">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-200 border-t border-border/60",
          open ? "max-h-[28rem] opacity-100 overflow-y-auto" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {isAuthenticated ? (
            <>
              {roleLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setOpen(false)}>
                <Link href={`${base}/login`}>{t("login")}</Link>
              </Button>
              <Button className="w-full" asChild onClick={() => setOpen(false)}>
                <Link href={`${base}/register`}>{t("register")}</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}