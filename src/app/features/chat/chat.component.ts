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
  observer!: MutationObserver;

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
      chatSessionKey: 'sessionId',
      showWelcomeScreen: false,
      mode: 'window', 
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

  ngAfterViewInit(): void {
    // 1) Première passe de remplacement quand la vue est prête
    this.replaceThinkTags();
    
    // 2) Mettre en place un observer pour détecter l’arrivée de nouveaux messages
    const container = document.querySelector('.chat-messages-list');
    if (!container) {
      return;
    }

    this.observer = new MutationObserver((mutations) => {
      // À chaque fois qu’un message est ajouté, on refait le remplacement
      this.replaceThinkTags();
    });

    // Surveille l’ajout d’éléments dans '.chat-messages-list'
    this.observer.observe(container, {
      childList: true,
      subtree: true
    });
  }

  ngOnDestroy(): void {
    // Nettoyage pour éviter les fuites mémoire
    this.observer?.disconnect();
  }

  private replaceThinkTags(): void {
    // Récupère la liste .chat-messages-list dans le DOM
    const container = document.querySelector('.chat-messages-list');
    if (!container) {
      return;
    }

    // Sélectionne tous les blocs de texte où le chat insère le markdown
    const messageElements = container.querySelectorAll('.chat-message-markdown');
    messageElements.forEach((el) => {
      const originalHtml = el.innerHTML;

      // Remplace &lt;think&gt;...&lt;/think&gt; par <small><i>...</i></small>
      const replacedHtml = originalHtml.replace(
        /&lt;think&gt;(.*?)&lt;\/think&gt;/gs,
        '<small><i>$1</i></small>'
      );

      if (replacedHtml !== originalHtml) {
        el.innerHTML = replacedHtml;
      }
    });
  }


  
}