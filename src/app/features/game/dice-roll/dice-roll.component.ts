import { Component, type OnInit, HostListener } from "@angular/core";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CommonModule } from "@angular/common";
import { NavComponent } from "../../../layout/nav/nav.component";

@Component({
  selector: "app-dice-roll",
  imports: [CommonModule, NavComponent],
  templateUrl: "./dice-roll.component.html",
  styleUrls: ["./dice-roll.component.scss"],
  standalone: true,
})
export class DiceRollComponent implements OnInit {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private scene!: any;
  private camera!: any;
  private renderer!: any;
  private dice!: any;
  private isAnimating = false;
  private controls!: any;
  private isDragging = false; // Suivi du clic de souris
  private previousMousePosition = { x: 0, y: 0 };
  private faceRotations: {
    [key: number]: { x: number; y: number; z: number };
  } = {
    1: { x: -3.25, y: 17.83, z: 0.0 },
    2: { x: 6.955, y: 29.42, z: 0.0 },
    3: { x: 4.265, y: 11.065, z: 0.0 },
    4: { x: 1.14, y: 5.695, z: 0.0 },
    5: { x: -1.995, y: 20.335, z: 0.0 },
    6: { x: 7.485, y: 25.675, z: 0.0 },
    7: { x: -2.225, y: 12.635, z: 0.0 },
    8: { x: -0.81, y: 17.7, z: 0.0 },
    9: { x: -2.015, y: 15.795, z: 0.0 },
    10: { x: -1.3, y: 18.36, z: 0.0 },
    11: { x: -2.015, y: 15.215, z: 0.0 },
    12: { x: 7.395, y: 28.655, z: 0.0 },
    13: { x: -2.435, y: 14.61, z: 0.0 },
    14: { x: 0.4, y: -0.005, z: 0.0 },
    15: { x: -1.975, y: 19.42, z: 0.0 },
    16: { x: -1.18, y: 17.125, z: 0.0 },
    17: { x: -1.995, y: 18.19, z: 0.0 },
    18: { x: -11.45, y: 23.7, z: 0.0 },
    19: { x: -2.555, y: 16.735, z: 0.0 },
    20: { x: -0.11, y: 15.73, z: 0.0 },
  };

  public diceResult: number | null = null;
  public resultMessage = "";
  cave: any;
  private clock = new THREE.Clock();
  private defaultView = false;

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

