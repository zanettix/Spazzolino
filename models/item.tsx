export interface Item {
  name: string;
  category: "igiene_personale" | "cucina" | "bagno";
  description: string;
  link: string;
  created_at: string;
  duration_days: number; // Durata in giorni
  expired_at: string; //created_at + duration_days
  icon: string;
  owner: string; // Distingue catalog da user_items
}