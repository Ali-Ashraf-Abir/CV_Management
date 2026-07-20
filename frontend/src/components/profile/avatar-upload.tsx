"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Camera, Loader2, Trash2 } from "lucide-react";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface AvatarUploadProps {
  photoUrl: string;
  firstName: string;
  lastName: string;
  uploading: boolean;
  removing: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onValidationError: (messageKey: "imageTooLarge" | "imageWrongType") => void;
}

export function AvatarUpload({
  photoUrl,
  firstName,
  lastName,
  uploading,
  removing,
  onUpload,
  onRemove,
  onValidationError,
}: AvatarUploadProps) {
  const t = useTranslations("profile.photo");
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = uploading || removing;

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onValidationError("imageWrongType");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      onValidationError("imageTooLarge");
      return;
    }
    onUpload(file);
  }

  return (
    <div className="flex items-center gap-5">
      <div className="group relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-secondary text-secondary-foreground ring-2 ring-offset-2 ring-ring ring-offset-card transition disabled:opacity-70"
          aria-label={t("change")}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-semibold">{initials}</span>
          )}

          <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 text-transparent transition group-hover:bg-foreground/40 group-hover:text-background">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{t("hint")}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline disabled:opacity-50"
          >
            {uploading ? t("uploading") : t("change")}
          </button>

          {photoUrl && (
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="inline-flex items-center gap-1 text-sm font-medium text-destructive underline-offset-4 hover:underline disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {removing ? t("removing") : t("remove")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}