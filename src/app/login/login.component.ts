import { Component } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  standalone: true,
  imports: [FormsModule],
})
export class LoginComponent {
  email: string = "";
  password: string = "";

  constructor(private authService: AuthService) {}

  signInWithGoogle() {
    console.log("Signing in with Google");
  }

  loginWithEmail() {
    if (!this.email || !this.password) return;
    console.log("Logging in with email and password");
  }
}
