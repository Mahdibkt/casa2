import { supabase } from "@/integrations/supabase/client";
import type { Property, TransactionType, Currency, PropertyCategory } from "./types";

// Schéma DB tel qu'il existe dans Lovable Cloud (table public.properties)
export interface DbProperty {
  id: string;
  created_at: string;
  titre: string;
  prix: number;
  description: string | null;
  image_url: string | null;
  localisation: string | null;
  type: string; // 'vente' | 'location' | 'vacances'
  chambres: number;
  surface: number | null;
  commodites: string[];
  host_id: string | null;
  latitude: number | null;
  longitude: number | null;
}

const FALLBACK_IMG = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200";

const mapType = (t: string): TransactionType => {
  switch (t) {
    case "location":
    case "rent":
      return "rent";
    case "vacances":
    case "vacation":
      return "vacation";
    default:
      return "sale";
  }
};

const toDbType = (t: TransactionType): string =>
  t === "rent" ? "location" : t === "vacation" ? "vacances" : "vente";

export function adaptProperty(row: DbProperty): Property {
  const [district = "", country = ""] = (row.localisation ?? "").split(",").map((s) => s.trim());

  const currency: Currency = country.toLowerCase().includes("france") ? "EUR" : "TND";

  return {
    id: row.id,
    host_id: row.host_id ?? "",
    host: {
      id: row.host_id ?? "host-default",
      name: "Casa2",
      email: "contact@casa2.com",
      avatar: "https://i.pravatar.cc/150?img=1",
      rating: 4.8,
      joined: new Date(row.created_at).getFullYear().toString(),
    },

    // Champs Supabase
    titre: row.titre,
    prix: Number(row.prix),
    localisation: row.localisation ?? "—",
    image_url: row.image_url ?? FALLBACK_IMG,
    latitude: row.latitude ?? undefined, // ✅ plus de (row as any)
    longitude: row.longitude ?? undefined, // ✅ plus de (row as any)
    chambres: row.chambres ?? 0,
    surface: row.surface ? Number(row.surface) : 0,
    commodites: row.commodites ?? [],
    type: mapType(row.type) as any,
    currency,

    // Anciens champs pour compatibilité
    title: row.titre,
    description: row.description ?? "",
    price: Number(row.prix),
    city: district || row.localisation || "—",
    district: district || "—",
    country: country || "Tunisie",
    bedrooms: row.chambres ?? 0,
    bathrooms: 1,
    amenities: row.commodites ?? [],
    images: [row.image_url || FALLBACK_IMG],
    lat: row.latitude ?? 36.8065,
    lng: row.longitude ?? 10.1815,
    featured: true,
    createdAt: row.created_at,
    category: "apartment" as PropertyCategory,
  };
}

export async function fetchProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as DbProperty[]).map(adaptProperty);
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  return data ? adaptProperty(data as DbProperty) : null;
}

export async function fetchMyProperties(userId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("host_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbProperty[]).map(adaptProperty);
}

export interface PropertyInput {
  titre: string;
  description: string;
  prix: number;
  localisation: string;
  type: TransactionType;
  chambres: number;
  surface: number;
  commodites: string[];
  image_url: string;
  latitude?: number; // ← ajouté
  longitude?: number; // ← ajouté
}

export async function createProperty(input: PropertyInput, hostId: string) {
  const { data, error } = await supabase
    .from("properties")
    .insert({
      titre: input.titre,
      description: input.description,
      prix: input.prix,
      localisation: input.localisation,
      type: toDbType(input.type),
      chambres: input.chambres,
      surface: input.surface,
      commodites: input.commodites,
      image_url: input.image_url,
      host_id: hostId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProperty(id: string) {
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadPropertyImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("property-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("property-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPropertyImages(prefix: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${prefix}-${i}-${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("property-images")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from("property-images").getPublicUrl(path);

    urls.push(data.publicUrl);
  }

  return urls;
}

export async function updateProperty(id: string, input: Partial<PropertyInput>): Promise<void> {
  const { error } = await supabase
    .from("properties")
    .update({
      titre: input.titre,
      description: input.description,
      prix: input.prix,
      localisation: input.localisation,
      type: input.type ? toDbType(input.type) : undefined,
      chambres: input.chambres,
      surface: input.surface,
      commodites: input.commodites,
      image_url: input.image_url,
      latitude: input.latitude,
      longitude: input.longitude,
    })
    .eq("id", id);

  if (error) throw error;
}
