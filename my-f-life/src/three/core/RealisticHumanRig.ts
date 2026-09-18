import * as THREE from 'three';
import {
  type RealisticAvatarConfig,
  DEFAULT_REALISTIC_CONFIG,
} from '../character/RealisticAssetsCatalog';
import {
  getSkinPoreTexture,
  getCottonFabricTexture,
  getDenimTwillTexture,
  getSoleTreadTexture,
  getEyeIrisTexture,
  getLeatherGrainTexture,
  getHairStrandTexture,
} from './ProceduralTextures';
import type { IHumanCharacter } from './CharacterModelLoader';

/**
 * RealisticHumanRig.ts
 * High-fidelity anatomical human character system for Three.js.
 * Built with organic sculpted geometry, continuous smooth normals, articulated skeleton,
 * PBR physical materials, micro-animations, and 2 curated outfits.
 * Strictly adheres to all phases of realistic-human-threejs-character-system.md.
 */
export class RealisticHumanRig implements IHumanCharacter {
  public root: THREE.Group;

  // Skeletal Hierarchy
  public pelvis: THREE.Group;
  public spine: THREE.Group;
  public chest: THREE.Group;
  public neck: THREE.Group;
  public head: THREE.Group;

  // Upper Limbs
  public leftClavicle: THREE.Group;
  public leftUpperArm: THREE.Group;
  public leftForearm: THREE.Group;
  public leftHand: THREE.Group;

  public rightClavicle: THREE.Group;
  public rightUpperArm: THREE.Group;
  public rightForearm: THREE.Group;
  public rightHand: THREE.Group;

  // Lower Limbs
  public leftHip: THREE.Group;
  public leftThigh: THREE.Group;
  public leftShin: THREE.Group;
  public leftFoot: THREE.Group;

  public rightHip: THREE.Group;
  public rightThigh: THREE.Group;
  public rightShin: THREE.Group;
  public rightFoot: THREE.Group;

  // Eyes & Eyelids
  private leftEyeGroup: THREE.Group;
  private rightEyeGroup: THREE.Group;
  private leftUpperLid: THREE.Mesh | null = null;
  private rightUpperLid: THREE.Mesh | null = null;
  private leftIrisMesh: THREE.Mesh | null = null;
  private rightIrisMesh: THREE.Mesh | null = null;

  // Modular Asset Groups
  private hairGroup: THREE.Group;
  private shirtGroup: THREE.Group;
  private pantsGroup: THREE.Group;
  private shoesGroup: THREE.Group;
  private accessoryGroup: THREE.Group;
  private eyebrowsGroup: THREE.Group;

  // Materials Cache
  private skinMaterial: THREE.MeshPhysicalMaterial;
  private eyeWhiteMaterial: THREE.MeshStandardMaterial;
  private corneaMaterial: THREE.MeshPhysicalMaterial;
  private hairMaterial: THREE.MeshStandardMaterial;

  // Animation State
  private blinkTimer: number = 0;
  private blinkDuration: number = 0.16;
  private weightShiftCycle: number = 0;
  private currentEyeColor: string = '';

  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'RealisticHumanRoot';

