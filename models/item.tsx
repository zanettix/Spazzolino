export interface Item {
  name: string;
  category: "igiene_personale" | "cucina" | "bagno";
  duration_days: number;
  description: string;
  link: string;
  icon: string;
  creator: string;
}