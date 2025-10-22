"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const navigation = [
	{ name: "Inicio", href: "/" },
	{ name: "Encomiendas", href: "/encomiendas" },
	{ name: "Notificaciones", href: "/notificaciones" },
	{ name: "Estadísticas", href: "/estadisticas" },
	{ name: "QR", href: "/qr" },
];

export function SiteHeader() {
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-30 border-b border-border/60 bg-card/80 backdrop-blur-xl">
			<div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between gap-4">
					<Link
						href="/"
						className="flex items-center gap-2 text-lg font-semibold tracking-tight"
					>
						<span className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-primary/15 text-primary">
							CT
						</span>
						CondoTrack
					</Link>
					<nav className="hidden items-center gap-1 rounded-full border border-border/60 bg-card px-1 py-1 shadow-sm md:flex">
						{navigation.map((item) => {
							const isActive =
								item.href === "/"
									? pathname === item.href
									: pathname.startsWith(item.href);
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
										isActive
											? "bg-primary text-primary-foreground shadow-sm"
											: "text-muted-foreground hover:text-foreground hover:bg-muted/60",
									)}
								>
									{item.name}
								</Link>
							);
						})}
					</nav>
					<div className="flex items-center gap-3">
						<span className="hidden text-sm font-medium text-muted-foreground md:inline">
							Demo
						</span>
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground md:hidden"
							aria-label="Menú"
						>
							{mobileMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile menu */}
				{mobileMenuOpen && (
					<nav className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3 md:hidden">
						{navigation.map((item) => {
							const isActive =
								item.href === "/"
									? pathname === item.href
									: pathname.startsWith(item.href);
							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setMobileMenuOpen(false)}
									className={cn(
										"rounded-[var(--radius-md)] border border-border/60 px-4 py-3 text-sm font-medium",
										isActive
											? "bg-primary text-primary-foreground shadow-sm"
											: "text-muted-foreground bg-card/70 hover:bg-muted/60 hover:text-foreground",
									)}
								>
									{item.name}
								</Link>
							);
						})}
						<div className="mt-2 border-t border-border/60 pt-3 text-center text-sm text-muted-foreground">
							Demo
						</div>
					</nav>
				)}
			</div>
		</header>
	);
}
