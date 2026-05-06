import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Upload, X, LogOut, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { allAmenities, formatPrice } from "@/lib/mock-data";
import type { Property, TransactionType } from "@/lib/types";
import {
  fetchMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  type PropertyInput,
} from "@/lib/properties-api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard propriétaire — Casa2" }] }),
  component: Dashboard,
});

// Villes tunisiennes + internationales
const cities = [
  "Tunis",
  "La Marsa",
  "Sidi Bou Saïd",
  "Carthage",
  "Hammamet",
  "Djerba",
  "Sousse",
  "Sfax",
  "Bizerte",
  "Nabeul",
  "Les Berges du Lac",
  "Centre Ville Tunis",
  "Paris",
  "Dubai",
  "Lyon",
  "Marseille",
];

// Coordonnées par ville
const cityCoords: Record<string, { lat: number; lng: number }> = {
  Tunis: { lat: 36.819, lng: 10.1658 },
  "La Marsa": { lat: 36.8781, lng: 10.3236 },
  "Sidi Bou Saïd": { lat: 36.8702, lng: 10.3417 },
  Carthage: { lat: 36.8528, lng: 10.3233 },
  Hammamet: { lat: 36.4, lng: 10.6167 },
  Djerba: { lat: 33.8075, lng: 10.8451 },
  Sousse: { lat: 35.8245, lng: 10.6346 },
  Sfax: { lat: 34.7406, lng: 10.7603 },
  Bizerte: { lat: 37.2746, lng: 9.8739 },
  Nabeul: { lat: 36.4561, lng: 10.7376 },
  "Les Berges du Lac": { lat: 36.835, lng: 10.228 },
  "Centre Ville Tunis": { lat: 36.819, lng: 10.1658 },
  Paris: { lat: 48.8566, lng: 2.3522 },
  Dubai: { lat: 25.2048, lng: 55.2708 },
  Lyon: { lat: 45.764, lng: 4.8357 },
  Marseille: { lat: 43.2965, lng: 5.3698 },
};

