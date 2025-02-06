import { NgModule } from "@angular/core";
import { LevelPipe } from "./formatting/level.pipe";
import { RelativeTimePipe } from "./date-time/relative-time.pipe";
import { CountdownPipe } from "./date-time/countdown.pipe";
import { RarityPipe } from "./gameplay/rarity.pipe";

@NgModule({
  imports: [LevelPipe, RelativeTimePipe, CountdownPipe, RarityPipe],
  exports: [LevelPipe, RelativeTimePipe, CountdownPipe, RarityPipe],
})
export class PipesModule {}
