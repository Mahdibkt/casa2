import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, Search, User, PlusCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const linkCls = (active: boolean) =>
    `text-sm font-medium transition-colors ${active ? "text-primary" : "text-foreground/70 hover:text-primary"}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground">
            <Home className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Médina<span className="text-gold">Stay</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className={linkCls(path === "/")}>Accueil</Link>
          <Link to="/search" search={{ type: "rent" }} className={linkCls(path === "/search")}>Louer</Link>
          <Link to="/search" search={{ type: "sale" }} className={linkCls(false)}>Acheter</Link>
          <Link to="/search" search={{ type: "vacation" }} className={linkCls(false)}>Vacances</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/search" className="md:hidden">
            <Button size="icon" variant="ghost"><Search className="h-5 w-5" /></Button>
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Mon espace
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                className="gap-2"
                onClick={() => signOut().then(() => navigate({ to: "/" }))}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Connexion</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
