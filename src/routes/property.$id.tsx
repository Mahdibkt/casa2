import { useState } from "react";
import { createFileRoute, notFound, Link, ErrorComponent, useRouter } from "@tanstack/react-router";
import { Bed, Bath, Maximize, MapPin, Star, Calendar as CalendarIcon, MessageCircle, Heart, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { PropertyMap } from "@/components/PropertyMap";
import { formatPrice } from "@/lib/mock-data";
import { fetchPropertyById } from "@/lib/properties-api";

export const Route = createFileRoute("/property/$id")({
  loader: async ({ params }) => {
    const property = await fetchPropertyById(params.id);
    if (!property) throw notFound();
    return { property };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.property.title} — MédinaStay` },
          { name: "description", content: loaderData.property.description.slice(0, 155) },
          { property: "og:image", content: loaderData.property.images[0] },
        ]
      : [{ title: "Bien — MédinaStay" }],
  }),
  pendingComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Chargement du bien...</div>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ErrorComponent error={error} />
        <Button className="mt-4" onClick={() => { router.invalidate(); reset(); }}>Réessayer</Button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-3xl">Bien introuvable</h1>
      <Link to="/search" className="mt-4 inline-block text-primary underline">Retour à la recherche</Link>
    </div>
  ),
  component: PropertyDetail,
});

function PropertyDetail() {
  const { property } = Route.useLoaderData();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // ROI calculator state
  const [downPayment, setDownPayment] = useState(20); // %
  const [rate, setRate] = useState(5.5); // %
  const [years, setYears] = useState(20);

  const loan = property.price * (1 - downPayment / 100);
  const monthlyRate = rate / 100 / 12;
  const n = years * 12;
  const monthly = monthlyRate === 0 ? loan / n : (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
  const fmt = (v: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold md:text-4xl">{property.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-gold text-gold" /> {property.host.rating} · Hôte vérifié</span>
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {property.district}, {property.city}, {property.country}</span>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="sm" className="gap-2"><Share2 className="h-4 w-4" /> Partager</Button>
            <Button variant="ghost" size="sm" className="gap-2"><Heart className="h-4 w-4" /> Sauvegarder</Button>
          </div>
        </div>
      </div>

      {/* Asymmetric gallery */}
      <div className="grid h-[260px] gap-2 overflow-hidden rounded-2xl md:h-[460px] md:grid-cols-4 md:grid-rows-2">
        <img src={property.images[0]} alt="" className="h-full w-full object-cover md:col-span-2 md:row-span-2" />
        {property.images.slice(1, 5).map((img: string, i: number) => (
          <img key={i} src={img} alt="" className="hidden h-full w-full object-cover md:block" />
        ))}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* MAIN */}
        <div>
          <div className="flex items-center gap-3 border-b border-border pb-6">
            <img src={property.host.avatar} alt={property.host.name} className="h-14 w-14 rounded-full object-cover" />
            <div>
              <p className="text-sm text-muted-foreground">Proposé par</p>
              <p className="font-display text-lg font-semibold">{property.host.name}</p>
              <p className="text-xs text-muted-foreground">Membre depuis {property.host.joined}</p>
            </div>
            <Badge className="ml-auto bg-secondary text-secondary-foreground">
              {property.type === "sale" ? "À vendre" : property.type === "rent" ? "À louer" : "Vacances"}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 border-b border-border py-6 text-center">
            <div><Bed className="mx-auto h-5 w-5 text-primary" /><p className="mt-1 text-sm font-semibold">{property.bedrooms}</p><p className="text-xs text-muted-foreground">Chambres</p></div>
            <div><Bath className="mx-auto h-5 w-5 text-primary" /><p className="mt-1 text-sm font-semibold">{property.bathrooms}</p><p className="text-xs text-muted-foreground">SDB</p></div>
            <div><Maximize className="mx-auto h-5 w-5 text-primary" /><p className="mt-1 text-sm font-semibold">{property.surface}</p><p className="text-xs text-muted-foreground">m²</p></div>
          </div>

          <div className="border-b border-border py-6">
            <h2 className="font-display text-xl font-semibold">À propos de ce bien</h2>
            <p className="mt-3 leading-relaxed text-foreground/80">{property.description}</p>
          </div>

          <div className="border-b border-border py-6">
            <h2 className="font-display text-xl font-semibold">Commodités</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {property.amenities.map((a: string) => (
                <div key={a} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" /> {a}
                </div>
              ))}
            </div>
          </div>

          {/* ROI Calculator */}
          {property.type === "sale" && (
            <div className="border-b border-border py-6">
              <h2 className="font-display text-xl font-semibold">Calculateur de rendement</h2>
              <p className="text-sm text-muted-foreground">Estimation indicative de votre mensualité.</p>
              <div className="mt-5 grid gap-5 rounded-2xl bg-secondary/40 p-5 md:grid-cols-2">
                <div>
                  <Label className="mb-2 flex justify-between text-sm font-medium">
                    Apport initial <span className="text-primary">{downPayment}%</span>
                  </Label>
                  <Slider value={[downPayment]} max={80} step={1} onValueChange={([v]) => setDownPayment(v)} />
                  <p className="mt-1 text-xs text-muted-foreground">{fmt(property.price * downPayment / 100)} {property.currency}</p>
                </div>
                <div>
                  <Label className="mb-2 flex justify-between text-sm font-medium">
                    Taux d'intérêt <span className="text-primary">{rate}%</span>
                  </Label>
                  <Slider value={[rate]} max={12} step={0.1} onValueChange={([v]) => setRate(v)} />
                </div>
                <div>
                  <Label className="mb-2 flex justify-between text-sm font-medium">
                    Durée <span className="text-primary">{years} ans</span>
                  </Label>
                  <Slider value={[years]} min={5} max={30} step={1} onValueChange={([v]) => setYears(v)} />
                </div>
                <div className="flex flex-col justify-center rounded-xl bg-background p-4 shadow-card">
                  <p className="text-xs text-muted-foreground">Mensualité estimée</p>
                  <p className="font-display text-2xl font-bold text-primary">{fmt(monthly)} {property.currency}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Montant emprunté : {fmt(loan)} {property.currency}</p>
                </div>
              </div>
            </div>
          )}

          <div className="py-6">
            <h2 className="font-display text-xl font-semibold">Localisation</h2>
            <div className="mt-4 h-[320px]">
              <PropertyMap properties={[property]} />
            </div>
          </div>
        </div>

        {/* STICKY ASIDE */}
        <aside>
          <div className="sticky top-20 rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="font-display text-3xl font-bold text-primary">
              {formatPrice(property.price, property.currency, property.type)}
            </p>

            {property.type !== "sale" && (
              <div className="mt-5">
                <Label className="mb-2 flex items-center gap-2 text-sm font-medium"><CalendarIcon className="h-4 w-4" /> Disponibilités</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border pointer-events-auto"
                />
              </div>
            )}

            <Button className="mt-5 w-full gap-2 bg-gold text-gold-foreground hover:bg-gold/90" size="lg">
              {property.type === "sale" ? "Demander une visite" : "Réserver"}
            </Button>
            <Button variant="outline" className="mt-2 w-full gap-2" size="lg">
              <MessageCircle className="h-4 w-4" /> Contacter le propriétaire
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
