import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/authProvider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "SkillSync — Connect talent with opportunity",
  description: "The professional hiring platform for candidates and recruiters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <AuthProvider>
        <body className={`${geist.variable} font-sans antialiased`}>
        <Toaster/>
        {children}
        </body>
      </AuthProvider>
    </html>
  );
}
