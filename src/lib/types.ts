export type TransactionType = "vente" | "location";
export type Currency = "TND" | "EUR";
export type PropertyCategory = "villa" | "apartment" | "office" | "guesthouse";

export interface Host {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rating?: number;
  joined?: string;
}

// Interface principale — reflète exactement les colonnes Supabase
export interface Property {
  id: string;
  host_id: string;
  host?: Host; // jointure optionnelle avec profiles

  // Champs Supabase (noms exacts des colonnes)
  titre: string;
  description?: string;
  prix: number;
  localisation: string;
  type: TransactionType;
  chambres?: number;
  surface?: number;
  image_url?: string;
  commodites?: string[];
  latitude?: number;
  longitude?: number;

  created_at?: string;
  updated_at?: string;

  // Champs optionnels hérités du mock (pour compatibilité temporaire)
  currency?: Currency;
  category?: PropertyCategory;
  featured?: boolean;
}
