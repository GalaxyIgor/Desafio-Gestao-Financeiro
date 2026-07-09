import type { paths } from "@/lib/api/schema";
import { downloadWorkbook, type Sheet } from "@/lib/xlsx";

type ReportsData =
  paths["/reports"]["get"]["responses"]["200"]["content"]["application/json"];

/**
 * Exporta os dados do relatório para um arquivo .xlsx com três abas:
 * Resumo mensal, Receitas × Despesas e Despesas por categoria.
 */
export function exportReportsToXlsx(data: ReportsData, range: string): void {
  const monthlySummary: Sheet = {
    name: "Resumo mensal",
    rows: [
      ["Período", "Receitas", "Despesas", "Saldo"],
      ...data.monthlySummary.map((row) => [
        row.period,
        row.income,
        row.expenses,
        row.balance,
      ]),
    ],
  };

  const incomeVsExpense: Sheet = {
    name: "Receitas x Despesas",
    rows: [
      ["Período", "Receitas", "Despesas"],
      ...data.incomeVsExpense.income.points.map((point, i) => [
        point.label,
        point.value,
        data.incomeVsExpense.expenses.points[i]?.value ?? 0,
      ]),
    ],
  };

  const expensesByCategory: Sheet = {
    name: "Despesas por categoria",
    rows: [
      ["Categoria", "Valor", "% do total"],
      ...data.expensesByCategory.items.map((item) => [
        item.category,
        item.amount,
        item.percent / 100,
      ]),
      ["Total", data.expensesByCategory.total, ""],
    ],
  };

  const stamp = new Date().toISOString().slice(0, 10);
  downloadWorkbook(
    [monthlySummary, incomeVsExpense, expensesByCategory],
    `relatorio-${range}-${stamp}.xlsx`,
  );
}
