import { useEffect, useState } from "react";
import type { Property } from "@/lib/types";
import { fetchProperties } from "@/lib/properties-api";

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchProperties()
      .then((data) => {
        if (!active) return;
        setProperties(data);
        setError(null);
      })
      .catch((e) => {
        if (!active) return;
        setError(e?.message ?? "Erreur inconnue");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { properties, loading, error };
}
