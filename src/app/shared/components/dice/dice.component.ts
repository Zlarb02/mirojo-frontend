import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
} from '@angular/core';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

@Component({
  standalone: true,
  selector: 'app-dice',
  template: `<div id="canvasContainer"></div>
    <button id="resetButton" (click)="resetDice()">
      Réinitialiser le dé
    </button> `,
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

      #canvasContainer {
        margin: auto;
        width: 80vw;
        height: 120vw;
        max-width: 80vh;
        max-height: 80vh;
        touch-action: none;
        border-radius: 20px;
        overflow: hidden;
      }
      #resetButton {
        margin: auto;
        margin-top: 20px;
        display: flex;
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

  private composer!: EffectComposer;
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

  ngAfterViewInit(): void {
    const container = this.elementRef.nativeElement.querySelector('div');

    // Initialiser le renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Créer la scène
    this.scene = new THREE.Scene();

    // Créer la caméra
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 7, 10);
    this.camera.lookAt(0, -5, 0);

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
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Ajoute une inertie fluide lors du mouvement
    this.controls.dampingFactor = 0.1; // Facteur de l'inertie
    this.controls.minDistance = 5; // Distance de zoom minimale
    this.controls.maxDistance = 15; // Réduisez la distance de dézoom maximale
    this.controls.enablePan = false; // Désactiver les déplacements latéraux

    // Ajouter les écouteurs pour les interactions utilisateur
    this.addInteractionListeners(container);

    const animate = () => {
      this.world.step(1 / 60);

      // Si une position cible existe et que le dé est sélectionné
      if (this.targetPosition && this.selectedObject) {
        const currentPosition = this.diceBody.position;

        // Interpoler la position actuelle vers la position cible
        const alpha = 0.17; // Facteur d'interpolation (plus petit = plus fluide)
        this.diceBody.position.set(
          this.lerp(currentPosition.x, this.targetPosition.x, alpha),
          this.lerp(currentPosition.y, this.targetPosition.y, alpha),
          this.lerp(currentPosition.z, this.targetPosition.z, alpha)
        );

        // Neutraliser les forces physiques parasites
        this.diceBody.velocity.set(0, 0, 0);
      }

      if (this.diceBody && this.diceMesh) {
        // Synchroniser la position et la rotation du mesh avec le corps physique
        this.diceMesh.position.copy(this.diceBody.position as any);
        this.diceMesh.quaternion.copy(this.diceBody.quaternion as any);
      }
      // Mettre à jour les contrôles uniquement si l'utilisateur ne manipule pas le dé
      if (!this.isDragging) {
        this.controls.update();
      }

      // === Camera Collision Detection ===
      const minCameraHeight = 2; // La hauteur minimale autorisée pour la caméra
      if (this.camera.position.y < minCameraHeight) {
        // Remontez la caméra si elle est trop basse
        this.camera.position.y = minCameraHeight;

        // Optionnel : recentrer légèrement la caméra
        const center = new THREE.Vector3(0, 0, 0);
        this.camera.lookAt(center);
        this.controls.target.copy(center);
      }

      // === Dice Collision Detection ===
      if (this.diceBody && this.diceMesh) {
        const bounds = 15; // Taille de la limite autour de la scène
        if (
          Math.abs(this.diceBody.position.x) > bounds ||
          Math.abs(this.diceBody.position.z) > bounds ||
          this.diceBody.position.y < -10
        ) {
          this.resetDice(); // Réinitialiser le dé s'il sort des limites
        }
      }
      // Rendu de la scène
      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    this.addBloomEffect();
    this.animateWithBloom();

    // Gérer le redimensionnement
    window.addEventListener('resize', () => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  private addBloomEffect(): void {
    const renderPass = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      2,
      0.8,
      1.2
    );
    bloomPass.threshold = 0.1; // Plus petit seuil pour inclure plus d'objets
    bloomPass.strength = 2.0; // Augmentez la force du bloom
    bloomPass.radius = 0.5; // Ajustez pour obtenir un effet plus diffus

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);
  }

  private animateWithBloom = () => {
    this.world.step(1 / 60);

    if (this.diceBody && this.diceMesh) {
      this.diceMesh.position.copy(this.diceBody.position as any);
      this.diceMesh.quaternion.copy(this.diceBody.quaternion as any);
    }

    if (!this.isDragging) {
      this.controls.update();
    }

    // Render avec l'effet bloom
    this.composer.render();
    requestAnimationFrame(this.animateWithBloom);
  };

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
    this.diceMaterial = new CANNON.Material('diceMaterial');
    this.wallMaterial = new CANNON.Material('wallMaterial');
    this.groundMaterial = new CANNON.Material('groundMaterial');

    // Configurer les interactions entre le dé et les murs
    const diceWallContact = new CANNON.ContactMaterial(
      this.diceMaterial,
      this.wallMaterial,
      {
        friction: 0.1, // Faible friction pour que le dé glisse un peu
        restitution: 0.3, // Rebond modéré
      }
    );
    this.world.addContactMaterial(diceWallContact);

    // Configurer les interactions entre le dé et le sol
    const diceGroundContact = new CANNON.ContactMaterial(
      this.diceMaterial,
      this.groundMaterial,
      {
        friction: 0.2, // Plus de friction avec le sol
        restitution: 0.3, // Rebond modéré
      }
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
      new THREE.PlaneGeometry(30, 30)
    );
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.3, // Opacité pour les arêtes
    });
    const groundWireframe = new THREE.LineSegments(groundEdges, edgeMaterial);

    groundWireframe.rotation.x = -Math.PI / 2; // Aligner avec le sol
    this.scene.add(groundWireframe);

    // Ajouter une surface semi-transparente pour le sol
    const groundMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.07, // Opacité pour la surface
      side: THREE.DoubleSide,
    });
    const groundSurface = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      groundMaterial
    );
    groundSurface.rotation.x = -Math.PI / 2; // Aligner avec le sol
    this.scene.add(groundSurface);
  }

  private addWalls(): void {
    const wallMaterial = new CANNON.Material();

    // Dimensions des murs
    const wallHeight = 17.5; // Réduit la hauteur des murs
    const wallThickness = 0.1;
    const wallWidth = 30; // Correspond à la taille du sol

    // Couleur des arêtes
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.3, // Opacité des arêtes
    });

    // Couleur des surfaces opaques
    const wallSurfaceMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.07, // Opacité des murs
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
          new CANNON.Vec3(wallWidth / 2, wallHeight / 2, wallThickness)
        ),
        material: this.wallMaterial,
      });
      wallBody.position.set(...(position as [number, number, number]));
      wallBody.quaternion.setFromEuler(
        ...(rotation as [number, number, number])
      );
      this.world.addBody(wallBody);

      // Ajouter uniquement les arêtes pour le mur
      const wallEdges = new THREE.EdgesGeometry(
        new THREE.BoxGeometry(wallWidth, wallHeight, wallThickness * 2)
      );
      const wallWireframe = new THREE.LineSegments(wallEdges, edgeMaterial);

      wallWireframe.position.set(...(position as [number, number, number]));
      wallWireframe.rotation.set(...(rotation as [number, number, number]));
      this.scene.add(wallWireframe);

      // Ajouter une surface semi-transparente pour le mur
      const wallSurface = new THREE.Mesh(
        new THREE.BoxGeometry(wallWidth, wallHeight, wallThickness * 2),
        wallSurfaceMaterial
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
      new THREE.PlaneGeometry(30, 30)
    );
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.3, // Opacité des arêtes
    });
    const ceilingWireframe = new THREE.LineSegments(ceilingEdges, edgeMaterial);

    ceilingWireframe.rotation.x = Math.PI / 2; // Aligner avec le plafond
    ceilingWireframe.position.y = wallHeight; // Aligner en hauteur
    this.scene.add(ceilingWireframe);

    // Ajouter une surface semi-transparente pour le plafond
    const ceilingMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.07, // Opacité de la surface
      side: THREE.DoubleSide,
    });
    const ceilingSurface = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      ceilingMaterial
    );
    ceilingSurface.rotation.x = Math.PI / 2; // Aligner avec le plafond
    ceilingSurface.position.y = wallHeight; // Aligner en hauteur
    this.scene.add(ceilingSurface);
  }

  private diceObjects: any[] = [];

  private addDice(): void {
    const loader = new GLTFLoader();
    loader['load'](
      'assets/3d/dice/d20.gltf',
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
          console.warn('Aucun mesh trouvé dans le GLTF !');
          return;
        }

        // Utiliser la géométrie du GLTF pour copier les UVs
        const diceGeometry = new THREE.IcosahedronGeometry(1.4);
        diceGeometry.attributes.uv = gltfMesh.geometry.attributes.uv; // Copier les UVs

        // Utiliser le matériau du GLTF
        const diceMaterial = gltfMesh.material;

        this.diceMesh = new THREE.Mesh(diceGeometry, diceMaterial);
        this.diceMesh.layers.set(1); // Assigner la couche 1
        this.camera.layers.enable(1); // Activer la couche 1 pour la caméra

        this.scene.add(this.diceMesh);

        // Correspondance physique pour le dé avec la forme d'un icosaèdre
        const diceShape = this.createIcosahedronShape(1); // Rayon de 1 unité
        this.diceBody = new CANNON.Body({
          mass: 0.2,
          shape: diceShape,
          material: this.diceMaterial,
        });

        this.diceBody.position.set(0, 3, 0);
        this.world.addBody(this.diceBody);
      },
      undefined,
      (error: any) => {
        console.error('Erreur lors du chargement du modèle GLTF :', error);
      }
    );
  }

  private addLights(): void {
    // Lumière ambiante (illumination uniforme de la scène)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Lumière directionnelle principale
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Intensité augmentée
    directionalLight.position.set(5, 10, 5);
    this.scene.add(directionalLight);

    // Ajout d'un projecteur directement sur le dé
    const spotLight = new THREE.SpotLight(0xffffff, 2); // Intensité forte
    spotLight.position.set(0, 10, 0); // Directement au-dessus du dé
    spotLight.angle = Math.PI / 6; // Concentrez la lumière sur une petite zone
    spotLight.penumbra = 0.5; // Ajouter un léger flou
    spotLight.decay = 2; // Réduire l'intensité avec la distance
    spotLight.distance = 30; // Limite de la portée
    this.scene.add(spotLight);

    // Ajout d'un deuxième projecteur
    const spotLight2 = new THREE.SpotLight(0xffffff, 1.5);
    spotLight2.position.set(-10, 5, 10); // Position décalée
    spotLight2.angle = Math.PI / 4;
    this.scene.add(spotLight2);
  }

  private addInteractionListeners(container: HTMLElement): void {
    container.addEventListener('mousedown', (event) =>
      this.onPointerDown(event)
    );
    container.addEventListener('mousemove', (event) =>
      this.onPointerMove(event)
    );
    container.addEventListener('mouseup', () => this.onPointerUp());

    container.addEventListener('touchstart', (event) =>
      this.onPointerDown(event.touches[0])
    );
    container.addEventListener('touchmove', (event) =>
      this.onPointerMove(event.touches[0])
    );
    container.addEventListener('touchend', () => this.onPointerUp());
  }

  private applyExtraForce(): void {
    if (this.diceBody) {
      // Direction et force
      const force = new CANNON.Vec3(1, 2, 0.5); // Force dans la direction X, Y et Z
      const relativePoint = new CANNON.Vec3(1, 0, 0); // Point d'application de la force (centre)

      // Appliquer la force
      this.diceBody.applyForce(force, relativePoint);
    }
  }

  private onPointerDown(event: MouseEvent | Touch): void {
    this.mouseDown = true;
    this.updateMousePosition(event);

    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.raycaster.layers.set(1); // Limiter le raycaster à la couche 1
    const intersects = this.raycaster.intersectObject(this.diceMesh);

    if (intersects.length > 0) {
      this.selectedObject = this.diceBody;
      this.controls.enabled = false; // Désactiver OrbitControls
      this.diceBody.mass = 0; // Rendre le dé "statique" temporairement
      this.diceBody.updateMassProperties();

      // Sauvegarder la position initiale et la profondeur
      this.initialPosition = this.diceBody.position.clone();
      const intersectPoint = intersects[0].point;
      this.targetPosition = new CANNON.Vec3(
        intersectPoint.x,
        intersectPoint.y,
        intersectPoint.z
      );
      this.isDragging = true;
    }
  }
  private initialHeight: number = 3; // Hauteur initiale définie à 3 (valeur de départ du dé)
  private maxHeight: number = 3; // Initialement égale à la hauteur initiale

  private onPointerMove(event: MouseEvent | Touch): void {
    if (!this.mouseDown || !this.selectedObject || !this.initialPosition)
      return;

    this.updateMousePosition(event);

    // Projeter un rayon depuis la caméra pour trouver le point cible
    const ray = new THREE.Raycaster();
    ray.setFromCamera(this.mouse, this.camera);

    // Calculer le point cible aligné sur la profondeur initiale
    const plane = new THREE.Plane();
    plane.setFromNormalAndCoplanarPoint(
      this.camera.getWorldDirection(new THREE.Vector3()), // Normal alignée à la caméra
      new THREE.Vector3().copy(this.initialPosition as any) // Point coplanaire
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
      Math.min(targetPoint.y, this.maxHeight)
    );

    // Mettre à jour la position cible (en profondeur et direction alignées)
    this.targetPosition = new CANNON.Vec3(
      targetPoint.x,
      newY, // Utiliser la hauteur limitée
      targetPoint.z
    );
  }

  private onPointerUp(): void {
    this.mouseDown = false;

    if (this.selectedObject && this.targetPosition) {
      // Calculer la vélocité basée sur la différence entre les positions
      const velocity = new CANNON.Vec3(
        this.targetPosition.x - this.diceBody.position.x,
        this.targetPosition.y - this.diceBody.position.y,
        this.targetPosition.z - this.diceBody.position.z
      );

      // Appliquer la vélocité pour que le dé continue son mouvement
      this.diceBody.velocity.copy(velocity);

      // Appliquer une force supplémentaire
      this.applyExtraForce();

      this.selectedObject = null;
      this.targetPosition = null; // Réinitialiser la position cible
      this.initialPosition = null; // Réinitialiser la position initiale
    }

    this.isDragging = false; // Désactiver le mode "drag"
    this.controls.enabled = true; // Réactiver les contrôles après l'interaction
    this.diceBody.mass = 0.2; // Réactiver la gravité
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
