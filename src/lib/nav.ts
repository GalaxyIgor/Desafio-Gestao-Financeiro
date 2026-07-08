import {
  LayoutDashboard,
  ArrowDownToLine,
  CreditCard,
  LineChart,
  Target,
  FileBarChart,
  TrendingUp,
  Tags,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { title: "Visão geral", href: "/", icon: LayoutDashboard },
  { title: "Receitas", href: "/income", icon: ArrowDownToLine },
  { title: "Despesas", href: "/expenses", icon: CreditCard },
  { title: "Investimentos", href: "/investments", icon: LineChart },
  { title: "Metas", href: "/goals", icon: Target },
  { title: "Relatórios", href: "/reports", icon: FileBarChart },
  { title: "Projeções", href: "/projections", icon: TrendingUp },
  { title: "Categorias", href: "/categories", icon: Tags },
  { title: "Usuários", href: "/users", icon: Users },
  { title: "Configurações", href: "/settings", icon: Settings },
];