function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editProperty, setEditProperty] = useState<Property | null>(null); // ← ajoute
  const [editOpen, setEditOpen] = useState(false); // ← ajoute

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  const reload = async () => {
    if (!user) return;
    setLoading(true);
    try {
      setList(await fetchMyProperties(user.id));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) reload();
  }, [user]);

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce bien définitivement ?")) return;
    try {
      await deleteProperty(id);
      setList(list.filter((p) => p.id !== id));
      toast.success("Bien supprimé.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Chargement...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Mon espace {user.user_metadata?.full_name ?? user.email?.split("@")[0]}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => signOut().then(() => navigate({ to: "/" }))}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 bg-gold text-gold-foreground hover:bg-gold/90">
                <Plus className="h-4 w-4" /> Ajouter un bien
                {/* Dialog Modifier un bien */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Modifier le bien</DialogTitle>
                    </DialogHeader>
                    {editProperty && (
                      <PropertyForm
                        userId={user.id}
                        initial={editProperty} // ← pré-remplit le formulaire
                        onSuccess={() => {
                          setEditOpen(false);
                          setEditProperty(null);
                          reload();
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Publier un nouveau bien</DialogTitle>
              </DialogHeader>
              <PropertyForm
                userId={user.id}
                onSuccess={() => {
                  setOpen(false);
                  reload();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Annonces actives", value: list.length },
          { label: "Vues ce mois", value: "—" },
          { label: "Demandes reçues", value: "—" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Liste des biens */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold">Mes annonces</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          {loading ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Chargement...</p>
          ) : list.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Aucune annonce. Ajoutez votre premier bien !
              </p>
              <Button className="mt-4 bg-gold text-gold-foreground" onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Ajouter un bien
              </Button>
            </div>
          ) : (
            list.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 border-b border-border p-4 last:border-0"
              >
                {/* ✅ image_url au lieu de images[0] */}
                <img
                  src={
                    p.image_url ??
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200"
                  }
                  alt={p.titre}
                  className="h-20 w-28 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  {/* ✅ titre au lieu de title */}
                  <Link
                    to="/property/$id"
                    params={{ id: p.id }}
                    className="line-clamp-1 font-display font-semibold hover:text-primary"
                  >
                    {p.titre}
                  </Link>
                  {/* ✅ localisation au lieu de city */}
                  <p className="text-xs text-muted-foreground">
                    {p.localisation} · {p.surface} m² · {p.chambres} ch.
                  </p>
                  {/* ✅ prix au lieu de price */}
                  <p className="mt-1 text-sm font-semibold text-primary">
                    {formatPrice(p.prix, p.currency ?? "TND", p.type)}
                  </p>
                  {/* Badge coordonnées GPS */}
                  {p.latitude && p.longitude && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                      <MapPin className="h-3 w-3" />
                      GPS : {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditProperty(p);
                      setEditOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(p.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FORMULAIRE — Version complète avec coordonnées GPS
// ============================================================
function PropertyForm({
  userId,
  onSuccess,
  initial, // ← bien à modifier (optionnel)
}: {
  userId: string;
  onSuccess: () => void;
  initial?: Property | null;
}) {
  // ✅ Si "initial" existe → mode édition, sinon → mode création
  const isEdit = !!initial;

  const [titre, setTitre] = useState(initial?.titre ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [prix, setPrix] = useState(initial?.prix?.toString() ?? "");
  const [type, setType] = useState<TransactionType>((initial?.type as TransactionType) ?? "vente");
  const [city, setCity] = useState(initial?.localisation?.split(",")[0]?.trim() ?? "");
  const [country, setCountry] = useState(initial?.localisation?.split(",")[1]?.trim() ?? "Tunisie");
  const [chambres, setChambres] = useState(initial?.chambres?.toString() ?? "");
  const [surface, setSurface] = useState(initial?.surface?.toString() ?? "");
  const [latitude, setLatitude] = useState(initial?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(initial?.longitude?.toString() ?? "");
  const [amenities, setAmenities] = useState<string[]>(initial?.commodites ?? []);
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  // ✅ Quand l'utilisateur choisit une ville → remplir GPS automatiquement
  const handleCityChange = (selectedCity: string) => {
    setCity(selectedCity);
    const coords = cityCoords[selectedCity];
    if (coords) {
      setLatitude(coords.lat.toString());
      setLongitude(coords.lng.toString());
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = 10 - images.length;
    const next = Array.from(files)
      .slice(0, remaining)
      .map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages([...images, ...next]);
    if (files.length > remaining) {
      toast.warning(`Maximum 10 photos. ${files.length - remaining} photo(s) ignorée(s).`);
    }
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(images[i].preview);
    setImages(images.filter((_, idx) => idx !== i));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) {
      toast.error("Veuillez choisir une ville.");
      return;
    }

    // En mode création, au moins une photo obligatoire
    if (!isEdit && images.length === 0) {
      toast.error("Ajoutez au moins une photo.");
      return;
    }

    setSubmitting(true);
    try {
      // Upload nouvelles photos si il y en a
      let image_url = initial?.image_url ?? "";
      if (images.length > 0) {
        toast.info("Upload des photos...");
        const uploadedUrls = await uploadPropertyImages(
          "temp-" + Date.now(),
          images.map((i) => i.file),
        );
        image_url = uploadedUrls[0];

        // Images supplémentaires
        if (uploadedUrls.length > 1 && (isEdit ? initial?.id : true)) {
          const { supabase } = await import("@/integrations/supabase/client");
          const propertyId = isEdit ? initial!.id : "pending";
          const extraImages = uploadedUrls.slice(1).map((url, i) => ({
            property_id: propertyId,
            url,
            position: i + 1,
          }));
          if (propertyId !== "pending") {
            await supabase.from("property_images").insert(extraImages);
          }
        }
      }

      const payload: PropertyInput = {
        titre,
        description,
        prix: Number(prix),
        localisation: `${city}, ${country}`,
        type,
        chambres: Number(chambres) || 0,
        surface: Number(surface) || 0,
        commodites: amenities,
        image_url,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
      };

      if (isEdit) {
        // ✅ Mode édition → updateProperty
        await updateProperty(initial!.id, payload);
        toast.success("Bien mis à jour ! ✅");
      } else {
        // ✅ Mode création → createProperty
        await createProperty(payload, userId);
        toast.success("Bien publié ! ✅");
      }

      onSuccess();
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de la sauvegarde.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5 pt-2">
      {/* Titre */}
      <div>
        <Label>Titre de l'annonce *</Label>
        <Input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
          placeholder="Ex: Villa avec piscine vue mer — Sidi Bou Saïd"
        />
      </div>

      {/* Description */}
      <div>
        <Label>Description *</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          placeholder="Décrivez votre bien en détail..."
        />
      </div>

      {/* Prix + Type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Prix (TND) *</Label>
          <Input
            value={prix}
            onChange={(e) => setPrix(e.target.value)}
            type="number"
            required
            placeholder="Ex: 350000"
          />
        </div>
        <div>
          <Label>Type de transaction *</Label>
          <Select value={type} onValueChange={(v: TransactionType) => setType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vente">Vente</SelectItem>
              <SelectItem value="location">Location</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ville + Pays */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Ville *</Label>
          <Select value={city} onValueChange={handleCityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une ville" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Pays</Label>
          <Input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Tunisie"
          />
        </div>
      </div>

      {/* Coordonnées GPS — remplies automatiquement ou manuellement */}
      <div>
        <Label className="flex items-center gap-1 mb-2">
          <MapPin className="h-4 w-4 text-primary" />
          Coordonnées GPS
          <span className="text-xs text-muted-foreground ml-1">
            (remplies automatiquement selon la ville)
          </span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Latitude</Label>
            <Input
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Ex: 36.8702"
              type="number"
              step="any"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Longitude</Label>
            <Input
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Ex: 10.3417"
              type="number"
              step="any"
            />
          </div>
        </div>
        {latitude && longitude && (
          <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Position définie : {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
          </p>
        )}
      </div>

      {/* Chambres + Surface */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Chambres</Label>
          <Input
            value={chambres}
            onChange={(e) => setChambres(e.target.value)}
            type="number"
            min="0"
            placeholder="Ex: 3"
          />
        </div>
        <div>
          <Label>Superficie (m²)</Label>
          <Input
            value={surface}
            onChange={(e) => setSurface(e.target.value)}
            type="number"
            placeholder="Ex: 120"
          />
        </div>
      </div>

      {/* Commodités */}
      <div>
        <Label className="mb-2 block">Commodités</Label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto rounded-lg border border-border p-3">
          {allAmenities.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={amenities.includes(a)}
                onCheckedChange={(c) =>
                  setAmenities(c ? [...amenities, a] : amenities.filter((x) => x !== a))
                }
              />
              {a}
            </label>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div>
        <Label className="mb-2 block">
          Photos du bien *
          <span className="text-xs text-muted-foreground ml-1">
            ({images.length}/10 — la 1ère sera la photo principale)
          </span>
        </Label>
        {images.length < 10 && (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 p-6 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <Upload className="mb-2 h-6 w-6" />
            Cliquez pour ajouter des photos
            <span className="text-xs mt-1">JPG, PNG, WEBP — max 10 photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}

        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img.preview} alt="" className="h-20 w-full rounded-lg object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded text-white text-[10px] bg-primary/80 px-1">
                    Principale
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full bg-primary" size="lg" disabled={submitting}>
        {submitting
          ? isEdit
            ? "Mise à jour..."
            : "Publication en cours..."
          : isEdit
            ? "Enregistrer les modifications ✅"
            : "Publier le bien ✨"}
      </Button>
    </form>
  );
}
