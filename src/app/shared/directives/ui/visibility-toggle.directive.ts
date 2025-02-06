import { Directive, ElementRef, HostListener, Input } from "@angular/core";

@Directive({
  standalone: true,
  selector: "[appVisibilityToggle]",
})
export class VisibilityToggleDirective {
  @Input("appVisibilityToggle") targetSelector!: string;

  constructor(private el: ElementRef) {}

  @HostListener("click")
  toggle() {
    const target = document.querySelector(this.targetSelector);
    if (target) {
      target.classList.toggle("hidden");
    }
  }
}

// USE LIKE THIS

// <button appVisibilityToggle="#panel">Afficher/masquer</button>
// <div id="panel" class="hidden">Contenu caché</div>

// .hidden {
//     opacity: 0;
//     transition: opacity 0.5s ease-in-out;
//     pointer-events: none;
//   }
