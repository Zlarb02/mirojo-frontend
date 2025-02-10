import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
} from "@angular/core";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FormsModule, NgModel } from "@angular/forms";
import { Color } from "three";

@Component({
  standalone: true,
  selector: "app-dice",
  imports: [FormsModule],
  template: `
    <section class="col">
      <section class="row">
        <label>
          Edge Color:
          <input type="color" [(ngModel)]="edgeColor"  (value)="edgeColor"/>
        </label>
        <label>
          Edge Opacity: {{ edgeOpacity }}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            [(ngModel)]="edgeOpacity"
          />
        </label>
      </section>    
      <section class="row">
        <label>
          Surface Color:
          <input type="color" [(ngModel)]="surfaceColor" (value)="surfaceColor" />
        </label>
        <label>
          Surface Opacity: {{ surfaceOpacity }}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            [(ngModel)]="surfaceOpacity"
        />
        </label>
      </section> 
    </section>
    <button id="score">
      Score :
      @if (topFaceNumber) {
        {{ this.topFaceNumber }}
      }
    </button>
    <span>{{this.resultMessage}}</span>
    <div id="canvasContainer"></div>
    <button id="resetButton" (click)="resetScene()">Relancer le dé</button>

    <button id="fpsCounter"></button>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      div {
        width: 100%;
        height: 100%;
      }

      section, span   {
        display: flex;
        align-items: center;
        gap: 15px;
        margin:auto;
        margin-top: 40px;
        margin-bottom: 20px;
        max-width:90vw;
        text-align: center;
        justify-content: center;
      }

      label{
      }

      input{padding:0;
      border-radius: 5px;}

      #canvasContainer {
        margin: auto;
        width: 80vw;
        height: 120vw;
        max-width: 80vh;
        max-height: 80vh;
        touch-action: none;
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
      #resetButton {
        z-index: 10;
        margin: auto;
        margin-top: -40px;
        margin-bottom: 80px;
        display: flex;
        scale: 2;
      }
      #fpsCounter {
        position: absolute;
        display: none;
        top: 10px;
        right: 10px;
        color: white;
        background-color: rgba(0, 0, 0, 0.7);
        padding: 5px 10px;
        font-size: 16px;
        border-radius: 5px;
        z-index: 10;
      }
      #score {
        scale: 2;
        display: flex;
        margin: auto;
      }
      #score:hover {
        transform: scale(1.1);
      }
    `,
  ],
})
export class DiceComponent implements AfterViewInit, OnDestroy {
  private renderer!: any;
  private scene!: any;
  private camera!: any;
  private animationFrameId!: number;

  private world!: CANNON.World; // Monde physique
  private diceBody!: CANNON.Body; // Corps physique du dé
  private diceMesh!: any; // Mesh du dé
  private raycaster!: any; // Raycaster pour détecter les clics
  private mouse = new THREE.Vector2(); // Position de la souris normalisée
  private mouseDown = false;
  private selectedObject: CANNON.Body | null = null;
  private isDragging = false; // Indique si l'utilisateur est en train de manipuler le dé

  private readonly elementRef = inject(ElementRef);
  private controls!: any; // Ajouter une propriété pour les contrôles

  private targetPosition: CANNON.Vec3 | null = null;
  private initialPosition: CANNON.Vec3 | null = null;

  private hasDiceBeenLaunched = false; // Indique si le dé a été lancé

  private lastTime: number = 0;

  public edgeOpacity: number = 0;
  public surfaceOpacity: number = 0.17;

  public edgeColor: string = "#FFFFFF";
  public surfaceColor: string = "#785078";

  private diceFaceNumbers: number[] = [
    10, 8, 20, 2, 12, 15, 7, 17, 16, 3, 1, 19, 6, 9, 13, 11, 14, 4, 5, 18,
  ];
  private fpsDisplay!: HTMLElement;
  private frameCount: number = 0;
  private fps: number = 0;
  public topFaceNumber: number | null = null;
  public resultMessage: string = "";

