# HUMAN FIGURE 3D SYSTEM SPECIFICATION
*Quy chuẩn kỹ thuật cấu trúc mô hình khớp động (Action Figure / S.H.Figuarts / Figma Style) cho Three.js*

---

## 1. Bản Đồ Phân Tách Khối Cơ Thể (Segmentation Map)

Để biến mô hình 3D người liền mạch (organic) thành mô hình khớp đồ chơi chân thực, toàn bộ cơ thể cần được cắt lát cơ học thành 32 phân đoạn độc lập:

| Nhóm | Phân đoạn (Part Name) | Dạng khớp (Joint Type) | Chức năng chuyển động |
| :--- | :--- | :--- | :--- |
| **Đầu & Cổ** | Head Shell | Khớp cầu (Ball-and-socket) | Gật/ngửa, nghiêng và xoay đầu |
| | Neck Stem | Khớp bản lề kép (Double Peg) | Uốn cổ về trước/sau độc lập |
| **Vai (x2)** | Clavicle Cap (Bả vai) | Butterfly Joint (Khớp cánh bướm) | Đưa vai ra trước ngực hoặc ngửa ra sau |
| | Shoulder Ball (Cầu vai) | Ball Joint | Xoay nâng tay tự do 3 trục |
| **Tay (x2)** | Bicep Swivel | Khớp xoay ngang (Horizontal Swivel) | Vặn bắp tay trong/ngoài |
| | Upper Arm Block | Khối cứng | Định hình cơ delta và bắp tay |
| | Double-Joint Elbow | Bản lề đôi (Double Hinge) | Gập cẳng tay áp sát bắp tay (lên tới 155°) |
| | Forearm Swivel | Trục xoay cẳng tay | Giả lập cơ quay sấp/ngửa cổ tay |
| | Wrist Peg | Khớp bi chốt đôi | Gập lên xuống và xoay lòng bàn tay |
| | Hands (Nắm đấm / Xòe) | Part rời thay thế (Interchangeable) | Giữ vũ khí hoặc tạo dáng bàn tay |
| **Thân mình** | Upper Torso (Ngực) | Khớp cầu ngực | Gập gù lưng và nghiêng ngực |
| | Mid Torso (Bụng) | Floating Abdomen Ring | Vòng đệm che khe hở khi gập người |
| | Lower Torso (Hông/Đáy chậu)| Khớp chậu xoay | Điểm neo chịu tải toàn thân |
| **Chân (x2)** | Hip Ball / Drop-down | Khớp cầu hạ trọng tâm (Drop Axis) | Tăng biên độ đá cao mà không cấn háng |
| | Thigh Swivel | Khớp xoay đùi ngang | Xoay vặn mũi chân hướng ra ngoài/vào trong |
| | Double-Joint Knee | Bản lề đôi | Gập gót chân chạm mông |
| | Ankle Rocker | Khớp cầu nghiêng | Giúp đế chân luôn bám phẳng mặt đất |
| | Toe Hinge | Bản lề mũi chân | Nhón gót khi chạy nhảy, đứng trụ |

---

## 2. Thông Số Kích Thước Khối & Giới Hạn Góc Xoay

Bảng thông số tính toán quy chuẩn theo chiều cao nhân vật 1.76m (Three.js 1 Unit = 1 Meter):

| Điểm Khớp | Kích thước / Bán kính (m) | Giới hạn trục X (Pitch) | Giới hạn trục Y (Yaw) | Giới hạn trục Z (Roll) |
| :--- | :--- | :--- | :--- | :--- |
| **Shoulder Ball** | Radius: `0.027` | `-90°` đến `+180°` | `-45°` đến `+90°` | `-120°` đến `+90°` |
| **Clavicle (Vai)** | L: `0.14`, W: `0.05` | `-10°` đến `+15°` | `-25°` đến `+35°` | `-15°` đến `+20°` |
| **Bicep Swivel** | L: `0.12`, W: `0.07` | `0°` (Cố định) | `-90°` đến `+90°` | `0°` (Cố định) |
| **Double Elbow** | 2 trục cách nhau `0.022` | `0°` đến `+155°` | `0°` (Khóa cứng) | `0°` (Khóa cứng) |
| **Wrist Peg** | Radius: `0.012` | `-75°` đến `+75°` | `-30°` đến `+30°` | `-80°` đến `+80°` |
| **Chest Cut** | L: `0.26`, W: `0.32` | `-25°` đến `+30°` | `-20°` đến `+20°` | `-18°` đến `+18°` |
| **Hip Drop Axis** | Radius: `0.032` | `-120°` đến `+40°` | `-35°` đến `+45°` | `-60°` đến `+30°` |
| **Double Knee** | 2 trục cách nhau `0.025` | `0°` đến `+160°` | `0°` (Khóa cứng) | `0°` (Khóa cứng) |
| **Ankle Rocker** | Radius: `0.016` | `-45°` đến `+40°` | `-15°` đến `+15°` | `-35°` đến `+35°` |

