"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { attributesApi } from "@/lib/api/attributes";

import { AttributeTypeBadge } from "@/components/attributes/type-badge";
import { AttributeFormDialog, AttributeFormValues } from "@/components/attributes/attribute-form-dialog";
import { AttributeValueTable } from "@/components/attributes/attribute-value-table";
import { AttributePreview } from "@/components/attributes/attribute-preview";
import { ConfirmDeleteDialog } from "@/components/attributes/confirm-delete-dialog";
import { toast } from "sonner";
import { AttributeDto, requiresValues } from "@/types/attribute";
import { extractErrorMessage } from "@/lib/api";

export default function AttributeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const t = useTranslations("attributes.detail");
  const tCategories = useTranslations("attributes.categories");
  const tTypes = useTranslations("attributes.types");
  const tDeleteAttribute = useTranslations("attributes.deleteAttribute");

  const [attribute, setAttribute] = useState<AttributeDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(searchParams.get("edit") === "1");
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function load() {
    try {
      setLoadError(null);
      const data = await attributesApi.getById(id);
      setAttribute(data);
    } catch (err) {
      setLoadError(extractErrorMessage(err, t("loadError")));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleUpdate(values: AttributeFormValues) {
    if (!attribute) return;
    try {
      const updated = await attributesApi.update(id, { ...values, version: attribute.version });
      setAttribute({ ...updated, values: updated.values ?? attribute.values });
      toast.success(t("updateSuccess"));
    } catch (err) {
      throw new Error(extractErrorMessage(err, t("updateError")));
    }
  }

  async function handleDelete() {
    await attributesApi.remove(id);
    toast.success(t("deleteSuccess", { title: attribute?.title ?? "" }));
    router.push(`/${locale}/attributes`);
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">{loadError}</p>
        <Button variant="outline" className="mt-4" onClick={load}>
          {t("tryAgain")}
        </Button>
      </div>
    );
  }

  if (!attribute) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href={`/${locale}/attributes`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        {t("backToList")}
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight">{attribute.title}</h1>
            <AttributeTypeBadge type={attribute.type} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="font-normal">
              {tCategories(attribute.category)}
            </Badge>
            {attribute.isFilterable && (
              <Badge variant="outline" className="font-normal">
                {t("filterable")}
              </Badge>
            )}
          </div>
          {attribute.description && (
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">{attribute.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFormOpen(true)}>
            <Pencil className="size-4" />
            {t("edit")}
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            {t("delete")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {requiresValues(attribute.type) ? (
            <Card>
              <CardContent className="pt-6">
                <AttributeValueTable
                  attributeId={attribute.id}
                  values={attribute.values}
                  version={attribute.version}
                  onChange={(values) => setAttribute({ ...attribute, values })}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("noValuesTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("noValuesBody", {
                    type: tTypes(`${attribute.type}.label`),
                    dropdown: tTypes("Dropdown.label"),
                  })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <AttributePreview attribute={attribute} />
        </div>
      </div>

      <AttributeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        attribute={attribute}
        onSubmit={handleUpdate}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={tDeleteAttribute("title", { title: attribute.title })}
        description={tDeleteAttribute("description")}
        onConfirm={handleDelete}
      />
    </div>
  );
}