  // Mapping des phrases par score (1 à 20)
  private scorePhrases: { [score: number]: string[] } = {
    20: [
      "Impressionnant, vous êtes prêt à tout affronter !",
      "Vous avez une chance de cocu (de jet de 20 d'affilés) !",
      "Inarrêtable, le destin est de votre côté !",
      "C'est le jackpot, rien ne peut vous arrêter !",
    ],
    19: [
      "Super ! Presque parfait.",
      "Comme disait mes profs, 'peut mieux faire'.",
      "Très bon coup, vous êtes presque infaillible !",
      "Excellent, vous avez presque la perfection !",
    ],
    18: [
      "Bravo, une excellente performance !",
      "Vous maîtrisez l'art du jet, continuez ainsi !",
      "Un résultat remarquable, bien joué !",
      "Votre coup est impressionnant, presque parfait !",
    ],
    17: [
      "Très bien, vous êtes sur la bonne voie.",
      "Un excellent jet, continuez comme ça !",
      "Bravo, c'est un résultat enviable !",
      "Votre chance continue de briller !",
    ],
    16: [
      "Bon jet, vous faites le bon choix.",
      "Pas mal du tout, vous maîtrisez votre destin.",
      "Une belle réussite, rien que du bonheur !",
      "Votre coup était solide, bien joué !",
    ],
    15: [
      "C'est un bon résultat, continuez comme ça !",
      "Un jet solide, félicitations !",
      "Pas mal, la chance vous sourit.",
      "Bravo, vous êtes sur la bonne voie.",
    ],
    14: [
      "Un bon jet, mais il reste encore de la marge.",
      "Pas mal, vous pourriez faire encore mieux !",
      "Un résultat honorable, continuez à vous améliorer !",
      "Très bon, mais la perfection est encore à atteindre !",
    ],
    13: [
      "Un jet respectable, bien joué !",
      "C'est un bon coup, continuez dans cette voie !",
      "Pas mal, mais vous pouvez viser plus haut !",
      "Un résultat honorable, presque parfait !",
    ],
    12: [
      "Un résultat correct, pas mal du tout !",
      "Vous vous en sortez bien, continuez ainsi !",
      "C'est correct, mais vous pouvez faire mieux !",
      "Un bon effort, le résultat est encourageant !",
    ],
    11: [
      "Juste au-dessus de la moyenne, bravo !",
      "C'est suffisant, mais vous pouvez viser plus haut !",
      "Un résultat acceptable, continuez à progresser !",
      "Pas mal, mais la perfection est à portée de main !",
    ],
    10: [
      "Ni trop, ni trop peu, c'est juste moyen !",
      "Un résultat équilibré, continuez comme ça !",
      "Votre jet est moyen, mais chaque point compte !",
      "Moyen, mais le potentiel est là !",
    ],
    9: [
      "Pas mal, mais il y a encore de la marge !",
      "Un jet moyen, continuez à vous améliorer !",
      "Vous faites de votre mieux, et c'est déjà pas mal !",
      "Un résultat correct, mais vous pouvez faire mieux !",
    ],
    8: [
      "Votre jet est en deçà des attentes, mais ça peut s'améliorer.",
      "Un résultat faible, mais la chance peut tourner !",
      "Moyen, vous avez encore du chemin à parcourir !",
      "Pas mal, mais visons plus haut la prochaine fois !",
    ],
    7: [
      "Un résultat en dessous de la moyenne, mieux faire la prochaine fois !",
      "Pas très bon, vous pouvez faire mieux !",
      "Votre jet laisse à désirer, n'abandonnez pas !",
      "Moyen, mais il y a encore de l'espoir !",
    ],
    6: [
      "Un jet médiocre, mais ne perdez pas espoir !",
      "Le résultat n'est pas fameux, continuez à essayer !",
      "Pas terrible, mais chaque échec est une leçon !",
      "Un coup décevant, mais la chance peut tourner !",
    ],
    5: [
      "Oups, c'est un mauvais jet !",
      "Un résultat vraiment faible, mieux faire la prochaine fois !",
      "Pas fort du tout, réessayez et vous ferez mieux !",
      "Ce n'est pas votre jour, mais ne baissez pas les bras !",
    ],
    4: [
      "Un échec cuisant, mais ça ne définit pas tout !",
      "Triste résultat, mieux vaut réessayer !",
      "Un jet décevant, mais l'échec est le début de la réussite !",
      "Ça peut aller mieux, ne vous découragez pas !",
    ],
    3: [
      "C'est presque catastrophique, mais tout n'est pas perdu !",
      "Un jet très faible, redressez-vous et réessayez !",
      "Triste résultat, mais l'échec forge le caractère !",
      "Pas idéal, mais chaque échec est une chance de progresser !",
    ],
    2: [
      "Presque nul, vous avez vraiment besoin d'un miracle !",
      "Un résultat épouvantable, mais le désespoir est temporaire !",
      "C'est une vraie catastrophe, mais ne perdez pas espoir !",
      "Un jet lamentable, mais l'échec est le premier pas vers la réussite !",
    ],
    1: [
      "C'est le pire possible !",
      "Un échec total, on ne peut pas faire pire !",
      "Catastrophique, c'est un désastre complet !",
      "Votre jet est d'un niveau déplorable, mieux faire la prochaine fois !",
    ],
  };

  private getRandomPhrase(score: number): string {
    const phrases = this.scorePhrases[score];
    if (phrases && phrases.length > 0) {
      const index = Math.floor(Math.random() * phrases.length);
      return phrases[index];
    }
    return "";
  }
  private lastDragMouse: any = new THREE.Vector2();

  private lerp(start: number, end: number, alpha: number): number {
    return start + (end - start) * alpha; // Interpolation linéaire
  }