        /* DEBUG Rotation manuelle du dé pour ajuster les valeurs de faceRotations

        const rotationSpeed = 0.005;
        this.dice.rotation.y += deltaMove.x * rotationSpeed;
        this.dice.rotation.x += deltaMove.y * rotationSpeed;

        this.previousMousePosition = { x: event.clientX, y: event.clientY };
        
        console.log('Rotation actuelle du dé :', {
          x: this.dice.rotation.x.toFixed(5),
          y: this.dice.rotation.y.toFixed(5),
          z: this.dice.rotation.z.toFixed(5),
        }); */
      }
    });

    document.addEventListener("mouseup", () => {
      this.isDragging = false;
    });
    this.loadCaveModel();
    this.animate();
  }

  private initThreeJS(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Initialisation de la caméra
    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100);
    this.camera.position.z = 1;

    // Initialisation de la scène
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000000, 1, 10); // Brume noire avec des distances ajustées

    // Charger la texture de skybox
    const loader = new THREE.TextureLoader();
    loader.load(
      "assets/cave.jpg", // Chemin de la texture cave.jpg
      (texture: any) => {
        // Assurez-vous que la texture se répète correctement
        texture.mapping = THREE.EquirectangularReflectionMapping;

        // Appliquer la texture en tant que fond
        this.scene.background = texture;

        // Ajuster la luminosité en appliquant une couleur de fond foncée (optionnel)
        this.renderer.setClearColor(0x000000, 1); // Fond noir pour réduire la luminosité générale
      },
      undefined,
      (error: any) => {
        console.error(
          "Erreur lors du chargement de la texture cave.jpg :",
          error,
        );
      },
    );

    // Lumière ponctuelle
    const pointLight = new THREE.PointLight(0xffa500, 0.9, 5); // Intensité réduite à 0.8
    pointLight.position.set(0, 0.13, 0);
    pointLight.castShadow = true;
    this.scene.add(pointLight);

    // Lumière spot
    const spotLight = new THREE.SpotLight(0xff4500, 2, 15, Math.PI / 8); // Intensité réduite à 0.5
    spotLight.position.set(0, 1.8, 0);
    spotLight.target.rotation.set(2, 2, 2);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    //debug box
    const pointLightHelper = new THREE.PointLightHelper(pointLight);
    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    //this.scene.add(pointLightHelper, spotLightHelper);

    // Lumière ambiante
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15); // Réduction à 0.2
    this.scene.add(ambientLight);

    // Charger le modèle d20.gltf
    this.loadDiceModel();

    this.loadCaveModel();

    // Plateau en bois
    const tabletopGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.8);
    const tabletopMaterial = new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load(
        "assets/3d/table-wood/wood_table_worn_diff_4k.jpg",
      ),
      normalMap: new THREE.TextureLoader().load(
        "assets/3d/table-wood/wood_table_worn_nor_gl_4k.exr",
      ),
      roughnessMap: new THREE.TextureLoader().load(
        "assets/3d/table-wood/wood_table_worn_rough_4k.exr",
      ),
    });
    const tabletop = new THREE.Mesh(tabletopGeometry, tabletopMaterial);
    tabletop.position.y = -0.25;
    tabletop.castShadow = false;
    tabletop.receiveShadow = true;
    this.scene.add(tabletop);

    // Pieds de table
    const legGeometry = new THREE.BoxGeometry(0.05, 0.25, 0.05);
    const legMaterial = new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load(
        "assets/3d/table-wood/wood_table_worn_diff_4k.jpg",
      ),
      normalMap: new THREE.TextureLoader().load(
        "assets/3d/table-wood/wood_table_worn_nor_gl_4k.exr",
      ),
      roughnessMap: new THREE.TextureLoader().load(
        "assets/3d/table-wood/wood_table_worn_rough_4k.exr",
      ),
    });
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

    this.addCandle();

    //renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0; // Contrôle la luminosité
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const container = document.getElementById("scene-container");
    if (container) {
      container.appendChild(this.renderer.domElement);
    } else {
      console.error("Scene container not found");
    }
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optionnel, ombres plus douces

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls["enableDamping"] = true; // Pour des mouvements fluides

    this.handleResize();
    this.toggleControl();
  }

  /**
   * Charge le modèle cave.gltf
   */

  private loadCaveModel(): void {
    const loader: any = new GLTFLoader();

    loader.load(
      "assets/3d/cave/cave.gltf", // Chemin vers le modèle
      (gltf: any) => {
        this.cave = gltf.scene;

        const boxHelper = new THREE.BoxHelper(this.cave, 0xffff00);
        //this.scene.add(boxHelper);
        // Appliquer les textures à chaque matériau de la grotte
        this.cave.traverse((child: any) => {
          if (child.isMesh) {
            // Création du matériau avec rendu double face
            child.material = new THREE.MeshStandardMaterial({
              side: THREE.DoubleSide, // Important : double face pour voir de l'intérieur
              //textures
              map: new THREE.TextureLoader().load(
                "assets/3d/cave/textures/tiger_rock_diff_4k.jpg",
              ),
              normalMap: new THREE.TextureLoader().load(
                "assets/3d/cave/textures/tiger_rock_nor_gl_4k.exr",
              ),
              roughnessMap: new THREE.TextureLoader().load(
                "assets/3d/cave/textures/tiger_rock_rough_4k.exr",
              ),
            });

            // Inverser les normales si nécessaire
            child.geometry.computeVertexNormals(); // Recalcule les normales

            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Ajuster la taille et la position de la grotte
        this.cave.scale.set(1.2, 1.2, 1.2); // Adapter selon vos besoins
        this.cave.position.set(0.7, 0.81, 0.5);
        this.cave.rotation.set(0, 4, 0);

        // Ajouter la grotte à la scène
        this.scene.add(this.cave);
      },
      undefined,
      (error: any) => {
        console.error("Erreur lors du chargement du modèle de grotte :", error);
      },
    );
  }

  /**
   * Charge le modèle d20.gltf
   */
  private loadDiceModel(): void {
    const loader: any = new GLTFLoader();
    loader.load(
      "assets/3d/dice/d20.gltf", // Chemin vers votre modèle GLTF
      (gltf: any) => {
        this.dice = gltf.scene;

        //dé au centre de l'ecran bien visible
        this.dice.position.set(0, 0, 0.8);

        this.dice.traverse((child: any) => {
          if (child.isMesh) {
            if (child.material) {
              child.material.metalness = 0.1; // Augmente l'effet de réflexion
              child.material.roughness = 0.3; // Rend la surface lisse

              // Ajoutez une émissivité
              child.material.emissive = new THREE.Color(0xffff00);
              child.material.emissiveIntensity = 0.01; // Ajustez l'intensité (0.2 est subtil)

              child.material.needsUpdate = true; // Assurez-vous que les changements sont appliqués
            }
          }
        });

        this.dice.scale.set(0.0008, 0.0008, 0.0008); // Réduire la taille du modèle

        //const boxHelper = new THREE.BoxHelper(this.dice, 0xffff00);
        //this.scene.add(boxHelper);
        this.dice.castShadow = true;
        this.dice.receiveShadow = true;

        // Ajouter le modèle à la scène
        this.scene.add(this.dice);
      },
      undefined,
      (error: any) => {
        console.error("Erreur lors du chargement du modèle GLTF :", error);
      },
    );
  }

  private addCandle(): void {
    // Charger la texture du halo
    const haloTexture = new THREE.TextureLoader().load(
      "assets/3d/candle/halo.png",
    );

    // Matériau du halo
    const haloMaterial = new THREE.SpriteMaterial({
      map: haloTexture, // Texture du halo
      color: 0xffaa33, // Couleur initiale
      transparent: true, // Transparence activée
      opacity: 0.5, // Opacité initiale
    });

    // Sprite pour représenter le halo
    const haloSprite = new THREE.Sprite(haloMaterial);
    haloSprite.scale.set(0.5, 0.5, 1); // Taille initiale du halo
    haloSprite.position.set(0, 0.2, 0); // Position au-dessus de la bougie

    // Cylindre pour représenter la bougie
    const candleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 10);
    const candleMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const candleMesh = new THREE.Mesh(candleGeometry, candleMaterial);

    // Groupe pour rassembler la bougie et le halo
    const candleGroup = new THREE.Group();
    candleGroup.add(candleMesh, haloSprite); // Ajoute la bougie et le halo au groupe
    candleGroup.position.set(0.3, -0.22, 0.3); // Position du groupe (sur la table)
    candleGroup.scale.set(0.2, 0.2, 0.2); // Ajuste la taille de la bougie

    const candleGroup2 = candleGroup.clone();
    candleGroup2.position.set(-0.3, -0.22, 0.3);

    const candleGroup3 = candleGroup.clone();
    candleGroup3.position.set(0.3, -0.22, -0.3);

    const candleGroup4 = candleGroup.clone();
    candleGroup4.position.set(-0.3, -0.22, -0.3);

    this.scene.add(candleGroup, candleGroup2, candleGroup3, candleGroup4); // Ajoute le groupe à la scène

    // Animation du halo (respiration et changement de couleur)
    const clock = new THREE.Clock();
    const animateHalo = () => {
      const elapsedTime = clock.getElapsedTime();

      // Effet de respiration (changement d'échelle)
      const scale = 0.5 + Math.sin(elapsedTime * 4) * 0.05; // Oscille entre 0.45 et 0.55
      haloSprite.scale.set(scale, scale, 1);

      // Variation de l'opacité pour simuler des fluctuations lumineuses
      haloMaterial.opacity = 0.5 + Math.sin(elapsedTime * 6) * 0.1; // Oscille entre 0.4 et 0.6

      // Variation de la couleur pour simuler une flamme dynamique
      haloMaterial.color.setHSL(
        ((Math.sin(elapsedTime * 3) + 1) / 2) * 0.01, // Légère variation de teinte
        0.7, // Saturation maximale
        0.5, // Luminosité constante
      );

      // Continue l'animation
      requestAnimationFrame(animateHalo);
    };
    animateHalo();
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
    this.controls.enabled = true;
    const randomFace = Math.floor(Math.random() * 20) + 1; // Face finale aléatoire
    const targetRotation = this.faceRotations[randomFace];

    if (!this.dice || this.isAnimating) return;

    const animationDuration = 2000; // Durée totale de l'animation (ms)
    const startRotation = {
      x: this.dice.rotation.x,
      y: this.dice.rotation.y,
      z: this.dice.rotation.z,
    };
    const startPosition = new THREE.Vector3(0, -0.188, 0.3); // Position de départ
    const endPosition = new THREE.Vector3(0, -0.188, 0); // Position finale

    // Position et rotation de la caméra
    const cameraStartPosition = this.camera.position.clone();
    const cameraStartRotation = this.camera.rotation.clone();
    const cameraEndPosition = new THREE.Vector3(
      1.742198389711335e-9,
      0.2526036140961516,
      2.52597606083769e-7,
    );
    const cameraEndRotation = new THREE.Euler(
      -1.570795326818681,
      6.896965412846179e-9,
      0.006897020093819907,
    );

    const startTime = performance.now();
    this.isAnimating = true;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Interpolation de la position du dé
      this.dice.position.lerpVectors(startPosition, endPosition, progress);

      // Interpolation de la position de la caméra pour le mode dynamique
      this.camera.position.lerpVectors(
        cameraStartPosition,
        cameraEndPosition,
        progress,
      );

      // Interpolation de la rotation de la caméra pour le mode statique
      // this.camera.rotation.set(
      //   THREE.MathUtils.lerp(
      //     cameraStartRotation.x,
      //     cameraEndRotation.x,
      //     progress
      //   ),
      //   THREE.MathUtils.lerp(
      //     cameraStartRotation.y,
      //     cameraEndRotation.y,
      //     progress
      //   ),
      //   THREE.MathUtils.lerp(
      //     cameraStartRotation.z,
      //     cameraEndRotation.z,
      //     progress
      //   )
      // );

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

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
        this.diceResult = randomFace;
        this.resultMessage =
          randomFace >= 1 && randomFace <= 3
            ? "Échec critique"
            : randomFace >= 17 && randomFace <= 20
              ? "Réussite critique"
              : "";
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Gère le redimensionnement de la fenêtre
   */

  private handleResize(): void {
    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    this.controls.update();
    this.checkCollisions();

    this.renderer.render(this.scene, this.camera);
  }

  private checkCollisions(): void {
    if (!this.cave) return; // Vérifie si la grotte est bien chargée avant d'essayer de détecter des collisions

    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);

    // Vérifier si l'objet `cave` est bien un objet avec une propriété `layers`
    if (!this.cave.layers) {
      console.warn(
        "L'objet 'cave' n'a pas de propriété layers. Ignorant la détection de collision.",
      );
      return;
    }

    this.raycaster.set(this.camera.position, direction);
    const intersectsForward = this.raycaster.intersectObject(this.cave, true);

    if (intersectsForward.length > 0) {
      const distance = intersectsForward[0].distance;
      if (distance < 0.5) {
        this.camera.position.add(direction.multiplyScalar(-0.1));
      }
    }

    const backwardDirection = direction.clone().negate();
    this.raycaster.set(this.camera.position, backwardDirection);
    const intersectsBackward = this.raycaster.intersectObject(this.cave, true);

    if (intersectsBackward.length > 0) {
      const distance = intersectsBackward[0].distance;
      if (distance < 0.5) {
        this.camera.position.add(backwardDirection.multiplyScalar(-0.1));
      }
    }
  }

  toggleControl(): void {
    this.defaultView = !this.defaultView;
    if (this.defaultView) {
      this.controls.enabled = false;

      this.camera.position.set(0, 0, 1); // Set to default position
      this.camera.lookAt(new THREE.Vector3(0, 0, 0)); // Ensure the camera is looking at the center
      this.controls.update();
      if (this.dice != null) {
        this.dice.position.set(0, 0, 0.8);
      }
    } else {
      this.controls.enabled = true;

      // début du lancer de dé
      this.dice.position.set(0, -0.188, 0.3);
    }
  }
}