---

## 3. Quy Chuẩn Vật Liệu Nhựa PBR (PVC / ABS Injection Molding)

Mô hình figure đồ chơi không dùng tán xạ da sinh học (Subsurface Scattering) mà sử dụng tính chất nhựa đúc bóng mờ:

* **Vật liệu chính:** `THREE.MeshPhysicalMaterial`
* **Albedo Base Color:** Màu da ngả vàng cam sáng hoặc màu nhựa đúc nguyên bản.
* **Roughness:** `0.35 - 0.42` (mịn đều, không phản chiếu gắt).
* **Metalness:** `0.01 - 0.03` (đảm bảo không bị ám xám kim loại).
* **Clearcoat:** `0.2` (lớp phủ bảo vệ bề mặt chống trầy).
* **ClearcoatRoughness:** `0.25` (phân tán ánh sáng phản chiếu).
* **Ambient Occlusion (AO):** Tăng trọng số ở các rãnh khớp cắt (seam gaps) để tạo khe tối cơ học giữa các part.

---

## 4. Mã Nguồn Cải Tiến Hoàn Chỉnh (`FigureCharacterPipeline.ts`)

Đoạn code tích hợp nhận diện khớp mở rộng, tư thế Figure tự nhiên và điều khiển khớp lề đôi:

```typescript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface FigureConfig {
  figureScale?: number;
  plasticColor?: string | number;
  roughness?: number;
  elbowBendDeg?: number;
  kneeBendDeg?: number;
  chestHunchDeg?: number;
}

export class FigureCharacterSystem {
  public root: THREE.Group;
  public model: THREE.Group | null = null;
  public bones: Record<string, THREE.Object3D> = {};
  public materials: THREE.MeshPhysicalMaterial[] = [];

  private initialScale: number = 1.0;
  private loader: GLTFLoader;

  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'FigureCharacterRoot';
    this.loader = new GLTFLoader();
  }

  public async loadModel(url: string, config?: FigureConfig): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          this.model = gltf.scene;
          this.root.add(this.model);

          this.normalizeGeometry();
          this.setupFigureMaterials(config);
          this.mapFigureBones();
          this.applyDefaultFigurePose(config);

          resolve(this.root);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  private normalizeGeometry() {
    if (!this.model) return;

    this.model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const targetHeight = 1.76;
    const modelHeight = size.y > 0.001 ? size.y : 1;
    this.initialScale = targetHeight / modelHeight;
    this.model.scale.setScalar(this.initialScale);

    this.model.position.x = -center.x * this.initialScale;
    this.model.position.z = -center.z * this.initialScale;
    this.model.position.y = -box.min.y * this.initialScale;
  }

  private setupFigureMaterials(config?: FigureConfig) {
    if (!this.model) return;

    const baseColor = config?.plasticColor ? new THREE.Color(config.plasticColor) : null;
    const roughnessVal = config?.roughness ?? 0.38;

    this.model.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;

        const sourceMat = Array.isArray(node.material) ? node.material[0] : node.material;

        // Chuyển đổi sang MeshPhysicalMaterial chuẩn nhựa ABS/PVC
        const toyMaterial = new THREE.MeshPhysicalMaterial({
          color: baseColor || sourceMat.color || 0xecd0b7,
          roughness: roughnessVal,
          metalness: 0.02,
          clearcoat: 0.22,
          clearcoatRoughness: 0.25,
          map: sourceMat.map || null,
          normalMap: sourceMat.normalMap || null,
        });

        node.material = toyMaterial;
        this.materials.push(toyMaterial);
      }
    });
  }

  public mapFigureBones() {
    if (!this.model) return;

    const boneMapping: Record<string, string[]> = {
      // Đầu & Thân
      head: ['head', 'mixamorighead'],
      neck: ['neck', 'mixamorigneck'],
      chest: ['spine2', 'upperchest', 'chest_cut', 'mixamorigspine2'],
      abdomen: ['spine1', 'spine', 'abdomen', 'mixamorigspine1'],
      pelvis: ['hips', 'pelvis', 'mixamorighips'],

      // Nhóm Vai & Cánh Tay Đồ Chơi
      leftClavicle: ['leftshoulder', 'clavicle_l', 'mixamorigleftshoulder'],
      rightClavicle: ['rightshoulder', 'clavicle_r', 'mixamorigrightshoulder'],
      leftShoulderBall: ['leftarm', 'arm_l', 'mixamorigleftarm'],
      rightShoulderBall: ['rightarm', 'arm_r', 'mixamorigrightarm'],
      leftBicepSwivel: ['leftarmtwist', 'bicep_twist_l'],
      rightBicepSwivel: ['rightarmtwist', 'bicep_twist_r'],
      leftElbowJoint1: ['leftforearm', 'forearm_l', 'mixamorigleftforearm'],
      rightElbowJoint1: ['rightforearm', 'forearm_r', 'mixamorigrightforearm'],
      leftWristPeg: ['lefthand', 'hand_l', 'mixamoriglefthand'],
      rightWristPeg: ['righthand', 'hand_r', 'mixamorigrighthand'],

      // Nhóm Chân & Khớp Gối Đôi
      leftHipJoint: ['leftupleg', 'thigh_l', 'mixamorigleftupleg'],
      rightHipJoint: ['rightupleg', 'thigh_r', 'mixamorigrightupleg'],
      leftKneeJoint: ['leftleg', 'calf_l', 'mixamorigleftleg'],
      rightKneeJoint: ['rightleg', 'calf_r', 'mixamorigrightleg'],
      leftAnkleRocker: ['leftfoot', 'foot_l', 'mixamorigleftfoot'],
      rightAnkleRocker: ['rightfoot', 'foot_r', 'mixamorigrightfoot'],
      leftToeHinge: ['lefttoebase', 'toes_l', 'mixamoriglefttoebase'],
      rightToeHinge: ['righttoebase', 'toes_r', 'mixamorigrighttoebase'],
    };

    this.model.traverse((obj) => {
      const lowerName = obj.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const [key, aliases] of Object.entries(boneMapping)) {
        if (aliases.some((alias) => lowerName.includes(alias))) {
          if (!this.bones[key]) {
            this.bones[key] = obj;
          }
        }
      }
    });
  }

  public applyDefaultFigurePose(config?: FigureConfig) {
    const elbowBend = THREE.MathUtils.degToRad(config?.elbowBendDeg ?? 35);
    const kneeBend = THREE.MathUtils.degToRad(config?.kneeBendDeg ?? 12);
    const chestHunch = THREE.MathUtils.degToRad(config?.chestHunchDeg ?? 6);

    // 1. Hạ vai và khép tay vào thân
    if (this.bones.leftShoulderBall) {
      this.bones.leftShoulderBall.rotation.z = THREE.MathUtils.degToRad(65);
      this.bones.leftShoulderBall.rotation.x = THREE.MathUtils.degToRad(8);
    }
    if (this.bones.rightShoulderBall) {
      this.bones.rightShoulderBall.rotation.z = THREE.MathUtils.degToRad(-65);
      this.bones.rightShoulderBall.rotation.x = THREE.MathUtils.degToRad(8);
    }

    // 2. Phân bổ góc gập cho cùi chỏ
    if (this.bones.leftElbowJoint1) {
      this.bones.leftElbowJoint1.rotation.y = elbowBend;
    }
    if (this.bones.rightElbowJoint1) {
      this.bones.rightElbowJoint1.rotation.y = -elbowBend;
    }

    // 3. Khớp gối hơi chùng nhẹ
    if (this.bones.leftKneeJoint) {
      this.bones.leftKneeJoint.rotation.x = kneeBend;
    }
    if (this.bones.rightKneeJoint) {
      this.bones.rightKneeJoint.rotation.x = kneeBend;
    }

    // 4. Ngực hơi gập về trước
    if (this.bones.chest) {
      this.bones.chest.rotation.x = chestHunch;
    }
  }

  public update(time: number, mouseNormalized: { x: number; y: number }) {
    // Đầu và cổ chia tầng xoay theo chuột
    if (this.bones.neck && this.bones.head) {
      const targetX = -mouseNormalized.y * 0.3;
      const targetY = mouseNormalized.x * 0.45;

      this.bones.neck.rotation.y += (targetY * 0.35 - this.bones.neck.rotation.y) * 0.1;
      this.bones.neck.rotation.x += (targetX * 0.35 - this.bones.neck.rotation.x) * 0.1;

      this.bones.head.rotation.y += (targetY * 0.65 - this.bones.head.rotation.y) * 0.12;
      this.bones.head.rotation.x += (targetX * 0.65 - this.bones.head.rotation.x) * 0.12;
    }

    // Dao động nhẹ của khối bả vai khi thở
    if (this.bones.leftClavicle && this.bones.rightClavicle) {
      const breath = Math.sin(time * 2.0) * 0.015;
      this.bones.leftClavicle.rotation.z = breath;
      this.bones.rightClavicle.rotation.z = -breath;
    }
  }

  public dispose() {
    this.materials.forEach((mat) => mat.dispose());
    if (this.model) {
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
        }
      });
    }
  }
}