  private createIcosahedronShape(radius: number): CANNON.ConvexPolyhedron {
    const t = (1 + Math.sqrt(5)) / 2; // Constante du nombre d'or

    // Sommets d'un icosaèdre
    const vertices: CANNON.Vec3[] = [
      new CANNON.Vec3(-1, t, 0).scale(radius),
      new CANNON.Vec3(1, t, 0).scale(radius),
      new CANNON.Vec3(-1, -t, 0).scale(radius),
      new CANNON.Vec3(1, -t, 0).scale(radius),
      new CANNON.Vec3(0, -1, t).scale(radius),
      new CANNON.Vec3(0, 1, t).scale(radius),
      new CANNON.Vec3(0, -1, -t).scale(radius),
      new CANNON.Vec3(0, 1, -t).scale(radius),
      new CANNON.Vec3(t, 0, -1).scale(radius),
      new CANNON.Vec3(t, 0, 1).scale(radius),
      new CANNON.Vec3(-t, 0, -1).scale(radius),
      new CANNON.Vec3(-t, 0, 1).scale(radius),
    ];

    // Faces de l'icosaèdre (index des sommets formant chaque face)
    const faces: number[][] = [
      [0, 11, 5],
      [0, 5, 1],
      [0, 1, 7],
      [0, 7, 10],
      [0, 10, 11],
      [1, 5, 9],
      [5, 11, 4],
      [11, 10, 2],
      [10, 7, 6],
      [7, 1, 8],
      [3, 9, 4],
      [3, 4, 2],
      [3, 2, 6],
      [3, 6, 8],
      [3, 8, 9],
      [4, 9, 5],
      [2, 4, 11],
      [6, 2, 10],
      [8, 6, 7],
      [9, 8, 1],
    ];

    // Convertir les sommets et faces pour le format CANNON.ConvexPolyhedron
    return new CANNON.ConvexPolyhedron({
      vertices,
      faces,
    });
  }

  private groundEdgeMaterial!: any;
  private groundSurfaceMaterial!: any;
  private wallEdgeMaterial!: any;
  private wallSurfaceMaterial!: any;
  private ceilingEdgeMaterial!: any;
  private ceilingSurfaceMaterial!: any;

