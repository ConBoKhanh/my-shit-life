import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { RealisticAvatarConfig } from '../character/RealisticAssetsCatalog';

/**
 * Interface cho mọi Character Model (cả Procedural Sculpted lẫn Imported GLB)
 * Đảm bảo tuân thủ Phase 24: "REPLACEABLE ASSET PIPELINE" trong
 * realistic-human-threejs-character-system.md
 */
export interface IHumanCharacter {
  root: THREE.Group;
  updateOutfit(config: RealisticAvatarConfig): void;
  update(delta: number, time: number, mouseNormalized: { x: number; y: number }): void;
  dispose(): void;
  setPose?(poseId: string): void;
}

/**
 * CharacterModelLoader
 * Hỗ trợ nạp mô hình 3D GLB/GLTF từ file người dùng tải lên hoặc URL từ xa,
 * tự động dò tìm cấu trúc xương chuẩn Humanoid (Mixamo, RPM, Blender).
 */
export class CharacterModelLoader {
  private loader: GLTFLoader;

  constructor() {
    this.loader = new GLTFLoader();
  }

  /**
   * Tải mô hình từ URL hoặc Data URI
   */
  public async loadFromUrl(url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          this.setupModelMaterials(model);
          resolve(model);
        },
        undefined,
        (error) => {
          console.error('[CharacterModelLoader] Lỗi khi nạp GLB từ URL:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Tải mô hình từ File (input[type="file"])
   */
  public async loadFromFile(file: File): Promise<THREE.Group> {
    const arrayBuffer = await file.arrayBuffer();
    return new Promise((resolve, reject) => {
      this.loader.parse(
        arrayBuffer,
        '',
        (gltf) => {
          const model = gltf.scene;
          this.setupModelMaterials(model);
          resolve(model);
        },
        (error) => {
          console.error('[CharacterModelLoader] Lỗi khi phân tích cú pháp GLB File:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Tự động cấu hình bóng đổ và PBR cho tất cả mesh trong mô hình GLB
   */
  private setupModelMaterials(root: THREE.Group) {
    root.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;

        if (node.geometry) {
          node.geometry.computeVertexNormals();
        }

        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach((mat) => this.optimizeMaterial(mat));
          } else {
            this.optimizeMaterial(node.material);
          }
        }
      }
    });
  }

  private optimizeMaterial(material: THREE.Material) {
    if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
      material.roughness = Math.max(0.42, Math.min(0.75, material.roughness || 0.55));
      material.metalness = Math.min(0.1, material.metalness || 0.0);
      material.needsUpdate = true;
    }
  }

  /**
   * Ánh xạ các xương chính của mô hình Humanoid GLB
   */
  public mapHumanoidBones(root: THREE.Group): Record<string, THREE.Bone | THREE.Object3D> {
    const bones: Record<string, THREE.Bone | THREE.Object3D> = {};

    const boneNameMap: Record<string, string[]> = {
      head: ['head', 'mixamorighead', 'head_01', 'bip01_head'],
      neck: ['neck', 'mixamorigneck', 'neck_01', 'bip01_neck'],
      chest: ['spine2', 'chest', 'upperchest', 'mixamorigspine2', 'bip01_spine2'],
      spine: ['spine', 'spine1', 'mixamorigspine', 'bip01_spine'],
      hips: ['hips', 'pelvis', 'mixamorighips', 'bip01_pelvis', 'root_bone'],
      leftUpperArm: ['leftarm', 'mixamorigleftarm', 'arm_l', 'bip01_l_upperarm'],
      rightUpperArm: ['rightarm', 'mixamorigrightarm', 'arm_r', 'bip01_r_upperarm'],
      leftForearm: ['leftforearm', 'mixamorigleftforearm', 'forearm_l', 'bip01_l_forearm'],
      rightForearm: ['rightforearm', 'mixamorigrightforearm', 'forearm_r', 'bip01_r_forearm'],
      leftHand: ['lefthand', 'mixamoriglefthand', 'hand_l', 'bip01_l_hand'],
      rightHand: ['righthand', 'mixamorigrighthand', 'hand_r', 'bip01_r_hand'],
      leftUpLeg: ['leftupleg', 'mixamorigleftupleg', 'thigh_l', 'bip01_l_thigh'],
      rightUpLeg: ['rightupleg', 'mixamorigrightupleg', 'thigh_r', 'bip01_r_thigh'],
      leftLeg: ['leftleg', 'mixamorigleftleg', 'calf_l', 'bip01_l_calf'],
      rightLeg: ['rightleg', 'mixamorigrightleg', 'calf_r', 'bip01_r_calf'],
      leftFoot: ['leftfoot', 'mixamorigleftfoot', 'foot_l', 'bip01_l_foot'],
      rightFoot: ['rightfoot', 'mixamorigrightfoot', 'foot_r', 'bip01_r_foot'],
    };

    root.traverse((obj) => {
      const lowerName = obj.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const [key, aliases] of Object.entries(boneNameMap)) {
        if (aliases.some((alias) => lowerName.includes(alias))) {
          if (!bones[key]) {
            bones[key] = obj;
          }
        }
      }
    });

    return bones;
  }
}

/**
 * SculptedGlbCharacter
 * Lớp điều khiển cho mô hình 3D người thật nhập từ file GLB (ví dụ: sculpting_a_human_body.glb).
 * Tự động căn chỉnh chiều cao, chân chạm bục, chuẩn hóa bóng đổ, PBR da, micro-animations và tùy biến.
 */
export class SculptedGlbCharacter implements IHumanCharacter {
  public root: THREE.Group;
  public model: THREE.Group;
  private bones: Record<string, THREE.Bone | THREE.Object3D> = {};
  private materials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];
  private initialY: number = 0;
  private initialBox: THREE.Box3 = new THREE.Box3();
  private initialScale: number = 1.0;

