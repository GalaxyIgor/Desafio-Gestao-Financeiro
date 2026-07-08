"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/format";
import { paymentMethodLabels } from "../schema";
import type { ExpenseEntry } from "./expense-entry-dialog";

export function ExpensesTable({
  entries,
  onEdit,
  onDelete,
}: {
  entries: ExpenseEntry[];
  onEdit: (entry: ExpenseEntry) => void;
  onDelete: (entry: ExpenseEntry) => void;
}) {
  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma despesa cadastrada.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="whitespace-nowrap">
                {formatDate(entry.date)}
              </TableCell>
              <TableCell className="font-medium">{entry.description}</TableCell>
              <TableCell className="text-muted-foreground">
                {entry.category}
              </TableCell>
              <TableCell>
                {entry.paymentMethod && (
                  <Badge variant="secondary">
                    {paymentMethodLabels[entry.paymentMethod]}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(entry.amount)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" aria-label="Ações" />
                    }
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(entry)}>
                      <Pencil className="size-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(entry)}
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
  );
}
