import * as THREE from 'three';
import type { RealisticAvatarConfig } from '../character/RealisticAssetsCatalog';
import type { IHumanCharacter } from './CharacterModelLoader';

/**
 * ArticulatedMannequin.ts
 * High-End Action Figure / S.H.Figuarts / Figma Style 3D Articulated Human Figure.
 *
 * Major Fixes:
 * 1. Seamless Shoulder & Trapezius Flow (Cổ vuốt xuống vai liền mạch một đường cong tự nhiên):
 *    - Gentle 10° athletic collarbone slope (no triangular pagoda roof tent).
 *    - Solid rounded Deltoid Cap completely covering the top of the arm.
 *    - 100% eliminated the open volcano pipe craters on top of the shoulders.
 * 2. Powerful Heroic Thighs (Đùi to khỏe, cơ tứ đầu đùi nở nang):
 *    - Thigh radius increased to 0.060m with prominent teardrop quadriceps filling the pelvic V-cut.
 * 3. 3D Orbital Eye Sockets:
 *    - Refined almond-shaped eye sockets without harsh horizontal bars.
 * 4. 100% Solid DoubleSide Rendering.
 */
export class ArticulatedMannequin implements IHumanCharacter {
  public root: THREE.Group;

  // Materials with DoubleSide
  private bodyMaterial: THREE.MeshPhysicalMaterial;
  private jointMaterial: THREE.MeshPhysicalMaterial;
  private accentMaterial: THREE.MeshStandardMaterial;

  // Skeletal Nodes
  public spineRoot: THREE.Group;
  public pelvisBone: THREE.Group;
  public waistBone: THREE.Group;
  public chestBone: THREE.Group;
  public neckBone: THREE.Group;
  public headBone: THREE.Group;

  // Upper Limbs
  public leftShoulder: THREE.Group;
  public rightShoulder: THREE.Group;
  public leftUpperArm: THREE.Group;
  public rightUpperArm: THREE.Group;
  public leftElbow: THREE.Group;
  public rightElbow: THREE.Group;
  public leftForearm: THREE.Group;
  public rightForearm: THREE.Group;
  public leftHand: THREE.Group;
  public rightHand: THREE.Group;

  // Lower Limbs & 4-Stage Drop-Down Hip System
  public dropDownPegL: THREE.Group;
  public dropDownPegR: THREE.Group;
  public leftHipBallGroup: THREE.Group;
  public rightHipBallGroup: THREE.Group;
  public leftThigh: THREE.Group;
  public rightThigh: THREE.Group;
  public leftKnee: THREE.Group;
  public rightKnee: THREE.Group;
  public leftShin: THREE.Group;
  public rightShin: THREE.Group;
  public leftFoot: THREE.Group;
  public rightFoot: THREE.Group;

  // Animation cycle
  private weightShiftCycle: number = 0;