  constructor(model: THREE.Group, showPodium: boolean = true) {
    this.root = new THREE.Group();
    this.root.name = 'SculptedGlbCharacterRoot';
    this.model = model;
    this.root.add(this.model);

    // 1. Tính toán Bounding Box và Kích thước
    this.model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.model);
    this.initialBox = box;
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // 2. Chuẩn hóa chiều cao về tỷ lệ người thật (~1.76m)
    const targetHeight = 1.76;
    const modelHeight = size.y > 0.001 ? size.y : 1;
    const scale = targetHeight / modelHeight;
    this.initialScale = scale;
    this.model.scale.setScalar(scale);

    // 3. Căn giữa theo trục X, Z và đặt chân ngay ngắn lên bục xoay
    const baseY = showPodium ? 0.08 : 0.0;
    this.initialY = baseY;
    this.model.position.x = -center.x * scale;
    this.model.position.z = -center.z * scale;
    this.model.position.y = baseY - box.min.y * scale;

    // 4. Cấu hình Vật liệu PBR, bóng đổ và tính toán pháp tuyến đỉnh
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.geometry) {
          child.geometry.computeVertexNormals();
        }

        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => {
            if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial) {
              m.roughness = Math.max(0.40, Math.min(0.70, m.roughness || 0.52));
              m.metalness = Math.min(0.08, m.metalness || 0.0);
              this.materials.push(m);
            }
          });
        }
      }
    });

    // 5. Ánh xạ xương (nếu model có khung xương rig)
    const loader = new CharacterModelLoader();
    this.bones = loader.mapHumanoidBones(this.model);
  }

  public updateOutfit(config: RealisticAvatarConfig) {
    // 1. Cập nhật màu da chân thực
    if (config.skinTone && this.materials.length > 0) {
      const skinColor = new THREE.Color(config.skinTone);
      this.materials.forEach((mat) => {
        mat.color.copy(skinColor);
        mat.needsUpdate = true;
      });
    }

    // 2. Tinh chỉnh tỷ lệ vóc dáng cơ thể (Height, Weight, Shoulder)
    if (config.body) {
      const heightRatio = Math.max(0.70, Math.min(1.30, (config.body.heightCm || 105) / 105));
      const buildWeight = Math.max(0.8, Math.min(1.3, config.body.weightKg / 68));
      const shoulderRatio = Math.max(0.85, Math.min(1.25, config.body.shoulderWidthScale || 1.0));

      this.model.scale.set(
        this.initialScale * shoulderRatio * buildWeight,
        this.initialScale * heightRatio,
        this.initialScale * buildWeight
      );
    }

    // 3. Tinh chỉnh khung xương hàm / tỷ lệ ngũ quan nếu có head bone
    if (this.bones.head) {
      if (config.jawlineShapeId === 'jaw_structured_masculine') {
        this.bones.head.scale.set(1.03, 1.0, 1.02);
      } else {
        this.bones.head.scale.set(0.98, 1.0, 0.98);
      }
    }
  }

  public update(_delta: number, time: number, mouseNormalized: { x: number; y: number }) {
    // 1. Nhịp thở cơ hoành vi mô (~4.2s)
    const breath = Math.sin(time * 1.5);
    const breatheOffsetY = breath * 0.005;

    // 2. Chuyển trọng tâm đung đưa nhẹ nhàng
    const shift = Math.sin(time * 0.5);
    this.root.rotation.y = shift * 0.035;

    // 3. Nghiêng đầu / cơ thể mượt mà nhìn theo con trỏ chuột
    if (this.bones.head) {
      const targetHeadY = mouseNormalized.x * 0.40;
      const targetHeadX = -mouseNormalized.y * 0.25;
      this.bones.head.rotation.y += (targetHeadY - this.bones.head.rotation.y) * 0.1;
      this.bones.head.rotation.x += (targetHeadX - this.bones.head.rotation.x) * 0.1;
    } else {
      const targetTiltY = mouseNormalized.x * 0.14;
      const targetTiltX = -mouseNormalized.y * 0.08;
      this.model.rotation.y += (targetTiltY - this.model.rotation.y) * 0.08;
      this.model.rotation.x += (targetTiltX - this.model.rotation.x) * 0.08;
    }

    // 4. Nâng hạ nhịp thở nhẹ nhàng
    this.model.position.y = this.initialY - this.initialBox.min.y * this.initialScale + breatheOffsetY;
  }

  public dispose() {
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
  }
}
