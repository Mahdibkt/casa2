import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, ShieldCheck, MapPinned } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/mock-data";
import { useProperties } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MédinaStay — Vente, location & vacances en Méditerranée" },
      { name: "description", content: "Découvrez villas, appartements et maisons d'hôtes à Sidi Bou Saïd, La Marsa, Hammamet, Paris, Dubai." },
    ],
  }),
  component: Index,
});

function Index() {
  const { properties, loading, error } = useProperties();
  const featured = properties.filter((p) => p.featured);

  return (
    <div>
      {/* HERO */}
      <section className="relative">
        <div className="relative h-[640px] w-full overflow-hidden">
          <img src={heroImg} alt="Villa méditerranéenne" width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/20 to-background" />
        </div>

        <div className="container absolute inset-x-0 top-1/2 mx-auto -translate-y-1/2 px-4">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> Plus de 1 200 biens d'exception
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-primary-foreground drop-shadow-lg md:text-6xl">
              Trouvez votre refuge<br />en Méditerranée.
            </h1>
            <p className="mt-4 max-w-xl text-base text-primary-foreground/90 drop-shadow md:text-lg">
              De Sidi Bou Saïd aux Champs-Élysées, achetez, louez ou séjournez dans des biens soigneusement sélectionnés.
            </p>
          </div>

          <div className="mt-8 max-w-5xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Explorer par catégorie</h2>
            <p className="mt-2 text-muted-foreground">Trouvez le bien qui correspond à votre style de vie.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              to="/search"
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
            >
              <div className="text-4xl">{cat.icon}</div>
              <h3 className="mt-4 font-display text-lg font-semibold">{cat.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{cat.count} biens disponibles</p>
              <ArrowRight className="absolute right-5 top-5 h-5 w-5 text-muted-foreground transition-all group-hover:right-4 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container mx-auto px-4 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Biens à la une</h2>
            <p className="mt-2 text-muted-foreground">Une sélection de coups de cœur soigneusement vérifiés.</p>
          </div>
          <Link to="/search" className="hidden text-sm font-medium text-primary hover:underline md:inline-flex">
            Voir tout →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
          ))}
          {!loading && error && (
            <p className="col-span-full rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              Impossible de charger les biens : {error}
            </p>
          )}
          {!loading && !error && featured.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">Aucun bien disponible pour le moment.</p>
          )}
          {!loading && !error && featured.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      </section>

      {/* TRUST */}
      <section className="container mx-auto mt-10 px-4">
        <div className="rounded-3xl bg-gradient-hero p-10 text-primary-foreground md:p-14">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <ShieldCheck className="mb-3 h-8 w-8 text-gold" />
              <h3 className="font-display text-xl font-semibold">Annonces vérifiées</h3>
              <p className="mt-2 text-sm text-primary-foreground/80">Chaque propriétaire est identifié et chaque bien contrôlé.</p>
            </div>
            <div>
              <MapPinned className="mb-3 h-8 w-8 text-gold" />
              <h3 className="font-display text-xl font-semibold">Local & international</h3>
              <p className="mt-2 text-sm text-primary-foreground/80">De la Tunisie à Dubai, une couverture méditerranéenne et au-delà.</p>
            </div>
            <div>
              <Sparkles className="mb-3 h-8 w-8 text-gold" />
              <h3 className="font-display text-xl font-semibold">Outils malins</h3>
              <p className="mt-2 text-sm text-primary-foreground/80">Calculateur de rendement locatif, carte interactive, comparateur.</p>
            </div>
          </div>
          <div className="mt-8">
            <Link to="/dashboard">
              <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
                Publier mon bien gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
