import { Component, OnInit } from '@angular/core';
import { createChat } from "@n8n/chat";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
    // Initialisation du chat au montage du composant
    createChat({
      webhookUrl: "https://n8n-n9mx.onrender.com/webhook/f406671e-c954-4691-b39a-66c90aa2f103/chat",
      initialMessages: [
        "Coucou ! 👋",
        "Des questions à propos de Mirojo.app? \nSinon jouez à un jeu de rôle avec notre IA !",
      ],
      chatInputKey: 'chatInput',
      chatSessionKey: 'sessionId1',
      showWelcomeScreen: false,
      mode: 'fullscreen', 
      i18n: {
        en: {
          title: 'Enchanté ! 👋',
          subtitle: "Posez-moi une question. Ou lancez une partie de jeu de rôle.",
          footer: '',
          getStarted: 'Nouvelle Conversation',
          inputPlaceholder: "C'est à vous… ",
          closeButtonTooltip: ''
        },
      },
    });
  }
}