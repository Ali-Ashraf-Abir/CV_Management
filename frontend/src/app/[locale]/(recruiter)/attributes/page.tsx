"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ListPlus,
  MoreHorizontal,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash2,
  Eye,
} from "lucide-react";

import { attributesApi } from "@/lib/api/attributes";

import { AttributeTypeBadge } from "@/components/attributes/type-badge";
import { AttributeFormDialog, AttributeFormValues } from "@/components/attributes/attribute-form-dialog";
import { ConfirmDeleteDialog } from "@/components/attributes/confirm-delete-dialog";
import { toast } from "sonner";
import { AttributeListDto, CreateAttributeDto } from "@/types/attribute";
import { extractErrorMessage } from "@/lib/api";

export default function AttributesPage() {
  const t = useTranslations("attributes.list");
  const tCategories = useTranslations("attributes.categories");
  const tDeleteAttribute = useTranslations("attributes.deleteAttribute");
  const locale = useLocale();
  const router = useRouter();

  const [attributes, setAttributes] = useState<AttributeListDto[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AttributeListDto | null>(null);

  async function load() {
    try {
      setLoadError(null);
      const data = await attributesApi.list();
      setAttributes(data);
    } catch (err) {
      setLoadError(extractErrorMessage(err, t("loadError")));
    }
  }

  useEffect(() => {
    load();

  }, []);

  const categories = useMemo(() => {
    if (!attributes) return [];
    return Array.from(new Set(attributes.map((a) => a.category))).sort();
  }, [attributes]);

  const filtered = useMemo(() => {
    if (!attributes) return [];
    return attributes.filter((a) => {
      const matchesSearch = a.title.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = categoryFilter === "all" || a.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [attributes, search, categoryFilter]);

  async function handleCreate(values: AttributeFormValues) {
    const dto: CreateAttributeDto = { ...values };
    const created = await attributesApi.create(dto);
    toast.success(t("createSuccess", { title: created.title }));
    await load();
  }

  async function handleDelete(attribute: AttributeListDto) {
    await attributesApi.remove(attribute.id);
    toast.success(t("deleteSuccess", { title: attribute.title }));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("eyebrow")}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <ListPlus className="size-4" />
            {t("newAttribute")}
          </Button>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <SelectValue placeholder={t("categoryFilterPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {tCategories(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {attributes && (
          <span className="text-sm text-muted-foreground">
            {t("resultsCount", { filtered: filtered.length, total: attributes.length })}
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("columns.title")}</TableHead>
              <TableHead>{t("columns.category")}</TableHead>
              <TableHead>{t("columns.type")}</TableHead>
              <TableHead className="w-12 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes === null && !loadError && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}

            {loadError && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  {loadError}{" "}
                  <button onClick={load} className="font-medium text-foreground underline underline-offset-2">
                    {t("tryAgain")}
                  </button>
                </TableCell>
              </TableRow>
            )}

            {attributes !== null && filtered.length === 0 && !loadError && (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center">
                  <p className="text-sm font-medium">{t("emptyTitle")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {attributes.length === 0 ? t("emptyNoneYet") : t("emptyNoMatch")}
                  </p>
                </TableCell>
              </TableRow>
            )}

            {filtered.map((attribute) => (
              <TableRow
                key={attribute.id}
                className="cursor-pointer"
                onClick={() => router.push(`/${locale}/attributes/${attribute.id}`)}
              >
                <TableCell className="font-medium">{attribute.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {tCategories(attribute.category)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <AttributeTypeBadge type={attribute.type} />
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/${locale}/attributes/${attribute.id}`}>
                          <Eye className="size-4" />
                          {t("rowMenu.open")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/${locale}/attributes/${attribute.id}?edit=1`}>
                          <Pencil className="size-4" />
                          {t("rowMenu.edit")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTarget(attribute)}
                      >
                        <Trash2 className="size-4" />
                        {t("rowMenu.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AttributeFormDialog open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} />

      {deleteTarget && (
        <ConfirmDeleteDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title={tDeleteAttribute("title", { title: deleteTarget.title })}
          description={tDeleteAttribute("description")}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}
    </div>
  );
}