  private updateMaterialProperties(): void {
    if (this.groundEdgeMaterial) {
      this.groundEdgeMaterial.opacity = this.edgeOpacity;
      this.groundEdgeMaterial.color.set(this.edgeColor);
    }
    if (this.groundSurfaceMaterial) {
      this.groundSurfaceMaterial.opacity = this.surfaceOpacity;
      this.groundSurfaceMaterial.color.set(this.surfaceColor);
    }
    if (this.wallEdgeMaterial) {
      this.wallEdgeMaterial.opacity = this.edgeOpacity;
      this.wallEdgeMaterial.color.set(this.edgeColor);
    }
    if (this.wallSurfaceMaterial) {
      this.wallSurfaceMaterial.opacity = this.surfaceOpacity;
      this.wallSurfaceMaterial.color.set(this.surfaceColor);
    }
    if (this.ceilingEdgeMaterial) {
      this.ceilingEdgeMaterial.opacity = this.edgeOpacity;
      this.ceilingEdgeMaterial.color.set(this.edgeColor);
    }
    if (this.ceilingSurfaceMaterial) {
      this.ceilingSurfaceMaterial.opacity = this.surfaceOpacity;
      this.ceilingSurfaceMaterial.color.set(this.surfaceColor);
    }
  }
  ngAfterViewInit(): void {
    const container = this.elementRef.nativeElement.querySelector("div");

    // Initialiser le renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);
    this.renderer.setClearColor(0xfffff0, 0.1); // Fond transparent

    // Créer la scène
    this.scene = new THREE.Scene();

    // Créer la caméra
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(8, 7, 8 );
    this.camera.lookAt(0, 0, 0);
    this.camera.layers.enable(1); // Activer la couche 1 pour la caméra

    this.raycaster = new THREE.Raycaster();

    // Configurer le monde physique
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    this.configureMaterials();

    // Ajouter un sol physique
    this.addGround();

    // Ajouter des murs autour de la scène
    this.addWalls();

    // Ajouter un plafond physique
    this.addCeiling();

    // Ajouter le dé (icosaèdre)
    this.addDice();

    // Ajouter des lumières
    this.addLights();

    // Initialiser les contrôles OrbitControls
    this.addControls();
    // Ajouter les écouteurs pour les interactions utilisateur
    this.addInteractionListeners(container);

    this.startAnimation();

    // Gérer le redimensionnement
    window.addEventListener("resize", () => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }
  private startAnimation(): void {
    // Obtenez une référence à l'élément HTML pour afficher les FPS
    this.fpsDisplay = document.getElementById("fpsCounter")!;

    let lastUpdateTime = performance.now();

    const animate = (now: number) => {
      const deltaTime = (now - this.lastTime) / 1000; // Temps écoulé entre les frames en secondes
      this.lastTime = now;

      // Comptez les frames pour le calcul des FPS
      this.frameCount++;
      if (now - lastUpdateTime >= 1000) {
        this.fps = this.frameCount; // FPS calculé
        this.frameCount = 0; // Réinitialisez le compteur de frames
        lastUpdateTime = now;

        // Affichez les FPS
        this.fpsDisplay.innerText = `${this.fps} FPS`;
      }

      // Mise à jour du monde physique avec un intervalle fixe (1 / 60)
      this.world.step(1 / 30, deltaTime, 4);

      // Si une position cible existe et que le dé est sélectionné
      if (this.targetPosition && this.selectedObject) {
        const currentPosition = this.diceBody.position;

        // Interpoler la position actuelle vers la position cible
        const alpha = 0.17; // Facteur d'interpolation (plus petit = plus fluide)
        this.diceBody.position.set(
          this.lerp(currentPosition.x, this.targetPosition.x, alpha),
          this.lerp(currentPosition.y, this.targetPosition.y, alpha),
          this.lerp(currentPosition.z, this.targetPosition.z, alpha),
        );

        // Neutraliser les forces physiques parasites
        this.diceBody.velocity.set(0, 0, 0);
      }

      if (this.diceBody && this.diceMesh) {
        // Synchroniser la position et la rotation du mesh avec le corps physique
        this.diceMesh.position.copy(this.diceBody.position as any);
        this.diceMesh.quaternion.copy(this.diceBody.quaternion as any);
      }

      // === Détection : dé lancé et immobile ===
      if (
        !this.isDragging &&
        this.hasDiceBeenLaunched &&
        this.isDiceStopped()
      ) {
        this.moveCameraToTopView(); // Déplacer la caméra au-dessus du dé
        return; // Arrêter la boucle pour éviter de multiples appels
      }

      this.updateMaterialProperties();

      // Mettre à jour les contrôles uniquement si l'utilisateur ne manipule pas le dé
      if (!this.isDragging) {
        this.controls.update();
      }

      // Rendu de la scène
      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate(this.lastTime);
  }

  private addControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Ajoute une inertie fluide lors du mouvement
    this.controls.dampingFactor = 0.1; // Facteur de l'inertie
    this.controls.minDistance = 3; // Distance de zoom minimale
    this.controls.maxDistance = 8; // Distance de zoom maximale
    this.controls.enablePan = true; // Permettre la translation

    // Limites pour les déplacements latéraux (en fonction des dimensions de la scène)
    const bounds = {
      minX: -15, // Limite gauche
      maxX: 15, // Limite droite
      minZ: -15, // Limite avant
      maxZ: 15, // Limite arrière
      minY: 2, // Hauteur minimale
      maxY: 17, // Hauteur maximale
    };

    // Restreindre les déplacements latéraux uniquement lorsque le dé n'est pas manipulé
    this.controls.addEventListener("change", () => {
      if (!this.isDragging) {
        const target = this.controls.target;

        // Limiter le target des contrôles
        target.x = Math.max(bounds.minX, Math.min(bounds.maxX, target.x));
        target.y = Math.max(bounds.minY, Math.min(bounds.maxY, target.y));
        target.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, target.z));

        // Facultatif : Limiter également la position de la caméra
        const position = this.camera.position;
        position.x = Math.max(bounds.minX, Math.min(bounds.maxX, position.x));
        position.y = Math.max(bounds.minY, Math.min(bounds.maxY, position.y));
        position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, position.z));
      }
    });
  }

  private getTopFace(): number | null {
    if (!this.diceMesh || !this.diceMesh.geometry) return null;

    // Récupérer la géométrie et les faces du dé
    const geometry = new THREE.IcosahedronGeometry(0.8);
    const positionAttribute = geometry.attributes.position;
    const worldQuaternion = this.diceMesh.getWorldQuaternion(
      new THREE.Quaternion(),
    );

    let maxDot = -Infinity;
    let topFaceIndex = -1;

    // Parcourir chaque face en utilisant les sommets (3 sommets par face)
    const faceCount = positionAttribute.count / 3;
    for (let i = 0; i < faceCount; i++) {
      // Obtenir les trois sommets de la face
      const vA = new THREE.Vector3().fromBufferAttribute(
        positionAttribute,
        i * 3,
      );
      const vB = new THREE.Vector3().fromBufferAttribute(
        positionAttribute,
        i * 3 + 1,
      );
      const vC = new THREE.Vector3().fromBufferAttribute(
        positionAttribute,
        i * 3 + 2,
      );

      // Calculer la normale de la face dans l'espace local
      const normal = new THREE.Vector3()
        .subVectors(vB, vA)
        .cross(new THREE.Vector3().subVectors(vC, vA))
        .normalize();

      // Transformer la normale en espace monde
      normal.applyQuaternion(worldQuaternion);

      // Calculer le produit scalaire avec la direction "haut" (0, 1, 0)
      const dot = normal.dot(new THREE.Vector3(0, 1, 0));

      // Si cette face est plus proche de "haut", on met à jour
      if (dot > maxDot) {
        maxDot = dot;
        topFaceIndex = i;
      }
    }

    // Vérifier si un index valide a été trouvé
    if (topFaceIndex !== -1 && topFaceIndex < this.diceFaceNumbers.length) {
      return this.diceFaceNumbers[topFaceIndex];
    }

    return null; // Aucune face valide trouvée
  }

  private isDiceStopped(): boolean {
    const linearVelocity = this.diceBody.velocity.length(); // Vitesse linéaire
    const angularVelocity = this.diceBody.angularVelocity.length(); // Vitesse angulaire

    // Si la vitesse est inférieure à un seuil, le dé est considéré comme immobile
    const threshold = 0.01;
    return linearVelocity < threshold && angularVelocity < threshold;
  }

  private moveCameraToTopView(): void {
    const targetPosition = this.diceBody.position; // Position finale du dé

    // Désactiver les contrôles
    this.controls.enabled = false;

    // Définir les positions de départ et de fin
    const startPosition = this.camera.position.clone();
    const endPosition = new THREE.Vector3(
      targetPosition.x, // Position X du dé
      targetPosition.y + 8, // Au-dessus du dé (10 unités en hauteur)
      targetPosition.z, // Position Z du dé
    );
    const lookAtTarget = new THREE.Vector3(
      targetPosition.x,
      targetPosition.y,
    );

    // Variables pour l'animation
    let progress = 0;
    const duration = 2; // Durée de l'animation en secondes

    const animateCamera = () => {
      // Incrémentez le progrès
      progress += 1 / 30; // 1 frame à 60 FPS
      const alpha = Math.min(progress / duration, 1); // Normaliser entre 0 et 1

      // Interpolation linéaire de la position de la caméra
      this.camera.position.lerpVectors(startPosition, endPosition, alpha);

      // Faire regarder la caméra vers le dé
      this.camera.lookAt(lookAtTarget);

      // Rendre la scène après chaque mise à jour
      this.renderer.render(this.scene, this.camera);

      // Continuez tant que l'animation n'est pas terminée
      if (alpha < 1) {
        requestAnimationFrame(animateCamera);
      } else {
        console.log("Animation terminée, caméra au-dessus du dé.");
        this.topFaceNumber = this.getTopFace();
        if (this.topFaceNumber !== null) {
          this.resultMessage = this.getRandomPhrase(this.topFaceNumber);
        }
      }
    };

    animateCamera();
  }

  resetScene(): void {
    // Annuler l'animation en cours
    cancelAnimationFrame(this.animationFrameId);

    this.topFaceNumber = null; // Réinitialiser le numéro de la face
    // Supprimer tous les objets de la scène
    while (this.scene.children.length > 0) {
      const object = this.scene.children[0];
      this.scene.remove(object);
    }

    // Supprimer tous les objets physiques
    while (this.world.bodies.length > 0) {
      this.world.removeBody(this.world.bodies[0]);
    }

    // Réinitialiser les variables de contrôle
    this.hasDiceBeenLaunched = false;
    this.isDragging = false;
    this.selectedObject = null;
    this.targetPosition = null;
    this.initialPosition = null;

    // Réinitialiser la caméra
    this.camera.position.set(0, 7, 10);
    this.camera.lookAt(0, 0, 0);

    // Réinitialiser les contrôles
    if (this.controls) {
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }

    // Réinitialiser les matériaux
    this.configureMaterials();

    // Recréer les éléments de la scène
    this.addGround();
    this.addWalls();
    this.addCeiling();
    this.addDice();
    this.addLights();

    // Relancer l'animation
    this.startAnimation();
  }

  resetDice(): void {
    if (this.diceBody && this.diceMesh) {
      // Réinitialiser la position et la rotation du corps physique
      this.diceBody.position.set(0, 3, 0); // Position d'origine
      this.diceBody.quaternion.set(0, 0, 0, 1); // Rotation initiale
      this.diceBody.velocity.set(0, 0, 0); // Supprimer la vélocité
      this.diceBody.angularVelocity.set(0, 0, 0); // Supprimer la rotation

      // Synchroniser le mesh avec le corps physique
      this.diceMesh.position.copy(this.diceBody.position as any);
      this.diceMesh.quaternion.copy(this.diceBody.quaternion as any);
    }
  }

  private diceMaterial!: CANNON.Material; // Matériau du dé
  private wallMaterial!: CANNON.Material; // Matériau des murs
  private groundMaterial!: CANNON.Material; // Matériau du sol

  private configureMaterials(): void {
    // Créer des matériaux physiques
    this.diceMaterial = new CANNON.Material("diceMaterial");
    this.wallMaterial = new CANNON.Material("wallMaterial");
    this.groundMaterial = new CANNON.Material("groundMaterial");

    // Configurer les interactions entre le dé et les murs
    const diceWallContact = new CANNON.ContactMaterial(
      this.diceMaterial,
      this.wallMaterial,
      {
        friction: 0.1, // Faible friction pour que le dé glisse un peu
        restitution: 0.3, // Rebond modéré
      },
    );
    this.world.addContactMaterial(diceWallContact);

    // Configurer les interactions entre le dé et le sol
    const diceGroundContact = new CANNON.ContactMaterial(
      this.diceMaterial,
      this.groundMaterial,
      {
        friction: 0.2, // Plus de friction avec le sol
        restitution: 0.3, // Rebond modéré
      },
    );
    this.world.addContactMaterial(diceGroundContact);
  }

  private addGround(): void {
    // Sol physique
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: this.groundMaterial,
    });

    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);

    // Ajouter uniquement les arêtes du sol
    const groundEdges = new THREE.EdgesGeometry(
      new THREE.PlaneGeometry(16, 16),
    );
    this.groundEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: this.edgeOpacity, // Opacité pour les arêtes
    });
    const groundWireframe = new THREE.LineSegments(
      groundEdges,
      this.groundEdgeMaterial,
    );

    groundWireframe.rotation.x = -Math.PI / 2; // Aligner avec le sol
    this.scene.add(groundWireframe);

    // Ajouter une surface semi-transparente pour le sol
    this.groundSurfaceMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: this.surfaceOpacity,
      side: THREE.DoubleSide,
    });
    const groundSurface = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      this.groundSurfaceMaterial,
    );
    groundSurface.rotation.x = -Math.PI / 2; // Aligner avec le sol

    this.scene.add(groundSurface);
  }

  private addWalls(): void {
    const wallMaterial = new CANNON.Material();
    // Dimensions des murs
    const wallHeight = 16; // Réduit la hauteur des murs
    const wallThickness = 0.2;
    const wallWidth = 16; // Correspond à la taille du sol

    // Couleur des arêtes
    this.wallEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: this.edgeOpacity, // Opacité des arêtes
    });

    // Couleur des surfaces opaques
    this.wallSurfaceMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: this.surfaceOpacity,
      side: THREE.DoubleSide,
    });

    // Positions des murs
    const wallShapes = [
      { position: [0, wallHeight / 2, -wallWidth / 2], rotation: [0, 0, 0] }, // Mur arrière
      {
        position: [-wallWidth / 2, wallHeight / 2, 0],
        rotation: [0, Math.PI / 2, 0],
      }, // Mur gauche
      {
        position: [wallWidth / 2, wallHeight / 2, 0],
        rotation: [0, -Math.PI / 2, 0],
      }, // Mur droit
      {
        position: [0, wallHeight / 2, wallWidth / 2],
        rotation: [0, Math.PI, 0],
      }, // Mur devant (derrière la caméra)
    ];

    wallShapes.forEach(({ position, rotation }) => {
      // Créer le mur physique
      const wallBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(
          new CANNON.Vec3(wallWidth / 2, wallHeight / 2, wallThickness),
        ),
        material: this.wallMaterial,
      });
      wallBody.position.set(...(position as [number, number, number]));
      wallBody.quaternion.setFromEuler(
        ...(rotation as [number, number, number]),
      );
      this.world.addBody(wallBody);

      // Ajouter uniquement les arêtes pour le mur
      const wallEdges = new THREE.EdgesGeometry(
        new THREE.BoxGeometry(wallWidth, wallHeight, wallThickness * 2),
      );
      const wallWireframe = new THREE.LineSegments(
        wallEdges,
        this.wallEdgeMaterial,
      );

      wallWireframe.position.set(...(position as [number, number, number]));
      wallWireframe.rotation.set(...(rotation as [number, number, number]));
      this.scene.add(wallWireframe);

      // Ajouter une surface semi-transparente pour le mur
      const wallSurface = new THREE.Mesh(
        new THREE.BoxGeometry(wallWidth, wallHeight, wallThickness * 2),
        this.wallSurfaceMaterial,
      );
      wallSurface.position.set(...(position as [number, number, number]));
      wallSurface.rotation.set(...(rotation as [number, number, number]));

      this.scene.add(wallSurface);
    });
  }

  private addCeiling(): void {
    const wallHeight = 17; // Correspond à la nouvelle hauteur des murs

    // Plafond physique
    const ceilingBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
    });
    ceilingBody.position.set(0, wallHeight, 0); // Position du plafond en fonction de la hauteur des murs
    ceilingBody.quaternion.setFromEuler(Math.PI / 2, 0, 0);
    this.world.addBody(ceilingBody);

    // Ajouter uniquement les arêtes du plafond
    const ceilingEdges = new THREE.EdgesGeometry(
      new THREE.PlaneGeometry(16, 16),
    );
    this.ceilingEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: this.edgeOpacity, // Opacité des arêtes
    });
    const ceilingWireframe = new THREE.LineSegments(
      ceilingEdges,
      this.ceilingEdgeMaterial,
    );

    ceilingWireframe.rotation.x = Math.PI / 2; // Aligner avec le plafond
    ceilingWireframe.position.y = wallHeight; // Aligner en hauteur
    this.scene.add(ceilingWireframe);

    // Ajouter une surface semi-transparente pour le plafond
    this.ceilingSurfaceMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: this.surfaceOpacity,
      side: THREE.DoubleSide,
    });
    const ceilingSurface = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      this.ceilingSurfaceMaterial,
    );
    ceilingSurface.rotation.x = Math.PI / 2; // Aligner avec le plafond
    ceilingSurface.position.y = wallHeight; // Aligner en hauteur

    this.scene.add(ceilingSurface);
  }

  private diceObjects: any[] = [];

  private addDice(): void {
    const loader = new GLTFLoader();
    loader["load"](
      "assets/3d/dice/d20.gltf",
      (gltf: any) => {
        const model = gltf.scene;

        // Trouver le premier Mesh dans le modèle
        let gltfMesh: any = null;
        model.traverse((child: any) => {
          if (child.isMesh) {
            gltfMesh = child;
          }
        });

        if (!gltfMesh) {
          console.warn("Aucun mesh trouvé dans le GLTF !");
          return;
        }

        // Utiliser la géométrie du GLTF pour copier les UVs
        const diceGeometry = new THREE.IcosahedronGeometry(0.8);
        diceGeometry.attributes.uv = gltfMesh.geometry.attributes.uv; // Copier les UVs

        // Utiliser le matériau du GLTF
        const diceMaterial = gltfMesh.material;

        this.diceMesh = new THREE.Mesh(diceGeometry, diceMaterial);
        this.diceMesh.layers.set(1); // Assigner la couche 1

        this.scene.add(this.diceMesh);

        // Correspondance physique pour le dé avec la forme d'un icosaèdre
        const diceShape = this.createIcosahedronShape(1); // Rayon de 1 unité
        this.diceBody = new CANNON.Body({
          mass: 1,
          shape: diceShape,
          material: this.diceMaterial,
        });
        this.diceBody.angularDamping = 0.1; // Ajustez cette valeur selon l'effet désiré

        this.diceBody.position.set(0, 3, 0);
        this.world.addBody(this.diceBody);
      },
      undefined,
      (error: any) => {
        console.error("Erreur lors du chargement du modèle GLTF :", error);
      },
    );
  }

  private addLights(): void {
    // Lumière ambiante (illumination uniforme de la scène)
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambientLight);

    // Lumière directionnelle principale
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.6); // Intensité augmentée
    directionalLight.position.set(5, 10, 5);
    this.scene.add(directionalLight);

    // Ajout d'un projecteur directement sur le dé
    const spotLight = new THREE.SpotLight(0xffffff, 3); // Intensité forte
    spotLight.position.set(-5, 10, -5); // Directement au-dessus du dé
    spotLight.angle = Math.PI / 3; // Concentrez la lumière sur une petite zone
    spotLight.penumbra = 0.2; // Ajouter un léger flou
    spotLight.decay = 2; // Réduire l'intensité avec la distance
    spotLight.distance = 130; // Limite de la portée
    this.scene.add(spotLight);

    // Ajout d'un deuxième projecteur
    const spotLight2 = new THREE.SpotLight(0xffffff, 3.5);
    spotLight2.position.set(-10, 5, 10); // Position décalée
    spotLight2.angle = Math.PI / 4;
    this.scene.add(spotLight2);
  }

  private addInteractionListeners(container: HTMLElement): void {
    container.addEventListener("mousedown", (event) =>
      this.onPointerDown(event),
    );
    container.addEventListener("mousemove", (event) =>
      this.onPointerMove(event),
    );
    container.addEventListener("mouseup", () => this.onPointerUp());

    container.addEventListener("touchstart", (event) =>
      this.onPointerDown(event.touches[0]),
    );
    container.addEventListener("touchmove", (event) =>
      this.onPointerMove(event.touches[0]),
    );
    container.addEventListener("touchend", () => this.onPointerUp());
  }

  private applyExtraForce(): void {
    if (this.diceBody) {
      // Force linéaire : direction et intensité
      const force = new CANNON.Vec3(
        (Math.random() - 0.5) * 10, // Force aléatoire sur X
        Math.random() * 20 + 10, // Force positive sur Y pour lever le dé
        (Math.random() - 0.5) * 10, // Force aléatoire sur Z
      );
      const relativePoint = new CANNON.Vec3(0, 0, 0); // Point d'application de la force (centre)

      // Appliquer la force linéaire
      this.diceBody.applyForce(force, relativePoint);

      // === Calculer l'intensité de la force ===
      const forceMagnitude = force.length(); // Magnitude de la force appliquée

      // === Définir une rotation proportionnelle à la force ===
      const rotationFactor = forceMagnitude * 0.5; // Ajustez le facteur de rotation
      const angularVelocity = new CANNON.Vec3(
        (Math.random() - 0.5) * rotationFactor, // Vélocité de rotation proportionnelle sur X
        (Math.random() - 0.5) * rotationFactor, // Vélocité de rotation proportionnelle sur Y
        (Math.random() - 0.5) * rotationFactor, // Vélocité de rotation proportionnelle sur Z
      );

      // Appliquer la vélocité angulaire
      this.diceBody.angularVelocity.copy(angularVelocity);

      // Marquer le dé comme lancé
      this.hasDiceBeenLaunched = true;
    }
  }

  private onPointerDown(event: MouseEvent | Touch): void {
    this.mouseDown = true;
    this.updateMousePosition(event);

    // Initialiser la position de départ pour le calcul de rotation
    this.lastDragMouse.copy(this.mouse);

    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.raycaster.layers.set(1); // Limiter le raycaster à la couche 1
    const intersects = this.raycaster.intersectObject(this.diceMesh);

    if (intersects.length > 0) {
      this.selectedObject = this.diceBody;
      this.controls.enabled = false; // Désactiver OrbitControls
      this.diceBody.mass = 1; // garder la masse.
      this.diceBody.updateMassProperties();

      // Sauvegarder la position initiale et la profondeur
      this.initialPosition = this.diceBody.position.clone();
      const intersectPoint = intersects[0].point;
      this.targetPosition = new CANNON.Vec3(
        intersectPoint.x,
        intersectPoint.y,
        intersectPoint.z,
      );
      this.isDragging = true;
    }
  }

  private initialHeight: number = 3; // Hauteur initiale définie à 3 (valeur de départ du dé)
  private maxHeight: number = 3; // Initialement égale à la hauteur initiale

  // Déclarez une variable pour mémoriser le delta de rotation
  private lastPointerDelta: any = new THREE.Vector2();

  private onPointerMove(event: MouseEvent | Touch): void {
    if (!this.mouseDown || !this.selectedObject || !this.initialPosition)
      return;

    this.updateMousePosition(event);

    // Calculer le delta entre la position actuelle et la dernière position connue
    const deltaX = this.mouse.x - this.lastDragMouse.x;
    const deltaY = this.mouse.y - this.lastDragMouse.y;

    // Mettre à jour lastPointerDelta pour pouvoir éventuellement l'utiliser (par exemple pour un éventuel boost)
    this.lastPointerDelta.set(deltaX, deltaY);

    // Facteur d'accélération (ajustez-le pour obtenir l'effet souhaité)
    const accelerationFactor = 10;
    // Calculer l'accélération angulaire à appliquer
    const angularAcceleration = new CANNON.Vec3(
      deltaY * accelerationFactor, // influence sur la rotation autour de X
      deltaX * accelerationFactor, // influence sur la rotation autour de Y
      0, // pas de rotation autour de Z dans cet exemple
    );

    // Accumuler l'accélération dans la vélocité angulaire actuelle
    this.diceBody.angularVelocity.vadd(
      angularAcceleration,
      this.diceBody.angularVelocity,
    );

    // Mettre à jour la dernière position du pointeur pour le prochain delta
    this.lastDragMouse.copy(this.mouse);

    // Mise à jour de la position (translation) du dé (code inchangé)
    const ray = new THREE.Raycaster();
    ray.setFromCamera(this.mouse, this.camera);
    const plane = new THREE.Plane();
    plane.setFromNormalAndCoplanarPoint(
      this.camera.getWorldDirection(new THREE.Vector3()),
      new THREE.Vector3().copy(this.initialPosition as any),
    );
    const targetPoint = new THREE.Vector3();
    ray.ray.intersectPlane(plane, targetPoint);

    // Mettre à jour la hauteur maximale atteinte si le dé est soulevé
    if (targetPoint.y > this.maxHeight) {
      this.maxHeight = targetPoint.y; // Mise à jour de la hauteur maximale atteinte
    }

    // Limiter la position Y : ne pas descendre en dessous de l'initialHeight, mais permettre de baisser jusqu'à maxHeight
    const newY = Math.max(
      this.initialHeight,
      Math.min(targetPoint.y, this.maxHeight),
    );

    // Mettre à jour la position cible (en profondeur et direction alignées)
    this.targetPosition = new CANNON.Vec3(
      targetPoint.x,
      newY, // Utiliser la hauteur limitée
      targetPoint.z,
    );
  }

  private onPointerUp(): void {
    this.mouseDown = false;

    if (this.selectedObject && this.targetPosition) {
      // Calcul de la vélocité pour la translation (mouvement du dé)
      const velocity = new CANNON.Vec3(
        this.targetPosition.x - this.diceBody.position.x,
        this.targetPosition.y - this.diceBody.position.y,
        this.targetPosition.z - this.diceBody.position.z,
      );

      // Appliquer la vélocité pour que le dé continue son mouvement
      this.diceBody.velocity.copy(velocity);

      // Appliquer une force supplémentaire
      this.applyExtraForce();

      this.selectedObject = null;
      this.targetPosition = null;
      this.initialPosition = null;
    }

    this.isDragging = false;
    this.controls.enabled = true;
    this.diceBody.mass = 1;
    this.diceBody.updateMassProperties();
  }

  private updateMousePosition(event: MouseEvent | Touch): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.renderer.dispose();
  }
}