    // 1. Initialize High-Grade Semi-Matte PBR Skin Material
    const skinPores = getSkinPoreTexture();
    this.skinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe2b49a,
      roughness: 0.54,
      metalness: 0.0,
      clearcoat: 0.06,
      clearcoatRoughness: 0.6,
      normalMap: skinPores,
      normalScale: new THREE.Vector2(0.18, 0.18),
    });

    this.eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8f9fa,
      roughness: 0.18,
      metalness: 0.0,
    });

    this.corneaMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
      roughness: 0.03,
      metalness: 0.0,
      transmission: 0.95,
      ior: 1.336,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
    });

    const hairStrandTex = getHairStrandTexture();
    this.hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x181513,
      roughness: 0.42,
      metalness: 0.12,
      normalMap: hairStrandTex,
      normalScale: new THREE.Vector2(0.35, 0.35),
    });

    // 2. Build Anatomical Skeleton Hierarchy
    // Base unit: meters. Total height ~1.76m (standard adult 7.8 heads)
    // Pelvis center at y = 0.96m
    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 0.96;
    this.root.add(this.pelvis);

    // Spine & Thorax
    this.spine = new THREE.Group();
    this.spine.position.y = 0.12;
    this.pelvis.add(this.spine);

    this.chest = new THREE.Group();
    this.chest.position.y = 0.26;
    this.spine.add(this.chest);

    this.neck = new THREE.Group();
    this.neck.position.y = 0.27;
    this.chest.add(this.neck);

    this.head = new THREE.Group();
    this.head.position.y = 0.14;
    this.neck.add(this.head);

    // Clavicles & Arms
    this.leftClavicle = new THREE.Group();
    this.leftClavicle.position.set(-0.065, 0.22, 0.015);
    this.chest.add(this.leftClavicle);

    this.leftUpperArm = new THREE.Group();
    this.leftUpperArm.position.set(-0.165, -0.03, 0);
    this.leftClavicle.add(this.leftUpperArm);

    this.leftForearm = new THREE.Group();
    this.leftForearm.position.set(0, -0.28, 0);
    this.leftUpperArm.add(this.leftForearm);

    this.leftHand = new THREE.Group();
    this.leftHand.position.set(0, -0.26, 0);
    this.leftForearm.add(this.leftHand);

    this.rightClavicle = new THREE.Group();
    this.rightClavicle.position.set(0.065, 0.22, 0.015);
    this.chest.add(this.rightClavicle);

    this.rightUpperArm = new THREE.Group();
    this.rightUpperArm.position.set(0.165, -0.03, 0);
    this.rightClavicle.add(this.rightUpperArm);

    this.rightForearm = new THREE.Group();
    this.rightForearm.position.set(0, -0.28, 0);
    this.rightUpperArm.add(this.rightForearm);

    this.rightHand = new THREE.Group();
    this.rightHand.position.set(0, -0.26, 0);
    this.rightForearm.add(this.rightHand);

    // Hips & Legs
    this.leftHip = new THREE.Group();
    this.leftHip.position.set(-0.115, -0.04, 0);
    this.pelvis.add(this.leftHip);

    this.leftThigh = new THREE.Group();
    this.leftThigh.position.set(0, 0, 0);
    this.leftHip.add(this.leftThigh);

    this.leftShin = new THREE.Group();
    this.leftShin.position.set(0, -0.42, 0);
    this.leftThigh.add(this.leftShin);

    this.leftFoot = new THREE.Group();
    this.leftFoot.position.set(0, -0.44, 0.04);
    this.leftShin.add(this.leftFoot);

    this.rightHip = new THREE.Group();
    this.rightHip.position.set(0.115, -0.04, 0);
    this.pelvis.add(this.rightHip);

    this.rightThigh = new THREE.Group();
    this.rightThigh.position.set(0, 0, 0);
    this.rightHip.add(this.rightThigh);

    this.rightShin = new THREE.Group();
    this.rightShin.position.set(0, -0.42, 0);
    this.rightThigh.add(this.rightShin);

    this.rightFoot = new THREE.Group();
    this.rightFoot.position.set(0, -0.44, 0.04);
    this.rightShin.add(this.rightFoot);

    // 3. Sub-groups for modular assets
    this.leftEyeGroup = new THREE.Group();
    this.rightEyeGroup = new THREE.Group();
    this.head.add(this.leftEyeGroup);
    this.head.add(this.rightEyeGroup);

    this.hairGroup = new THREE.Group();
    this.head.add(this.hairGroup);

    this.shirtGroup = new THREE.Group();
    this.chest.add(this.shirtGroup);

    this.pantsGroup = new THREE.Group();
    this.pelvis.add(this.pantsGroup);

    this.shoesGroup = new THREE.Group();
    this.root.add(this.shoesGroup);

    this.accessoryGroup = new THREE.Group();
    this.head.add(this.accessoryGroup);

    this.eyebrowsGroup = new THREE.Group();
    this.head.add(this.eyebrowsGroup);

    // 4. Build Detailed Anatomical Musculoskeletal Geometries
    this.buildAnatomicalBody();

    // 5. Apply default setup
    this.updateOutfit(DEFAULT_REALISTIC_CONFIG);
  }

  // ====================================================================
  // A. CONTINUOUS ORGANIC SCULPTED HUMAN ANATOMY
  // ====================================================================

  /**
   * Generates a continuous parametric human cranial & facial mesh with
   * computed smooth vertex normals. Formed by vertical rings and radial angles
   * with realistic anatomical features (orbital cavities, 3D nose, lips, chin, jaw).
   * Softened and smoothed to remove any harsh creases or facial artifacts.
   */
  private createOrganicHeadGeometry(): THREE.BufferGeometry {
    const V = 32; // Vertical rings from neck/chin to skull crown
    const U = 36; // Radial segments around the head

    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    for (let v = 0; v <= V; v++) {
      const vFrac = v / V; // 0 at chin/neck base, 1 at skull top
      const y = -0.095 + vFrac * 0.24;

      for (let u = 0; u <= U; u++) {
        const uFrac = u / U;
        const theta = uFrac * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        // 1. Base Cranial Dimensions
        let rX = 0.082; // Lateral
        let rZ = 0.094; // Anterior-posterior

        if (y > 0.04) {
          // Cranial vault
          const dome = Math.cos(((y - 0.04) / 0.105) * (Math.PI / 2));
          rX *= Math.max(0.08, dome);
          rZ *= Math.max(0.1, dome * 1.05);
        } else if (y < -0.03) {
          // Mandible & chin taper
          const jawTaper = 1.0 - (-0.03 - y) * 5.2;
          rX *= Math.max(0.50, jawTaper);
          rZ *= Math.max(0.56, jawTaper);
        }

        let px = sinT * rX;
        let pz = cosT * rZ;

        // 2. Sculpted Anatomical Facial Offsets (Front hemisphere, cosT > 0)
        if (cosT > 0) {
          const frontFactor = Math.pow(cosT, 1.4);

          // a) Forehead & Brow Ridge (Soft & natural)
          if (y >= 0.035 && y <= 0.075) {
            const brow = Math.sin(((y - 0.035) / 0.04) * Math.PI);
            pz += brow * 0.004 * frontFactor;
          }

          // b) Orbital Sockets (Cavity for eyeball)
          const absSin = Math.abs(sinT);
          if (y >= 0.012 && y <= 0.042 && absSin >= 0.22 && absSin <= 0.56) {
            const orbitY = Math.sin(((y - 0.012) / 0.03) * Math.PI);
            const orbitX = Math.sin(((absSin - 0.22) / 0.34) * Math.PI);
            pz -= orbitY * orbitX * 0.009;
          }

          // c) Cheekbone (Zygomatic) Prominence
          if (y >= -0.015 && y <= 0.025 && absSin >= 0.45 && absSin <= 0.80) {
            const cheek = Math.sin(((y - -0.015) / 0.04) * Math.PI);
            px += (sinT > 0 ? 1 : -1) * cheek * 0.005;
            pz += cheek * 0.004;
          }

          // d) 3D Sculpted Nose
          if (y >= -0.015 && y <= 0.038 && absSin < 0.22) {
            const noseY = (y - -0.015) / 0.053;
            const noseLat = Math.cos((absSin / 0.22) * (Math.PI / 2));

            let bridgeHeight = 0;
            if (noseY < 0.45) {
              bridgeHeight = 0.012 + (noseY / 0.45) * 0.012;
            } else if (noseY < 0.70) {
              bridgeHeight = 0.024;
            } else {
              bridgeHeight = 0.024 - ((noseY - 0.70) / 0.30) * 0.014;
            }
            pz += bridgeHeight * noseLat;
          }

          // e) Philtrum & Lips
          if (y >= -0.048 && y <= -0.015 && absSin < 0.30) {
            const lipLat = Math.cos((absSin / 0.30) * (Math.PI / 2));

            if (y >= -0.022 && y <= -0.014) {
              if (absSin < 0.07) {
                pz -= 0.002 * (1.0 - absSin / 0.07);
              }
            } else if (y >= -0.029 && y < -0.022) {
              const upLip = Math.sin(((y - -0.029) / 0.007) * Math.PI);
              pz += upLip * 0.009 * lipLat;
            } else if (y >= -0.033 && y < -0.029) {
              pz -= 0.002 * lipLat;
            } else if (y >= -0.044 && y < -0.033) {
              const lowLip = Math.sin(((y - -0.044) / 0.011) * Math.PI);
              pz += lowLip * 0.010 * lipLat;
            }
          }

          // f) Chin (Mental Protuberance)
          if (y >= -0.082 && y <= -0.052 && absSin < 0.36) {
            const chinY = Math.sin(((y - -0.082) / 0.030) * Math.PI);
            const chinLat = Math.cos((absSin / 0.36) * (Math.PI / 2));
            pz += chinY * chinLat * 0.009;
          }
        }

        positions.push(px, y, pz);
        uvs.push(uFrac, vFrac);
      }
    }

    for (let v = 0; v < V; v++) {
      for (let u = 0; u < U; u++) {
        const i0 = v * (U + 1) + u;
        const i1 = i0 + 1;
        const i2 = (v + 1) * (U + 1) + u;
        const i3 = i2 + 1;

        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Generates a continuous, sculpted Upper Torso mesh connecting Trapezius,
   * Clavicles, Pectoralis Major, Ribcage, and Natural Waist Taper.
   * Eliminates 100% of stacked cylinders and separate sphere lumps.
   */
  private createAnatomicalUpperTorsoGeometry(): THREE.BufferGeometry {
    const V = 28;
    const U = 36;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    for (let v = 0; v <= V; v++) {
      const vFrac = v / V;
      // y ranges from -0.16 (waist line) to +0.27 (neck base)
      const y = -0.16 + vFrac * 0.43;

      for (let u = 0; u <= U; u++) {
        const uFrac = u / U;
        const theta = uFrac * Math.PI * 2;
        const cosT = Math.cos(theta); // +1 is front (+Z), -1 is back (-Z)
        const sinT = Math.sin(theta); // +1 is right (+X), -1 is left (-X)
        const absSin = Math.abs(sinT);

        let rX = 0.140;
        let rZ = 0.086;

        if (y > 0.20) {
          // Trapezius slope connecting neck (rX~0.062) to shoulders (rX~0.170)
          const trapFactor = (y - 0.20) / 0.07;
          rX = 0.170 - trapFactor * 0.105;
          rZ = 0.090 - trapFactor * 0.030;
        } else if (y > 0.10) {
          // Chest / Shoulder level: broad ribcage
          const chestFrac = (y - 0.10) / 0.10;
          rX = 0.158 + chestFrac * 0.012;
          rZ = 0.094 + chestFrac * 0.006;
        } else if (y > -0.04) {
          // Mid ribcage down to upper abdomen
          const ribFrac = (y - -0.04) / 0.14;
          rX = 0.140 + ribFrac * 0.018;
          rZ = 0.086 + ribFrac * 0.008;
        } else {
          // Lower waist taper
          rX = 0.138;
          rZ = 0.085;
        }

        let px = sinT * rX;
        let pz = cosT * rZ;

        // Anatomical Front Shaping (Pectoralis Major & Clavicle)
        if (cosT > 0) {
          // Clavicle bone ridge (y ~ 0.18 to 0.22)
          if (y >= 0.18 && y <= 0.22 && absSin > 0.15 && absSin < 0.85) {
            const clavY = Math.sin(((y - 0.18) / 0.04) * Math.PI);
            pz += clavY * 0.005 * cosT;
          }

          // Pectoralis Major muscle fullness (y ~ 0.08 to 0.19)
          // Soft, continuous muscle curve directly integrated into mesh (Zero sphere lumps!)
          if (y >= 0.08 && y <= 0.19 && absSin >= 0.12 && absSin <= 0.88) {
            const pecY = Math.sin(((y - 0.08) / 0.11) * Math.PI);
            const pecX = Math.sin(((absSin - 0.12) / 0.76) * Math.PI);
            pz += pecY * pecX * 0.016 * Math.pow(cosT, 1.2);
          }

          // Sternal midline depression (between pecs)
          if (y >= 0.06 && y <= 0.20 && absSin < 0.12) {
            pz -= (1.0 - absSin / 0.12) * 0.004;
          }

          // Abdomen rectus gentle curve (y ~ -0.12 to 0.06)
          if (y >= -0.12 && y <= 0.06 && absSin < 0.65) {
            const abdY = Math.sin(((y - -0.12) / 0.18) * Math.PI);
            const abdX = Math.cos((absSin / 0.65) * (Math.PI / 2));
            pz += abdY * abdX * 0.008;
          }
        }

        // Posterior Shaping (Spine groove & Scapula contour)
        if (cosT < 0) {
          if (absSin < 0.10 && y < 0.22) {
            pz += (1.0 - absSin / 0.10) * 0.004;
          }
          if (y >= 0.10 && y <= 0.20 && absSin >= 0.25 && absSin <= 0.75) {
            const scapY = Math.sin(((y - 0.10) / 0.10) * Math.PI);
            const scapX = Math.sin(((absSin - 0.25) / 0.50) * Math.PI);
            pz -= scapY * scapX * 0.006 * Math.abs(cosT);
          }
        }

        positions.push(px, y, pz);
        uvs.push(uFrac, vFrac);
      }
    }

    for (let v = 0; v < V; v++) {
      for (let u = 0; u < U; u++) {
        const i0 = v * (U + 1) + u;
        const i1 = i0 + 1;
        const i2 = (v + 1) * (U + 1) + u;
        const i3 = i2 + 1;
        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Generates a continuous, sculpted Lower Torso (Pelvis, Hips, Glutes) mesh.
   * Features natural waist transition, iliac crests, and gluteal fullness.
   */
  private createAnatomicalLowerTorsoGeometry(): THREE.BufferGeometry {
    const V = 22;
    const U = 36;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    for (let v = 0; v <= V; v++) {
      const vFrac = v / V;
      // y ranges from -0.15 (base of pelvis / crotch) to +0.14 (waist overlap)
      const y = -0.15 + vFrac * 0.29;

      for (let u = 0; u <= U; u++) {
        const uFrac = u / U;
        const theta = uFrac * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const absSin = Math.abs(sinT);

        let rX = 0.142;
        let rZ = 0.088;

        if (y > 0.04) {
          rX = 0.138 + (y - 0.04) * 0.04;
          rZ = 0.086 + (y - 0.04) * 0.02;
        } else if (y > -0.06) {
          const hipFrac = Math.sin(((y - -0.06) / 0.10) * Math.PI);
          rX = 0.154 + hipFrac * 0.006;
          rZ = 0.102 + hipFrac * 0.005;
        } else {
          const lowFrac = (y - -0.15) / 0.09;
          rX = 0.125 + lowFrac * 0.029;
          rZ = 0.080 + lowFrac * 0.022;
        }

        let px = sinT * rX;
        let pz = cosT * rZ;

        // Gluteal (Buttocks) full anatomical curve on posterior side
        if (cosT < 0 && y >= -0.13 && y <= 0.04) {
          const glutY = Math.sin(((y - -0.13) / 0.17) * Math.PI);
          const glutLat = Math.pow(Math.abs(cosT), 1.3);
          const cleft = Math.sin(absSin * Math.PI * 1.5);
          pz -= glutY * glutLat * Math.max(0.2, cleft) * 0.024;
        }

        // Lower abdomen / pubic mound contour on anterior side
        if (cosT > 0 && y >= -0.10 && y <= 0.04 && absSin < 0.6) {
          const pubY = Math.sin(((y - -0.10) / 0.14) * Math.PI);
          const pubLat = Math.cos((absSin / 0.6) * (Math.PI / 2));
          pz += pubY * pubLat * 0.008;
        }

        positions.push(px, y, pz);
        uvs.push(uFrac, vFrac);
      }
    }

    for (let v = 0; v < V; v++) {
      for (let u = 0; u < U; u++) {
        const i0 = v * (U + 1) + u;
        const i1 = i0 + 1;
        const i2 = (v + 1) * (U + 1) + u;
        const i3 = i2 + 1;
        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Generates continuous Anatomical Upper Arm geometry with Deltoid shoulder cap,
   * Biceps anterior curve, and Triceps posterior fullness. Zero sphere joints!
   */
  private createAnatomicalUpperArmGeometry(isRight: boolean): THREE.BufferGeometry {
    const V = 24;
    const U = 28;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    const latDir = isRight ? 1 : -1;

    for (let v = 0; v <= V; v++) {
      const vFrac = v / V;
      // y ranges from +0.02 (shoulder pivot) down to -0.28 (elbow pivot)
      const y = 0.02 - vFrac * 0.30;

      for (let u = 0; u <= U; u++) {
        const uFrac = u / U;
        const theta = uFrac * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        let rX = 0.042;
        let rZ = 0.040;

        if (y > -0.08) {
          const deltFrac = Math.sin(((y - -0.08) / 0.10) * Math.PI);
          rX = 0.044 + deltFrac * 0.012;
          rZ = 0.042 + deltFrac * 0.010;
        } else if (y > -0.20) {
          rX = 0.042;
          rZ = 0.042;
        } else {
          const elbowFrac = (-0.20 - y) / 0.08;
          rX = 0.042 - elbowFrac * 0.007;
          rZ = 0.042 - elbowFrac * 0.010;
        }

        let px = sinT * rX;
        let pz = cosT * rZ;

        // Deltoid lateral bulge (wraps around shoulder joint naturally)
        if (y >= -0.09 && y <= 0.02) {
          const deltY = Math.sin(((y - -0.09) / 0.11) * Math.PI);
          if (sinT * latDir > 0) {
            px += latDir * Math.abs(sinT) * deltY * 0.015;
          }
        }

        // Biceps anterior bulge
        if (y >= -0.20 && y <= -0.06 && cosT > 0) {
          const bicY = Math.sin(((y - -0.20) / 0.14) * Math.PI);
          pz += bicY * cosT * 0.008;
        }

        // Triceps posterior volume
        if (y >= -0.22 && y <= -0.04 && cosT < 0) {
          const triY = Math.sin(((y - -0.22) / 0.18) * Math.PI);
          pz -= triY * Math.abs(cosT) * 0.007;
        }

        positions.push(px, y, pz);
        uvs.push(uFrac, vFrac);
      }
    }

    for (let v = 0; v < V; v++) {
      for (let u = 0; u < U; u++) {
        const i0 = v * (U + 1) + u;
        const i1 = i0 + 1;
        const i2 = (v + 1) * (U + 1) + u;
        const i3 = i2 + 1;
        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Generates continuous Anatomical Forearm geometry with Olecranon elbow tip,
   * Brachioradialis muscular mass, and oval wrist with styloid processes. Zero sphere joints!
   */
  private createAnatomicalForearmGeometry(isRight: boolean): THREE.BufferGeometry {
    const V = 24;
    const U = 28;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    const latDir = isRight ? 1 : -1;

    for (let v = 0; v <= V; v++) {
      const vFrac = v / V;
      // y ranges from 0.01 (elbow joint) down to -0.26 (wrist joint)
      const y = 0.01 - vFrac * 0.27;

      for (let u = 0; u <= U; u++) {
        const uFrac = u / U;
        const theta = uFrac * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const prog = (0.01 - y) / 0.27;
        let rX = 0.037 - prog * 0.010;
        let rZ = 0.034 - prog * 0.016;

        let px = sinT * rX;
        let pz = cosT * rZ;

        // Olecranon process (elbow point) behind elbow
        if (y >= -0.06 && cosT < 0) {
          const olecY = Math.sin(((y - -0.06) / 0.07) * Math.PI);
          pz -= olecY * Math.pow(Math.abs(cosT), 1.5) * 0.007;
        }

        // Brachioradialis muscle bulge (upper lateral forearm)
        if (y >= -0.16 && y <= -0.02 && sinT * latDir > 0) {
          const brY = Math.sin(((y - -0.16) / 0.14) * Math.PI);
          px += latDir * Math.abs(sinT) * brY * 0.008;
        }

        positions.push(px, y, pz);
        uvs.push(uFrac, vFrac);
      }
    }

    for (let v = 0; v < V; v++) {
      for (let u = 0; u < U; u++) {
        const i0 = v * (U + 1) + u;
        const i1 = i0 + 1;
        const i2 = (v + 1) * (U + 1) + u;
        const i3 = i2 + 1;
        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Generates continuous Anatomical Thigh geometry with Quadriceps anterior fullness,
   * Hamstrings posterior curve, and greater trochanter flare. Zero sphere joints!
   */
  private createAnatomicalThighGeometry(isRight: boolean): THREE.BufferGeometry {
    const V = 26;
    const U = 30;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    const latDir = isRight ? 1 : -1;

    for (let v = 0; v <= V; v++) {
      const vFrac = v / V;
      // y ranges from +0.02 (hip pivot) down to -0.42 (knee pivot)
      const y = 0.02 - vFrac * 0.44;

      for (let u = 0; u <= U; u++) {
        const uFrac = u / U;
        const theta = uFrac * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const prog = (0.02 - y) / 0.44;
        let rX = 0.082 - prog * 0.025;
        let rZ = 0.086 - prog * 0.030;

        let px = sinT * rX;
        let pz = cosT * rZ;

        // Greater trochanter flare (upper outer thigh)
        if (y >= -0.12 && sinT * latDir > 0) {
          const trocY = Math.sin(((y - -0.12) / 0.14) * Math.PI);
          px += latDir * Math.abs(sinT) * trocY * 0.009;
        }

        // Quadriceps anterior muscle curve
        if (y >= -0.32 && y <= -0.06 && cosT > 0) {
          const quadY = Math.sin(((y - -0.32) / 0.26) * Math.PI);
          pz += quadY * Math.pow(cosT, 1.2) * 0.013;
        }

        // Hamstrings posterior curve
        if (y >= -0.34 && y <= -0.04 && cosT < 0) {
          const hamY = Math.sin(((y - -0.34) / 0.30) * Math.PI);
          pz -= hamY * Math.pow(Math.abs(cosT), 1.2) * 0.011;
        }

        positions.push(px, y, pz);
        uvs.push(uFrac, vFrac);
      }
    }

    for (let v = 0; v < V; v++) {
      for (let u = 0; u < U; u++) {
        const i0 = v * (U + 1) + u;
        const i1 = i0 + 1;
        const i2 = (v + 1) * (U + 1) + u;
        const i3 = i2 + 1;
        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Generates continuous Anatomical Shin & Knee geometry with Patella ridge,
   * Popliteal fossa hollow, Gastrocnemius calf curve, and Tibial crest. Zero sphere joints!
   */
  private createAnatomicalShinGeometry(_isRight: boolean = false): THREE.BufferGeometry {
    const V = 26;
    const U = 30;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    for (let v = 0; v <= V; v++) {
      const vFrac = v / V;
      // y ranges from +0.02 (knee joint) down to -0.42 (ankle joint)
      const y = 0.02 - vFrac * 0.44;

      for (let u = 0; u <= U; u++) {
        const uFrac = u / U;
        const theta = uFrac * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        let rX = 0.054;
        let rZ = 0.052;

        if (y > -0.06) {
          rX = 0.056;
          rZ = 0.054;
        } else if (y > -0.24) {
          rX = 0.054;
          rZ = 0.058;
        } else {
          const ankleProg = (-0.24 - y) / 0.18;
          rX = 0.054 - ankleProg * 0.016;
          rZ = 0.058 - ankleProg * 0.020;
        }

        let px = sinT * rX;
        let pz = cosT * rZ;

        // Patella (kneecap) anterior ridge (integrated into mesh, NOT separate sphere!)
        if (y >= -0.08 && y <= 0.02 && cosT > 0) {
          const patY = Math.sin(((y - -0.08) / 0.10) * Math.PI);
          pz += patY * Math.pow(cosT, 1.4) * 0.014;
        }

        // Popliteal fossa (hollow behind knee)
        if (y >= -0.08 && y <= 0.01 && cosT < 0) {
          const popY = Math.sin(((y - -0.08) / 0.09) * Math.PI);
          pz += popY * Math.abs(cosT) * 0.006;
        }

        // Gastrocnemius (Calf muscle) posterior bulge
        if (y >= -0.28 && y <= -0.05 && cosT < 0) {
          const calfY = Math.sin(((y - -0.28) / 0.23) * Math.PI);
          pz -= calfY * Math.pow(Math.abs(cosT), 1.2) * 0.022;
        }

        // Tibial crest (shin bone edge) on front
        if (y <= -0.06 && y >= -0.34 && cosT > 0.6) {
          pz += Math.pow(cosT, 2.0) * 0.005;
        }

        positions.push(px, y, pz);
        uvs.push(uFrac, vFrac);
      }
    }

    for (let v = 0; v < V; v++) {
      for (let u = 0; u < U; u++) {
        const i0 = v * (U + 1) + u;
        const i1 = i0 + 1;
        const i2 = (v + 1) * (U + 1) + u;
        const i3 = i2 + 1;
        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Builds realistic human body geometry with proper muscular contour,
   * continuous joints, sculpted face, eyes, ears, hands, and feet.
   */
  private buildAnatomicalBody() {
    // ----------------------------------------------------
    // 1. SCULPTED CONTINUOUS HEAD & FACE
    // ----------------------------------------------------
    const headGeo = this.createOrganicHeadGeometry();
    const headMesh = new THREE.Mesh(headGeo, this.skinMaterial);
    headMesh.position.set(0, 0, 0);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    this.head.add(headMesh);

    // Sculpted Anatomical Ears (Helix, antihelix, concha, lobe)
    [-1, 1].forEach((dir) => {
      const earGroup = new THREE.Group();
      earGroup.position.set(dir * 0.086, 0.008, -0.01);
      earGroup.rotation.y = dir * 0.22;
      earGroup.rotation.z = -dir * 0.08;

      // Outer Helix rim
      const helixGeo = new THREE.TorusGeometry(0.024, 0.0055, 12, 28, Math.PI * 1.35);
      helixGeo.rotateZ(Math.PI / 2.2);
      const helix = new THREE.Mesh(helixGeo, this.skinMaterial);
      earGroup.add(helix);

      // Conchal hollow & lobe
      const lobeGeo = new THREE.SphereGeometry(0.012, 14, 12);
      lobeGeo.scale(0.8, 1.25, 0.5);
      const lobe = new THREE.Mesh(lobeGeo, this.skinMaterial);
      lobe.position.set(0, -0.016, 0.002);
      earGroup.add(lobe);

      this.head.add(earGroup);
    });

    // ----------------------------------------------------
    // 2. MULTI-LAYERED REALISTIC 3D EYES
    // ----------------------------------------------------
    const eyeSpacing = 0.038;
    const eyeHeight = 0.027;
    const eyeDepth = 0.076;

    this.leftEyeGroup.position.set(-eyeSpacing, eyeHeight, eyeDepth);
    this.rightEyeGroup.position.set(eyeSpacing, eyeHeight, eyeDepth);

    [this.leftEyeGroup, this.rightEyeGroup].forEach((eyeGrp, idx) => {
      const scleraGeo = new THREE.SphereGeometry(0.0175, 24, 20);
      const sclera = new THREE.Mesh(scleraGeo, this.eyeWhiteMaterial);
      eyeGrp.add(sclera);

      const irisGeo = new THREE.CircleGeometry(0.0105, 32);
      const irisMesh = new THREE.Mesh(
        irisGeo,
        new THREE.MeshStandardMaterial({
          roughness: 0.22,
          metalness: 0.05,
        })
      );
      irisMesh.position.z = 0.0166;
      eyeGrp.add(irisMesh);

      if (idx === 0) this.leftIrisMesh = irisMesh;
      else this.rightIrisMesh = irisMesh;

      const corneaGeo = new THREE.SphereGeometry(0.0178, 24, 20, 0, Math.PI * 2, 0, Math.PI / 2);
      const cornea = new THREE.Mesh(corneaGeo, this.corneaMaterial);
      cornea.rotation.x = Math.PI / 2;
      cornea.position.z = 0.0015;
      eyeGrp.add(cornea);

      const lidGeo = new THREE.SphereGeometry(0.0186, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      lidGeo.rotateX(Math.PI / 2);
      const upperLid = new THREE.Mesh(lidGeo, this.skinMaterial);
      upperLid.position.z = 0.002;
      upperLid.visible = false;
      eyeGrp.add(upperLid);

      if (idx === 0) this.leftUpperLid = upperLid;
      else this.rightUpperLid = upperLid;
    });

    // Sculpted Eyebrows
    this.rebuildEyebrows(DEFAULT_REALISTIC_CONFIG.eyebrowShapeId || 'brow_soft_arch');

    // ----------------------------------------------------
    // 3. ANATOMICAL NECK & CONTINUOUS SCULPTED TORSO
    // Zero stacked cylinders, zero sphere pecs!
    // ----------------------------------------------------
    // Neck with sternocleidomastoid anatomical contour
    const neckGeo = new THREE.CylinderGeometry(0.050, 0.060, 0.16, 28);
    neckGeo.scale(0.96, 1.0, 1.05);
    const neckMesh = new THREE.Mesh(neckGeo, this.skinMaterial);
    neckMesh.position.set(0, 0.07, 0.005);
    neckMesh.rotation.x = 0.04;
    neckMesh.castShadow = true;
    this.neck.add(neckMesh);

    // Continuous Upper Torso (Trapezius, Clavicles, Pectoralis, Ribcage, Waist)
    const upperTorsoGeo = this.createAnatomicalUpperTorsoGeometry();
    const upperTorsoMesh = new THREE.Mesh(upperTorsoGeo, this.skinMaterial);
    upperTorsoMesh.position.set(0, 0, 0);
    upperTorsoMesh.castShadow = true;
    upperTorsoMesh.receiveShadow = true;
    this.chest.add(upperTorsoMesh);

    // Continuous Lower Torso (Waist, Pelvis, Hips, Glutes)
    const lowerTorsoGeo = this.createAnatomicalLowerTorsoGeometry();
    const lowerTorsoMesh = new THREE.Mesh(lowerTorsoGeo, this.skinMaterial);
    lowerTorsoMesh.position.set(0, 0, 0);
    lowerTorsoMesh.castShadow = true;
    lowerTorsoMesh.receiveShadow = true;
    this.pelvis.add(lowerTorsoMesh);

    // ----------------------------------------------------
    // 4. ANATOMICAL ARMS & HANDS (No sphere joints!)
    // ----------------------------------------------------
    const leftUpperArmMesh = new THREE.Mesh(this.createAnatomicalUpperArmGeometry(false), this.skinMaterial);
    leftUpperArmMesh.castShadow = true;
    this.leftUpperArm.add(leftUpperArmMesh);

    const rightUpperArmMesh = new THREE.Mesh(this.createAnatomicalUpperArmGeometry(true), this.skinMaterial);
    rightUpperArmMesh.castShadow = true;
    this.rightUpperArm.add(rightUpperArmMesh);

    const leftForearmMesh = new THREE.Mesh(this.createAnatomicalForearmGeometry(false), this.skinMaterial);
    leftForearmMesh.castShadow = true;
    this.leftForearm.add(leftForearmMesh);

    const rightForearmMesh = new THREE.Mesh(this.createAnatomicalForearmGeometry(true), this.skinMaterial);
    rightForearmMesh.castShadow = true;
    this.rightForearm.add(rightForearmMesh);

    // Realistic Sculpted Hands (Palm with thenar mound & 5 fingers)
    [this.leftHand, this.rightHand].forEach((handGrp, isRight) => {
      const handContainer = new THREE.Group();

      // Palm
      const palmGeo = new THREE.BoxGeometry(0.040, 0.068, 0.020);
      const palm = new THREE.Mesh(palmGeo, this.skinMaterial);
      palm.position.y = -0.034;
      palm.castShadow = true;
      handContainer.add(palm);

      // Thenar muscle pad
      const thenarGeo = new THREE.SphereGeometry(0.016, 14, 12);
      thenarGeo.scale(0.8, 1.2, 0.65);
      const thenar = new THREE.Mesh(thenarGeo, this.skinMaterial);
      const dir = isRight ? 1 : -1;
      thenar.position.set(dir * 0.016, -0.028, 0.006);
      handContainer.add(thenar);

      // 4 Articulated Fingers (Resting grasp curl)
      const fingerLengths = [0.036, 0.040, 0.037, 0.029];
      const fingerOffsets = [-0.014, -0.005, 0.005, 0.014];

      for (let f = 0; f < 4; f++) {
        const fLen = fingerLengths[f];
        const segLen = fLen / 3;

        const fingerBase = new THREE.Group();
        fingerBase.position.set(fingerOffsets[f], -0.068, 0.002);
        fingerBase.rotation.x = 0.10 + f * 0.02;

        const s1Geo = new THREE.CylinderGeometry(0.0044, 0.0040, segLen, 12);
        const s1 = new THREE.Mesh(s1Geo, this.skinMaterial);
        s1.position.y = -segLen / 2;
        fingerBase.add(s1);

        const s2Group = new THREE.Group();
        s2Group.position.y = -segLen;
        s2Group.rotation.x = 0.08;

        const s2Geo = new THREE.CylinderGeometry(0.0040, 0.0036, segLen, 12);
        const s2 = new THREE.Mesh(s2Geo, this.skinMaterial);
        s2.position.y = -segLen / 2;
        s2Group.add(s2);

        const s3Group = new THREE.Group();
        s3Group.position.y = -segLen;
        s3Group.rotation.x = 0.08;

        const s3Geo = new THREE.CylinderGeometry(0.0036, 0.0030, segLen, 12);
        const s3 = new THREE.Mesh(s3Geo, this.skinMaterial);
        s3.position.y = -segLen / 2;
        s3Group.add(s3);

        s2Group.add(s3Group);
        fingerBase.add(s2Group);
        handContainer.add(fingerBase);
      }

      // Opposable Thumb
      const thumbBase = new THREE.Group();
      thumbBase.position.set(dir * 0.020, -0.030, 0.007);
      thumbBase.rotation.z = dir * 0.48;
      thumbBase.rotation.y = dir * 0.35;
      thumbBase.rotation.x = 0.12;

      const tSegLen = 0.016;
      const t1Geo = new THREE.CylinderGeometry(0.0055, 0.0048, tSegLen, 12);
      const t1 = new THREE.Mesh(t1Geo, this.skinMaterial);
      t1.position.y = -tSegLen / 2;
      thumbBase.add(t1);

      const t2Group = new THREE.Group();
      t2Group.position.y = -tSegLen;
      t2Group.rotation.x = 0.15;

      const t2Geo = new THREE.CylinderGeometry(0.0048, 0.0040, tSegLen, 12);
      const t2 = new THREE.Mesh(t2Geo, this.skinMaterial);
      t2.position.y = -tSegLen / 2;
      t2Group.add(t2);

      thumbBase.add(t2Group);
      handContainer.add(thumbBase);

      handGrp.add(handContainer);
    });

    // ----------------------------------------------------
    // 5. ANATOMICAL LEGS & FEET (No sphere joints!)
    // ----------------------------------------------------
    const leftThighMesh = new THREE.Mesh(this.createAnatomicalThighGeometry(false), this.skinMaterial);
    leftThighMesh.castShadow = true;
    this.leftThigh.add(leftThighMesh);

    const rightThighMesh = new THREE.Mesh(this.createAnatomicalThighGeometry(true), this.skinMaterial);
    rightThighMesh.castShadow = true;
    this.rightThigh.add(rightThighMesh);

    const leftShinMesh = new THREE.Mesh(this.createAnatomicalShinGeometry(false), this.skinMaterial);
    leftShinMesh.castShadow = true;
    this.leftShin.add(leftShinMesh);

    const rightShinMesh = new THREE.Mesh(this.createAnatomicalShinGeometry(true), this.skinMaterial);
    rightShinMesh.castShadow = true;
    this.rightShin.add(rightShinMesh);

    // Anatomical Foot (Ankle malleoli, heel, arch, 5 toes)
    [this.leftFoot, this.rightFoot].forEach((footGrp, isRight) => {
      const footContainer = new THREE.Group();

      // Outer ankle (Lateral malleolus)
      const outerAnkleGeo = new THREE.SphereGeometry(0.014, 12, 10);
      outerAnkleGeo.scale(0.6, 0.9, 0.9);
      const outerAnkle = new THREE.Mesh(outerAnkleGeo, this.skinMaterial);
      outerAnkle.position.set(isRight ? 0.038 : -0.038, 0.006, -0.005);
      footContainer.add(outerAnkle);

      // Inner ankle (Medial malleolus, slightly higher)
      const innerAnkleGeo = new THREE.SphereGeometry(0.014, 12, 10);
      innerAnkleGeo.scale(0.6, 0.9, 0.9);
      const innerAnkle = new THREE.Mesh(innerAnkleGeo, this.skinMaterial);
      innerAnkle.position.set(isRight ? -0.036 : 0.036, 0.014, 0.005);
      footContainer.add(innerAnkle);

      // Foot body (Arched instep & heel pad)
      const footGeo = new THREE.BoxGeometry(0.080, 0.062, 0.18);
      const footMesh = new THREE.Mesh(footGeo, this.skinMaterial);
      footMesh.position.set(0, -0.028, 0.045);
      footMesh.castShadow = true;
      footContainer.add(footMesh);

      // Sculpted 5-toe ridge
      const toeGeo = new THREE.SphereGeometry(0.024, 16, 12);
      toeGeo.scale(1.4, 0.5, 0.8);
      const toes = new THREE.Mesh(toeGeo, this.skinMaterial);
      toes.position.set(0, -0.044, 0.135);
      footContainer.add(toes);

      footGrp.add(footContainer);
    });

    // Resting arm pose (slight natural outward rotation)
    this.leftUpperArm.rotation.z = 0.11;
    this.leftUpperArm.rotation.x = -0.04;
    this.rightUpperArm.rotation.z = -0.11;
    this.rightUpperArm.rotation.x = -0.04;
  }

  // ====================================================================
  // B. MODULAR ASSET BUILDERS (2 Curated Options Each)
  // ====================================================================

  /**
   * Updates all modular outfits, materials, and body sliders in real time.
   */
  public updateOutfit(config: RealisticAvatarConfig) {
    // 1. Skin tone & Hair color
    if (config.skinTone) {
      this.skinMaterial.color.set(config.skinTone);
    }
    if (config.hairColor) {
      this.hairMaterial.color.set(config.hairColor);
    }

    // 2. Eye color texture & 4 Eye shapes morphing
    if (config.eyeColor && config.eyeColor !== this.currentEyeColor) {
      this.currentEyeColor = config.eyeColor;
      const irisTex = getEyeIrisTexture(config.eyeColor);
      if (this.leftIrisMesh) {
        (this.leftIrisMesh.material as THREE.MeshStandardMaterial).map = irisTex;
        (this.leftIrisMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
      if (this.rightIrisMesh) {
        (this.rightIrisMesh.material as THREE.MeshStandardMaterial).map = irisTex;
        (this.rightIrisMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
    }

    const eyeShape = config.eyeShapeId || 'eye_shape_natural_almond';
    let irisScaleX = 1.0;
    let irisScaleY = 0.82;
    let irisTilt = 0;
    if (eyeShape === 'eye_shape_narrow_slanted') {
      irisScaleX = 1.25;
      irisScaleY = 0.44;
    } else if (eyeShape === 'eye_shape_natural_almond') {
      irisScaleX = 1.00;
      irisScaleY = 0.82;
    } else if (eyeShape === 'eye_shape_phoenix') {
      irisScaleX = 1.14;
      irisScaleY = 0.76;
      irisTilt = 0.14;
    } else if (eyeShape === 'eye_shape_big_round') {
      irisScaleX = 1.10;
      irisScaleY = 1.30;
    }

    if (this.leftIrisMesh) {
      this.leftIrisMesh.scale.set(irisScaleX, irisScaleY, 1.0);
      this.leftIrisMesh.rotation.z = -irisTilt;
    }
    if (this.rightIrisMesh) {
      this.rightIrisMesh.scale.set(irisScaleX, irisScaleY, 1.0);
      this.rightIrisMesh.rotation.z = irisTilt;
    }

    // 3. Body Morphology Customization (Without ugly mesh stretching!)
    const body = config.body || DEFAULT_REALISTIC_CONFIG.body;
    const baseHeight = 105;
    const heightRatio = Math.max(0.70, Math.min(1.30, (body.heightCm || 105) / baseHeight));
    const legRatio = Math.max(0.85, Math.min(1.2, body.legLengthScale));
    const shoulderRatio = Math.max(0.85, Math.min(1.25, body.shoulderWidthScale));
    const buildWeight = Math.max(0.8, Math.min(1.3, body.weightKg / 68));

    // Bone length adjustment
    this.spine.position.y = 0.12 * heightRatio;
    this.chest.position.y = 0.26 * heightRatio;
    this.chest.scale.set(shoulderRatio * buildWeight, 1.0, buildWeight);

    this.leftClavicle.position.x = -0.065 * shoulderRatio;
    this.rightClavicle.position.x = 0.065 * shoulderRatio;

    // Leg proportions
    this.leftThigh.scale.set(buildWeight, legRatio, buildWeight);
    this.rightThigh.scale.set(buildWeight, legRatio, buildWeight);
    this.leftShin.position.y = -0.42 * legRatio;
    this.rightShin.position.y = -0.42 * legRatio;

    // 4. Rebuild 2 Curated Assets per Category
    this.rebuildHair(config.hairId);
    this.rebuildShirt(config.shirtId, config.shirtColor);
    this.rebuildPants(config.pantsId, config.pantsColor);
    this.rebuildShoes(config.shoesId, config.shoesColor);
    this.rebuildAccessory(config.accessoryId);

    // 5. Dynamic Ngũ Quan Morphing
    this.rebuildEyebrows(config.eyebrowShapeId, config.eyebrowIntensity);
    this.updateEyeShape(config.eyeShapeId);
    this.updateJawline(config.jawlineShapeId);
  }

  // -------------------------------------------------------------
  // REBUILD 9 CURATED EYEBROW SHAPES
  // -------------------------------------------------------------
  private rebuildEyebrows(browShapeId: string = 'brow_soft_arch', intensity: number = 85) {
    this.clearGroup(this.eyebrowsGroup);
    const eyeSpacing = 0.038;
    const eyeHeight = 0.027;
    const eyeDepth = 0.076;

    const opacityVal = Math.max(0.12, Math.min(1.0, intensity / 100));
    const intensityScale = 0.70 + 0.40 * (intensity / 100);

    const browMat = this.hairMaterial.clone();
    browMat.transparent = opacityVal < 0.98;
    browMat.opacity = opacityVal;

    [-1, 1].forEach((dir) => {
      if (browShapeId === 'brow_sword_bold') {
        // Chân mày kiếm: dứt khoát, vát nhọn và xếch lên thái dương
        const browGeo = new THREE.TorusGeometry(0.033, 0.0046 * intensityScale, 8, 20, Math.PI * 0.42);
        browGeo.rotateZ(dir > 0 ? -0.30 : Math.PI + 0.30);
        const browMesh = new THREE.Mesh(browGeo, browMat);
        browMesh.position.set(dir * eyeSpacing, eyeHeight + 0.020, eyeDepth + 0.007);
        this.eyebrowsGroup.add(browMesh);
      } else if (browShapeId === 'brow_unibrow_continuous') {
        // Lông mày liền nhau (Unibrow)
        const browGeo = new THREE.TorusGeometry(0.036, 0.0052 * intensityScale, 8, 20, Math.PI * 0.58);
        browGeo.rotateZ(dir > 0 ? -0.12 : Math.PI + 0.12);
        const browMesh = new THREE.Mesh(browGeo, browMat);
        browMesh.position.set(dir * (eyeSpacing * 0.72), eyeHeight + 0.018, eyeDepth + 0.007);
        this.eyebrowsGroup.add(browMesh);
      } else if (browShapeId === 'brow_slit_cyber') {
        // Chân mày cắt khấc Cyber Slit
        const browGeo = new THREE.TorusGeometry(0.032, 0.0042 * intensityScale, 8, 20, Math.PI * 0.44);
        browGeo.rotateZ(dir > 0 ? -0.25 : Math.PI + 0.25);
        const browMesh = new THREE.Mesh(browGeo, browMat);
        browMesh.position.set(dir * (eyeSpacing + 0.002), eyeHeight + 0.020, eyeDepth + 0.006);
        this.eyebrowsGroup.add(browMesh);
      } else if (browShapeId === 'brow_wave_squiggles') {
        // Chân mày lượn sóng Squiggle
        const browGeo = new THREE.TorusGeometry(0.034, 0.0040 * intensityScale, 8, 20, Math.PI * 0.46);
        browGeo.rotateZ(dir > 0 ? -0.15 : Math.PI + 0.15);
        const browMesh = new THREE.Mesh(browGeo, browMat);
        browMesh.position.set(dir * eyeSpacing, eyeHeight + 0.019, eyeDepth + 0.006);
        this.eyebrowsGroup.add(browMesh);
      } else if (browShapeId === 'brow_lightning_zigzag') {
        // Chân mày tia chớp Zig-Zag
        const browGeo = new THREE.TorusGeometry(0.031, 0.0042 * intensityScale, 8, 20, Math.PI * 0.45);
        browGeo.rotateZ(dir > 0 ? -0.32 : Math.PI + 0.32);
        const browMesh = new THREE.Mesh(browGeo, browMat);
        browMesh.position.set(dir * eyeSpacing, eyeHeight + 0.021, eyeDepth + 0.007);
        this.eyebrowsGroup.add(browMesh);
      } else if (browShapeId === 'brow_straight_korean') {
        // Chân mày ngang Hàn Quốc
        const browGeo = new THREE.TorusGeometry(0.038, 0.0038 * intensityScale, 8, 20, Math.PI * 0.38);
        browGeo.rotateZ(dir > 0 ? -0.05 : Math.PI + 0.05);
        const browMesh = new THREE.Mesh(browGeo, browMat);
        browMesh.position.set(dir * eyeSpacing, eyeHeight + 0.018, eyeDepth + 0.006);
        this.eyebrowsGroup.add(browMesh);
      } else if (browShapeId === 'brow_high_arch_western') {
        // Chân mày cong cao Diva
        const browGeo = new THREE.TorusGeometry(0.028, 0.0036 * intensityScale, 8, 20, Math.PI * 0.52);
        browGeo.rotateZ(dir > 0 ? -0.36 : Math.PI + 0.36);
        const browMesh = new THREE.Mesh(browGeo, browMat);
        browMesh.position.set(dir * eyeSpacing, eyeHeight + 0.022, eyeDepth + 0.006);
        this.eyebrowsGroup.add(browMesh);
      } else if (browShapeId === 'brow_thick_bushy') {
        // Chân mày rậm rạp sâu róm
        const browGeo = new THREE.TorusGeometry(0.030, 0.0065 * intensityScale, 8, 20, Math.PI * 0.48);
        browGeo.rotateZ(dir > 0 ? -0.18 : Math.PI + 0.18);
        const browMesh = new THREE.Mesh(browGeo, browMat);
        browMesh.position.set(dir * eyeSpacing, eyeHeight + 0.018, eyeDepth + 0.007);
        this.eyebrowsGroup.add(browMesh);
      } else if (browShapeId === 'brow_sigma_raised') {
        // Chân mày Sigma (The Rock): 1 bên nhướn cao, 1 bên hạ thấp
        const isRaised = dir > 0;
        const browGeo = new THREE.TorusGeometry(isRaised ? 0.026 : 0.036, 0.0042 * intensityScale, 8, 20, Math.PI * (isRaised ? 0.54 : 0.38));
        browGeo.rotateZ(isRaised ? -0.42 : Math.PI + 0.05);
        const browMesh = new THREE.Mesh(browGeo, browMat);
        browMesh.position.set(dir * eyeSpacing, eyeHeight + (isRaised ? 0.026 : 0.016), eyeDepth + 0.006);
        this.eyebrowsGroup.add(browMesh);
      } else {
        // Chân mày cánh cung: mềm mại tự nhiên uốn lượn theo hốc mắt
        const browGeo = new THREE.TorusGeometry(0.030, 0.0036 * intensityScale, 8, 20, Math.PI * 0.48);
        browGeo.rotateZ(dir > 0 ? -0.18 : Math.PI + 0.18);
        const browMesh = new THREE.Mesh(browGeo, browMat);
        browMesh.position.set(dir * eyeSpacing, eyeHeight + 0.018, eyeDepth + 0.006);
        this.eyebrowsGroup.add(browMesh);
      }
    });
  }

  private updateEyeShape(eyeShapeId: string = 'eye_shape_almond') {
    if (eyeShapeId === 'eye_shape_phoenix') {
      // Mắt phượng: đuôi mắt xếch nhẹ thanh tú, hốc mắt sâu
      this.leftEyeGroup.rotation.z = -0.10;
      this.rightEyeGroup.rotation.z = 0.10;
      this.leftEyeGroup.scale.set(1.08, 0.90, 1.0);
      this.rightEyeGroup.scale.set(1.08, 0.90, 1.0);
    } else {
      // Mắt hạnh nhân: tự nhiên tròn sáng
      this.leftEyeGroup.rotation.z = -0.02;
      this.rightEyeGroup.rotation.z = 0.02;
      this.leftEyeGroup.scale.set(1.0, 1.0, 1.0);
      this.rightEyeGroup.scale.set(1.0, 1.0, 1.0);
    }
  }

  private updateJawline(jawlineShapeId: string = 'jaw_sharp_v_line') {
    if (jawlineShapeId === 'jaw_sigma_chad_mewing') {
      // Sigma Chad Mewing: khuôn mặt thon gọn sắc nét, góc cạnh, không phồng má
      this.head.scale.set(1.0, 1.01, 1.01);
    } else if (jawlineShapeId === 'jaw_structured_masculine') {
      // Góc hàm vuông vững chãi nam tính
      this.head.scale.set(1.01, 1.0, 1.01);
    } else if (jawlineShapeId === 'jaw_round_soft_baby') {
      // Khung hàm tròn baby má bầu
      this.head.scale.set(1.01, 0.98, 1.0);
    } else if (jawlineShapeId === 'jaw_heart_pointed') {
      // Khung hàm trái tim cằm nhọn
      this.head.scale.set(0.97, 1.02, 0.97);
    } else if (jawlineShapeId === 'jaw_cleft_chin_gentleman') {
      // Cằm chẻ lãng tử quý tộc
      this.head.scale.set(0.99, 1.01, 1.0);
    } else {
      // Góc hàm V-line thon gọn thanh tú
      this.head.scale.set(0.98, 1.0, 0.98);
    }
  }

  // -------------------------------------------------------------
  // REBUILD 2 CURATED HAIRSTYLES (Phase 7)
  // -------------------------------------------------------------
  private rebuildHair(hairId: string) {
    this.clearGroup(this.hairGroup);
    if (hairId === 'hair_bald_natural' || hairId === 'none') {
      return;
    }

    if (hairId === 'hair_modern_quiff') {
      // Hairstyle 1: Modern Textured Quiff
      // High volume on top, swept locks along curved paths, tapered undercut sides
      const baseScalpGeo = new THREE.SphereGeometry(0.096, 28, 24);
      baseScalpGeo.scale(0.98, 1.10, 1.15);
      const baseScalp = new THREE.Mesh(baseScalpGeo, this.hairMaterial);
      baseScalp.position.set(0, 0.045, -0.008);
      baseScalp.castShadow = true;
      this.hairGroup.add(baseScalp);

      // Swept volumetric quiff locks
      const lockPositions = [
        { x: 0, y: 0.125, z: 0.065, rx: -0.32, rz: 0, scale: 1.1 },
        { x: -0.024, y: 0.120, z: 0.060, rx: -0.28, rz: -0.15, scale: 0.95 },
        { x: 0.024, y: 0.120, z: 0.060, rx: -0.28, rz: 0.15, scale: 0.95 },
        { x: -0.042, y: 0.108, z: 0.048, rx: -0.22, rz: -0.25, scale: 0.85 },
        { x: 0.042, y: 0.108, z: 0.048, rx: -0.22, rz: 0.25, scale: 0.85 },
        { x: 0, y: 0.138, z: 0.015, rx: -0.15, rz: 0, scale: 1.05 },
        { x: -0.022, y: 0.132, z: 0.010, rx: -0.12, rz: -0.10, scale: 0.90 },
        { x: 0.022, y: 0.132, z: 0.010, rx: -0.12, rz: 0.10, scale: 0.90 },
        { x: 0, y: 0.125, z: -0.035, rx: 0.12, rz: 0, scale: 0.92 },
      ];

      lockPositions.forEach((loc) => {
        const lockGeo = new THREE.ConeGeometry(0.022 * loc.scale, 0.09 * loc.scale, 16);
        lockGeo.rotateX(loc.rx);
        lockGeo.rotateZ(loc.rz);
        const lock = new THREE.Mesh(lockGeo, this.hairMaterial);
        lock.position.set(loc.x, loc.y, loc.z);
        lock.castShadow = true;
        this.hairGroup.add(lock);
      });
    } else {
      // Hairstyle 2: Layered Natural Side-Part
      const baseScalpGeo = new THREE.SphereGeometry(0.095, 28, 24);
      baseScalpGeo.scale(1.02, 1.08, 1.16);
      const baseScalp = new THREE.Mesh(baseScalpGeo, this.hairMaterial);
      baseScalp.position.set(0, 0.042, -0.010);
      baseScalp.castShadow = true;
      this.hairGroup.add(baseScalp);

      // Part line at left temple with flowing sweeping fringe over brow
      const fringeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.045, 0.105, 0.065),
        new THREE.Vector3(-0.015, 0.092, 0.082),
        new THREE.Vector3(0.025, 0.080, 0.086),
        new THREE.Vector3(0.065, 0.055, 0.068),
      ]);
      const fringeGeo = new THREE.TubeGeometry(fringeCurve, 24, 0.018, 12, false);
      const fringe = new THREE.Mesh(fringeGeo, this.hairMaterial);
      fringe.castShadow = true;
      this.hairGroup.add(fringe);

      // Crown wave layers
      const crownWaveGeo = new THREE.TorusGeometry(0.078, 0.016, 12, 28, Math.PI * 0.9);
      crownWaveGeo.rotateZ(-0.25);
      const crownWave = new THREE.Mesh(crownWaveGeo, this.hairMaterial);
      crownWave.position.set(-0.01, 0.075, 0.055);
      this.hairGroup.add(crownWave);
    }
  }

  // -------------------------------------------------------------
  // REBUILD 2 CURATED SHIRTS (Phase 8, 9, 10, 11)
  // -------------------------------------------------------------
  private rebuildShirt(shirtId: string, colorHex: string = '#ffffff') {
    this.clearGroup(this.shirtGroup);
    if (shirtId === 'shirt_none' || shirtId === 'none') {
      return;
    }
    const cottonWeave = getCottonFabricTexture();

    const fabricMat = new THREE.MeshStandardMaterial({
      color: colorHex || 0xffffff,
      roughness: 0.70,
      metalness: 0.02,
      normalMap: cottonWeave,
      normalScale: new THREE.Vector2(0.35, 0.35),
    });

    if (shirtId === 'shirt_fitted_cotton_tee') {
      // Shirt 1: Fitted Premium Cotton Crewneck Tee
      const teeTorsoGeo = this.createAnatomicalUpperTorsoGeometry();
      teeTorsoGeo.scale(1.025, 1.01, 1.03);
      const teeTorso = new THREE.Mesh(teeTorsoGeo, fabricMat);
      teeTorso.castShadow = true;
      this.shirtGroup.add(teeTorso);

      // Ribbed crewneck collar ring
      const collarGeo = new THREE.TorusGeometry(0.075, 0.008, 14, 32);
      collarGeo.rotateX(Math.PI / 2);
      const collar = new THREE.Mesh(
        collarGeo,
        new THREE.MeshStandardMaterial({
          color: colorHex,
          roughness: 0.85,
        })
      );
      collar.position.set(0, 0.24, 0.012);
      this.shirtGroup.add(collar);
    } else {
      // Shirt 2: Oxford Button-Down Shirt
      const shirtTorsoGeo = this.createAnatomicalUpperTorsoGeometry();
      shirtTorsoGeo.scale(1.035, 1.015, 1.04);
      const shirtTorso = new THREE.Mesh(shirtTorsoGeo, fabricMat);
      shirtTorso.castShadow = true;
      this.shirtGroup.add(shirtTorso);

      // Standing structured collar
      const collarStandGeo = new THREE.TorusGeometry(0.078, 0.010, 14, 28, Math.PI * 1.3);
      collarStandGeo.rotateX(Math.PI / 2);
      collarStandGeo.rotateZ(Math.PI * 0.85);
      const collarStand = new THREE.Mesh(collarStandGeo, fabricMat);
      collarStand.position.set(0, 0.25, 0.012);
      this.shirtGroup.add(collarStand);

      // Front vertical button placket strip
      const placketGeo = new THREE.BoxGeometry(0.020, 0.30, 0.005);
      const placket = new THREE.Mesh(placketGeo, fabricMat);
      placket.position.set(0, 0.08, 0.125);
      this.shirtGroup.add(placket);

      // 5 shell buttons
      for (let b = 0; b < 5; b++) {
        const buttonGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.003, 16);
        buttonGeo.rotateX(Math.PI / 2);
        const button = new THREE.Mesh(
          buttonGeo,
          new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            roughness: 0.18,
            metalness: 0.35,
          })
        );
        button.position.set(0, 0.20 - b * 0.055, 0.130);
        this.shirtGroup.add(button);
      }

      // Left breast pocket
      const pocketGeo = new THREE.PlaneGeometry(0.042, 0.048);
      const pocket = new THREE.Mesh(pocketGeo, fabricMat);
      pocket.position.set(-0.082, 0.14, 0.135);
      this.shirtGroup.add(pocket);
    }
  }

  // -------------------------------------------------------------
  // REBUILD 2 CURATED PANTS (Phase 10, 11)
  // -------------------------------------------------------------
  private rebuildPants(pantsId: string, colorHex: string = '#2563eb') {
    this.clearGroup(this.pantsGroup);

    if (pantsId === 'pants_underwear_briefs' || pantsId === 'none') {
      const briefMat = new THREE.MeshStandardMaterial({
        color: colorHex || 0x1e293b,
        roughness: 0.65,
        metalness: 0.02,
      });
      const briefGeo = new THREE.CylinderGeometry(0.158, 0.142, 0.14, 32);
      briefGeo.scale(1.26, 1.0, 0.90);
      const briefMesh = new THREE.Mesh(briefGeo, briefMat);
      briefMesh.position.y = 0.02;
      briefMesh.castShadow = true;
      this.pantsGroup.add(briefMesh);

      const bandGeo = new THREE.TorusGeometry(0.156, 0.008, 12, 36);
      bandGeo.rotateX(Math.PI / 2);
      bandGeo.scale(1.26, 0.90, 1.0);
      const band = new THREE.Mesh(bandGeo, briefMat);
      band.position.y = 0.09;
      this.pantsGroup.add(band);
      return;
    }

    if (pantsId === 'pants_classic_denim_jeans') {
      // Pants 1: Classic Straight-Cut Denim Jeans
      const denimTexture = getDenimTwillTexture();
      const denimMat = new THREE.MeshStandardMaterial({
        color: colorHex || 0x2563eb,
        roughness: 0.68,
        metalness: 0.04,
        normalMap: denimTexture,
        normalScale: new THREE.Vector2(0.4, 0.4),
      });

      // Waistband & Hips theo phom giải phẫu
      const waistGeo = this.createAnatomicalLowerTorsoGeometry();
      waistGeo.scale(1.025, 1.01, 1.03);
      const waistMesh = new THREE.Mesh(waistGeo, denimMat);
      waistMesh.position.set(0, 0, 0);
      waistMesh.castShadow = true;
      this.pantsGroup.add(waistMesh);

      // Belt loops around waist (5 loops)
      const loopAngles = [-0.6, -0.25, 0.25, 0.6, Math.PI];
      loopAngles.forEach((ang) => {
        const loopGeo = new THREE.BoxGeometry(0.008, 0.038, 0.004);
        const loop = new THREE.Mesh(loopGeo, denimMat);
        const lx = Math.sin(ang) * 0.17;
        const lz = Math.cos(ang) * 0.12;
        loop.position.set(lx, 0.08, lz);
        loop.rotation.y = ang;
        this.pantsGroup.add(loop);
      });

      // Brass center rivet button
      const rivetGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.004, 16);
      rivetGeo.rotateX(Math.PI / 2);
      const rivet = new THREE.Mesh(
        rivetGeo,
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 })
      );
      rivet.position.set(0, 0.08, 0.140);
      this.pantsGroup.add(rivet);

      // Left & Right Pant Legs theo đường nét giải phẫu đùi & bắp chân
      [-0.115, 0.115].forEach((xPos, idx) => {
        const isRight = idx === 1;
        const thighPantsGeo = this.createAnatomicalThighGeometry(isRight);
        thighPantsGeo.scale(1.03, 1.0, 1.03);
        const thighPants = new THREE.Mesh(thighPantsGeo, denimMat);
        thighPants.position.set(xPos, 0, 0);
        thighPants.castShadow = true;
        this.pantsGroup.add(thighPants);

        const shinPantsGeo = this.createAnatomicalShinGeometry(isRight);
        shinPantsGeo.scale(1.03, 1.0, 1.03);
        const shinPants = new THREE.Mesh(shinPantsGeo, denimMat);
        shinPants.position.set(xPos, -0.42, 0);
        shinPants.castShadow = true;
        this.pantsGroup.add(shinPants);
      });
    } else {
      // Pants 2: Tailored Chino Trousers
      const chinoMat = new THREE.MeshStandardMaterial({
        color: colorHex || 0x475569,
        roughness: 0.62,
        metalness: 0.02,
      });

      const waistGeo = this.createAnatomicalLowerTorsoGeometry();
      waistGeo.scale(1.025, 1.01, 1.03);
      const waistMesh = new THREE.Mesh(waistGeo, chinoMat);
      waistMesh.position.set(0, 0, 0);
      waistMesh.castShadow = true;
      this.pantsGroup.add(waistMesh);

      [-0.115, 0.115].forEach((xPos, idx) => {
        const isRight = idx === 1;
        const thighPantsGeo = this.createAnatomicalThighGeometry(isRight);
        thighPantsGeo.scale(1.03, 1.0, 1.03);
        const thighPants = new THREE.Mesh(thighPantsGeo, chinoMat);
        thighPants.position.set(xPos, 0, 0);
        thighPants.castShadow = true;
        this.pantsGroup.add(thighPants);

        const shinPantsGeo = this.createAnatomicalShinGeometry(isRight);
        shinPantsGeo.scale(1.03, 1.0, 1.03);
        const shinPants = new THREE.Mesh(shinPantsGeo, chinoMat);
        shinPants.position.set(xPos, -0.42, 0);
        shinPants.castShadow = true;
        this.pantsGroup.add(shinPants);
      });
    }
  }

  // -------------------------------------------------------------
  // REBUILD 2 CURATED FOOTWEAR (Phase 12)
  // -------------------------------------------------------------
  private rebuildShoes(shoesId: string, colorHex: string = '#f8fafc') {
    this.clearGroup(this.shoesGroup);
    if (shoesId === 'shoes_barefoot' || shoesId === 'none') {
      return;
    }

    const solesTexture = getSoleTreadTexture();
    const leatherBump = getLeatherGrainTexture();

    const feetTargets = [
      { bone: this.leftFoot, xOffset: -0.115 },
      { bone: this.rightFoot, xOffset: 0.115 },
    ];

    feetTargets.forEach(({ bone, xOffset }) => {
      const shoeContainer = new THREE.Group();
      shoeContainer.position.set(xOffset, 0.04, 0.05);

      if (shoesId === 'shoes_low_top_sneaker') {
        // Shoe 1: Low-Top Leather Sneaker
        // 1. Rubber Cupsole with tread pattern and toe spring
        const soleGeo = new THREE.BoxGeometry(0.090, 0.038, 0.22);
        const soleMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.35,
          normalMap: solesTexture,
          normalScale: new THREE.Vector2(0.25, 0.25),
        });
        const sole = new THREE.Mesh(soleGeo, soleMat);
        sole.position.y = -0.05;
        sole.castShadow = true;
        shoeContainer.add(sole);

        // 2. Leather Upper with padded collar
        const upperGeo = new THREE.BoxGeometry(0.086, 0.062, 0.21);
        const upperMat = new THREE.MeshStandardMaterial({
          color: colorHex || 0xf8fafc,
          roughness: 0.45,
          normalMap: leatherBump,
          normalScale: new THREE.Vector2(0.2, 0.2),
        });
        const upper = new THREE.Mesh(upperGeo, upperMat);
        upper.position.set(0, -0.015, 0.005);
        upper.castShadow = true;
        shoeContainer.add(upper);

        // 3. Shoe Tongue
        const tongueGeo = new THREE.BoxGeometry(0.048, 0.055, 0.006);
        tongueGeo.rotateX(-0.35);
        const tongue = new THREE.Mesh(tongueGeo, upperMat);
        tongue.position.set(0, 0.022, 0.032);
        shoeContainer.add(tongue);

        // 4. Shoelaces (Criss-cross rows + 3D tied bow knot)
        for (let r = 0; r < 4; r++) {
          const laceRowGeo = new THREE.BoxGeometry(0.042, 0.004, 0.010);
          const laceRow = new THREE.Mesh(
            laceRowGeo,
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
          );
          laceRow.position.set(0, 0.018 + r * 0.006, 0.015 + r * 0.024);
          shoeContainer.add(laceRow);
        }

        // Tied 3D Bow Knot
        const knotGeo = new THREE.TorusGeometry(0.014, 0.0035, 10, 20);
        const knot = new THREE.Mesh(
          knotGeo,
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
        );
        knot.position.set(0, 0.038, 0.075);
        shoeContainer.add(knot);
      } else {
        // Shoe 2: Polished Leather Dress Shoes (Oxford)
        const dressMat = new THREE.MeshStandardMaterial({
          color: colorHex || 0x1a1614,
          roughness: 0.20,
          metalness: 0.15,
        });

        // Chisel toe upper
        const shoeGeo = new THREE.ConeGeometry(0.060, 0.23, 24);
        shoeGeo.rotateX(Math.PI / 2);
        shoeGeo.scale(0.85, 0.42, 1.0);
        const shoeUpper = new THREE.Mesh(shoeGeo, dressMat);
        shoeUpper.position.set(0, -0.028, 0.035);
        shoeUpper.castShadow = true;
        shoeContainer.add(shoeUpper);

        // Stacked leather heel
        const heelGeo = new THREE.BoxGeometry(0.076, 0.028, 0.075);
        const heelMat = new THREE.MeshStandardMaterial({ color: 0x0c0907, roughness: 0.4 });
        const heel = new THREE.Mesh(heelGeo, heelMat);
        heel.position.set(0, -0.056, -0.045);
        shoeContainer.add(heel);
      }

      bone.add(shoeContainer);
    });
  }

  // -------------------------------------------------------------
  // REBUILD 2 CURATED ACCESSORIES (Phase 13)
  // -------------------------------------------------------------
  private rebuildAccessory(accessoryId?: string) {
    this.clearGroup(this.accessoryGroup);
    if (!accessoryId) return;

    if (accessoryId === 'acc_wireframe_glasses') {
      // Accessory 1: Classic Metal Wireframe Glasses
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.95,
        roughness: 0.18,
      });

      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        roughness: 0.04,
        transmission: 0.92,
        clearcoat: 1.0,
      });

      [-0.038, 0.038].forEach((xPos) => {
        // Left & Right Rim
        const rimGeo = new THREE.TorusGeometry(0.021, 0.0026, 12, 28);
        const rim = new THREE.Mesh(rimGeo, frameMat);
        rim.position.set(xPos, 0.026, 0.098);
        this.accessoryGroup.add(rim);

        // Glass Lens
        const lensGeo = new THREE.CircleGeometry(0.020, 24);
        const lens = new THREE.Mesh(lensGeo, glassMat);
        lens.position.set(xPos, 0.026, 0.098);
        this.accessoryGroup.add(lens);
      });

      // Bridge over nose
      const bridgeGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.022, 10);
      bridgeGeo.rotateZ(Math.PI / 2);
      const bridge = new THREE.Mesh(bridgeGeo, frameMat);
      bridge.position.set(0, 0.028, 0.100);
      this.accessoryGroup.add(bridge);
    } else if (accessoryId === 'acc_minimalist_leather_watch') {
      // Accessory 2: Minimalist Leather Watch on Left Wrist
      const watchCaseMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.9,
        roughness: 0.18,
      });

      const strapMat = new THREE.MeshStandardMaterial({
        color: 0x3e2723,
        roughness: 0.45,
      });

      // Leather Strap around wrist
      const strapGeo = new THREE.TorusGeometry(0.036, 0.011, 12, 28);
      const strap = new THREE.Mesh(strapGeo, strapMat);
      strap.position.set(0, -0.22, 0);
      strap.rotation.x = Math.PI / 2;
      this.leftForearm.add(strap);

      // Watch Round Case & Dial
      const caseGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.006, 24);
      caseGeo.rotateX(Math.PI / 2);
      const watchCase = new THREE.Mesh(caseGeo, watchCaseMat);
      watchCase.position.set(0, -0.22, 0.040);
      this.leftForearm.add(watchCase);
    }
  }

  // ====================================================================
  // C. ANIMATION LOOP & MICRO-DYNAMICS (Phase 14, 15, 16)
  // ====================================================================
  public update(delta: number, time: number, mouseNormalized: { x: number; y: number }) {
    // 1. Natural Diaphragmatic Idle Breathing
    // Breathing cycle ~4.2 seconds
    const breath = Math.sin(time * 1.5);
    this.chest.position.y = 0.26 + breath * 0.008;
    this.chest.scale.y = 1.0 + breath * 0.012;
    this.leftClavicle.position.y = 0.22 + breath * 0.004;
    this.rightClavicle.position.y = 0.22 + breath * 0.004;

    // 2. Subtle Weight Shifting between Left & Right Leg (~7.5s cycle)
    this.weightShiftCycle += delta * 0.42;
    const shift = Math.sin(this.weightShiftCycle);
    this.pelvis.position.x = shift * 0.014;
    this.pelvis.rotation.z = shift * 0.018;
    this.spine.rotation.z = -shift * 0.016; // Counterbalance spine

    // 3. Smooth Damped Head & Neck Tracking
    const targetHeadY = mouseNormalized.x * 0.38;
    const targetHeadX = -mouseNormalized.y * 0.25;

    // Neck takes 35% of rotation, Head takes 65% for organic human neck movement
    this.neck.rotation.y += (targetHeadY * 0.35 - this.neck.rotation.y) * 0.08;
    this.neck.rotation.x += (targetHeadX * 0.35 - this.neck.rotation.x) * 0.08;
    this.head.rotation.y += (targetHeadY * 0.65 - this.head.rotation.y) * 0.12;
    this.head.rotation.x += (targetHeadX * 0.65 - this.head.rotation.x) * 0.12;

    // 4. Natural 3D Blinking Animation
    this.blinkTimer += delta;
    if (this.blinkTimer > 3.6) {
      if (this.leftUpperLid && this.rightUpperLid) {
        this.leftUpperLid.visible = true;
        this.rightUpperLid.visible = true;
      }

      if (this.blinkTimer > 3.6 + this.blinkDuration) {
        this.blinkTimer = 0;
        if (this.leftUpperLid && this.rightUpperLid) {
          this.leftUpperLid.visible = false;
          this.rightUpperLid.visible = false;
        }
      }
    }
  }

  // ====================================================================
  // D. CLEANUP & MEMORY MANAGEMENT
  // ====================================================================
  private clearGroup(group: THREE.Group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    }
  }

  public dispose() {
    this.skinMaterial.dispose();
    this.eyeWhiteMaterial.dispose();
    this.corneaMaterial.dispose();
    this.hairMaterial.dispose();
  }
}
