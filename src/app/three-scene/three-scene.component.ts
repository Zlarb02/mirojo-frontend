import { Component, OnInit, HostListener } from "@angular/core";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

@Component({
  selector: "app-three-scene",
  templateUrl: "./three-scene.component.html",
  styleUrls: ["./three-scene.component.scss"],
  standalone: true,
})
export class ThreeSceneComponent implements OnInit {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private scene!: any;
  private camera!: any;
  private renderer!: any;
  private dice!: any;
  private isAnimating = false;
  private controls!: OrbitControls;
  private isDragging = false; // Suivi du clic de souris
  private previousMousePosition = { x: 0, y: 0 };
  private faceRotations: {
    [key: number]: { x: number; y: number; z: number };
  } = {
    1: { x: -1.7, y: 18.18, z: 0.0 },
    2: { x: 0.8, y: 13.68, z: 0.0 },
    3: { x: -0.44, y: 17.4, z: 0.0 },
    4: { x: 0.3, y: 15.03, z: 0.0 },
    5: { x: -2.9, y: 10.87, z: 0.0 },
    6: { x: 2.39, y: 6.34, z: 0.0 },
    7: { x: -0.87, y: 19.19, z: 0.0 },
    8: { x: 0.78, y: 17.89, z: 0.0 },
    9: { x: 5.78, y: 9.75, z: 0.0 },
    10: { x: -0.11, y: 11.98, z: 0.0 },
    11: { x: -0.31, y: 9.11, z: 0.0 },
    12: { x: 0.31, y: 13.05, z: 0.0 },
    13: { x: 5.44, y: 14.68, z: 0.0 },
    14: { x: 0.79, y: 9.38, z: 0.0 },
    15: { x: 0.67, y: 20.09, z: 0.0 },
    16: { x: 0.22, y: 10.98, z: 0.0 },
    17: { x: -0.32, y: 11.9, z: 0.0 },
    18: { x: 6.75, y: 14.23, z: 0.0 },
    19: { x: -0.75, y: 4.22, z: 0.0 },
    20: { x: 1.62, y: 3.14, z: 0.0 },
  };

  constructor() {}

  ngOnInit(): void {
    if (typeof window !== "undefined") {
      this.initThreeJS();
    }
    document.addEventListener("mousedown", (event) => {
      this.isDragging = true;
      this.previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    document.addEventListener("mousemove", (event) => {
      if (this.isDragging && this.dice) {
        const deltaMove = {
          x: event.clientX - this.previousMousePosition.x,
          y: event.clientY - this.previousMousePosition.y,
        };

        const rotationSpeed = 0.005;
        this.dice.rotation.y += deltaMove.x * rotationSpeed;
        this.dice.rotation.x += deltaMove.y * rotationSpeed;

        this.previousMousePosition = { x: event.clientX, y: event.clientY };

        console.log("Rotation actuelle du dé :", {
          x: this.dice.rotation.x.toFixed(2),
          y: this.dice.rotation.y.toFixed(2),
          z: this.dice.rotation.z.toFixed(2),
        });
      }
    });

    document.addEventListener("mouseup", () => {
      this.isDragging = false;
    });
  }

  private initThreeJS(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Initialisation de la caméra
    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100);
    this.camera.position.z = 1;

    // Initialisation de la scène
    this.scene = new THREE.Scene();

    // Lumière directionnelle
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(2, 2, 2);
    this.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffa500, 1, 10); // Couleur chaude, intensité 1
    pointLight.position.set(0, 2, 0); // Position au-dessus du dé
    pointLight.castShadow = true;
    this.scene.add(pointLight);

    const spotLight = new THREE.SpotLight(0xff4500, 0.7, 15, Math.PI / 6);
    spotLight.position.set(2, 3, 2);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    // Lumière ambiante pour éclairage global
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Pour la lumière directionnelle
    directionalLight.castShadow = true;

    // Charger le modèle d20.gltf
    this.loadDiceModel();

    // Texture procédurale de bois réaliste
    const woodTexture = this.createRealisticWoodTexture();

    // Plateau en bois
    const tabletopGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.8);
    const tabletopMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
    const tabletop = new THREE.Mesh(tabletopGeometry, tabletopMaterial);
    tabletop.position.y = -0.25;
    tabletop.castShadow = false;
    tabletop.receiveShadow = true;
    this.scene.add(tabletop);

    // Pieds de table
    const legGeometry = new THREE.BoxGeometry(0.05, 0.25, 0.05);
    const legMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
    const legPositions = [
      { x: -0.35, z: -0.35 },
      { x: 0.35, z: -0.35 },
      { x: -0.35, z: 0.35 },
      { x: 0.35, z: 0.35 },
    ];
    for (const pos of legPositions) {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.castShadow = false;
      leg.receiveShadow = true;
      leg.position.set(pos.x, -0.4, pos.z);
      this.scene.add(leg);
    }

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setAnimationLoop(this.animate.bind(this));
    const container = document.getElementById("scene-container");
    if (container) {
      container.appendChild(this.renderer.domElement);
    } else {
      console.error("Scene container not found");
    }
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optionnel, ombres plus douces

