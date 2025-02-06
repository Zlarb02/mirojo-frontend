import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { provideHttpClient } from "@angular/common/http";
import { PipesModule } from "./shared/pipes/pipes.module";

import { LevelPipe } from "./shared/pipes/formatting/level.pipe";
import { RelativeTimePipe } from "./shared/pipes/date-time/relative-time.pipe";
import { CountdownPipe } from "./shared/pipes/date-time/countdown.pipe";
import { RarityPipe } from "./shared/pipes/gameplay/rarity.pipe";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    LevelPipe,
    RelativeTimePipe,
    CountdownPipe,
    RarityPipe,
  ],
};
