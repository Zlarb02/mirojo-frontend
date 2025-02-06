import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  standalone: true,
  name: "level",
})
export class LevelPipe implements PipeTransform {
  transform(value: number): string {
    return `Niveau ${value} 🏆`;
  }
}