    //this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    //this.controls.enableDamping = true; // Pour des mouvements fluides

    this.handleResize();
  }

  /**
   * Charge le modèle d20.gltf
   */
  private loadDiceModel(): void {
    const loader: any = new GLTFLoader();
    loader.load(
      "assets/d20.gltf", // Chemin vers votre modèle GLTF
      (gltf: any) => {
        this.dice = gltf.scene;

        // Centrer et ajuster l'échelle du modèle
        this.dice.position.set(0, -0.1, -0.3);

        // Parcourir tous les enfants pour identifier les Mesh
        this.dice.traverse((child: any) => {
          if (child.isMesh) {
            console.log("Mesh trouvé :", child);

            // Assurez-vous que le matériau d'origine est utilisé
            child.material = child.material || new THREE.MeshStandardMaterial();
          }
        });

        this.dice.scale.set(0.003, 0.003, 0.003); // Réduire la taille du modèle

        //const boxHelper = new THREE.BoxHelper(this.dice, 0xffff00);
        //this.scene.add(boxHelper);
        this.dice.castShadow = true;
        this.dice.receiveShadow = true;

        // Ajouter le modèle à la scène
        this.scene.add(this.dice);
        console.log("Modèle ajouté à la scène :", this.dice);
      },
      undefined,
      (error: any) => {
        console.error("Erreur lors du chargement du modèle GLTF :", error);
      },
    );
  }

  /**
   * Fonction d'animation de la scène
   */
  private animate(): void {
    if (this.isAnimating && this.dice) {
      this.dice.rotation.x += 0.1;
      this.dice.rotation.y += 0.1;
    }
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Texture procédurale de bois
   */
  private createRealisticWoodTexture(): any {
    const canvas = document.createElement("canvas");
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Impossible de créer le contexte 2D pour le canvas");
    }

    const gradient = context.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "#deb887");
    gradient.addColorStop(1, "#a0522d");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    for (let i = 0; i < 100; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const width = Math.random() * 100 + 20;
      const height = Math.random() * 5 + 2;
      const rotation = Math.random() * Math.PI * 2;

      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.3 + 0.1})`;
      context.fillRect(-width / 2, -height / 2, width, height);
      context.restore();
    }

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Gestion des clics sur la scène
   */
  @HostListener("click", ["$event"])
  onClick(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObject(this.dice, true);
    if (intersects.length > 0 && !this.isAnimating) {
      this.rollDice();
    }
  }

  /**
   * Animation du dé
   */
  private rollDice(): void {
    const randomFace = Math.floor(Math.random() * 20) + 1; // Face finale aléatoire
    const targetRotation = this.faceRotations[randomFace];

    if (!this.dice || this.isAnimating) return;

    const animationDuration = 3000; // Durée totale de l'animation (ms)
    const startRotation = {
      x: this.dice.rotation.x,
      y: this.dice.rotation.y,
      z: this.dice.rotation.z,
    };
    const startPosition = { ...this.dice.position }; // Position de départ
    const endPosition = {
      x: (Math.random() - 0.5) * 0.4, // Translation aléatoire sur X
      y: this.dice.position.y,
      z: (Math.random() - 0.5) * 0.4, // Translation aléatoire sur Z
    };

    const startTime = performance.now();
    this.isAnimating = true;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Ajout d'une rotation dynamique pour simuler le roulement
      const randomSpinX = Math.PI * 4 * (1 - progress); // Réduction progressive du spin
      const randomSpinY = Math.PI * 6 * (1 - progress);

      this.dice.rotation.x = THREE.MathUtils.lerp(
        startRotation.x,
        targetRotation.x + randomSpinX,
        progress,
      );
      this.dice.rotation.y = THREE.MathUtils.lerp(
        startRotation.y,
        targetRotation.y + randomSpinY,
        progress,
      );
      this.dice.rotation.z = THREE.MathUtils.lerp(
        startRotation.z,
        targetRotation.z,
        progress,
      );

      // Ajout de la translation pour simuler le déplacement sur la table
      this.dice.position.x = THREE.MathUtils.lerp(
        startPosition.x,
        endPosition.x,
        progress,
      );
      this.dice.position.z = THREE.MathUtils.lerp(
        startPosition.z,
        endPosition.z,
        progress,
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
        console.log(`Face obtenue : ${randomFace}`);
      }
    };
    requestAnimationFrame(animate);
  }

  /**
   * Gère le redimensionnement de la fenêtre
   */
  @HostListener("window:resize", ["$event"])
  onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0; // Ajustez pour contrôler la luminosité
  }

  private handleResize(): void {
    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
  }
}
