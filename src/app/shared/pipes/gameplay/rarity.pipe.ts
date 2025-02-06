import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  standalone: true,
  name: "rarity",
})
export class RarityPipe implements PipeTransform {
  transform(value: string): string {
    const rarityLabels: Record<string, string> = {
      common: "⚪️ Commun",
      rare: "🔵 Rare",
      epic: "🟣 Épique",
      legendary: "🟠 Légendaire",
    };
    return rarityLabels[value] || "❓ Inconnu";
  }
}
