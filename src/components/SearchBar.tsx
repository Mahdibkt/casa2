import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, MapPin, Tag, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cities } from "@/lib/mock-data";

export function SearchBar() {
  const navigate = useNavigate();
  const [city, setCity] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [budget, setBudget] = useState<string>("");

  const submit = () => {
    navigate({
      to: "/search",
      search: {
        city: city || undefined,
        type: (type as "rent" | "sale" | "vacation") || undefined,
        maxPrice: budget ? Number(budget) : undefined,
      } as never,
    });
  };

  return (
    <div className="rounded-2xl bg-background/95 p-2 shadow-elegant backdrop-blur md:p-3">
      <div className="grid gap-2 md:grid-cols-[1.2fr_1fr_1fr_auto]">
        <div className="flex items-center gap-2 rounded-xl bg-secondary/40 px-3">
          <MapPin className="h-4 w-4 text-primary" />
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-12 border-0 bg-transparent shadow-none focus:ring-0">
              <SelectValue placeholder="Localisation" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-secondary/40 px-3">
          <Tag className="h-4 w-4 text-primary" />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-12 border-0 bg-transparent shadow-none focus:ring-0">
              <SelectValue placeholder="Type de transaction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">Vente</SelectItem>
              <SelectItem value="rent">Location</SelectItem>
              <SelectItem value="vacation">Vacances</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-secondary/40 px-3">
          <Wallet className="h-4 w-4 text-primary" />
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger className="h-12 border-0 bg-transparent shadow-none focus:ring-0">
              <SelectValue placeholder="Budget max" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2000">2 000</SelectItem>
              <SelectItem value="10000">10 000</SelectItem>
              <SelectItem value="500000">500 000</SelectItem>
              <SelectItem value="2000000">2 000 000</SelectItem>
              <SelectItem value="10000000">10 000 000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={submit} size="lg" className="h-12 gap-2 bg-gold text-gold-foreground hover:bg-gold/90">
          <Search className="h-4 w-4" /> Rechercher
        </Button>
      </div>
    </div>
  );
}
