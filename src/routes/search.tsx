import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Map as MapIcon, List, SlidersHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyMap } from "@/components/PropertyMap";
import { allAmenities, cities } from "@/lib/mock-data";
import { useProperties } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";

const searchSchema = z.object({
  city: z.string().optional(),
  type: z.enum(["sale", "rent", "vacation"]).optional(),
  maxPrice: z.number().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Recherche — MédinaStay" }] }),
  component: SearchPage,
});

function SearchPage() {
  const params = Route.useSearch();
  const { properties, loading, error } = useProperties();
  const [maxPrice, setMaxPrice] = useState<number>(params.maxPrice ?? 5000000);
  const [minSurface, setMinSurface] = useState(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [city, setCity] = useState<string>(params.city ?? "");
  const [view, setView] = useState<"split" | "list" | "map">("split");

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (params.type && p.type !== params.type) return false;
      if (city && p.city !== city) return false;
      if (p.price > maxPrice) return false;
      if (p.surface < minSurface) return false;
      if (amenities.length && !amenities.every((a) => p.amenities.includes(a))) return false;
      return true;
    });
  }, [properties, params.type, city, maxPrice, minSurface, amenities]);

  const Filters = (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block text-sm font-semibold">Ville</Label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Toutes</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <Label className="mb-2 flex justify-between text-sm font-semibold">
          Prix max <span className="font-normal text-muted-foreground">{new Intl.NumberFormat("fr-FR").format(maxPrice)}</span>
        </Label>
        <Slider value={[maxPrice]} max={5000000} step={1000} onValueChange={([v]) => setMaxPrice(v)} />
      </div>

      <div>
        <Label className="mb-2 flex justify-between text-sm font-semibold">
          Surface min <span className="font-normal text-muted-foreground">{minSurface} m²</span>
        </Label>
        <Slider value={[minSurface]} max={600} step={10} onValueChange={([v]) => setMinSurface(v)} />
      </div>

      <div>
        <Label className="mb-3 block text-sm font-semibold">Commodités</Label>
        <div className="space-y-2">
          {allAmenities.slice(0, 8).map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={amenities.includes(a)}
                onCheckedChange={(c) => setAmenities(c ? [...amenities, a] : amenities.filter((x) => x !== a))}
              />
              {a}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{filtered.length} biens trouvés</h1>
          <p className="text-sm text-muted-foreground">{params.type === "rent" ? "Location" : params.type === "sale" ? "Vente" : params.type === "vacation" ? "Vacances" : "Tous types"}{city && ` · ${city}`}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-lg border border-border p-1 md:flex">
            <Button size="sm" variant={view === "list" ? "default" : "ghost"} onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
            <Button size="sm" variant={view === "split" ? "default" : "ghost"} onClick={() => setView("split")}>Split</Button>
            <Button size="sm" variant={view === "map" ? "default" : "ghost"} onClick={() => setView("map")}><MapIcon className="h-4 w-4" /></Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 lg:hidden"><SlidersHorizontal className="h-4 w-4" /> Filtres</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Filtres</SheetTitle></SheetHeader>
              <div className="mt-6">{Filters}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-border bg-card p-5">{Filters}</div>
        </aside>

        <div className={`grid gap-6 ${view === "split" ? "md:grid-cols-2" : "grid-cols-1"}`}>
          {view !== "map" && (
            <div className={`grid gap-5 ${view === "list" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-2xl" />
              ))}
              {!loading && error && (
                <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  Erreur de chargement : {error}
                </p>
              )}
              {!loading && !error && filtered.map((p) => <PropertyCard key={p.id} property={p} />)}
              {!loading && !error && !filtered.length && <p className="text-sm text-muted-foreground">Aucun bien ne correspond.</p>}
            </div>
          )}
          {view !== "list" && (
            <div className="sticky top-20 h-[70vh] min-h-[400px]">
              <PropertyMap properties={filtered} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
