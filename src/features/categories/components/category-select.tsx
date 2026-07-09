"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "../api";

/**
 * Seletor de categoria alimentado pela API.
 * Mostra categorias do tipo informado + as "ambos".
 * Se o valor atual não estiver na lista (ex.: lançamento antigo), inclui como opção.
 */
export function CategorySelect({
  value,
  onValueChange,
  type,
  id,
}: {
  value: string;
  onValueChange: (value: string) => void;
  type: "income" | "expense";
  id?: string;
}) {
  const { data } = useCategories();

  const options = (data ?? []).filter(
    (c) => c.type === type || c.type === "both",
  );
  const names = options.map((o) => o.name);
  const extra = value && !names.includes(value) ? value : null;
  const isEmpty = options.length === 0 && !extra;

  return (
    <Select
      value={value || null}
      onValueChange={(v) => onValueChange(v ?? "")}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Selecione" />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.name}>
            <span className="flex items-center gap-2">
              {o.color && (
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: o.color }}
                />
              )}
              {o.name}
            </span>
          </SelectItem>
        ))}
        {extra && <SelectItem value={extra}>{extra}</SelectItem>}
        {isEmpty && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            Nenhuma categoria. Cadastre em Categorias.
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
