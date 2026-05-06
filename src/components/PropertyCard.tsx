import { Link } from "@tanstack/react-router";
import { Bed, Bath, Maximize, MapPin, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/mock-data";
import type { Property } from "@/lib/types";

const typeLabel: Record<string, string> = { sale: "À vendre", rent: "À louer", vacation: "Vacances" };

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      to="/property/$id"
      params={{ id: property.id }}
      className="group block overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className={property.type === "sale" ? "bg-gold text-gold-foreground" : "bg-primary text-primary-foreground"}>
            {typeLabel[property.type]}
          </Badge>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 top-2 h-9 w-9 rounded-full bg-background/70 backdrop-blur hover:bg-background"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{property.district}, {property.city}</span>
        </div>
        <h3 className="mt-1 line-clamp-1 font-display text-lg font-semibold text-foreground">
          {property.title}
        </h3>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{property.bedrooms}</span>}
          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{property.bathrooms}</span>
          <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{property.surface} m²</span>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div className="font-display text-xl font-bold text-primary">
            {formatPrice(property.price, property.currency, property.type)}
          </div>
        </div>
      </div>
    </Link>
  );
}
