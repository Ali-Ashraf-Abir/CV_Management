import { ProfileClient } from "@/components/profile/profile-client";
import { getTranslations } from "next-intl/server";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const t = await getTranslations("profile");
  return { title: t("title") };
}

export default async function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <ProfileClient />
    </main>
  );
}