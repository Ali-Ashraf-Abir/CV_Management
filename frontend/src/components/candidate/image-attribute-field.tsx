"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ImagePlus, Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/api";
import { cvAttributesApi } from "@/lib/api/cvAttribute";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; 

export function ImageAttributeField({
    attributeId,
    value,
    onChange,
}: {
    attributeId: string;
    value: string;
    onChange: (v: string) => void;
}) {
    const t = useTranslations("cv");
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File | undefined) {
        if (!file) return;
        setError(null);

        if (!file.type.startsWith("image/")) {
            setError(t("imageInvalidType"));
            return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            setError(t("imageTooLarge"));
            return;
        }

        setIsUploading(true);
        try {
            const result = await cvAttributesApi.uploadImage(attributeId, file);
            if (!result.attributeValue) {
                throw new Error("Upload succeeded but no image URL was returned");
            }
            onChange(result.attributeValue);
        } catch (err) {
            const message = extractErrorMessage(err, t("imageUploadError"));
            setError(message);
            toast.error(message);
        } finally {
            setIsUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    async function handleRemove() {
        setError(null);
        const previous = value;
        onChange(""); 
        try {
            await cvAttributesApi.deleteImage(attributeId);
        } catch (err) {
            onChange(previous); 
            toast.error(extractErrorMessage(err, t("imageDeleteError")));
        }
    }

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
            />

            {value ? (
                <div className="group relative overflow-hidden rounded-xl border border-border/80">
                    <div className="relative aspect-video w-full bg-muted">
                        <Image src={value} alt="" fill className="object-cover" unoptimized />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-accent hover:bg-white"
                        >
                            <RefreshCw className="size-3.5" />
                            {t("imageReplace")}
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={isUploading}
                            className="flex items-center gap-1.5 rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-white"
                        >
                            <X className="size-3.5" />
                            {t("imageRemove")}
                        </button>
                    </div>
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Loader2 className="size-6 animate-spin text-white" />
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleFile(e.dataTransfer.files?.[0]);
                    }}
                    disabled={isUploading}
                    className={cn(
                        "flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm text-muted-foreground transition-colors",
                        isDragging
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50 hover:bg-accent",
                        isUploading && "pointer-events-none opacity-70"
                    )}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="size-6 animate-spin" />
                            <span>{t("imageUploading")}</span>
                        </>
                    ) : (
                        <>
                            <ImagePlus className="size-6" />
                            <span className="font-medium">{t("imageUploadCta")}</span>
                            <span className="text-xs">{t("imageUploadHint")}</span>
                        </>
                    )}
                </button>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}