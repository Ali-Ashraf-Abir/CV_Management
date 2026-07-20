"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ListPlus,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { attributesApi } from "@/lib/api/attributes";

import { AttributeTypeBadge } from "@/components/attributes/type-badge";
import { AttributeFormDialog, AttributeFormValues } from "@/components/attributes/attribute-form-dialog";
import { ConfirmDeleteDialog } from "@/components/attributes/confirm-delete-dialog";
import { toast } from "sonner";
import { AttributeListDto, CreateAttributeDto, PagedResultDto } from "@/types/attribute";
import { extractErrorMessage } from "@/lib/api";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

export default function AttributesPage() {
  const t = useTranslations("attributes.list");
  const tCategories = useTranslations("attributes.categories");
  const tDeleteAttribute = useTranslations("attributes.deleteAttribute");
  const locale = useLocale();
  const router = useRouter();

  const [result, setResult] = useState<PagedResultDto<AttributeListDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Debounce the raw search input.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  async function load() {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await attributesApi.list({
        search: search || undefined,
        category: categoryFilter,
        page,
        pageSize: PAGE_SIZE,
      });
      setResult(data);
      setSelectedIds(new Set());
    } catch (err) {
      setLoadError(extractErrorMessage(err, t("loadError")));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, page]);

  useEffect(() => {
    attributesApi.categories().then(setCategories).catch(() => {});
  }, []);

  const items = result?.items ?? [];
  const totalPages = result?.totalPages ?? 0;

  const allOnPageSelected = items.length > 0 && items.every((a) => selectedIds.has(a.id));

  function toggleAll() {
    setSelectedIds((prev) => {
      if (allOnPageSelected) return new Set();
      return new Set(items.map((a) => a.id));
    });
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  async function handleCreate(values: AttributeFormValues) {
    const dto: CreateAttributeDto = { ...values };
    const created = await attributesApi.create(dto);
    toast.success(t("createSuccess", { title: created.title }));
    await load();
  }

  function handleEditSelected() {
    if (selectedArray.length !== 1) return;
    router.push(`/${locale}/attributes/${selectedArray[0]}?edit=1`);
  }

  async function handleBulkDelete() {
    try {
      await attributesApi.removeMany(selectedArray);
      toast.success(t("bulkDeleteSuccess", { count: selectedArray.length }));
      await load();
    } catch (err) {
      toast.error(extractErrorMessage(err, t("bulkDeleteError")));
    }
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
        >
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
        {result && (
          <span className="text-sm text-muted-foreground">
            {t("resultsCount", { filtered: result.totalCount, total: result.totalCount })}
          </span>
        )}
      </div>

      {/* Selection toolbar */}
      {selectedIds.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">
              {t("toolbar.selectedCount", { count: selectedIds.size })}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              <X className="size-3.5" />
              {t("toolbar.clear")}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={selectedIds.size !== 1}
              onClick={handleEditSelected}
            >
              <Pencil className="size-4" />
              {t("toolbar.edit")}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
              <Trash2 className="size-4" />
              {t("toolbar.delete")}
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox checked={allOnPageSelected} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>{t("columns.title")}</TableHead>
              <TableHead>{t("columns.category")}</TableHead>
              <TableHead>{t("columns.type")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && !result && (
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

            {result !== null && items.length === 0 && !loadError && (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center">
                  <p className="text-sm font-medium">{t("emptyTitle")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.totalCount === 0 ? t("emptyNoneYet") : t("emptyNoMatch")}
                  </p>
                </TableCell>
              </TableRow>
            )}

            {items.map((attribute) => (
              <TableRow
                key={attribute.id}
                className="cursor-pointer"
                data-state={selectedIds.has(attribute.id) ? "selected" : undefined}
                onClick={() => router.push(`/${locale}/attributes/${attribute.id}`)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(attribute.id)}
                    onCheckedChange={() => toggleOne(attribute.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{attribute.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {tCategories(attribute.category)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <AttributeTypeBadge type={attribute.type} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {result && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t("pagination.pageOf", { page: result.page, totalPages })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              {t("pagination.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t("pagination.next")}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <AttributeFormDialog open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} />

      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={tDeleteAttribute("bulkTitle", { count: selectedArray.length })}
        description={tDeleteAttribute("bulkDescription")}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}