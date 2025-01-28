import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThreeSceneComponent } from './three-scene/three-scene.component';
import { CommonModule } from '@angular/common';
import { LoadingScreenComponent } from './loading-screen/loading-screen.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LoadingScreenComponent,
    ThreeSceneComponent,
    CommonModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'MirojoFrontend';

  showLoadingScreen = true;
  viewToggled = false;

  ngOnInit() {
    setTimeout(() => {
      this.showLoadingScreen = false;
    }, 1000);
  }

  @ViewChild('threeSceneComponent') threeSceneComponent!: ThreeSceneComponent;

  toggleView(): void {
    this.threeSceneComponent.toggleView();
    this.viewToggled = !this.viewToggled;
  }

  get buttonText() {
    return this.viewToggled ? 'Reset static view' : 'Control view';
  }
}
