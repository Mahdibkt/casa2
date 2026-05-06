import { Link } from "@tanstack/react-router";
import { Home, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-secondary/40">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground">
              <Home className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold">Médina<span className="text-gold">Stay</span></span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            La plateforme méditerranéenne pour acheter, louer et séjourner — de Sidi Bou Saïd à Paris.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Explorer</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/search" className="hover:text-primary">Acheter</Link></li>
            <li><Link to="/search" className="hover:text-primary">Louer</Link></li>
            <li><Link to="/search" className="hover:text-primary">Vacances</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary">Publier un bien</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Société</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>À propos</li>
            <li>Carrières</li>
            <li>Presse</li>
            <li>Confiance & sécurité</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> La Marsa, Tunisie</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contact@medinastay.tn</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +216 71 000 000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MédinaStay — Tous droits réservés.
      </div>
    </footer>
  );
}
