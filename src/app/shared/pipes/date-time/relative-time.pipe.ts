import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  standalone: true,
  name: "relativeTime",
})
export class RelativeTimePipe implements PipeTransform {
  transform(value: Date | string): string {
    const now = new Date();
    const date = new Date(value);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return `il y a ${diffSec} sec`;
    if (diffMin < 60) return `il y a ${diffMin} min`;
    if (diffHour < 24) return `il y a ${diffHour} h`;
    return diffDay === 1 ? `hier` : `il y a ${diffDay} jours`;
  }
}
