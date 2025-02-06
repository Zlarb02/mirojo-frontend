import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'countdown'
})
export class CountdownPipe implements PipeTransform {
  transform(targetDate: Date | string): string {
    const now = new Date();
    const target = new Date(targetDate);
    const diffMs = target.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Terminé';

    const diffSec = Math.floor(diffMs / 1000) % 60;
    const diffMin = Math.floor(diffMs / (1000 * 60)) % 60;
    const diffHour = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
    const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return `${diffDay}j ${diffHour}h ${diffMin}m ${diffSec}s`;
  }
}
