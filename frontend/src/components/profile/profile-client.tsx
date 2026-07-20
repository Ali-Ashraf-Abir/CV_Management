"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserProfileDto } from "@/types/profile";
import { profileApi } from "@/lib/api/profile";
import { extractErrorMessage } from "@/lib/api";
import { AvatarUpload } from "./avatar-upload";
import { ProfileDetailsForm } from "./profile-details-form";
import { ChangePasswordForm } from "./change-password-form";


type Banner = { type: "success" | "error"; message: string } | null;

export function ProfileClient() {
  const t = useTranslations("profile");
  const tDetails = useTranslations("profile.details");
  const tSecurity = useTranslations("profile.security");
  const tErrors = useTranslations("profile.errors");
  const tValidation = useTranslations("profile.validation");

  const { refreshUser } = useAuth();

  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner>(null);

  const [savingDetails, setSavingDetails] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;

    profileApi
      .getMine()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(extractErrorMessage(err, tErrors("loadFailed")));
      });

    return () => {
      cancelled = true;
    };
  }, [tErrors]);

  function showBanner(next: Banner) {
    setBanner(next);
    if (next) {
      setTimeout(() => setBanner(null), 4000);
    }
  }

  async function handleSaveDetails(values: { firstName: string; lastName: string }) {
    setSavingDetails(true);
    try {
      const updated = await profileApi.update(values);
      setProfile(updated);
      refreshUser().catch(() => {});
      showBanner({ type: "success", message: tDetails("saved") });
    } catch (err) {
      showBanner({ type: "error", message: extractErrorMessage(err, tErrors("genericFailed")) });
    } finally {
      setSavingDetails(false);
    }
  }

  async function handleUploadPhoto(file: File) {
    setUploadingPhoto(true);
    try {
      const updated = await profileApi.uploadPhoto(file);
      setProfile(updated);
      refreshUser().catch(() => {});
    } catch (err) {
      showBanner({ type: "error", message: extractErrorMessage(err, tErrors("genericFailed")) });
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleRemovePhoto() {
    if (!profile) return;
    setRemovingPhoto(true);
    try {
      await profileApi.deletePhoto();
      setProfile({ ...profile, photoUrl: "" });
      refreshUser().catch(() => {});
    } catch (err) {
      showBanner({ type: "error", message: extractErrorMessage(err, tErrors("genericFailed")) });
    } finally {
      setRemovingPhoto(false);
    }
  }

  function handlePhotoValidationError(key: "imageTooLarge" | "imageWrongType") {
    showBanner({ type: "error", message: tValidation(key) });
  }

  async function handleChangePassword(values: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) {
    setChangingPassword(true);
    try {
      await profileApi.changePassword(values);
      showBanner({ type: "success", message: tSecurity("success") });
    } catch (err) {
      showBanner({ type: "error", message: extractErrorMessage(err, tErrors("genericFailed")) });
    } finally {
      setChangingPassword(false);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-destructive">
        {loadError}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {banner && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            banner.type === "success"
              ? "border-border bg-secondary text-secondary-foreground"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
          role="status"
        >
          {banner.message}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{t("photo.heading")}</h2>
        <AvatarUpload
          photoUrl={profile.photoUrl}
          firstName={profile.firstName}
          lastName={profile.lastName}
          uploading={uploadingPhoto}
          removing={removingPhoto}
          onUpload={handleUploadPhoto}
          onRemove={handleRemovePhoto}
          onValidationError={handlePhotoValidationError}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{tDetails("heading")}</h2>
        <ProfileDetailsForm
          firstName={profile.firstName}
          lastName={profile.lastName}
          email={profile.email}
          role={profile.role}
          saving={savingDetails}
          onSave={handleSaveDetails}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-1 text-sm font-semibold text-foreground">{tSecurity("heading")}</h2>
        <ChangePasswordForm submitting={changingPassword} onSubmit={handleChangePassword} />
      </section>
    </div>
  );
}