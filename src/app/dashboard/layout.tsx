"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ROLES } from "@/constants";
import {
  Scissors,
  Calendar,
  Users,
  Store,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  FileBarChart,
} from "lucide-react";
import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [ROLES.ADMIN] },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar, roles: [ROLES.ADMIN, ROLES.BARBER] },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users, roles: [ROLES.ADMIN] },
  { href: "/dashboard/barbeiros", label: "Barbeiros", icon: Store, roles: [ROLES.ADMIN] },
  { href: "/dashboard/servicos", label: "Serviços", icon: Scissors, roles: [ROLES.ADMIN] },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: FileBarChart, roles: [ROLES.ADMIN] },
  { href: "/dashboard/config", label: "Configurações", icon: Settings, roles: [ROLES.ADMIN] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoaded = !!user;
  const visibleNav = isLoaded
    ? navItems.filter((item) => (item.roles as string[]).includes(user!.role))
    : [];

  return (
    <div className="flex h-screen bg-stone-100">
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
            : "w-64"
        } bg-stone-950 text-white flex flex-col shadow-xl`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-stone-800">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
            <Scissors className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Barber<span className="text-primary">App</span>
          </span>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="ml-auto cursor-pointer text-stone-400 hover:text-white" aria-label="Fechar menu">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {!isLoaded ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-stone-800/50 rounded-lg animate-pulse" />
            ))
          ) : (
            visibleNav.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })
          )}
        </nav>

        <div className="p-4 border-t border-stone-800">
          {isLoaded && (
            <div className="mb-3 px-2 text-sm">
              <p className="font-medium text-white truncate">{user!.name}</p>
              <p className="text-stone-500 text-xs truncate">{user!.email}</p>
            </div>
          )}
          {!isLoaded && (
            <div className="mb-3 px-2 space-y-2">
              <div className="h-4 bg-stone-800/50 rounded animate-pulse w-24" />
              <div className="h-3 bg-stone-800/50 rounded animate-pulse w-32" />
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800/50 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-stone-200 px-6 py-3.5 flex items-center gap-4 shadow-sm">
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} className="cursor-pointer text-stone-600 hover:text-stone-900" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h1 className="font-bold text-lg text-foreground">
            {visibleNav.find((n) => n.href === pathname)?.label || "Dashboard"}
          </h1>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