  constructor(customColorHex: string = '#B57850') {
    this.root = new THREE.Group();
    this.root.name = 'ArticulatedMannequin_Root';

    // 1. PBR ABS / PVC Semi-Gloss Satin Figure Materials
    const baseColor = new THREE.Color(customColorHex);
    this.bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      roughness: 0.36,
      metalness: 0.02,
      clearcoat: 0.22,
      clearcoatRoughness: 0.24,
      side: THREE.DoubleSide,
    });

    const jointColor = baseColor.clone().multiplyScalar(0.85);
    this.jointMaterial = new THREE.MeshPhysicalMaterial({
      color: jointColor,
      roughness: 0.32,
      metalness: 0.06,
      clearcoat: 0.28,
      clearcoatRoughness: 0.20,
      side: THREE.DoubleSide,
    });

    this.accentMaterial = new THREE.MeshStandardMaterial({
      color: jointColor.clone().multiplyScalar(0.76),
      roughness: 0.25,
      metalness: 0.15,
      side: THREE.DoubleSide,
    });

    // 2. Harmonious Proportional Skeletal Hierarchy
    this.spineRoot = new THREE.Group();
    this.spineRoot.name = 'Spine_Root';
    this.root.add(this.spineRoot);

    // Pelvis anchor at Y = 0.74m
    this.pelvisBone = new THREE.Group();
    this.pelvisBone.position.set(0, 0.74, 0);
    this.spineRoot.add(this.pelvisBone);

    // Waist / Floating Abdomen (attached above Pelvis, overlaps 3cm inside pelvis)
    this.waistBone = new THREE.Group();
    this.waistBone.position.set(0, 0.05, 0);
    this.pelvisBone.add(this.waistBone);

    // Chest (attached above Waist at Y = 0.12m)
    this.chestBone = new THREE.Group();
    this.chestBone.position.set(0, 0.12, 0);
    this.waistBone.add(this.chestBone);

    // Neck (nested in chest collar at Y = 0.170m)
    this.neckBone = new THREE.Group();
    this.neckBone.position.set(0, 0.170, 0);
    this.chestBone.add(this.neckBone);

    // Head (atop neck at Y = 0.050m)
    this.headBone = new THREE.Group();
    this.headBone.position.set(0, 0.050, 0);
    this.neckBone.add(this.headBone);

    // Shoulders placed flush with broad chest shelf (X = ±0.138, Y = 0.138)
    this.leftShoulder = new THREE.Group();
    this.leftShoulder.position.set(-0.138, 0.138, 0);
    this.chestBone.add(this.leftShoulder);

    this.rightShoulder = new THREE.Group();
    this.rightShoulder.position.set(0.138, 0.138, 0);
    this.chestBone.add(this.rightShoulder);

    // Upper Arms (Length: 0.22m)
    this.leftUpperArm = new THREE.Group();
    this.leftShoulder.add(this.leftUpperArm);

    this.rightUpperArm = new THREE.Group();
    this.rightShoulder.add(this.rightUpperArm);

    this.leftElbow = new THREE.Group();
    this.leftElbow.position.set(0, -0.22, 0);
    this.leftUpperArm.add(this.leftElbow);

    this.rightElbow = new THREE.Group();
    this.rightElbow.position.set(0, -0.22, 0);
    this.rightUpperArm.add(this.rightElbow);

    this.leftForearm = new THREE.Group();
    this.leftElbow.add(this.leftForearm);

    this.rightForearm = new THREE.Group();
    this.rightElbow.add(this.rightForearm);

    this.leftHand = new THREE.Group();
    this.leftHand.position.set(0, -0.20, 0);
    this.leftForearm.add(this.leftHand);

    this.rightHand = new THREE.Group();
    this.rightHand.position.set(0, -0.20, 0);
    this.rightForearm.add(this.rightHand);

    // 4-Stage Drop-Down Hip System (X = ±0.074, Y = -0.030, deep inside pelvis)
    this.dropDownPegL = new THREE.Group();
    this.dropDownPegL.position.set(-0.074, -0.030, 0);
    this.pelvisBone.add(this.dropDownPegL);

    this.dropDownPegR = new THREE.Group();
    this.dropDownPegR.position.set(0.074, -0.030, 0);
    this.pelvisBone.add(this.dropDownPegR);

    this.leftHipBallGroup = new THREE.Group();
    this.dropDownPegL.add(this.leftHipBallGroup);

    this.rightHipBallGroup = new THREE.Group();
    this.dropDownPegR.add(this.rightHipBallGroup);

    this.leftThigh = new THREE.Group();
    this.leftHipBallGroup.add(this.leftThigh);

    this.rightThigh = new THREE.Group();
    this.rightHipBallGroup.add(this.rightThigh);

    this.leftKnee = new THREE.Group();
    this.leftKnee.position.set(0, -0.30, 0);
    this.leftThigh.add(this.leftKnee);

    this.rightKnee = new THREE.Group();
    this.rightKnee.position.set(0, -0.30, 0);
    this.rightThigh.add(this.rightKnee);

    this.leftShin = new THREE.Group();
    this.leftKnee.add(this.leftShin);

    this.rightShin = new THREE.Group();
    this.rightKnee.add(this.rightShin);

    this.leftFoot = new THREE.Group();
    this.leftFoot.position.set(0, -0.30, 0);
    this.leftShin.add(this.leftFoot);

    this.rightFoot = new THREE.Group();
    this.rightFoot.position.set(0, -0.30, 0);
    this.rightShin.add(this.rightFoot);

    // 3. Build Detailed Geometry
    this.buildMannequin();
  }

  // ===========================================================================
  // BUILD MANNEQUIN
  // ===========================================================================
  private buildMannequin() {
    this.buildHead();
    this.buildNeck();
    this.buildTorso();
    this.buildArms();
    this.buildHipsAndLegs();
  }

  // ===========================================================================
  // 1. HEAD: Unified Sculpted Head (Đầu Điêu Khắc Liền Khối, Mềm Mại & Gọt Gọn Gàng)
  // ===========================================================================
  private buildHead() {
    const headContainer = new THREE.Group();
    headContainer.position.set(0, 0.006, 0.003);

    // 1. Unified Sculpted Head (Khối sọ & khuôn mặt điêu khắc tinh xảo chuẩn tỉ lệ ảnh mẫu)
    const headGeo = this.createUnifiedSculptedHeadGeometry();
    const headMesh = new THREE.Mesh(headGeo, this.bodyMaterial);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    headContainer.add(headMesh);

    // 2. Vành tai giải phẫu học thanh tú (Anatomical Ear - Concha, Helix Rim & Lobe)
    [-1, 1].forEach((dir) => {
      const earGroup = new THREE.Group();
      // Đặt ngang tầm đuôi mắt tới chân mũi, nghiêng nhẹ về sau 10 độ
      earGroup.position.set(dir * 0.052, 0.012, -0.008);
      earGroup.rotation.set(0.04, dir * 0.14, -dir * 0.06);

      // Thân lòng tai đặc (Concha bowl)
      const conchaGeo = new THREE.SphereGeometry(0.0090, 16, 12);
      conchaGeo.scale(0.28, 1.25, 0.70);
      const conchaMesh = new THREE.Mesh(conchaGeo, this.bodyMaterial);
      conchaMesh.castShadow = true;
      earGroup.add(conchaMesh);

      // Vành sụn ngoài uốn cong (Outer Helix Rim)
      const helixGeo = new THREE.TorusGeometry(0.0082, 0.0016, 8, 18, Math.PI * 1.12);
      helixGeo.rotateZ(Math.PI / 2 + (dir > 0 ? 0.14 : -0.14));
      helixGeo.scale(0.48, 1.10, 0.88);
      const helixMesh = new THREE.Mesh(helixGeo, this.bodyMaterial);
      helixMesh.position.set(dir * 0.0012, 0.002, -0.001);
      helixMesh.castShadow = true;
      earGroup.add(helixMesh);

      // Dái tai mềm mại (Ear Lobe)
      const lobeGeo = new THREE.SphereGeometry(0.0032, 10, 8);
      lobeGeo.scale(0.38, 0.85, 0.60);
      const lobeMesh = new THREE.Mesh(lobeGeo, this.bodyMaterial);
      lobeMesh.position.set(dir * 0.0006, -0.008, 0.001);
      lobeMesh.castShadow = true;
      earGroup.add(lobeMesh);

      headContainer.add(earGroup);
    });

    // 3. Khớp xoay đáy sọ (Skull Base Socket)
    const skullSocketGeo = new THREE.SphereGeometry(0.025, 24, 18);
    const skullSocket = new THREE.Mesh(skullSocketGeo, this.jointMaterial);
    skullSocket.position.set(0, -0.042, -0.004);
    headContainer.add(skullSocket);

    this.headBone.add(headContainer);
  }

  /**
   * Generates a realistic, exquisitely sculpted human male head geometry matching the reference model.
   * - Eliminates bird-beak over-projection: nose, lips, and chin share the classic aesthetic E-line.
   * - Forehead is upright and anatomically arched.
   * - Deep-set orbital eye cavities with natural eyelid forms.
   * - Chiseled straight nasal bridge with refined tip and alae.
   * - Expressive lips (Cupid's bow, lower lip cushion, labiomental crease).
   * - Strong, masculine, rounded-square chin.
   * - Seamless nape contouring directly into the neck cylinder.
   */
  private createUnifiedSculptedHeadGeometry(): THREE.BufferGeometry {
    const geo = new THREE.SphereGeometry(1, 84, 68);
    const pos = geo.attributes.position;

    const yCenter = 0.012;
    const rYTop = 0.064; // Đỉnh sọ y = 0.076m
    const rYBot = 0.060; // Đáy cằm y = -0.048m

    const rXBase = 0.057; // Bán kính ngang sọ = 5.7cm (rộng 11.4cm)
    const rZFront = 0.056; // Chiều sâu mặt trước = 5.6cm
    const rZBack = 0.072;  // Chiều sâu gáy sau = 7.2cm

    for (let k = 0; k < pos.count; k++) {
      const x0 = pos.getX(k);
      const y0 = pos.getY(k);
      const z0 = pos.getZ(k);

      let y: number;
      if (y0 >= 0) {
        y = yCenter + y0 * rYTop;
        if (z0 < 0) y += y0 * 0.003; // Đỉnh sọ dốc nhẹ về sau
      } else {
        const tLow = -y0;
        y = yCenter - tLow * rYBot;
      }

      // Hộp sọ dáng quả trứng chuẩn giải phẫu (thuôn trán trước, nở rộng xương đỉnh phía sau)
      const crWidth = rXBase * (1.0 - 0.09 * Math.max(0, z0));
      let px = x0 * crWidth;
      let pz = z0 * (z0 >= 0 ? rZFront : rZBack);

      // Vát phẳng thái dương mềm mại (Loomis temporal planes) - dùng hàm mượt, không tạo gờ ngấn
      const templeT = Math.max(0, Math.min(1, (Math.abs(x0) - 0.35) / 0.35));
      const templeY = Math.max(0, Math.sin(Math.max(0, Math.min(1, (y0 + 0.1) / 0.8)) * Math.PI));
      const templeZ = Math.max(0, z0 + 0.3);
      px *= 1.0 - templeT * templeY * Math.min(1, templeZ) * 0.10;

      // =======================================================================
      // CHI TIẾT KHUÔN MẶT ĐIÊU KHẮC (Theo sát tượng mẫu tham chiếu)
      // =======================================================================
      if (z0 > 0.15) {
        // 1. CUNG MÀY & ẤN ĐƯỜNG (Supraorbital Ridge & Glabella)
        const browDist = (y - 0.029) / 0.010;
        if (Math.abs(browDist) < 1.0) {
          const browYFactor = Math.cos(browDist * Math.PI * 0.5);
          const browArch = Math.sin(Math.min(1.0, Math.abs(x0) / 0.45) * Math.PI);
          pz += browYFactor * (0.0032 + 0.0022 * browArch) * Math.max(0, z0);
        }

        // 2. HỐC MẮT & MÍ MẮT (Orbital Sockets & Eyelids - Lõm sâu tự nhiên)
        if (y >= 0.010 && y <= 0.027 && Math.abs(px) >= 0.014 && Math.abs(px) <= 0.042) {
          const ex = (Math.abs(px) - 0.028) / 0.014;
          const ey = (y - 0.018) / 0.008;
          const eR2 = ex * ex + ey * ey;
          if (eR2 < 1.0) {
            const socketDepth = Math.cos(Math.sqrt(eR2) * Math.PI * 0.5);
            pz -= socketDepth * 0.0055;
            if (eR2 < 0.45) {
              const lid = Math.cos((Math.sqrt(eR2) / Math.sqrt(0.45)) * Math.PI * 0.5);
              pz += lid * 0.0032;
            }
          }
        }

        // 3. SỐNG MŨI CHUẨN TỈ LỆ (Chiseled Nasal Bridge - KHÔNG BỊ MỎ CHIM)
        if (y >= -0.001 && y <= 0.025) {
          const noseT = (y - (-0.001)) / 0.026;
          const noseHalfW = 0.0040 + Math.pow(1.0 - noseT, 1.2) * 0.0055;
          const noseXRatio = Math.abs(px) / noseHalfW;
          if (noseXRatio < 1.0) {
            const noseCross = Math.cos(noseXRatio * Math.PI * 0.5);
            const tipBell = Math.sin((1.0 - noseT) * Math.PI * 0.78);
            const noseHeight = 0.0025 + tipBell * 0.0090;
            pz += noseHeight * noseCross;
          }
        }

        // 4. GÒ MÁ (Zygomatic Arches)
        if (y >= -0.004 && y <= 0.022 && Math.abs(px) >= 0.028 && Math.abs(px) <= 0.052) {
          const cy = Math.sin(((y - (-0.004)) / 0.026) * Math.PI);
          const cx = Math.sin(((Math.abs(px) - 0.028) / 0.024) * Math.PI);
          pz += cy * cx * 0.0028;
        }

        // 5. RÃNH NHÂN TRUNG (Philtrum)
        if (y >= -0.010 && y <= 0.001 && Math.abs(px) < 0.0038) {
          pz -= 0.0014 * Math.cos((px / 0.0038) * Math.PI * 0.5);
        }

        // 6. MÔI TRÊN & MÔI DƯỚI (Harmonious Lips - Cân bằng tuyệt đối với mũi)
        // Môi trên cong nhẹ hình cánh cung Cupid
        if (y >= -0.016 && y <= -0.007 && Math.abs(px) < 0.018) {
          const uy = Math.sin(((y - (-0.016)) / 0.009) * Math.PI);
          const ux = Math.cos((px / 0.018) * Math.PI * 0.5);
          pz += uy * ux * 0.0050;
        }
        // Rãnh khóe miệng
        if (Math.abs(y - (-0.0165)) < 0.0015 && Math.abs(px) < 0.018) {
          pz -= 0.0018 * Math.cos((px / 0.018) * Math.PI * 0.5);
        }
        // Môi dưới mềm đệm
        if (y >= -0.026 && y <= -0.017 && Math.abs(px) < 0.017) {
          const ly = Math.sin(((y - (-0.026)) / 0.009) * Math.PI);
          const lx = Math.cos((px / 0.017) * Math.PI * 0.5);
          pz += ly * lx * 0.0052;
        }
        // Hõm dưới môi (Labiomental Groove)
        if (y >= -0.034 && y <= -0.025 && Math.abs(px) < 0.020) {
          const gy = Math.sin(((y - (-0.034)) / 0.009) * Math.PI);
          const gx = Math.cos((px / 0.020) * Math.PI * 0.5);
          pz -= gy * gx * 0.0028;
        }

        // 7. CẰM CHỮ ĐIỀN NAM TÍNH (Square Chin - Nhô ra trước ngang hàng với môi)
        if (y >= -0.048 && y <= -0.030 && Math.abs(px) < 0.024) {
          const chinY = Math.sin(((y - (-0.048)) / 0.018) * Math.PI);
          const chinX = Math.cos((px / 0.024) * Math.PI * 0.5);
          pz += chinY * chinX * 0.0070;
          px *= 1.0 + chinY * 0.05;
        }

        // 8. GÓC HÀM V-LINE (Mandibular Arch)
        if (y < 0.005) {
          const jawProg = Math.min(1.0, (0.005 - y) / 0.050);
          px *= 1.0 - Math.pow(jawProg, 1.1) * 0.35;
        }
      } else {
        // =====================================================================
        // BACK OF HEAD & NAPE (Gáy sau và chân cổ)
        // =====================================================================
        if (y < 0.005) {
          const napeProg = Math.min(1.0, (0.005 - y) / 0.050);
          const napeDepth = rZBack - Math.pow(napeProg, 1.1) * 0.028; // 0.072 -> 0.044m
          const napeWidth = rXBase - Math.pow(napeProg, 1.1) * 0.015; // 0.057 -> 0.042m
          pz = z0 * napeDepth;
          px = x0 * napeWidth;
          if (z0 < -0.75) {
            pz += Math.sin(napeProg * Math.PI) * 0.0022;
          }
        }
      }

      pos.setXYZ(k, px, y, pz);
    }

    geo.computeVertexNormals();
    return geo;
  }

  // ===========================================================================
  // 2. NECK: Proportional Stem & Muscular Contour (Cổ lực lưỡng, tỉ lệ chuẩn người thật)
  // ===========================================================================
  private buildNeck() {
    const neckTopBallGeo = new THREE.SphereGeometry(0.024, 24, 20);
    const neckTopBall = new THREE.Mesh(neckTopBallGeo, this.jointMaterial);
    neckTopBall.position.set(0, 0.050, 0);
    neckTopBall.castShadow = true;
    this.neckBone.add(neckTopBall);

    // Cổ cơ bắp thể thao ngắn gọn (cao 5.5cm, không còn bị dài như hươu)
    const neckStemGeo = new THREE.CylinderGeometry(0.041, 0.049, 0.055, 32);
    neckStemGeo.scale(0.96, 1.0, 1.12);
    const neckStem = new THREE.Mesh(neckStemGeo, this.bodyMaterial);
    neckStem.position.set(0, 0.024, -0.003);
    neckStem.rotation.x = 0.04;
    neckStem.castShadow = true;
    neckStem.receiveShadow = true;
    this.neckBone.add(neckStem);

    const neckBaseBallGeo = new THREE.SphereGeometry(0.028, 24, 18);
    const neckBaseBall = new THREE.Mesh(neckBaseBallGeo, this.jointMaterial);
    neckBaseBall.position.set(0, 0, 0);
    this.neckBone.add(neckBaseBall);
  }

  // ===========================================================================
  // 3. TORSO: Seamless Trapezius Slope & Heroic Pectorals (Cổ vuốt xuống vai liền mạch)
  // ===========================================================================
  private buildTorso() {
    // Collar Rim
    const collarRimGeo = new THREE.TorusGeometry(0.046, 0.005, 12, 32);
    collarRimGeo.rotateX(Math.PI / 2);
    collarRimGeo.scale(0.96, 1.04, 1.0);
    const collarRim = new THREE.Mesh(collarRimGeo, this.jointMaterial);
    collarRim.position.set(0, 0.170, 0);
    this.chestBone.add(collarRim);

    // Seamless Anatomical Chest Shell
    const chestShellGeo = this.createSeamlessAthleticChestGeometry();
    const chestShell = new THREE.Mesh(chestShellGeo, this.bodyMaterial);
    chestShell.castShadow = true;
    chestShell.receiveShadow = true;
    this.chestBone.add(chestShell);

    // Sculpted Athletic Male Abdomen (Lồng sâu vào ngực và khung chậu, cơ bụng 6 múi chìm tự nhiên, không vòng lơ lửng)
    const abdomenGeo = this.createSculptedAbdomenGeometry();
    const abdomenMesh = new THREE.Mesh(abdomenGeo, this.bodyMaterial);
    abdomenMesh.castShadow = true;
    abdomenMesh.receiveShadow = true;
    this.waistBone.add(abdomenMesh);
  }

  /**
   * Generates a sleek, athletic male abdomen with subtle anatomical 6-pack tone.
   * Completely eliminates floating rings and glued box bricks.
   */
  private createSculptedAbdomenGeometry(): THREE.BufferGeometry {
    const V = 20;
    const U = 36;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    for (let v = 0; v <= V; v++) {
      const vFrac = v / V;
      // y spans from 0.000 (deep inside pelvis) up to 0.160 (deep inside chest)
      const y = vFrac * 0.160;

      for (let u = 0; u <= U; u++) {
        const uFrac = u / U;
        const theta = uFrac * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const absSin = Math.abs(sinT);

        // Athletic V-taper waist contour
        let rX = 0.092;
        let rZ = 0.070;

        if (y > 0.060) {
          const topT = (y - 0.060) / 0.100;
          rX = 0.092 + topT * 0.018; // 0.092 -> 0.110 (widening into ribcage)
          rZ = 0.070 + topT * 0.012; // 0.070 -> 0.082
        } else {
          const botT = (0.060 - y) / 0.060;
          rX = 0.092 + botT * 0.004; // 0.092 -> 0.096 (fitting pelvis)
          rZ = 0.070 + botT * 0.006; // 0.070 -> 0.076
        }

        let px = sinT * rX;
        let pz = cosT * rZ;

        // Subtle sculpted male 6-pack abs on anterior wall
        if (cosT > 0 && y >= 0.025 && y <= 0.145 && absSin <= 0.55) {
          // Central linea alba groove
          const centerGroove = Math.min(1.0, absSin / 0.05);
          // 3 tiers of abdominal packs
          const absTier = Math.sin(((y - 0.025) / 0.120) * Math.PI * 3);
          const absPack = Math.max(0, absTier) * Math.sin((absSin / 0.55) * Math.PI);
          pz += centerGroove * absPack * 0.004;
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

        indices.push(i0, i1, i2);
        indices.push(i1, i3, i2);
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
   * Generates a seamless athletic chest with a natural, gentle trapezius slope.
   * Flows smoothly from the neck collar down to the shoulder sockets.
   * Eliminates pagoda tenting, creates heroic clavicle & pectoral contours.
   */
  private createSeamlessAthleticChestGeometry(): THREE.BufferGeometry {
    const V = 36;
    const U = 48;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    for (let v = 0; v <= V; v++) {
      const vFrac = v / V;

      for (let u = 0; u <= U; u++) {
        const uFrac = u / U;
        const theta = uFrac * Math.PI * 2;
        const cosT = Math.cos(theta); // >0 front, <0 back
        const sinT = Math.sin(theta); // <0 left, >0 right
        const absSin = Math.abs(sinT);

        let px: number;
        let py: number;
        let pz: number;

        if (vFrac <= 0.55) {
          // ===================================================================
          // ZONE 1: Lower to Mid Torso (Thân ngực chữ V thuôn mượt, đáy cuộn êm)
          // ===================================================================
          const t1 = vFrac / 0.55; // 0 -> 1
          py = -0.025 + t1 * 0.140; // -0.025 -> 0.115

          let rX: number;
          let rZ: number;

          if (t1 < 0.18) {
            // Mép đáy bo tròn cuộn vào trong ôm khít lấy bụng
            const rimT = t1 / 0.18;
            const s = Math.sin((rimT * Math.PI) / 2);
            rX = 0.099 + s * 0.007; // 0.099 -> 0.106
            rZ = 0.073 + s * 0.005; // 0.073 -> 0.078
          } else {
            // V-taper nở rộng dần lên trên mượt mà
            const wT = (t1 - 0.18) / 0.82;
            const curve = Math.sin((wT * Math.PI) / 2);
            rX = 0.106 + curve * 0.031; // 0.106 -> 0.137
            rZ = 0.078 + curve * 0.011; // 0.078 -> 0.089
          }

          // Cơ xô (Latissimus Dorsi) xòe nhẹ sang hai bên
          if (t1 > 0.30 && absSin > 0.35) {
            const latT = (t1 - 0.30) / 0.70;
            const latFlare = Math.sin(latT * Math.PI) * (absSin - 0.35) * 0.008;
            rX += latFlare;
          }

          px = sinT * rX;
          pz = cosT * rZ;

          // Cơ ngực mềm mại, mài mòn phẳng mịn, không nếp gờ (Ultra-soft, organic)
          if (cosT > 0 && py >= 0.030 && py <= 0.115 && absSin >= 0.05 && absSin <= 0.80) {
            const normX = (absSin - 0.05) / 0.75;
            const sternum = Math.sin(Math.min(1.0, normX / 0.15) * Math.PI * 0.5);
            const normY = (py - 0.030) / 0.085;
            const pecBulge = Math.sin(normY * Math.PI) * Math.sin(normX * Math.PI);
            pz += sternum * pecBulge * 0.0035; // Rất êm ái, chỉ 3.5mm nâng nhẹ tự nhiên
          }
        } else if (vFrac <= 0.75) {
          // ===================================================================
          // ZONE 2: Rounded Shoulder Dome / Fillet (Bo tròn vai ngực mềm mại)
          // XÓA BỎ HOÀN TOÀN GỜ ĐĨA PHẲNG 90 ĐỘ CŨ
          // ===================================================================
          const t2 = (vFrac - 0.55) / 0.20; // 0 -> 1
          const alpha = t2 * (Math.PI / 2); // 0 -> PI/2
          const sinA = Math.sin(alpha);
          const cosA = Math.cos(alpha);

          // Vòm cong bo tròn liên tục góc 90 độ (fillet) nối thẳng thân ngực lên quai xanh
          py = 0.115 + sinA * 0.028; // 0.115 -> 0.143
          const curRX = 0.137 - (1.0 - cosA) * 0.026; // 0.137 -> 0.111
          const curRZ = 0.089 - (1.0 - cosA) * 0.017; // 0.089 -> 0.072

          px = sinT * curRX;
          pz = cosT * curRZ;
        } else {
          // ===================================================================
          // ZONE 3: Trapezius Slope to Neck Collar (Cổ xuôi tự nhiên)
          // ===================================================================
          const t3 = (vFrac - 0.75) / 0.25; // 0 -> 1
          const smoothT = t3 * t3 * (3 - 2 * t3);

          const curRX = 0.111 - smoothT * 0.065; // 0.111 -> 0.046
          const curRZ = 0.072 - smoothT * 0.024; // 0.072 -> 0.048

          px = sinT * curRX;
          pz = cosT * curRZ;

          const baseHeight = 0.143 + smoothT * 0.027; // 0.143 -> 0.170
          const frontDip = (cosT > 0 ? cosT * (1 - absSin) * 0.005 : 0) * smoothT;
          const backRise = (cosT < 0 ? -cosT * 0.004 : 0) * smoothT;

          py = baseHeight - frontDip + backRise;
        }

        positions.push(px, py, pz);
        uvs.push(uFrac, vFrac);
      }
    }

    for (let v = 0; v < V; v++) {
      for (let u = 0; u < U; u++) {
        const i0 = v * (U + 1) + u;
        const i1 = i0 + 1;
        const i2 = (v + 1) * (U + 1) + u;
        const i3 = i2 + 1;

        indices.push(i0, i1, i2);
        indices.push(i1, i3, i2);
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
   * Generates a single, continuous, anatomically sculpted upper arm geometry.
   * Features:
   * 1. Deltoid muscle cap that is streamlined and athletic (less round, no sharp horns).
   * 2. 100% seamless transition from deltoid down into bicep and tricep (zero gaps/cuts).
   * 3. Perfectly flush with the shoulder socket and trapezius slope.
   */
  private createSculptedUpperArmGeometry(dir: number): THREE.BufferGeometry {
    const NY = 28;
    const NU = 32;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    const yTop = 0.008;
    const yBottom = -0.220;

    for (let i = 0; i <= NY; i++) {
      const t = i / NY;
      const y = yTop - t * (yTop - yBottom);

      let rX_lat: number;
      let rX_med: number;
      let rZ_ant: number;
      let rZ_pos: number;

      if (t <= 0.15) {
        // 1. Shoulder Deltoid Crown (y from +0.008 to -0.026)
        const capT = t / 0.15;
        const s = Math.sin((capT * Math.PI) / 2);
        rX_lat = Math.max(0.002, s * 0.038);
        rX_med = Math.max(0.002, s * 0.028);
        rZ_ant = Math.max(0.002, s * 0.033);
        rZ_pos = Math.max(0.002, s * 0.033);
      } else if (t <= 0.40) {
        // 2. Deltoid Muscle Belly (y from -0.026 to -0.083)
        const deltT = (t - 0.15) / 0.25;
        const bulge = Math.sin(deltT * Math.PI);
        rX_lat = 0.038 + bulge * 0.002 - deltT * 0.006;
        rX_med = 0.028 - deltT * 0.002;
        rZ_ant = 0.033 - deltT * 0.002;
        rZ_pos = 0.033 - deltT * 0.002;
      } else if (t <= 0.75) {
        // 3. Seamless Transition into Bicep & Tricep (y from -0.083 to -0.163)
        const armT = (t - 0.40) / 0.35;
        rX_lat = 0.032 - armT * 0.006;
        rX_med = 0.026 - armT * 0.002;
        const bicepBulge = Math.sin(armT * Math.PI);
        rZ_ant = 0.031 + bicepBulge * 0.003 - armT * 0.007;
        rZ_pos = 0.031 + bicepBulge * 0.002 - armT * 0.007;
      } else {
        // 4. Supracondylar Taper down to Elbow (y from -0.163 to -0.220) - Bo tròn thu nhỏ ôm lấy cùi chỏ
        const elbowT = (t - 0.75) / 0.25;
        rX_lat = 0.026 - elbowT * 0.007; // 0.026 -> 0.019
        rX_med = 0.024 - elbowT * 0.005; // 0.024 -> 0.019
        rZ_ant = 0.024 - elbowT * 0.005; // 0.024 -> 0.019
        rZ_pos = 0.024 - elbowT * 0.005; // 0.024 -> 0.019
      }

      for (let j = 0; j <= NU; j++) {
        const uFrac = j / NU;
        const phi = uFrac * Math.PI * 2;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);

        let px: number;
        if (dir > 0) {
          px = sinP * (sinP >= 0 ? rX_lat : rX_med);
        } else {
          px = sinP * (sinP <= 0 ? rX_lat : rX_med);
        }

        const pz = cosP * (cosP >= 0 ? rZ_ant : rZ_pos);

        positions.push(px, y, pz);
        uvs.push(uFrac, t);
      }
    }

    for (let i = 0; i < NY; i++) {
      for (let j = 0; j < NU; j++) {
        const i0 = i * (NU + 1) + j;
        const i1 = i0 + 1;
        const i2 = (i + 1) * (NU + 1) + j;
        const i3 = i2 + 1;

        indices.push(i0, i1, i2);
        indices.push(i1, i3, i2);
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
   * Generates an anatomically sculpted forearm geometry with smooth inward-rounded elbow socket.
   * Eliminates the sharp flat "gauntlet/boot" rim completely.
   */
  private createSculptedForearmGeometry(dir: number): THREE.BufferGeometry {
    const NY = 24;
    const NU = 24;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    const yTop = 0.000;
    const yBottom = -0.200;

    for (let i = 0; i <= NY; i++) {
      const t = i / NY;
      const y = yTop - t * (yTop - yBottom);

      let rX_lat: number;
      let rX_med: number;
      let rZ_ant: number;
      let rZ_pos: number;

      if (t <= 0.15) {
        // 1. Inward-rounded Elbow Rim (y from 0.000 down to -0.030)
        // Bo tròn miệng khớp cùi chỏ vào trong ôm khít trục khớp, triệt tiêu gờ phẳng như vành ủng
        const rimT = t / 0.15;
        const s = Math.sin((rimT * Math.PI) / 2);
        rX_lat = 0.019 + s * 0.008; // 0.019 -> 0.027
        rX_med = 0.019 + s * 0.007; // 0.019 -> 0.026
        rZ_ant = 0.019 + s * 0.008; // 0.019 -> 0.027
        rZ_pos = 0.019 + s * 0.008; // 0.019 -> 0.027
      } else if (t <= 0.45) {
        // 2. Forearm Belly & Brachioradialis (y from -0.030 to -0.090)
        const bellyT = (t - 0.15) / 0.30;
        const bulge = Math.sin(bellyT * Math.PI);
        rX_lat = 0.027 + bulge * 0.002;
        rX_med = 0.026;
        rZ_ant = 0.027 + bulge * 0.003;
        rZ_pos = 0.027;
      } else if (t <= 0.80) {
        // 3. Mid Forearm Taper (y from -0.090 to -0.160)
        const midT = (t - 0.45) / 0.35;
        rX_lat = 0.027 - midT * 0.007; // 0.027 -> 0.020
        rX_med = 0.026 - midT * 0.007; // 0.026 -> 0.019
        rZ_ant = 0.027 - midT * 0.008; // 0.027 -> 0.019
        rZ_pos = 0.027 - midT * 0.008; // 0.027 -> 0.019
      } else {
        // 4. Wrist Taper (y from -0.160 to -0.200)
        const wrtT = (t - 0.80) / 0.20;
        rX_lat = 0.020 - wrtT * 0.004; // 0.020 -> 0.016
        rX_med = 0.019 - wrtT * 0.003; // 0.019 -> 0.016
        rZ_ant = 0.019 - wrtT * 0.004; // 0.019 -> 0.015
        rZ_pos = 0.019 - wrtT * 0.004; // 0.019 -> 0.015
      }

      for (let j = 0; j <= NU; j++) {
        const uFrac = j / NU;
        const phi = uFrac * Math.PI * 2;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);

        let px: number;
        if (dir > 0) {
          px = sinP * (sinP >= 0 ? rX_lat : rX_med);
        } else {
          px = sinP * (sinP <= 0 ? rX_lat : rX_med);
        }

        const pz = cosP * (cosP >= 0 ? rZ_ant : rZ_pos);

        positions.push(px, y, pz);
        uvs.push(uFrac, t);
      }
    }

    for (let i = 0; i < NY; i++) {
      for (let j = 0; j < NU; j++) {
        const i0 = i * (NU + 1) + j;
        const i1 = i0 + 1;
        const i2 = (i + 1) * (NU + 1) + j;
        const i3 = i2 + 1;

        indices.push(i0, i1, i2);
        indices.push(i1, i3, i2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  // ===========================================================================
  // 4. ARMS: Seamless Sculpted Upper Arm (Liền mạch với tay, cơ vai thon gọn thể thao)
  // ===========================================================================
  private buildArms() {
    [-1, 1].forEach((dir) => {
      const upperArmBone = dir < 0 ? this.leftUpperArm : this.rightUpperArm;
      const elbowGroup = dir < 0 ? this.leftElbow : this.rightElbow;
      const forearmBone = dir < 0 ? this.leftForearm : this.rightForearm;
      const handGroup = dir < 0 ? this.leftHand : this.rightHand;

      upperArmBone.rotation.z = dir * 0.08;
      upperArmBone.rotation.x = 0.0;

      // =======================================================================
      // UNIFIED SCULPTED UPPER ARM (LIỀN MẠCH VỚI TAY, KHÔNG BỊ TRÒN QUÁ)
      // =======================================================================
      const upperArmGeo = this.createSculptedUpperArmGeometry(dir);
      const upperArmMesh = new THREE.Mesh(upperArmGeo, this.bodyMaterial);
      upperArmMesh.castShadow = true;
      upperArmMesh.receiveShadow = true;
      upperArmBone.add(upperArmMesh);

      // Đĩa đáy bịt kín cùi chỏ (Elbow end cap - bo tròn vừa khít khớp)
      const armEndCapGeo = new THREE.CircleGeometry(0.019, 20);
      armEndCapGeo.rotateX(Math.PI / 2);
      const armEndCap = new THREE.Mesh(armEndCapGeo, this.jointMaterial);
      armEndCap.position.set(0, -0.220, 0);
      upperArmBone.add(armEndCap);

      // Double-Joint Elbow
      const hingeLinkGeo = new THREE.BoxGeometry(0.026, 0.028, 0.022);
      const hingeLink = new THREE.Mesh(hingeLinkGeo, this.jointMaterial);
      elbowGroup.add(hingeLink);

      [-0.011, 0.011].forEach((yPos) => {
        const discGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.030, 20);
        discGeo.rotateZ(Math.PI / 2);
        const disc = new THREE.Mesh(discGeo, this.jointMaterial);
        disc.position.set(0, yPos, 0);
        elbowGroup.add(disc);

        const rivetGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.033, 14);
        rivetGeo.rotateZ(Math.PI / 2);
        const rivet = new THREE.Mesh(rivetGeo, this.accentMaterial);
        rivet.position.set(0, yPos, 0);
        elbowGroup.add(rivet);
      });

      // Sculpted Forearm Block (Bo tròn miệng khớp cùi chỏ vào trong, không còn gờ phẳng như vành ủng)
      forearmBone.rotation.x = 0.06;

      const forearmGeo = this.createSculptedForearmGeometry(dir);
      const forearmMesh = new THREE.Mesh(forearmGeo, this.bodyMaterial);
      forearmMesh.castShadow = true;
      forearmMesh.receiveShadow = true;
      forearmBone.add(forearmMesh);

      const forearmSeamGeo = new THREE.TorusGeometry(0.018, 0.0025, 10, 24);
      forearmSeamGeo.rotateX(Math.PI / 2);
      const forearmSeam = new THREE.Mesh(forearmSeamGeo, this.jointMaterial);
      forearmSeam.position.set(0, -0.165, 0);
      forearmBone.add(forearmSeam);

      const wristBallGeo = new THREE.SphereGeometry(0.012, 20, 16);
      const wristBall = new THREE.Mesh(wristBallGeo, this.jointMaterial);
      wristBall.position.set(0, -0.195, 0);
      wristBall.castShadow = true;
      forearmBone.add(wristBall);

      // Hand
      handGroup.rotation.y = dir * 0.30;

      const palmGeo = new THREE.BoxGeometry(0.034, 0.044, 0.015);
      const palm = new THREE.Mesh(palmGeo, this.bodyMaterial);
      palm.position.set(0, -0.022, 0);
      palm.castShadow = true;
      handGroup.add(palm);

      const thenarGeo = new THREE.SphereGeometry(0.014, 14, 12);
      thenarGeo.scale(0.8, 1.1, 0.7);
      const thenar = new THREE.Mesh(thenarGeo, this.bodyMaterial);
      thenar.position.set(dir * -0.013, -0.017, 0.007);
      thenar.castShadow = true;
      handGroup.add(thenar);

      const thumbRoot = new THREE.Group();
      thumbRoot.position.set(dir * -0.016, -0.014, 0.008);
      thumbRoot.rotation.set(0.35, 0, dir * 0.55);

      const t1Geo = new THREE.CapsuleGeometry(0.0050, 0.013, 8, 12);
      const t1 = new THREE.Mesh(t1Geo, this.bodyMaterial);
      t1.position.set(0, -0.006, 0);
      t1.castShadow = true;
      thumbRoot.add(t1);

      const t2Geo = new THREE.CapsuleGeometry(0.0044, 0.011, 8, 12);
      const t2 = new THREE.Mesh(t2Geo, this.bodyMaterial);
      t2.position.set(0, -0.017, 0.003);
      t2.rotation.x = 0.25;
      t2.castShadow = true;
      thumbRoot.add(t2);

      handGroup.add(thumbRoot);

      const fingerSpacings = [-0.011, -0.004, 0.004, 0.011];
      const fingerLengths = [0.028, 0.032, 0.030, 0.024];

      fingerSpacings.forEach((fX, fIdx) => {
        const totalLen = fingerLengths[fIdx];
        const seg1Len = totalLen * 0.55;
        const seg2Len = totalLen * 0.45;

        const fingerRoot = new THREE.Group();
        fingerRoot.position.set(fX, -0.044, 0.003);
        fingerRoot.rotation.x = 0.20 + fIdx * 0.03;

        const f1Geo = new THREE.CapsuleGeometry(0.0040, seg1Len, 8, 12);
        const f1 = new THREE.Mesh(f1Geo, this.bodyMaterial);
        f1.position.set(0, -seg1Len / 2, 0);
        f1.castShadow = true;
        fingerRoot.add(f1);

        const f2Geo = new THREE.CapsuleGeometry(0.0034, seg2Len, 8, 12);
        const f2 = new THREE.Mesh(f2Geo, this.bodyMaterial);
        f2.position.set(0, -seg1Len - seg2Len / 2, 0.003);
        f2.rotation.x = 0.18;
        f2.castShadow = true;
        fingerRoot.add(f2);

        handGroup.add(fingerRoot);
      });
    });
  }

  // ===========================================================================
  // 5. HIPS & LEGS: Powerful Muscular Thighs (Đùi To Khỏe, Cơ Tứ Đầu Nở Nang)
  // ===========================================================================
  private buildHipsAndLegs() {
    // Solid Anatomical Pelvis Shell
    const pelvisShellGeo = this.createSolidBikiniPelvisGeometry();
    const pelvisMesh = new THREE.Mesh(pelvisShellGeo, this.bodyMaterial);
    pelvisMesh.castShadow = true;
    pelvisMesh.receiveShadow = true;
    this.pelvisBone.add(pelvisMesh);

    // Build Each Leg with SCULPTED SEAMLESS THIGHS & MASCULINE STANCE
    [-1, 1].forEach((dir) => {
      const thighBone = dir < 0 ? this.leftThigh : this.rightThigh;
      const kneeGroup = dir < 0 ? this.leftKnee : this.rightKnee;
      const shinBone = dir < 0 ? this.leftShin : this.rightShin;
      const footGroup = dir < 0 ? this.leftFoot : this.rightFoot;

      // Dáng đứng con trai dạng 2 chân ra (Heroic Athletic Stance: đùi nghiêng ra ngoài)
      thighBone.rotation.z = dir * 0.075;

      // =======================================================================
      // UNIFIED SCULPTED THIGH (ĐÙI ĐÚC LIỀN NỞ NANG, TO HƠN TAY 20%+)
      // =======================================================================
      const thighGeo = this.createSculptedThighGeometry(dir);
      const thighMesh = new THREE.Mesh(thighGeo, this.bodyMaterial);
      thighMesh.castShadow = true;
      thighMesh.receiveShadow = true;
      thighBone.add(thighMesh);

      // Đĩa đáy bịt kín đầu gối (Knee end cap - bo tròn thu gọn)
      const thighEndCapGeo = new THREE.CircleGeometry(0.028, 22);
      thighEndCapGeo.rotateX(Math.PI / 2);
      const thighEndCap = new THREE.Mesh(thighEndCapGeo, this.jointMaterial);
      thighEndCap.position.set(0, -0.300, 0);
      thighBone.add(thighEndCap);

      // Double-Joint Knee
      const kneeLinkGeo = new THREE.BoxGeometry(0.038, 0.032, 0.030);
      const kneeLink = new THREE.Mesh(kneeLinkGeo, this.jointMaterial);
      kneeGroup.add(kneeLink);

      [-0.012, 0.012].forEach((yPos) => {
        const discGeo = new THREE.CylinderGeometry(0.019, 0.019, 0.040, 22);
        discGeo.rotateZ(Math.PI / 2);
        const disc = new THREE.Mesh(discGeo, this.jointMaterial);
        disc.position.set(0, yPos, 0);
        kneeGroup.add(disc);

        const rivetGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.044, 14);
        rivetGeo.rotateZ(Math.PI / 2);
        const rivet = new THREE.Mesh(rivetGeo, this.accentMaterial);
        rivet.position.set(0, yPos, 0);
        kneeGroup.add(rivet);
      });

      // Floating Patella Shield
      const patellaGeo = new THREE.BoxGeometry(0.032, 0.038, 0.014);
      const patella = new THREE.Mesh(patellaGeo, this.bodyMaterial);
      patella.position.set(0, 0, 0.018);
      patella.castShadow = true;
      kneeGroup.add(patella);

      // Sculpted Calf Block (Bo tròn miệng khớp gối vào trong, ôm khít đầu gối, triệt tiêu hoàn toàn vành ống ủng)
      const calfGeo = this.createSculptedCalfGeometry(dir);
      const calfMesh = new THREE.Mesh(calfGeo, this.bodyMaterial);
      calfMesh.castShadow = true;
      calfMesh.receiveShadow = true;
      shinBone.add(calfMesh);

      const ankleBallGeo = new THREE.SphereGeometry(0.016, 22, 18);
      const ankleBall = new THREE.Mesh(ankleBallGeo, this.jointMaterial);
      ankleBall.position.set(0, -0.295, 0);
      ankleBall.castShadow = true;
      shinBone.add(ankleBall);

      [-1, 1].forEach((mDir) => {
        const malleolusGeo = new THREE.SphereGeometry(0.009, 12, 10);
        malleolusGeo.scale(0.6, 0.9, 0.8);
        const malleolus = new THREE.Mesh(malleolusGeo, this.jointMaterial);
        malleolus.position.set(mDir * 0.018, -0.295, 0);
        shinBone.add(malleolus);
      });

      // Anatomical Foot & Ankle
      // Đứng dáng tự tin: mũi chân xoay nhẹ ra ngoài (toe-out) và counter-rotate Z để lòng bàn chân phẳng sàn
      footGroup.rotation.y = dir * 0.07;
      footGroup.rotation.z = dir * -0.075;

      const footSocketGeo = new THREE.CylinderGeometry(0.016, 0.018, 0.010, 20);
      const footSocket = new THREE.Mesh(footSocketGeo, this.jointMaterial);
      footSocket.position.set(0, 0.005, 0);
      footGroup.add(footSocket);

      // Sculpted Anatomical Foot (Gót tròn, mu xuôi, lòng bàn chân phẳng sàn, mũi chân tròn tự nhiên không bị nhọn mỏ vịt)
      const footGeo = this.createSculptedFootGeometry(dir);
      const footMesh = new THREE.Mesh(footGeo, this.bodyMaterial);
      footMesh.castShadow = true;
      footMesh.receiveShadow = true;
      footGroup.add(footMesh);
    });
  }

  /**
   * Solid Anatomical Pelvis Shell (Bikini Brief)
   * Wraps around the hips and conceals the hip joint with smooth leg openings.
   */
  private createSolidBikiniPelvisGeometry(): THREE.BufferGeometry {
    const V = 24;
    const U = 36;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    for (let v = 0; v <= V; v++) {
      const vFrac = v / V;
      // y spans from -0.065 (crotch bottom) to +0.065 (waist seam)
      const y = -0.065 + vFrac * 0.130;

      for (let u = 0; u <= U; u++) {
        const uFrac = u / U;
        const theta = uFrac * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const absSin = Math.abs(sinT);

        let rX = 0.100;
        let rZ = 0.082;

        if (y < 0.0) {
          // Lower Pelvis & Crotch Taper
          const crotchT = -y / 0.065;
          rX = 0.100 - crotchT * 0.046; // 0.100 -> 0.054
          rZ = 0.082 - crotchT * 0.038; // 0.082 -> 0.044
        } else {
          // Upper Pelvis towards Waist
          const waistT = y / 0.065;
          rX = 0.100 - waistT * 0.005; // 0.100 -> 0.095
          rZ = 0.082 - waistT * 0.004; // 0.082 -> 0.078
        }

        let px = sinT * rX;
        let pz = cosT * rZ;

        // Smooth anatomical bikini leg cut opening (groin crease)
        if (y < 0.020 && absSin > 0.28) {
          const cutT = (0.020 - y) / 0.085;
          const latT = (absSin - 0.28) / 0.72;
          const cutAmt = cutT * Math.sin(latT * Math.PI) * 0.020;
          px -= (sinT > 0 ? 1 : -1) * cutAmt;
        }

        // Gluteal definition on the back
        if (cosT < 0 && y > -0.045 && y < 0.045 && absSin > 0.15 && absSin < 0.85) {
          const gluteY = Math.sin(((y + 0.045) / 0.090) * Math.PI);
          const gluteX = Math.sin(((absSin - 0.15) / 0.70) * Math.PI);
          pz -= gluteY * gluteX * 0.014;
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

        indices.push(i0, i1, i2);
        indices.push(i1, i3, i2);
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
   * Generates an anatomically accurate male thigh geometry (bắp đùi người thật).
   * Features:
   * 1. Realistic S-curve: Tensor fasciae latae & vastus lateralis high on the outside.
   * 2. Prominent Vastus Medialis (cơ giọt nước) low on the inside right above the knee.
   * 3. Forward sweep of the Rectus Femoris.
   * 4. Seamless insertion into the pelvis socket at the top.
   */
  private createSculptedThighGeometry(dir: number): THREE.BufferGeometry {
    const NY = 32;
    const NU = 32;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    const yTop = 0.020;
    const yBottom = -0.300;

    for (let i = 0; i <= NY; i++) {
      const t = i / NY;
      const y = yTop - t * (yTop - yBottom);

      let rX_lat: number;
      let rX_med: number;
      let rZ_ant: number;
      let rZ_pos: number;

      if (t <= 0.12) {
        // 1. Convex Top Dome inserting deep into pelvis (y from +0.020 to -0.018)
        const capT = t / 0.12;
        const s = Math.sin((capT * Math.PI) / 2);
        rX_lat = Math.max(0.002, s * 0.060);
        rX_med = Math.max(0.002, s * 0.046);
        rZ_ant = Math.max(0.002, s * 0.064);
        rZ_pos = Math.max(0.002, s * 0.054);
      } else if (t <= 0.45) {
        // 2. Upper Quadriceps & Vastus Lateralis Bulge (y from -0.018 to -0.124) - ĐÙI TO NỞ NANG HƠN TAY 20%+
        const qT = (t - 0.12) / 0.33;
        const latBulge = Math.sin(qT * Math.PI);
        rX_lat = 0.060 + latBulge * 0.006 - qT * 0.005; // 0.060 -> 0.061
        rX_med = 0.046 - qT * 0.005;                   // 0.046 -> 0.041
        rZ_ant = 0.064 + latBulge * 0.006 - qT * 0.008; // 0.064 -> 0.062 (cơ tứ đầu đùi cuồn cuộn)
        rZ_pos = 0.054 + latBulge * 0.003 - qT * 0.006; // 0.054 -> 0.051 (cơ gân khoeo đùi sau)
      } else if (t <= 0.82) {
        // 3. Mid to Lower Thigh with Vastus Medialis (cơ giọt nước) on the inner side (y from -0.124 to -0.242)
        const midT = (t - 0.45) / 0.37;
        const medTeardrop = Math.sin(Math.pow(midT, 1.4) * Math.PI);
        rX_lat = 0.061 - midT * 0.018; // 0.061 -> 0.043
        rX_med = 0.041 + medTeardrop * 0.007 - midT * 0.009; // Teardrop nở rõ ở mặt trong phía trên đầu gối
        rZ_ant = 0.062 + medTeardrop * 0.004 - midT * 0.018; // 0.062 -> 0.044
        rZ_pos = 0.051 - midT * 0.015; // 0.051 -> 0.036
      } else {
        // 4. Supracondylar Knee Region (y from -0.242 to -0.300) - Bo tròn thu nhỏ ôm khít khớp gối
        const kT = (t - 0.82) / 0.18;
        rX_lat = 0.043 - kT * 0.014; // 0.043 -> 0.029
        rX_med = 0.039 - kT * 0.011; // 0.039 -> 0.028
        rZ_ant = 0.044 - kT * 0.015; // 0.044 -> 0.029
        rZ_pos = 0.036 - kT * 0.008; // 0.036 -> 0.028
      }

      for (let j = 0; j <= NU; j++) {
        const uFrac = j / NU;
        const phi = uFrac * Math.PI * 2;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);

        let px: number;
        if (dir > 0) {
          px = sinP * (sinP >= 0 ? rX_lat : rX_med);
        } else {
          px = sinP * (sinP <= 0 ? rX_lat : rX_med);
        }

        const pz = cosP * (cosP >= 0 ? rZ_ant : rZ_pos);

        positions.push(px, y, pz);
        uvs.push(uFrac, t);
      }
    }

    for (let i = 0; i < NY; i++) {
      for (let j = 0; j < NU; j++) {
        const i0 = i * (NU + 1) + j;
        const i1 = i0 + 1;
        const i2 = (i + 1) * (NU + 1) + j;
        const i3 = i2 + 1;

        indices.push(i0, i1, i2);
        indices.push(i1, i3, i2);
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
   * Generates an anatomically sculpted shin/calf geometry with smooth inward-rounded knee socket.
   * Eliminates the sharp flat "boot cuff" (đi ủng) rim completely.
   */
  private createSculptedCalfGeometry(dir: number): THREE.BufferGeometry {
    const NY = 28;
    const NU = 28;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    const yTop = 0.000;
    const yBottom = -0.300;

    for (let i = 0; i <= NY; i++) {
      const t = i / NY;
      const y = yTop - t * (yTop - yBottom);

      let rX_lat: number;
      let rX_med: number;
      let rZ_ant: number;
      let rZ_pos: number;

      if (t <= 0.12) {
        // 1. Inward-rounded Knee Rim (y from 0.000 down to -0.036)
        // Bo tròn vào trong ôm khít khớp gối, xóa bỏ hoàn toàn vành ống ủng
        const rimT = t / 0.12;
        const s = Math.sin((rimT * Math.PI) / 2); // 0 -> 1 smoothly
        rX_lat = 0.025 + s * 0.014; // 0.025 -> 0.039
        rX_med = 0.025 + s * 0.013; // 0.025 -> 0.038
        rZ_ant = 0.026 + s * 0.013; // 0.026 -> 0.039
        rZ_pos = 0.025 + s * 0.013; // 0.025 -> 0.038
      } else if (t <= 0.45) {
        // 2. Upper Calf & Gastrocnemius Belly (y from -0.036 to -0.135)
        const bellyT = (t - 0.12) / 0.33;
        const bulge = Math.sin(bellyT * Math.PI);
        rX_lat = 0.039 + bulge * 0.003 - bellyT * 0.004; // 0.039 -> 0.038
        rX_med = 0.038 + bulge * 0.002 - bellyT * 0.004; // 0.038 -> 0.036
        rZ_ant = 0.039 - bellyT * 0.002;                 // Tibial crest (xương ống đồng)
        rZ_pos = 0.038 + bulge * 0.006 - bellyT * 0.008; // Bắp chuối nở phía sau
      } else if (t <= 0.80) {
        // 3. Mid to Lower Shin (y from -0.135 to -0.240)
        const midT = (t - 0.45) / 0.35;
        rX_lat = 0.038 - midT * 0.012; // 0.038 -> 0.026
        rX_med = 0.036 - midT * 0.011; // 0.036 -> 0.025
        rZ_ant = 0.037 - midT * 0.011; // 0.037 -> 0.026
        rZ_pos = 0.036 - midT * 0.013; // 0.036 -> 0.023
      } else {
        // 4. Supramalleolar Ankle Taper (y from -0.240 to -0.300)
        const ankT = (t - 0.80) / 0.20;
        rX_lat = 0.026 - ankT * 0.005; // 0.026 -> 0.021
        rX_med = 0.025 - ankT * 0.005; // 0.025 -> 0.020
        rZ_ant = 0.026 - ankT * 0.004; // 0.026 -> 0.022
        rZ_pos = 0.023 - ankT * 0.003; // 0.023 -> 0.020
      }

      for (let j = 0; j <= NU; j++) {
        const uFrac = j / NU;
        const phi = uFrac * Math.PI * 2;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);

        let px: number;
        if (dir > 0) {
          px = sinP * (sinP >= 0 ? rX_lat : rX_med);
        } else {
          px = sinP * (sinP <= 0 ? rX_lat : rX_med);
        }

        const pz = cosP * (cosP >= 0 ? rZ_ant : rZ_pos);

        positions.push(px, y, pz);
        uvs.push(uFrac, t);
      }
    }

    for (let i = 0; i < NY; i++) {
      for (let j = 0; j < NU; j++) {
        const i0 = i * (NU + 1) + j;
        const i1 = i0 + 1;
        const i2 = (i + 1) * (NU + 1) + j;
        const i3 = i2 + 1;

        indices.push(i0, i1, i2);
        indices.push(i1, i3, i2);
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
   * Generates a single, continuous, anatomically sculpted human foot geometry.
   * Features:
   * 1. Rounded calcaneus (heel).
   * 2. High medial arch (vòm chân trong lõm tự nhiên).
   * 3. Slender Achilles tendon transition and sloping dorsum (mu bàn chân).
   * 4. Asymmetric ball of foot and organic toe contour (ngón cái dài hơn, vát đều ngón út).
   * 5. Eliminates boxy Minecraft bricks completely.
   */
  private createSculptedFootGeometry(dir: number): THREE.BufferGeometry {
    const NZ = 26;
    const NU = 28;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    const medialDir = dir > 0 ? -1 : 1;

    for (let k = 0; k <= NZ; k++) {
      const zFrac = k / NZ;

      let zBase: number;
      let rX_lat: number;
      let rX_med: number;
      let yTop: number;
      let yBot: number = -0.032; // Lòng bàn chân phẳng vững chắc trên sàn

      if (zFrac <= 0.20) {
        // 1. Calcaneus Heel (Gót chân bo tròn đều phía sau: z từ -0.048 đến -0.015)
        const heelT = zFrac / 0.20;
        const theta = (1 - heelT) * (Math.PI / 2);
        zBase = -0.015 - Math.sin(theta) * 0.033;
        const rScale = Math.cos(theta);
        rX_lat = Math.max(0.003, rScale * 0.024);
        rX_med = Math.max(0.003, rScale * 0.024);
        yTop = -0.010 + heelT * 0.016;
      } else if (zFrac <= 0.60) {
        // 2. Midfoot, Instep & Medial Arch (Mu chân dốc xuôi, vòm lõm bên trong: z từ -0.015 đến 0.060)
        const midT = (zFrac - 0.20) / 0.40;
        zBase = -0.015 + midT * 0.075;
        rX_lat = 0.024 + midT * 0.007; // 0.024 -> 0.031
        rX_med = 0.024 + midT * 0.008; // 0.024 -> 0.032
        yTop = 0.006 - midT * 0.018;   // Dốc xuôi tự nhiên từ cổ chân xuống ức bàn chân
      } else if (zFrac <= 0.80) {
        // 3. Ball of Foot (Ức bàn chân xòe rộng khỏe khoắn: z từ 0.060 đến 0.095)
        const ballT = (zFrac - 0.60) / 0.20;
        zBase = 0.060 + ballT * 0.035;
        rX_lat = 0.031 - ballT * 0.002; // 0.031 -> 0.029
        rX_med = 0.032 - ballT * 0.002; // 0.032 -> 0.030
        yTop = -0.012 - ballT * 0.004;  // -0.012 -> -0.016
      } else {
        // 4. Rounded Toe Box Dome (Mũi bàn chân bo tròn đầy đặn như ngón chân/giày thể thao, KHÔNG BỊ NHỌN MỎ VỊT)
        const toeT = (zFrac - 0.80) / 0.20;
        const toeTheta = toeT * (Math.PI / 2);

        // Mũi chân uốn vòm phía trước theo hình bán cầu (ellipsoidal cap):
        // z tăng theo sin(theta), độ rộng thu theo cos(theta) giúp tiếp tuyến tại đỉnh vuông góc với Z -> không thể tạo mỏ nhọn
        const toeArc = Math.sin(toeTheta);
        zBase = 0.095 + toeArc * 0.028;

        const domeScale = Math.cos(toeTheta);
        rX_lat = Math.max(0.002, 0.029 * domeScale);
        rX_med = Math.max(0.002, 0.030 * domeScale);
        yTop = -0.016 - toeArc * 0.010;
        // Độ vênh mũi chân 2mm tinh tế ở chóp mũi (toe spring), còn lại đáy phẳng hoàn toàn
        yBot = -0.032 + Math.pow(toeT, 3) * 0.003;
      }

      for (let j = 0; j <= NU; j++) {
        const uFrac = j / NU;
        const phi = uFrac * Math.PI * 2;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);

        const isMedial = sinP * medialDir >= 0;
        const curRX = isMedial ? rX_med : rX_lat;
        const px = sinP * curRX;

        const yCenter = (yTop + yBot) * 0.5;
        const yHalf = (yTop - yBot) * 0.5;
        let py = yCenter + cosP * yHalf;

        // Vòm chân hõm ở mặt trong lòng bàn chân (Medial Longitudinal Arch)
        if (isMedial && cosP < -0.2 && zFrac >= 0.20 && zFrac <= 0.65) {
          const archZ = Math.sin(((zFrac - 0.20) / 0.45) * Math.PI);
          const archX = Math.min(1.0, Math.abs(px) / Math.max(0.001, curRX));
          const lift = archZ * archX * 0.008 * -cosP;
          py += lift;
        }

        // Đường lượn mượt mà cho ngón chân: ngón cái dài hơn ngón út (hàm dốc liên tục, không gãy nếp)
        let pz = zBase;
        if (zFrac > 0.55 && curRX > 0.005) {
          const latNorm = px / curRX; // Tuyến tính từ -1 đến +1
          pz += medialDir * latNorm * 0.006 * Math.min(1.0, (zFrac - 0.55) / 0.35);
        }

        positions.push(px, py, pz);
        uvs.push(uFrac, zFrac);
      }
    }

    for (let k = 0; k < NZ; k++) {
      for (let j = 0; j < NU; j++) {
        const i0 = k * (NU + 1) + j;
        const i1 = i0 + 1;
        const i2 = (k + 1) * (NU + 1) + j;
        const i3 = i2 + 1;

        indices.push(i0, i1, i2);
        indices.push(i1, i3, i2);
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
   * Cập nhật màu da / chất liệu toàn thân đồng bộ từ bảng màu customizer
   */
  public updateOutfit(config?: RealisticAvatarConfig) {
    if (config?.skinTone) {
      const color = new THREE.Color(config.skinTone);
      this.bodyMaterial.color.copy(color);

      const jointCol = color.clone().multiplyScalar(0.85);
      this.jointMaterial.color.copy(jointCol);

      const accentCol = color.clone().multiplyScalar(0.74);
      this.accentMaterial.color.copy(accentCol);
    } else {
      this.bodyMaterial.color.set('#B57850');
      this.jointMaterial.color.set('#9A5E3A');
      this.accentMaterial.color.set('#7C482A');
    }
  }

  /**
   * Hoạt ảnh vi mô sống động (Breathing, Head-Tracking, Subtle Weight-Shift)
   */
  public update(delta: number, time: number, mouseNormalized: { x: number; y: number }) {
    // 1. Natural Diaphragmatic Idle Breathing
    const breath = Math.sin(time * 1.8);
    this.chestBone.position.y = 0.12 + breath * 0.004;
    this.chestBone.scale.y = 1.0 + breath * 0.008;

    // 2. Damped Head & Neck Tracking
    const targetHeadX = -mouseNormalized.y * 0.28;
    const targetHeadY = mouseNormalized.x * 0.42;

    this.neckBone.rotation.y += (targetHeadY * 0.35 - this.neckBone.rotation.y) * 0.10;
    this.neckBone.rotation.x += (targetHeadX * 0.35 - this.neckBone.rotation.x) * 0.10;

    this.headBone.rotation.y += (targetHeadY * 0.65 - this.headBone.rotation.y) * 0.12;
    this.headBone.rotation.x += (targetHeadX * 0.65 - this.headBone.rotation.x) * 0.12;

    // 3. Subtle Living Weight Shift
    this.weightShiftCycle += delta * 0.45;
    const shift = Math.sin(this.weightShiftCycle);
    this.pelvisBone.position.x = shift * 0.005;
    this.pelvisBone.rotation.z = shift * 0.008;
  }

  /**
   * Giải phóng tài nguyên đồ họa WebGL
   */
  public dispose() {
    this.bodyMaterial.dispose();
    this.jointMaterial.dispose();
    this.accentMaterial.dispose();

    this.root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
      }
    });
  }
}
