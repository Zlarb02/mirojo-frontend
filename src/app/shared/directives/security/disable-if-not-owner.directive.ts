import { Directive, Input, ElementRef, inject, OnInit } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";

@Directive({
  standalone: true,
  selector: "[appDisableIfNotOwner]",
})
export class DisableIfNotOwnerDirective implements OnInit {
  @Input("appDisableIfNotOwner") ownerId!: string;
  private auth = inject(AuthService);

  constructor(private el: ElementRef) {}

  ngOnInit() {
    if (this.auth.currentUser()?.id !== this.ownerId) {
      this.el.nativeElement.disabled = true;
      this.el.nativeElement.title = "Vous n'êtes pas le propriétaire";
    }
  }
}

//USE

// <button [appDisableIfNotOwner]="character.ownerId">Modifier</button>
