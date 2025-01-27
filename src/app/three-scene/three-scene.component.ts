// filepath: /src/app/three-scene/three-scene.component.ts
import { Component, type OnInit, HostListener } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-scene',
  templateUrl: './three-scene.component.html',
  styleUrls: ['./three-scene.component.css'],
  standalone: true,
})
export class ThreeSceneComponent implements OnInit {
  ngOnInit(): void {
    this.initThreeJS();
  }

  private initThreeJS(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10);
    camera.position.z = 1;

    const scene = new THREE.Scene();

    const geometry = new THREE.IcosahedronGeometry(0.2, 0);
    const material = new THREE.MeshNormalMaterial();

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setAnimationLoop((time: number) => {
      mesh.rotation.x = time / 2000;
      mesh.rotation.y = time / 1000;
      renderer.render(scene, camera);
    });
    const container = document.getElementById('scene-container');
    if (container) {
      container.appendChild(renderer.domElement);
    } else {
      console.error('Scene container not found');
    }

    this.handleResize(camera, renderer);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private handleResize(camera: any, renderer: any): void {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
  }
}
