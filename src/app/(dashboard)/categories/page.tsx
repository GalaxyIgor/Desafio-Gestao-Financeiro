"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  useCategories,
  useDeleteCategory,
  type CategoryType,
} from "@/features/categories/api";
import {
  CategoryDialog,
  type Category,
} from "@/features/categories/components/category-dialog";
import { categoryTypeLabels } from "@/features/categories/schema";

type Filter = "all" | CategoryType;

export default function CategoriesPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data, isLoading, isError } = useCategories(
    filter === "all" ? undefined : filter,
  );
  const del = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  return (
    <>
      <PageHeader
        title="Categorias"
        description="Organize receitas e despesas"
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nova categoria
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
          <TabsTrigger value="expense">Despesas</TabsTrigger>
          <TabsTrigger value="both">Ambos</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          {isError && (
            <p className="py-8 text-center text-sm text-destructive">
              Não foi possível carregar as categorias.
            </p>
          )}
          {isLoading && <Skeleton className="h-40 w-full" />}
          {data && data.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma categoria cadastrada.
            </p>
          )}
          {data && data.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-2">
                          {cat.color && (
                            <span
                              className="size-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                          )}
                          {cat.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {categoryTypeLabels[cat.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Ações"
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(cat as Category);
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil className="size-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleting(cat as Category)}
                            >
                              <Trash2 className="size-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir categoria?"
        description={
          deleting ? `"${deleting.name}" será removida.` : undefined
        }
        confirmLabel="Excluir"
        loading={del.isPending}
        onConfirm={() => {
          if (!deleting) return;
          del.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </>
  );
}
