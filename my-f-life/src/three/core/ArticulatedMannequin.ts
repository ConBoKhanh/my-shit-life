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
  private headMesh: THREE.Mesh | null = null;
  private leftEyeGroup: THREE.Group | null = null;
  private rightEyeGroup: THREE.Group | null = null;
  private leftBrowMesh: THREE.Mesh | null = null;
  private rightBrowMesh: THREE.Mesh | null = null;
  private eyeMaterial: THREE.MeshPhysicalMaterial;
  private eyeTexture: THREE.CanvasTexture | null = null;
  private eyeCanvas: HTMLCanvasElement | null = null;
  private pupilMaterial: THREE.MeshBasicMaterial;
  private browMaterial: THREE.MeshBasicMaterial;
  private lipMaterial: THREE.MeshPhysicalMaterial;
  private upperLipMesh: THREE.Mesh | null = null;
  private lowerLipMesh: THREE.Mesh | null = null;

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

  // Animation cycle & Scale tracking
  private weightShiftCycle: number = 0;
  private currentLegScale: number = 1.0;

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

    const initialEyeTexture = this.getOrCreateEyeTexture('#151316');
    this.eyeMaterial = new THREE.MeshPhysicalMaterial({
      map: initialEyeTexture,
      roughness: 0.12,
      metalness: 0.02,
      clearcoat: 0.95,
      clearcoatRoughness: 0.06,
      side: THREE.DoubleSide,
    });

    this.pupilMaterial = new THREE.MeshBasicMaterial({
      color: 0x050505,
    });

    this.browMaterial = new THREE.MeshBasicMaterial({
      color: 0x181210,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });

    this.lipMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#DE7E8A'),
      roughness: 0.35,
      metalness: 0.02,
      clearcoat: 0.45,
      clearcoatRoughness: 0.20,
      polygonOffset: true,
      polygonOffsetFactor: -1.5,
      polygonOffsetUnits: -1.5,
      side: THREE.DoubleSide,
    });

    // 2. Harmonious Proportional Skeletal Hierarchy
    this.spineRoot = new THREE.Group();
    this.spineRoot.name = 'Spine_Root';
    this.root.add(this.spineRoot);

    // Pelvis anchor at Y = 0.662m (bàn chân chạm chuẩn xác Y = 0.00m tại mặt sàn/mặt bục)
    this.pelvisBone = new THREE.Group();
    this.pelvisBone.position.set(0, 0.662, 0);
    this.spineRoot.add(this.pelvisBone);

    // Waist / Floating Abdomen (attached above Pelvis, overlaps 3cm inside pelvis)
    this.waistBone = new THREE.Group();
    this.waistBone.position.set(0, 0.05, 0);
    this.pelvisBone.add(this.waistBone);

    // Chest (attached above Waist at Y = 0.12m)
    this.chestBone = new THREE.Group();
    this.chestBone.position.set(0, 0.12, 0);
    this.waistBone.add(this.chestBone);

    // Neck (nested deep in chest collar at Y = 0.150m)
    this.neckBone = new THREE.Group();
    this.neckBone.position.set(0, 0.150, 0);
    this.chestBone.add(this.neckBone);

    // Head (atop lengthened neck at Y = 0.082m)
    this.headBone = new THREE.Group();
    this.headBone.position.set(0, 0.082, 0);
    this.neckBone.add(this.headBone);

    // Shoulders placed flush under acromion shelf and socket (X = ±0.125, Y = 0.114)
    this.leftShoulder = new THREE.Group();
    this.leftShoulder.position.set(-0.125, 0.114, 0);
    this.chestBone.add(this.leftShoulder);

    this.rightShoulder = new THREE.Group();
    this.rightShoulder.position.set(0.125, 0.114, 0);
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

    // 4-Stage Drop-Down Hip System (X = ±0.060 - 2 chân mở rộng vừa vặn ra ngoài bẹn)
    this.dropDownPegL = new THREE.Group();
    this.dropDownPegL.position.set(-0.060, -0.030, 0);
    this.pelvisBone.add(this.dropDownPegL);

    this.dropDownPegR = new THREE.Group();
    this.dropDownPegR.position.set(0.060, -0.030, 0);
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

  /**
   * Tạo hoặc cập nhật Canvas Texture độ phân giải cao cho mắt (Sclera + Iris + Pupil + Catchlight)
   * Giữ tròng mắt luôn hiển thị 100% rực rỡ ở mọi góc nhìn (thẳng, nghiêng 3/4, nhìn ngang) mà không bao giờ bị chìm/mất
   */
  private getOrCreateEyeTexture(colorHex = '#151316'): THREE.CanvasTexture {
    const size = 512;
    if (!this.eyeCanvas) {
      this.eyeCanvas = document.createElement('canvas');
      this.eyeCanvas.width = size;
      this.eyeCanvas.height = size;
    }
    const canvas = this.eyeCanvas;
    const ctx = canvas.getContext('2d')!;

    const cx = size / 2;
    const cy = size / 2;

    // 1. Sclera (Tròng trắng mịn màng với viền bóng đổ ambient vi mô)
    ctx.fillStyle = '#f6f8fb';
    ctx.fillRect(0, 0, size, size);

    const scleraGrad = ctx.createRadialGradient(cx, cy, size * 0.22, cx, cy, size * 0.48);
    scleraGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    scleraGrad.addColorStop(0.7, 'rgba(215, 224, 238, 0.22)');
    scleraGrad.addColorStop(1, 'rgba(175, 190, 210, 0.60)');
    ctx.fillStyle = scleraGrad;
    ctx.fillRect(0, 0, size, size);

    // 2. Iris (Tròng màu rực rỡ với vân mống mắt & Limbal Ring)
    const irisRadius = size * 0.26; // ~133px - tỷ lệ tròng mắt chuẩn Anime / Realistic
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, irisRadius, 0, Math.PI * 2);
    ctx.clip();

    const baseCol = new THREE.Color(colorHex);
    const darkColStyle = baseCol.clone().multiplyScalar(0.35).getStyle();
    const mainColStyle = baseCol.getStyle();
    const brightColStyle = baseCol.clone().offsetHSL(0, 0.05, 0.22).getStyle();

    const irisGrad = ctx.createRadialGradient(cx, cy, size * 0.04, cx, cy, irisRadius);
    irisGrad.addColorStop(0, darkColStyle);
    irisGrad.addColorStop(0.40, mainColStyle);
    irisGrad.addColorStop(0.85, brightColStyle);
    irisGrad.addColorStop(1.0, '#0a0810'); // Limbal ring
    ctx.fillStyle = irisGrad;
    ctx.fillRect(0, 0, size, size);

    // Vân mống mắt (Iris radial striations)
    ctx.lineWidth = 1.6;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 32) {
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      const rInner = irisRadius * 0.28;
      const rOuter = irisRadius * 0.95;
      ctx.strokeStyle = (a % (Math.PI / 16) === 0) ? 'rgba(255, 255, 255, 0.40)' : darkColStyle;
      ctx.beginPath();
      ctx.moveTo(cx + cosA * rInner, cy + sinA * rInner);
      ctx.lineTo(cx + cosA * rOuter, cy + sinA * rOuter);
      ctx.stroke();
    }

    // 3. Pupil (Con ngươi đen tuyền ở trung tâm)
    const pupilRadius = irisRadius * 0.46;
    ctx.beginPath();
    ctx.arc(cx, cy, pupilRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#050408';
    ctx.fill();

    // 4. Catchlights (Điểm phản quang long lanh)
    // Đốm sáng lớn
    ctx.beginPath();
    ctx.arc(cx - irisRadius * 0.32, cy - irisRadius * 0.30, pupilRadius * 0.34, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Đốm sáng phụ
    ctx.beginPath();
    ctx.arc(cx + irisRadius * 0.28, cy + irisRadius * 0.28, pupilRadius * 0.20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.80)';
    ctx.fill();

    ctx.restore();

    if (!this.eyeTexture) {
      this.eyeTexture = new THREE.CanvasTexture(canvas);
      this.eyeTexture.colorSpace = THREE.SRGBColorSpace;
    }
    this.eyeTexture.needsUpdate = true;
    return this.eyeTexture;
  }

  /**
   * Tạo hình học giác mạc 3D cong lồi tự nhiên với tọa độ UV phẳng chuẩn xác
   */
  private createEyeballGeometry(rX: number, rY: number, rZ: number): THREE.BufferGeometry {
    const U_SEGS = 24;
    const V_SEGS = 20;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let v = 0; v <= V_SEGS; v++) {
      const vFrac = v / V_SEGS; // 0 at top to 1 at bottom
      const phi = vFrac * Math.PI; // 0 to PI
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      for (let u = 0; u <= U_SEGS; u++) {
        const uFrac = u / U_SEGS; // 0 at left to 1 at right
        const theta = (uFrac - 0.5) * Math.PI * 0.96; // -0.48*PI to +0.48*PI
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        const px = sinTheta * sinPhi * rX * 1.5;
        const py = cosPhi * rY;
        const pz = cosTheta * sinPhi * rZ;

        // Planar normalized UV centered at (0.5, 0.5):
        const uCoord = 0.5 + (px / (rX * 2.2));
        const vCoord = 0.5 + (py / (rY * 2.0));

        positions.push(px, py, pz);
        uvs.push(Math.max(0, Math.min(1, uCoord)), Math.max(0, Math.min(1, vCoord)));
      }
    }

    for (let v = 0; v < V_SEGS; v++) {
      for (let u = 0; u < U_SEGS; u++) {
        const i0 = v * (U_SEGS + 1) + u;
        const i1 = i0 + 1;
        const i2 = (v + 1) * (U_SEGS + 1) + u;
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

  // ===========================================================================
  // 1. HEAD: Unified Sculpted Head (Khối Sọ & Gương Mặt V-Line Thanh Thoát, Tự Nhiên)
  // ===========================================================================
  private buildHead() {
    const headContainer = new THREE.Group();
    headContainer.position.set(0, 0.006, 0.003);

    // 1. Unified Sculpted Head (Khối sọ thon gọn, cằm V-line tự nhiên, mũi thanh thoát)
    const headGeo = this.createUnifiedSculptedHeadGeometry();
    const headMesh = new THREE.Mesh(headGeo, this.bodyMaterial);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    this.headMesh = headMesh;
    headContainer.add(headMesh);

    // 1.1 Stylized High-Definition Anime/Realistic Eyes (Single Unified Cornea Dome with Canvas Texture)
    const eyeGeo = this.createEyeballGeometry(0.0072, 0.0048, 0.0024);
    const eyelinerMat = new THREE.MeshBasicMaterial({ color: 0x181210 });

    [-1, 1].forEach((dir) => {
      const eyeGroup = new THREE.Group();
      // Đặt chìm sâu vào đáy hốc mắt 3D: x = ±0.021m, y = 0.011m, z = 0.0366m
      eyeGroup.position.set(dir * 0.0210, 0.0110, 0.0366);
      eyeGroup.rotation.y = dir * 0.06;

      // 1. Unified Eyeball Mesh (Trọn vẹn tròng trắng + tròng màu + con ngươi trên 1 bề mặt cong 3D)
      const eyeMesh = new THREE.Mesh(eyeGeo, this.eyeMaterial);
      eyeMesh.renderOrder = 3;
      eyeGroup.add(eyeMesh);

      // 2. Viền mí mắt trên ôm sát da mí mắt
      const ptsEye = [
        new THREE.Vector3(-0.0062, -0.0005, 0.0003),
        new THREE.Vector3(0.0000, 0.0022, 0.0005),
        new THREE.Vector3(0.0064, -0.0002, 0.0004),
      ];
      const eyeLidCurve = new THREE.CatmullRomCurve3(ptsEye);
      const eyeLidGeo = new THREE.TubeGeometry(eyeLidCurve, 12, 0.00022, 6, false);
      const eyeLidMesh = new THREE.Mesh(eyeLidGeo, eyelinerMat);
      eyeLidMesh.renderOrder = 4;
      eyeGroup.add(eyeLidMesh);

      headContainer.add(eyeGroup);

      if (dir < 0) {
        this.leftEyeGroup = eyeGroup;
      } else {
        this.rightEyeGroup = eyeGroup;
      }
    });

    // 1.2 Chân Mày Thanh Tú Chìm Mịn Trên Mặt Da Xương Trán
    [-1, 1].forEach((dir) => {
      const pts = [
        new THREE.Vector3(dir * 0.0075, 0.0188, 0.0436),
        new THREE.Vector3(dir * 0.0185, 0.0212, 0.0402),
        new THREE.Vector3(dir * 0.0305, 0.0175, 0.0322),
      ];
      const browCurve = new THREE.CatmullRomCurve3(pts);
      const browGeo = new THREE.TubeGeometry(browCurve, 16, 0.00038, 8, false);
      const browMesh = new THREE.Mesh(browGeo, this.browMaterial);
      browMesh.renderOrder = 5;
      headContainer.add(browMesh);

      if (dir < 0) {
        this.leftBrowMesh = browMesh;
      } else {
        this.rightBrowMesh = browMesh;
      }
    });

    // 1.3 Đôi Môi Chìm Mịn Theo Khối Mặt (Không Lồi Lơ Lửng)
    const upperLipPts = [
      new THREE.Vector3(-0.0115, -0.0245, 0.0418),
      new THREE.Vector3(-0.0045, -0.0220, 0.0442),
      new THREE.Vector3(0.0000, -0.0232, 0.0438),
      new THREE.Vector3(0.0045, -0.0220, 0.0442),
      new THREE.Vector3(0.0115, -0.0245, 0.0418),
    ];
    const upperLipCurve = new THREE.CatmullRomCurve3(upperLipPts);
    const upperLipGeo = new THREE.TubeGeometry(upperLipCurve, 20, 0.00055, 8, false);
    const upperLipMesh = new THREE.Mesh(upperLipGeo, this.lipMaterial);
    upperLipMesh.renderOrder = 4;
    headContainer.add(upperLipMesh);
    this.upperLipMesh = upperLipMesh;

    const lowerLipPts = [
      new THREE.Vector3(-0.0105, -0.0255, 0.0420),
      new THREE.Vector3(0.0000, -0.0280, 0.0442),
      new THREE.Vector3(0.0105, -0.0255, 0.0420),
    ];
    const lowerLipCurve = new THREE.CatmullRomCurve3(lowerLipPts);
    const lowerLipGeo = new THREE.TubeGeometry(lowerLipCurve, 16, 0.00070, 8, false);
    const lowerLipMesh = new THREE.Mesh(lowerLipGeo, this.lipMaterial);
    lowerLipMesh.renderOrder = 4;
    headContainer.add(lowerLipMesh);
    this.lowerLipMesh = lowerLipMesh;

    // 2. Vành tai giải phẫu học thanh tú ôm sát sọ (Anatomical Slim Ear)
    [-1, 1].forEach((dir) => {
      const earGroup = new THREE.Group();
      // Đặt ngang tầm từ đuôi mắt đến chân cánh mũi, áp sát sọ tự nhiên
      earGroup.position.set(dir * 0.0445, 0.002, -0.008);
      earGroup.rotation.set(0.04, dir * 0.10, -dir * 0.05);

      // Thân lòng tai đặc (Concha bowl)
      const conchaGeo = new THREE.SphereGeometry(0.0090, 16, 12);
      conchaGeo.scale(0.28, 1.20, 0.70);
      const conchaMesh = new THREE.Mesh(conchaGeo, this.bodyMaterial);
      conchaMesh.castShadow = true;
      earGroup.add(conchaMesh);

      // Vành sụn ngoài uốn cong (Outer Helix Rim)
      const helixGeo = new THREE.TorusGeometry(0.0085, 0.0015, 8, 20, Math.PI * 1.15);
      helixGeo.rotateZ(Math.PI / 2 + (dir > 0 ? 0.14 : -0.14));
      helixGeo.scale(0.46, 1.10, 0.88);
      const helixMesh = new THREE.Mesh(helixGeo, this.bodyMaterial);
      helixMesh.position.set(dir * 0.0010, 0.002, -0.001);
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

    // 3. Khớp xoay đáy sọ (Skull Base Socket - nằm gọn sâu bên trong hốc sọ, không lồi dưới cằm)
    const skullSocketGeo = new THREE.SphereGeometry(0.016, 20, 16);
    const skullSocket = new THREE.Mesh(skullSocketGeo, this.jointMaterial);
    skullSocket.position.set(0, -0.010, -0.005);
    headContainer.add(skullSocket);

    this.headBone.add(headContainer);
  }

  /**
   * Generates an aesthetically pleasing, slim, chiseled human head with natural harmonious profile.
   * - Proportions: Smooth natural cranial vault, refined straight nose with gentle nasion dip,
   *   elegant Cupid lips, and smooth continuous V-Line chin without jagged steps or artifacts.
   */
  private createUnifiedSculptedHeadGeometry(config?: RealisticAvatarConfig): THREE.BufferGeometry {
    const V = 100; // Height rings from crown down to chin/skull base
    const U = 88;  // Longitudinal radial slices
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const isNarrowEyes = config?.eyeShapeId === 'eye_shape_narrow_slanted';
    const isPhoenixEyes = config?.eyeShapeId === 'eye_shape_phoenix';
    const isBigRoundEyes = config?.eyeShapeId === 'eye_shape_big_round';

    const isLlineNose = config?.noseShapeId === 'nose_straight_l_line';
    const isWitchNose = config?.noseShapeId === 'nose_witch_hooked';
    const isCuteSnubNose = config?.noseShapeId === 'nose_cute_button_snub';

    const isMasculineJaw = config?.jawlineShapeId === 'jaw_structured_masculine';
    const isTreLip = config?.mouthShapeId === 'mouth_pouting_thick_tre';
    const isPlumpLip = config?.mouthShapeId === 'mouth_plump_full';
    const isSwordBrow = config?.eyebrowShapeId === 'brow_sword_bold';

    // Head proportions: yTop = 0.070m, yBottom = -0.050m (total 0.120m)
    const yTop = 0.070;
    const yBottom = -0.050;
    const yTotal = yTop - yBottom; // 0.120m

    for (let v = 0; v <= V; v++) {
      const vFrac = v / V;
      const y = yTop - vFrac * yTotal;
      // Normalized height fraction from chin/nape (0.0) up to crown (1.0)
      const h = (y - yBottom) / yTotal;
      const hEq = 0.50; // Parietal equator height (around eye level, y ≈ 0.010m)

      for (let u = 0; u <= U; u++) {
        const uFrac = u / U;
        const theta = uFrac * Math.PI * 2;
        const cosT = Math.cos(theta); // > 0 front, < 0 back
        const sinT = Math.sin(theta); // < 0 left, > 0 right
        const absSin = Math.abs(sinT);

        let rx: number;
        let rz_front: number;
        let rz_back: number;

        if (h >= hEq) {
          // Upper Cranium Dome (h from 0.50 to 1.0) - Vòm sọ tròn trịa tự nhiên
          const tCran = (h - hEq) / (1.0 - hEq);
          const dome = Math.sqrt(Math.max(0.00001, 1.0 - tCran * tCran));
          rx = 0.0465 * dome;
          rz_front = 0.0450 * dome * (0.92 + 0.08 * dome);
          rz_back = 0.0550 * dome * (0.90 + 0.10 * dome);

          // Subtle temporal plane flattening
          if (absSin > 0.35 && tCran < 0.85) {
            const templeY = Math.sin((tCran / 0.85) * Math.PI);
            const templeX = Math.sin(((absSin - 0.35) / 0.65) * Math.PI);
            rx *= 1.0 - templeY * templeX * 0.030;
          }
        } else {
          // Lower Face, Cheeks, V-Line Jaw & Nape (h from 0.50 down to 0.0)
          const tLow = (hEq - h) / hEq;
          const tLow2 = tLow * tLow;
          // Smooth, elegant V-line taper towards chin
          const taperCoeff = isMasculineJaw ? 0.36 : 0.44;
          const vLineTaper = 1.0 - taperCoeff * Math.pow(tLow, 1.15) + 0.03 * Math.pow(tLow, 2.2);
          rx = 0.0465 * vLineTaper;
          rz_front = 0.0450 * (1.0 - 0.04 * tLow2);
          rz_back = 0.0550 * (1.0 - 0.42 * tLow2 + 0.05 * tLow2 * tLow);
        }

        let px = sinT * rx;
        let pz = cosT >= 0 ? cosT * rz_front : cosT * rz_back;

        // Submental undercutting (đáy hàm vuốt êm liên tục 100% C2 vào cổ, không gãy gập, không gờ bậc)
        if (y < -0.034) {
          const underT = (-0.034 - y) / (-0.034 - yBottom);
          const underCut = underT * underT;
          const angleBlend = 0.5 + 0.5 * (1.0 - cosT); // 0 at front, 1 at back
          px *= 1.0 - underCut * 0.12;
          pz *= 1.0 - underCut * (0.08 + 0.14 * angleBlend);
        }

        // =====================================================================
        // NATURAL HARMONIOUS FACIAL FEATURES (Đường nét thanh tú, không thừa thô)
        // =====================================================================
        if (cosT > 0.15) {
          const frontFactor = Math.min(1.0, (cosT - 0.15) / 0.42);

          // 1. Forehead & Glabella (Vầng trán thanh tú, phẳng mịn)
          if (y >= 0.018 && y <= 0.055) {
            const fY = Math.sin(((y - 0.018) / 0.037) * Math.PI);
            const fX = Math.exp(-Math.pow(px / 0.028, 2));
            pz += fY * fX * 0.0012 * frontFactor;
          }

          // 2. Supraorbital Brow Ridge (Cung mày nhẹ nhàng, thanh thoát)
          if (y >= 0.014 && y <= 0.026 && Math.abs(px) <= 0.036) {
            const bY = Math.sin(((y - 0.014) / 0.012) * Math.PI);
            const bX = Math.exp(-Math.pow(px / 0.028, 2));
            const browArch = isSwordBrow
              ? 0.85 + 0.30 * Math.sin((Math.abs(px) / 0.036) * Math.PI)
              : 0.90 + 0.18 * Math.sin((Math.abs(px) / 0.036) * Math.PI);
            pz += bY * bX * browArch * 0.0014 * frontFactor;
          }

          // 3. Orbital Eye Sockets & Eyelids (4 Dáng Mắt: từ mắt híp đến mắt to tròn - hốc mắt chìm sâu tự nhiên)
          let eyeRadiusX = 0.0112;
          let eyeRadiusY = 0.0070;
          let eyeTilt = 0;
          let socketDepth = 0.0048;

          if (isNarrowEyes) {
            // 1. Mắt Híp / Một Mí: hẹp dọc (0.0034m), thon dài ngang (0.0132m)
            eyeRadiusX = 0.0132;
            eyeRadiusY = 0.0034;
            socketDepth = 0.0038;
          } else if (isPhoenixEyes) {
            // 3. Mắt Phượng Sắc Nét: đuôi mắt cong nhẹ xếch
            eyeRadiusX = 0.0122;
            eyeRadiusY = 0.0062;
            eyeTilt = (Math.abs(px) - 0.021) * 0.18;
            socketDepth = 0.0048;
          } else if (isBigRoundEyes) {
            // 4. Mắt To Tròn Long Lanh: mở rộng theo chiều dọc (0.0096m), hai mí rõ rệt
            eyeRadiusX = 0.0118;
            eyeRadiusY = 0.0096;
            socketDepth = 0.0054;
          }

          const eyeDistX = (Math.abs(px) - 0.021) / eyeRadiusX;
          const eyeDistY = (y - (0.011 + eyeTilt)) / eyeRadiusY;
          const eyeR2 = eyeDistX * eyeDistX + eyeDistY * eyeDistY;

          if (eyeR2 < 1.0) {
            const socketCos = Math.cos(Math.sqrt(eyeR2) * Math.PI * 0.5);
            pz -= socketCos * socketDepth * frontFactor;

            // Mí mắt trên
            const lidTop = 0.011 + eyeRadiusY * 0.90;
            const lidBot = 0.011 + eyeRadiusY * 0.12;
            if (y >= lidBot && y <= lidTop) {
              const lidY = Math.sin(((y - lidBot) / (lidTop - lidBot)) * Math.PI);
              const lidX = Math.exp(-Math.pow((Math.abs(px) - 0.021) / (eyeRadiusX * 0.65), 2));
              pz += lidY * lidX * (isNarrowEyes ? 0.0004 : (isBigRoundEyes ? 0.0009 : 0.0006)) * frontFactor;
            }
          }

          // 4. Zygomatic Cheekbones (Gò má thanh tú tự nhiên)
          if (y >= -0.012 && y <= 0.014 && Math.abs(px) >= 0.018 && Math.abs(px) <= 0.040) {
            const chY = Math.sin(((y - (-0.012)) / 0.026) * Math.PI);
            const chX = Math.sin(((Math.abs(px) - 0.018) / 0.022) * Math.PI);
            pz += chY * chX * 0.0015 * frontFactor;
          }

          // 5. 4 DÁNG MŨI 3D ĐIÊU KHẮC RÕ RỆT (S-Line, L-Line, Phù Thủy Khoằm To, Hếch Hạt Mít)
          const yBotNose = isWitchNose ? -0.023 : (isCuteSnubNose ? -0.014 : -0.015);
          const yTopNose = isWitchNose ? 0.026 : 0.021;

          if (y >= yBotNose && y <= yTopNose) {
            const tau = (y - yBotNose) / (yTopNose - yBotNose); // 0 at subnasale, 1 at nasion
            let noseH = 0;
            let sigmaX = 0.0038;
            let alarMax = 0.0026;
            let alarWidth = 0.0115;

            if (isWitchNose) {
              // 3. MŨI PHÙ THỦY KHOẰM TO 🧙‍♀️: Sống mũi gồ to khổng lồ, chóp mũi vươn dài khoằm quặp chúc xuống dưới quá môi trên
              const hump = 0.0240 * Math.exp(-Math.pow((tau - 0.65) / 0.20, 2));
              const beak = 0.0280 * Math.exp(-Math.pow((tau - 0.28) / 0.18, 2));
              const droop = 0.0180 * Math.exp(-Math.pow((tau - 0.10) / 0.15, 2));
              const generalBridge = 0.0090 * Math.sin(tau * Math.PI);
              noseH = Math.max(generalBridge, Math.max(hump, Math.max(beak, droop)));
              sigmaX = 0.0068 + 0.0040 * Math.sin(tau * Math.PI);
              alarMax = 0.0070;
              alarWidth = 0.0185;
            } else if (isCuteSnubNose) {
              // 4. MŨI HẾCH HẠT MÍT BABY 👶: Gốc mũi phẳng tẹt dí, chóp mũi vo tròn như hạt mít/hòn bi hếch cao lên trên
              // Gốc mũi tẹt lõm gần như phẳng sát sọ
              const flatBridge = 0.0008 * Math.sin(tau * Math.PI);
              // Hạt mít tròn vo ở vị trí cao tau = 0.38
              const buttonBall = 0.0075 * Math.exp(-Math.pow((tau - 0.38) / 0.13, 2));
              // Phần đáy mũi thụt lùi vào trong để hếch lên
              const snubRetreat = (tau < 0.22) ? (tau / 0.22) : 1.0;
              noseH = Math.max(flatBridge, buttonBall) * snubRetreat;
              sigmaX = (tau < 0.55) ? 0.0065 : 0.0025;
              alarMax = 0.0038;
              alarWidth = 0.0130;
            } else if (isLlineNose) {
              // 2. MŨI CAO THẲNG L-LINE: Sống mũi cao thẳng tắp từ đỉnh trán xuống chóp mũi, góc mũi trán sắc sảo Tây phương
              const straightLine = 0.0065 + 0.0040 * (1.0 - Math.pow(tau - 0.25, 2));
              noseH = Math.max(0.0040, straightLine);
              sigmaX = 0.0025 + 0.0012 * Math.sin(tau * Math.PI);
              alarMax = 0.0020;
              alarWidth = 0.0095;
            } else {
              // 1. MŨI S-LINE TỰ NHIÊN: Đường cong võng nhẹ Á Đông, đầu mũi thon gọn mềm mại
              const envelope = Math.pow(Math.sin(tau * Math.PI), 1.20);
              const tip = 0.0042 * Math.exp(-Math.pow((tau - 0.28) / 0.16, 2));
              noseH = (0.0036 + tip) * envelope;
              sigmaX = 0.0036 + 0.0020 * Math.sin(tau * Math.PI);
              alarMax = 0.0026;
              alarWidth = 0.0115;
            }

            const bX = Math.exp(-Math.pow(px / sigmaX, 2));
            pz += noseH * bX * frontFactor;

            // Cánh mũi & Rãnh cánh mũi
            if (tau >= 0.04 && tau <= 0.45 && Math.abs(px) >= 0.0030 && Math.abs(px) <= alarWidth) {
              const alarY = Math.sin(((tau - 0.04) / 0.41) * Math.PI);
              const alarX = Math.sin(((Math.abs(px) - 0.0030) / (alarWidth - 0.0030)) * Math.PI);
              pz += alarY * alarX * alarMax * frontFactor;
            }
          }

          // 6. 3 Dáng Môi: 1. Môi Mỏng Tự Nhiên | 2. Môi Căng Mọng | 3. Môi Trề To Dày Cộp Nhô Hẳn Ra Trước
          // Rãnh nhân trung
          if (y >= -0.021 && y <= -0.013 && Math.abs(px) <= 0.0032) {
            const philY = Math.sin(((y - (-0.021)) / 0.008) * Math.PI);
            const philX = Math.cos((px / 0.0032) * Math.PI * 0.5);
            pz -= philY * philX * 0.0006 * frontFactor;
          }

          // Môi trên (Upper Lip)
          const uTop = isTreLip ? -0.0175 : (isPlumpLip ? -0.0185 : -0.0195);
          const uBot = -0.025;
          const uWidth = isTreLip ? 0.0165 : (isPlumpLip ? 0.0150 : 0.0135);
          if (y >= uBot && y <= uTop && Math.abs(px) <= uWidth) {
            const uY = Math.sin(((y - uBot) / (uTop - uBot)) * Math.PI);
            const uX = Math.cos((px / uWidth) * Math.PI * 0.5);
            const cupidDip = 1.0 - (isTreLip ? 0.05 : (isPlumpLip ? 0.12 : 0.18)) * Math.exp(-Math.pow(px / 0.0028, 2));
            const uProtrude = isTreLip ? 0.0075 : (isPlumpLip ? 0.0048 : 0.0020);
            pz += uY * uX * cupidDip * uProtrude * frontFactor;
          }

          // Rãnh miệng (Mouth Fissure)
          const fissureWidth = isTreLip ? 0.0175 : (isPlumpLip ? 0.0155 : 0.0140);
          if (Math.abs(y - (-0.025)) <= 0.0020 && Math.abs(px) <= fissureWidth) {
            const fY = Math.cos(((y - (-0.025)) / 0.0020) * Math.PI * 0.5);
            const fX = Math.cos((px / fissureWidth) * Math.PI * 0.5);
            pz -= fY * fX * (isTreLip ? 0.0004 : 0.0008) * frontFactor;
          }

          // Môi dưới (Lower Lip - Dáng Môi Trề nhô hẳn 1.25cm ra phía trước và trễ xuống)
          const lTop = -0.025;
          const lBot = isTreLip ? -0.0350 : (isPlumpLip ? -0.0330 : -0.0315);
          const lWidth = isTreLip ? 0.0185 : (isPlumpLip ? 0.0150 : 0.0135);
          if (y >= lBot && y <= lTop && Math.abs(px) <= lWidth) {
            const lY = Math.sin(((y - lBot) / (lTop - lBot)) * Math.PI);
            const lX = Math.cos((px / lWidth) * Math.PI * 0.5);
            // Môi trề nhô mạnh 0.0125m, môi mọng 0.0062m, môi mỏng 0.0026m
            const lProtrude = isTreLip ? 0.0125 : (isPlumpLip ? 0.0062 : 0.0026);
            pz += lY * lX * lProtrude * frontFactor;
          }

          // Hõm dưới môi (Mentolabial Sulcus - chuyển tiếp êm dịu, không bị gãy gập)
          const sTop = isTreLip ? -0.0350 : (isPlumpLip ? -0.0330 : -0.0315);
          const sBot = isTreLip ? -0.0410 : -0.0385;
          if (y >= sBot && y <= sTop && Math.abs(px) <= 0.015) {
            const lmY = Math.sin(((y - sBot) / (sTop - sBot)) * Math.PI);
            const lmX = Math.cos((px / 0.015) * Math.PI * 0.5);
            pz -= lmY * lmX * 0.0010 * frontFactor;
          }

          // 7. Harmonious V-Line Chin (Cằm V-Line tự nhiên, liền khối 100%, không gờ, không ghẻ)
          if (y >= -0.048 && y <= -0.036 && Math.abs(px) <= 0.016) {
            const chinY = Math.sin(((y - (-0.048)) / 0.012) * Math.PI);
            const chinWidth = isMasculineJaw ? 0.018 : 0.015;
            const chinX = Math.cos((px / chinWidth) * Math.PI * 0.5);
            pz += chinY * chinX * 0.0024 * frontFactor;
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
  // 2. NECK: Anatomically Sculpted Athletic Neck (Cổ Điêu Khắc Cao Ráo, Thanh Lịch)
  // ===========================================================================
  private buildNeck() {
    // 1. Khớp cầu đỉnh cổ lồng vào đáy sọ (Top Ball Joint at Y = 0.082m)
    const neckTopBallGeo = new THREE.SphereGeometry(0.024, 24, 20);
    const neckTopBall = new THREE.Mesh(neckTopBallGeo, this.jointMaterial);
    neckTopBall.position.set(0, 0.082, 0);
    neckTopBall.castShadow = true;
    this.neckBone.add(neckTopBall);

    // 2. Thân cổ điêu khắc giải phẫu học cao ráo, cắm sâu 1.8cm vào lòng ngực (triệt tiêu hoàn toàn khe hở)
    const neckStemGeo = this.createSculptedNeckGeometry();
    const neckStem = new THREE.Mesh(neckStemGeo, this.bodyMaterial);
    neckStem.position.set(0, 0, 0);
    neckStem.castShadow = true;
    neckStem.receiveShadow = true;
    this.neckBone.add(neckStem);

    // 3. Khớp cầu đáy cổ lồng sâu vào cổ ngực (Base Ball Joint)
    const neckBaseBallGeo = new THREE.SphereGeometry(0.027, 24, 18);
    const neckBaseBall = new THREE.Mesh(neckBaseBallGeo, this.jointMaterial);
    neckBaseBall.position.set(0, 0, 0);
    this.neckBone.add(neckBaseBall);
  }

  /**
   * Generates an anatomically sculpted neck geometry with SCM muscle flow,
   * subtle thyroid cartilage (Adam's apple), posterior nuchal groove, and deep collar socket integration.
   * Starts from yBottom = -0.018m (deep inside chest) to yTop = 0.082m for a tall, elegant posture.
   */
  private createSculptedNeckGeometry(): THREE.BufferGeometry {
    const V = 36;
    const U = 36;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const yBottom = -0.018;
    const yTop = 0.082;
    const yTotal = yTop - yBottom;

    for (let v = 0; v <= V; v++) {
      const vFrac = v / V;
      const y = yBottom + vFrac * yTotal;
      // Normalized height fraction t from 0 (at collar level y=0) to 1 (at skull socket y=yTop)
      const t = Math.max(0, Math.min(1, y / yTop));

      // Slight natural forward tilt angle
      const zCenter = -0.004 + t * 0.004;

      // Proportional radius:
      // Base (embedded in chest socket): width 7.6cm (rx = 0.038m), depth 7.8cm (rz = 0.039m)
      // Top (under skull): width 5.8cm (rx = 0.029m), depth 6.2cm (rz = 0.031m)
      let rX: number;
      let rZ_ant: number;
      let rZ_pos: number;

      if (y <= 0) {
        const subT = -y / (-yBottom);
        rX = 0.038 + subT * 0.001;
        rZ_ant = 0.037 + subT * 0.001;
        rZ_pos = 0.039 + subT * 0.001;
      } else {
        rX = 0.038 - t * 0.009;
        rZ_ant = 0.037 - t * 0.007;
        rZ_pos = 0.039 - t * 0.008;
      }

      for (let u = 0; u <= U; u++) {
        const uFrac = u / U;
        const theta = uFrac * Math.PI * 2;
        const cosT = Math.cos(theta); // > 0 front, < 0 back
        const sinT = Math.sin(theta); // left / right
        const absSin = Math.abs(sinT);

        let px = sinT * rX;
        let pz = zCenter + (cosT >= 0 ? cosT * rZ_ant : cosT * rZ_pos);

        // 1. Sternocleidomastoid (SCM) Muscle Bands (Dải cơ ức đòn chũm 2 bên)
        if (y >= 0) {
          const scmThetaTarget = 0.32 + t * 0.88;
          const scmDist = Math.abs(absSin - Math.sin(scmThetaTarget));
          if (scmDist < 0.28 && cosT > -0.2) {
            const scmBell = Math.cos((scmDist / 0.28) * Math.PI * 0.5);
            const scmHeight = 0.0024 * (0.6 + 0.4 * Math.sin(t * Math.PI));
            pz += scmBell * scmHeight * (cosT > 0 ? cosT : 0.4);
            px += (sinT > 0 ? 1 : -1) * scmBell * scmHeight * 0.6;
          }

          // 2. Adam's Apple (Thyroid Cartilage) (Yết hầu nam tính tinh tế)
          if (cosT > 0.65 && t >= 0.35 && t <= 0.75) {
            const adT = Math.sin(((t - 0.35) / 0.40) * Math.PI);
            const adX = Math.cos(((1.0 - cosT) / 0.35) * Math.PI * 0.5);
            pz += adT * adX * 0.0032;
          }

          // 3. Posterior Nuchal Groove (Rãnh gáy sau cổ)
          if (cosT < -0.75) {
            const nuchT = Math.cos((Math.abs(sinT) / Math.sin(Math.PI * 0.25)) * Math.PI * 0.5);
            pz += nuchT * 0.0016;
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
  // 3. TORSO: Seamless Trapezius Slope & Heroic Pectorals (Cổ vuốt xuống vai liền mạch)
  // ===========================================================================
  private buildTorso() {
    // Seamless Anatomical Chest Shell (includes collar socket and clavicles)
    const chestShellGeo = this.createSeamlessAthleticChestGeometry();
    const chestShell = new THREE.Mesh(chestShellGeo, this.bodyMaterial);
    chestShell.castShadow = true;
    chestShell.receiveShadow = true;
    this.chestBone.add(chestShell);

    // Sculpted Athletic Male Abdomen
    const abdomenGeo = this.createSculptedAbdomenGeometry();
    const abdomenMesh = new THREE.Mesh(abdomenGeo, this.bodyMaterial);
    abdomenMesh.castShadow = true;
    abdomenMesh.receiveShadow = true;
    this.waistBone.add(abdomenMesh);
  }

  /**
   * Generates a sleek, athletic male abdomen with subtle anatomical tone.
   * Designed as a true internal floating core that inserts seamlessly inside
   * the chest shell at top and pelvis socket at bottom without ever protruding through the back.
   */
  private createSculptedAbdomenGeometry(): THREE.BufferGeometry {
    const V = 24;
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

        let rX: number;
        let rZ_ant: number;
        let rZ_pos: number;

        if (y < 0.030) {
          // 1. Lower Core inserting into pelvis socket (y from 0.000 to 0.030)
          const botT = y / 0.030;
          rX = 0.076 + botT * 0.006;       // 0.076 -> 0.082
          rZ_ant = 0.054 + botT * 0.006;   // 0.054 -> 0.060
          rZ_pos = 0.050 + botT * 0.006;   // 0.050 -> 0.056
        } else if (y <= 0.075) {
          // 2. Visible Waist & 6-Pack Midriff (y from 0.030 to 0.075)
          const midT = (y - 0.030) / 0.045;
          rX = 0.082 + midT * 0.002;       // 0.082 -> 0.084
          rZ_ant = 0.060 + midT * 0.002;   // 0.060 -> 0.062
          rZ_pos = 0.056 + midT * 0.002;   // 0.056 -> 0.058 (concave lumbar back curve)
        } else {
          // 3. Upper Dome inserting deep into chest socket (y from 0.075 to 0.160)
          // Taper smoothly inward so it stays 100% inside chest shell (rz_pos = 0.063m)
          const topT = (y - 0.075) / 0.085;
          const dome = topT * topT;
          rX = 0.084 - dome * 0.014;       // 0.084 -> 0.070
          rZ_ant = 0.062 - dome * 0.014;   // 0.062 -> 0.048
          rZ_pos = 0.058 - dome * 0.012;   // 0.058 -> 0.046 (NO step, NO back protrusion!)
        }

        let px = sinT * rX;
        let pz = cosT >= 0 ? cosT * rZ_ant : cosT * rZ_pos;

        // Subtle sculpted male 6-pack abs on anterior wall
        if (cosT > 0 && y >= 0.025 && y <= 0.085 && absSin <= 0.55) {
          // Central linea alba groove
          const centerGroove = Math.min(1.0, absSin / 0.05);
          // 3 tiers of abdominal packs
          const absTier = Math.sin(((y - 0.025) / 0.060) * Math.PI * 3);
          const absPack = Math.max(0, absTier) * Math.sin((absSin / 0.55) * Math.PI);
          pz += centerGroove * absPack * 0.0035;
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
   * Generates a sleek, athletic, beautifully proportioned chest with gentle clavicles (xương quai xanh)
   * and smooth organic trapezius slope connecting directly into shoulder sockets.
   * Acromion shelf reaches X = ±0.125m at Y = 0.114m, seamlessly capping the shoulder joint.
   */
  private createSeamlessAthleticChestGeometry(): THREE.BufferGeometry {
    const V = 44;
    const U = 48;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    const yBottom = -0.035;
    const yTop = 0.165;
    const yTotal = yTop - yBottom;

    for (let v = 0; v <= V; v++) {
      const vFrac = v / V; // 0 at bottom of chest, 1 at neck collar
      const py = yBottom + vFrac * yTotal;

      for (let u = 0; u <= U; u++) {
        const uFrac = u / U;
        const theta = uFrac * Math.PI * 2;
        const cosT = Math.cos(theta); // >0 front, <0 back
        const sinT = Math.sin(theta); // <0 left, >0 right
        const absSin = Math.abs(sinT);

        let rx: number;
        let rz_ant: number;
        let rz_pos: number;

        if (py <= 0.114) {
          // Ribcage & Athletic Pectoral span up to acromion shoulder shelf (py from -0.035 to 0.114)
          const t1 = (py - yBottom) / (0.114 - yBottom);
          const sCurve = Math.sin(t1 * (Math.PI / 2));
          rx = 0.088 + sCurve * 0.037;     // 0.088 -> 0.125 (reaches full shoulder shelf smoothly)
          rz_ant = 0.068 + sCurve * 0.003; // 0.068 -> 0.071
          rz_pos = 0.063 + sCurve * 0.001; // 0.063 -> 0.064 (smooth back latissimus contour)

          // Latissimus dorsi (cơ xô thon gọn thể thao)
          if (absSin > 0.40 && t1 > 0.20 && t1 < 0.85) {
            const latFlare = Math.sin(((t1 - 0.20) / 0.65) * Math.PI) * (absSin - 0.40) * 0.005;
            rx += latFlare;
          }
        } else {
          // Trapezius Slope from Acromion up to Neck Collar (py from 0.114 to 0.165)
          // Smooth continuous S-curve transition from 0.125m into neck base (0.038m x 0.039m)
          const t2 = (py - 0.114) / (0.165 - 0.114);
          const smoothT = t2 * t2 * (3 - 2 * t2);
          rx = 0.125 - smoothT * (0.125 - 0.038);
          rz_ant = 0.071 - smoothT * (0.071 - 0.037);
          rz_pos = 0.064 - smoothT * (0.064 - 0.039);
        }

        let px = sinT * rx;
        let pz = cosT >= 0 ? cosT * rz_ant : cosT * rz_pos;

        // Trapezius height profile: dip at front jugular notch, rise at back trapezius
        if (vFrac > 0.70) {
          const trapT = (vFrac - 0.70) / 0.30;
          if (cosT > 0) {
            // Hõm ức cổ (Jugular Notch)
            pz -= cosT * (1.0 - absSin) * 0.0035 * trapT;
          } else {
            // Cơ thang gáy sau (Trapezius muscle rise)
            pz += -cosT * 0.0030 * trapT;
          }
        }

        // =====================================================================
        // 1. NATURAL PECTORALIS MAJOR (Cơ ngực tự nhiên, mềm mại, thon gọn)
        // =====================================================================
        if (cosT > 0.20 && py >= 0.025 && py <= 0.108 && absSin >= 0.04 && absSin <= 0.75) {
          const pecX = (absSin - 0.04) / 0.71;
          const sternumSplit = Math.sin(Math.min(1.0, pecX / 0.25) * Math.PI * 0.5);
          const pecY = (py - 0.025) / 0.083;
          const pecBulge = Math.sin(pecY * Math.PI) * Math.sin(pecX * Math.PI);
          pz += sternumSplit * pecBulge * 0.0038 * (cosT > 0 ? cosT : 0.5);
        }

        // =====================================================================
        // 2. GENTLE ELEGANT CLAVICLES (Xương quai xanh nhẹ nhàng, uốn lượn chữ S)
        // =====================================================================
        if (cosT > 0.20 && py >= 0.110 && py <= 0.146 && absSin >= 0.04 && absSin <= 0.92) {
          const clavNormX = (absSin - 0.04) / 0.88; // 0 at sternum, 1 at acromion
          const clavCenterY = 0.134 - 0.010 * Math.pow(clavNormX, 1.3);
          const clavDistY = Math.abs(py - clavCenterY) / 0.012;
          if (clavDistY < 1.0) {
            const clavYBell = Math.cos(clavDistY * Math.PI * 0.5);
            const clavXBell = Math.sin(clavNormX * Math.PI);
            // Xương quai xanh nổi nhẹ nhàng thanh tú (~2.0mm)
            pz += clavYBell * clavXBell * 0.0020 * cosT;
          }
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
   * Connects seamlessly into the underside of the ellipsoid shoulder ball joint.
   * Features trimmed medial profile for natural armpit clearance and smooth cupped elbow socket.
   */
  private createSculptedUpperArmGeometry(dir: number): THREE.BufferGeometry {
    const NY = 32;
    const NU = 32;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    const yTop = 0.000;
    const yBottom = -0.220;

    for (let i = 0; i <= NY; i++) {
      const t = i / NY; // 0 at upper arm top socket, 1 at elbow bottom
      const y = yTop - t * (yTop - yBottom);

      let rX_lat: number;
      let rX_med: number;
      let rZ_ant: number;
      let rZ_pos: number;

      if (t <= 0.18) {
        // 1. Upper Deltoid Insertion Socket (Ôm khít đáy khối cầu vai bầu dục, khớp nối liền khối)
        const s = Math.sin((t / 0.18) * (Math.PI / 2));
        rX_lat = 0.026 + s * 0.012; // 0.026 -> 0.038 (đường cong cơ delta ngoài)
        rX_med = 0.017 + s * 0.003; // 0.017 -> 0.020 (mặt trong thon gọn triệt tiêu dính nách)
        rZ_ant = 0.025 + s * 0.013; // 0.025 -> 0.038
        rZ_pos = 0.025 + s * 0.011; // 0.025 -> 0.036
      } else if (t <= 0.65) {
        // 2. Bicep & Tricep Muscular Belly (y from -0.040 to -0.143) - BẮP TAY NỞ NANG KHỎE KHOẮN
        const midT = (t - 0.18) / 0.47;
        const bicepBulge = Math.sin(midT * Math.PI);
        rX_lat = 0.038 - midT * 0.009; // 0.038 -> 0.029
        rX_med = 0.020 - midT * 0.002; // 0.020 -> 0.018
        rZ_ant = 0.038 + bicepBulge * 0.004 - midT * 0.013; // 0.038 -> 0.042 -> 0.025 (bắp trước)
        rZ_pos = 0.036 + bicepBulge * 0.003 - midT * 0.011; // 0.036 -> 0.039 -> 0.025 (bắp sau)
      } else {
        // 3. Supracondylar Taper down to Elbow Socket (y from -0.143 to -0.220) - Bo tròn ôm khớp cùi chỏ
        const lowT = (t - 0.65) / 0.35;
        rX_lat = 0.029 - lowT * 0.007; // 0.029 -> 0.022
        rX_med = 0.018 - lowT * 0.002; // 0.018 -> 0.016
        rZ_ant = 0.025 - lowT * 0.004; // 0.025 -> 0.021
        rZ_pos = 0.025 - lowT * 0.004; // 0.025 -> 0.021
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
   * Generates an anatomically sculpted forearm geometry with muscular brachioradialis tone.
   * Smoothly cups the elbow hinge at the top and tapers seamlessly to an oval wrist socket at the bottom.
   */
  private createSculptedForearmGeometry(dir: number): THREE.BufferGeometry {
    const NY = 28;
    const NU = 28;
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
        // 1. Inward-rounded Elbow Rim (y from 0.000 down to -0.030) - Ôm khít khớp cùi chỏ
        const rimT = t / 0.15;
        const s = Math.sin((rimT * Math.PI) / 2);
        rX_lat = 0.022 + s * 0.012; // 0.022 -> 0.034
        rX_med = 0.017 + s * 0.011; // 0.017 -> 0.028
        rZ_ant = 0.022 + s * 0.012; // 0.022 -> 0.034
        rZ_pos = 0.022 + s * 0.011; // 0.022 -> 0.033
      } else if (t <= 0.45) {
        // 2. Forearm Belly & Brachioradialis (y from -0.030 to -0.090) - CẲNG TAY NỞ NANG KHỎE MẠNH
        const bellyT = (t - 0.15) / 0.30;
        const bulge = Math.sin(bellyT * Math.PI);
        rX_lat = 0.034 + bulge * 0.003;
        rX_med = 0.028;
        rZ_ant = 0.034 + bulge * 0.004;
        rZ_pos = 0.033 + bulge * 0.003;
      } else if (t <= 0.75) {
        // 3. Mid Forearm Taper (y from -0.090 to -0.150)
        const midT = (t - 0.45) / 0.30;
        rX_lat = 0.034 - midT * 0.014; // 0.034 -> 0.020
        rX_med = 0.028 - midT * 0.012; // 0.028 -> 0.016
        rZ_ant = 0.034 - midT * 0.012; // 0.034 -> 0.022
        rZ_pos = 0.033 - midT * 0.011; // 0.033 -> 0.022
      } else {
        // 4. Wrist Socket Taper (y from -0.150 to -0.200) - Ôm khít khớp cổ tay hình bầu dục
        const wrtT = (t - 0.75) / 0.25;
        rX_lat = 0.020 - wrtT * 0.007; // 0.020 -> 0.013
        rX_med = 0.016 - wrtT * 0.004; // 0.016 -> 0.012
        rZ_ant = 0.022 - wrtT * 0.005; // 0.022 -> 0.017
        rZ_pos = 0.022 - wrtT * 0.005; // 0.022 -> 0.017
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
  // 4. ARMS: Seamless Sculpted Upper Arm (Liền mạch với vai hình bầu dục)
  // ===========================================================================
  private buildArms() {
    [-1, 1].forEach((dir) => {
      const upperArmBone = dir < 0 ? this.leftUpperArm : this.rightUpperArm;
      const elbowGroup = dir < 0 ? this.leftElbow : this.rightElbow;
      const forearmBone = dir < 0 ? this.leftForearm : this.rightForearm;
      const handGroup = dir < 0 ? this.leftHand : this.rightHand;

      // Relaxed, natural athletic arm stance with clear armpit separation
      upperArmBone.rotation.z = dir * 0.072;
      upperArmBone.rotation.x = 0.0;

      // 1. Khối vai hình bầu dục bo tròn mịn màng (Smooth Sculpted Deltoid Cap)
      // Ôm khít dưới mỏm cùng vai acromion và nối liền vào bắp tay
      const shoulderEllipsoidGeo = new THREE.SphereGeometry(0.024, 28, 22);
      shoulderEllipsoidGeo.scale(1.05, 0.80, 1.02);
      const shoulderEllipsoid = new THREE.Mesh(shoulderEllipsoidGeo, this.bodyMaterial);
      shoulderEllipsoid.position.set(0, -0.004, 0);
      shoulderEllipsoid.castShadow = true;
      shoulderEllipsoid.receiveShadow = true;
      upperArmBone.add(shoulderEllipsoid);

      // Khớp xoay âm lồng khít bên trong hốc vai ngực
      const shoulderJointCoreGeo = new THREE.SphereGeometry(0.018, 18, 14);
      const shoulderJointCore = new THREE.Mesh(shoulderJointCoreGeo, this.jointMaterial);
      shoulderJointCore.position.set(dir * -0.006, 0, 0);
      upperArmBone.add(shoulderJointCore);

      // 2. UNIFIED SCULPTED UPPER ARM (NỐI LIỀN DƯỚI KHỐI BẦU DỤC VAI)
      const upperArmGeo = this.createSculptedUpperArmGeometry(dir);
      const upperArmMesh = new THREE.Mesh(upperArmGeo, this.bodyMaterial);
      upperArmMesh.castShadow = true;
      upperArmMesh.receiveShadow = true;
      upperArmBone.add(upperArmMesh);

      // Đĩa đáy bo tròn bịt kín khớp cùi chỏ
      const armEndCapGeo = new THREE.CircleGeometry(0.021, 20);
      armEndCapGeo.rotateX(Math.PI / 2);
      const armEndCap = new THREE.Mesh(armEndCapGeo, this.jointMaterial);
      armEndCap.position.set(0, -0.220, 0);
      upperArmBone.add(armEndCap);

      // 3. SLEEK ORGANIC ELBOW JOINT (Khớp cùi chỏ bo tròn mượt mà, ôm khít 2 đoạn tay)
      const elbowLinkGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.026, 22);
      elbowLinkGeo.rotateZ(Math.PI / 2);
      const elbowLink = new THREE.Mesh(elbowLinkGeo, this.jointMaterial);
      elbowGroup.add(elbowLink);

      [-0.010, 0.010].forEach((yPos) => {
        const discGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.030, 20);
        discGeo.rotateZ(Math.PI / 2);
        const disc = new THREE.Mesh(discGeo, this.jointMaterial);
        disc.position.set(0, yPos, 0);
        elbowGroup.add(disc);

        const rivetGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.033, 14);
        rivetGeo.rotateZ(Math.PI / 2);
        const rivet = new THREE.Mesh(rivetGeo, this.accentMaterial);
        rivet.position.set(0, yPos, 0);
        elbowGroup.add(rivet);
      });

      // 4. SCULPTED FOREARM & WRIST ALIGNMENT
      forearmBone.rotation.set(0.03, 0, 0);

      const forearmGeo = this.createSculptedForearmGeometry(dir);
      const forearmMesh = new THREE.Mesh(forearmGeo, this.bodyMaterial);
      forearmMesh.castShadow = true;
      forearmMesh.receiveShadow = true;
      forearmBone.add(forearmMesh);

      const forearmSeamGeo = new THREE.TorusGeometry(0.018, 0.0022, 10, 24);
      forearmSeamGeo.rotateX(Math.PI / 2);
      const forearmSeam = new THREE.Mesh(forearmSeamGeo, this.jointMaterial);
      forearmSeam.position.set(0, -0.165, 0);
      forearmBone.add(forearmSeam);

      // Khớp cầu cổ tay lồng khít vào hốc cẳng tay
      const wristBallGeo = new THREE.SphereGeometry(0.012, 20, 16);
      const wristBall = new THREE.Mesh(wristBallGeo, this.jointMaterial);
      wristBall.position.set(0, -0.198, 0);
      wristBall.castShadow = true;
      forearmBone.add(wristBall);

      // 5. HAND: Natural Resting Stance (Lòng bàn tay úp vào trong đùi, mu bàn tay hướng ra ngoài, ngón cái phía trước)
      handGroup.rotation.set(0, 0, 0);

      // Phần gốc cổ tay bo tròn khít khớp cầu (Carpal Base Cup)
      const carpalBaseGeo = new THREE.SphereGeometry(0.012, 16, 12);
      carpalBaseGeo.scale(0.85, 0.70, 1.10);
      const carpalBase = new THREE.Mesh(carpalBaseGeo, this.bodyMaterial);
      carpalBase.position.set(0, -0.004, 0);
      carpalBase.castShadow = true;
      handGroup.add(carpalBase);

      // Palm Box (Dày theo trục X 1.3cm, cao theo Y 3.8cm, rộng từ trước ra sau theo Z 3.0cm)
      const palmGeo = new THREE.BoxGeometry(0.013, 0.038, 0.030);
      const palm = new THREE.Mesh(palmGeo, this.bodyMaterial);
      palm.position.set(0, -0.021, 0);
      palm.castShadow = true;
      handGroup.add(palm);

      // Gốc cơ ngón cái (Thenar eminence - ở mặt trong hướng vào đùi, góc trước +Z)
      const thenarGeo = new THREE.SphereGeometry(0.012, 14, 12);
      thenarGeo.scale(0.70, 1.10, 0.80);
      const thenar = new THREE.Mesh(thenarGeo, this.bodyMaterial);
      thenar.position.set(-dir * 0.005, -0.015, 0.009);
      thenar.castShadow = true;
      handGroup.add(thenar);

      // Ngón cái (Thumb - ở phía trước +Z, hướng nhẹ vào trong)
      const thumbRoot = new THREE.Group();
      thumbRoot.position.set(-dir * 0.006, -0.013, 0.013);
      thumbRoot.rotation.set(0.30, -dir * 0.30, -dir * 0.20);

      const t1Geo = new THREE.CapsuleGeometry(0.0045, 0.012, 8, 12);
      const t1 = new THREE.Mesh(t1Geo, this.bodyMaterial);
      t1.position.set(0, -0.006, 0);
      t1.castShadow = true;
      thumbRoot.add(t1);

      const t2Geo = new THREE.CapsuleGeometry(0.0039, 0.010, 8, 12);
      const t2 = new THREE.Mesh(t2Geo, this.bodyMaterial);
      t2.position.set(0, -0.016, 0.003);
      t2.rotation.x = 0.25;
      t2.castShadow = true;
      thumbRoot.add(t2);

      handGroup.add(thumbRoot);

      // 4 Ngón tay (Fingers: Trỏ -> Giữa -> Áp út -> Út phân bố từ trước +Z ra sau -Z)
      const fingerSpacingsZ = [0.010, 0.0035, -0.0035, -0.010];
      const fingerLengths = [0.026, 0.030, 0.028, 0.022];

      fingerSpacingsZ.forEach((fZ, fIdx) => {
        const totalLen = fingerLengths[fIdx];
        const seg1Len = totalLen * 0.55;
        const seg2Len = totalLen * 0.45;

        const fingerRoot = new THREE.Group();
        fingerRoot.position.set(0, -0.040, fZ);
        // Ngón tay cong nhẹ tự nhiên vào trong
        fingerRoot.rotation.set(0.08 + fIdx * 0.02, 0, -dir * 0.06);

        const f1Geo = new THREE.CapsuleGeometry(0.0036, seg1Len, 8, 12);
        const f1 = new THREE.Mesh(f1Geo, this.bodyMaterial);
        f1.position.set(0, -seg1Len / 2, 0);
        f1.castShadow = true;
        fingerRoot.add(f1);

        const f2Geo = new THREE.CapsuleGeometry(0.0030, seg2Len, 8, 12);
        const f2 = new THREE.Mesh(f2Geo, this.bodyMaterial);
        f2.position.set(0, -seg1Len - seg2Len / 2, -0.001);
        f2.rotation.x = 0.15;
        f2.rotation.z = -dir * 0.05;
        f2.castShadow = true;
        fingerRoot.add(f2);

        handGroup.add(fingerRoot);
      });
    });
  }

  // ===========================================================================
  // 5. HIPS & LEGS: Powerful Muscular Thighs (Đùi To Khỏe, Dáng Đứng Vững Chãi)
  // ===========================================================================
  private buildHipsAndLegs() {
    // Solid Anatomical Pelvis Shell
    const pelvisShellGeo = this.createSolidBikiniPelvisGeometry();
    const pelvisMesh = new THREE.Mesh(pelvisShellGeo, this.bodyMaterial);
    pelvisMesh.castShadow = true;
    pelvisMesh.receiveShadow = true;
    this.pelvisBone.add(pelvisMesh);

    // Build Each Leg with SCULPTED SEAMLESS THIGHS & NATURAL ATHLETIC STANCE
    [-1, 1].forEach((dir) => {
      const thighBone = dir < 0 ? this.leftThigh : this.rightThigh;
      const kneeGroup = dir < 0 ? this.leftKnee : this.rightKnee;
      const shinBone = dir < 0 ? this.leftShin : this.rightShin;
      const footGroup = dir < 0 ? this.leftFoot : this.rightFoot;

      // Dáng đứng tự nhiên: 2 chân mở nhẹ ra ngoài bẹn chuẩn tỉ lệ
      thighBone.rotation.z = dir * 0.035;

      // =======================================================================
      // UNIFIED SCULPTED THIGH (ĐÙI ĐÚC LIỀN NỞ NANG, TO HƠN TAY 20%+)
      // =======================================================================
      const thighGeo = this.createSculptedThighGeometry(dir);
      const thighMesh = new THREE.Mesh(thighGeo, this.bodyMaterial);
      thighMesh.castShadow = true;
      thighMesh.receiveShadow = true;
      thighBone.add(thighMesh);

      // Đĩa đáy bịt kín đầu gối (Knee end cap - bo tròn thu gọn)
      const thighEndCapGeo = new THREE.CircleGeometry(0.024, 22);
      thighEndCapGeo.rotateX(Math.PI / 2);
      const thighEndCap = new THREE.Mesh(thighEndCapGeo, this.jointMaterial);
      thighEndCap.position.set(0, -0.300, 0);
      thighBone.add(thighEndCap);

      // 3. SLEEK ORGANIC DOUBLE-JOINT KNEE (Khớp gối bo tròn mượt mà)
      const kneeLinkGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.032, 22);
      kneeLinkGeo.rotateZ(Math.PI / 2);
      const kneeLink = new THREE.Mesh(kneeLinkGeo, this.jointMaterial);
      kneeGroup.add(kneeLink);

      [-0.010, 0.010].forEach((yPos) => {
        const discGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.036, 22);
        discGeo.rotateZ(Math.PI / 2);
        const disc = new THREE.Mesh(discGeo, this.jointMaterial);
        disc.position.set(0, yPos, 0);
        kneeGroup.add(disc);

        const rivetGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.039, 14);
        rivetGeo.rotateZ(Math.PI / 2);
        const rivet = new THREE.Mesh(rivetGeo, this.accentMaterial);
        rivet.position.set(0, yPos, 0);
        kneeGroup.add(rivet);
      });

      // Xương bánh chè giải phẫu học mượt mà (Sculpted Anatomical Patella Shield)
      const patellaGeo = new THREE.CapsuleGeometry(0.011, 0.012, 14, 16);
      patellaGeo.scale(1.15, 0.95, 0.60);
      const patella = new THREE.Mesh(patellaGeo, this.bodyMaterial);
      patella.position.set(0, 0, 0.019);
      patella.castShadow = true;
      kneeGroup.add(patella);

      // Sculpted Calf Block
      const calfGeo = this.createSculptedCalfGeometry(dir);
      const calfMesh = new THREE.Mesh(calfGeo, this.bodyMaterial);
      calfMesh.castShadow = true;
      calfMesh.receiveShadow = true;
      shinBone.add(calfMesh);

      const ankleBallGeo = new THREE.SphereGeometry(0.014, 22, 18);
      const ankleBall = new THREE.Mesh(ankleBallGeo, this.jointMaterial);
      ankleBall.position.set(0, -0.295, 0);
      ankleBall.castShadow = true;
      shinBone.add(ankleBall);

      [-1, 1].forEach((mDir) => {
        const malleolusGeo = new THREE.SphereGeometry(0.0075, 12, 10);
        malleolusGeo.scale(0.6, 0.9, 0.8);
        const malleolus = new THREE.Mesh(malleolusGeo, this.jointMaterial);
        malleolus.position.set(mDir * 0.016, -0.295, 0);
        shinBone.add(malleolus);
      });

      // Anatomical Foot & Ankle
      footGroup.rotation.y = dir * 0.05;
      footGroup.rotation.z = dir * -0.035;

      const footSocketGeo = new THREE.CylinderGeometry(0.014, 0.016, 0.010, 20);
      const footSocket = new THREE.Mesh(footSocketGeo, this.jointMaterial);
      footSocket.position.set(0, 0.005, 0);
      footGroup.add(footSocket);

      // Sculpted Anatomical Foot
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

        let rX = 0.092;
        let rZ = 0.078;

        if (y < 0.0) {
          // Lower Pelvis & Crotch Taper
          const crotchT = -y / 0.065;
          rX = 0.090 - crotchT * 0.044; // 0.090 -> 0.046
          rZ = 0.076 - crotchT * 0.032; // 0.076 -> 0.044
        } else {
          // Upper Pelvis towards Waist (Smooth gluteal-to-lumbar contour)
          const waistT = y / 0.065;
          rX = 0.090 - waistT * 0.005; // 0.090 -> 0.085
          rZ = 0.076 - waistT * 0.012; // 0.076 -> 0.064
        }

        let px = sinT * rX;
        let pz = cosT * rZ;

        // Smooth anatomical bikini leg cut opening (groin crease - uốn lượn mềm mại ôm đầu đùi)
        if (y < 0.025 && absSin > 0.22) {
          const cutT = (0.025 - y) / 0.090;
          const latT = (absSin - 0.22) / 0.78;
          const cutAmt = cutT * Math.sin(latT * Math.PI) * 0.016;
          px -= (sinT > 0 ? 1 : -1) * cutAmt;
        }

        // Gluteal definition on the back
        if (cosT < 0 && y > -0.045 && y < 0.045 && absSin > 0.15 && absSin < 0.85) {
          const gluteY = Math.sin(((y + 0.045) / 0.090) * Math.PI);
          const gluteX = Math.sin(((absSin - 0.15) / 0.70) * Math.PI);
          pz -= gluteY * gluteX * 0.012;
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
   * 4. Seamless insertion into the pelvis socket at the top and cupped knee socket at bottom.
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
        rX_lat = Math.max(0.002, s * 0.058);
        rX_med = Math.max(0.002, s * 0.044);
        rZ_ant = Math.max(0.002, s * 0.062);
        rZ_pos = Math.max(0.002, s * 0.052);
      } else if (t <= 0.45) {
        // 2. Upper Quadriceps & Vastus Lateralis Bulge (y from -0.018 to -0.124) - ĐÙI TO NỞ NANG HƠN TAY 20%+
        const qT = (t - 0.12) / 0.33;
        const latBulge = Math.sin(qT * Math.PI);
        rX_lat = 0.058 + latBulge * 0.005 - qT * 0.005; // 0.058 -> 0.059
        rX_med = 0.044 - qT * 0.004;                   // 0.044 -> 0.040
        rZ_ant = 0.062 + latBulge * 0.005 - qT * 0.007; // 0.062 -> 0.060 (cơ tứ đầu đùi cuồn cuộn)
        rZ_pos = 0.052 + latBulge * 0.003 - qT * 0.005; // 0.052 -> 0.050 (cơ gân khoeo đùi sau)
      } else if (t <= 0.82) {
        // 3. Mid to Lower Thigh with Vastus Medialis (cơ giọt nước) on the inner side (y from -0.124 to -0.242)
        const midT = (t - 0.45) / 0.37;
        const medTeardrop = Math.sin(Math.pow(midT, 1.4) * Math.PI);
        rX_lat = 0.059 - midT * 0.019; // 0.059 -> 0.040
        rX_med = 0.040 + medTeardrop * 0.006 - midT * 0.009; // Teardrop nở rõ ở mặt trong phía trên đầu gối
        rZ_ant = 0.060 + medTeardrop * 0.004 - midT * 0.018; // 0.060 -> 0.042
        rZ_pos = 0.050 - midT * 0.015; // 0.050 -> 0.035
      } else {
        // 4. Supracondylar Knee Region (y from -0.242 to -0.300) - Bo tròn thu nhỏ ôm khít khớp gối
        const kT = (t - 0.82) / 0.18;
        rX_lat = 0.040 - kT * 0.015; // 0.040 -> 0.025
        rX_med = 0.037 - kT * 0.013; // 0.037 -> 0.024
        rZ_ant = 0.042 - kT * 0.017; // 0.042 -> 0.025
        rZ_pos = 0.035 - kT * 0.010; // 0.035 -> 0.025
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
        rX_lat = 0.023 + s * 0.014; // 0.023 -> 0.037
        rX_med = 0.023 + s * 0.013; // 0.023 -> 0.036
        rZ_ant = 0.024 + s * 0.013; // 0.024 -> 0.037
        rZ_pos = 0.024 + s * 0.013; // 0.024 -> 0.037
      } else if (t <= 0.45) {
        // 2. Upper Calf & Gastrocnemius Belly (y from -0.036 to -0.135)
        const bellyT = (t - 0.12) / 0.33;
        const bulge = Math.sin(bellyT * Math.PI);
        rX_lat = 0.037 + bulge * 0.003 - bellyT * 0.004; // 0.037 -> 0.036
        rX_med = 0.036 + bulge * 0.002 - bellyT * 0.004; // 0.036 -> 0.034
        rZ_ant = 0.037 - bellyT * 0.002;                 // Tibial crest (xương ống đồng)
        rZ_pos = 0.037 + bulge * 0.005 - bellyT * 0.007; // Bắp chuối nở phía sau
      } else if (t <= 0.80) {
        // 3. Mid to Lower Shin (y from -0.135 to -0.240)
        const midT = (t - 0.45) / 0.35;
        rX_lat = 0.036 - midT * 0.012; // 0.036 -> 0.024
        rX_med = 0.034 - midT * 0.011; // 0.034 -> 0.023
        rZ_ant = 0.035 - midT * 0.011; // 0.035 -> 0.024
        rZ_pos = 0.035 - midT * 0.013; // 0.035 -> 0.022
      } else {
        // 4. Supramalleolar Ankle Taper (y from -0.240 to -0.300)
        const ankT = (t - 0.80) / 0.20;
        rX_lat = 0.024 - ankT * 0.005; // 0.024 -> 0.019
        rX_med = 0.023 - ankT * 0.005; // 0.023 -> 0.018
        rZ_ant = 0.024 - ankT * 0.004; // 0.024 -> 0.020
        rZ_pos = 0.022 - ankT * 0.003; // 0.022 -> 0.019
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
   * Cập nhật màu da / chất liệu toàn thân và ngũ quan đồng bộ từ bảng màu customizer
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

    // Cập nhật ngũ quan khuôn mặt khi config thay đổi
    if (this.headMesh && config) {
      const oldGeo = this.headMesh.geometry;
      this.headMesh.geometry = this.createUnifiedSculptedHeadGeometry(config);
      if (oldGeo) {
        oldGeo.dispose();
      }
    }

    // Cập nhật màu mắt & 4 dáng mắt 3D trong thời gian thực (mặc định option 1: Mắt Híp & Đen Tuyền)
    const eyeColor = config?.eyeColor || '#151316';
    const newTex = this.getOrCreateEyeTexture(eyeColor);
    if (this.eyeMaterial) {
      this.eyeMaterial.map = newTex;
      this.eyeMaterial.needsUpdate = true;
    }

    const eyeShape = config?.eyeShapeId || 'eye_shape_narrow_slanted';
    let eyeScaleX = 1.0;
    let eyeScaleY = 0.85;
    let eyeTiltZ = 0;

    if (eyeShape === 'eye_shape_narrow_slanted') {
      // 1. Mắt Híp / Một Mí: dẹt ngang hẹp dọc đặc trưng mắt cười/một mí
      eyeScaleX = 1.30;
      eyeScaleY = 0.36;
      eyeTiltZ = 0;
    } else if (eyeShape === 'eye_shape_natural_almond') {
      // 2. Mắt Hạnh Nhân / Tự Nhiên: mở vừa vặn, chuẩn Á Đông cân đối
      eyeScaleX = 1.00;
      eyeScaleY = 0.85;
      eyeTiltZ = 0;
    } else if (eyeShape === 'eye_shape_phoenix') {
      // 3. Mắt Phượng: xếch nhẹ thanh tú sắc sảo
      eyeScaleX = 1.18;
      eyeScaleY = 0.72;
      eyeTiltZ = 0.18;
    } else if (eyeShape === 'eye_shape_big_round') {
      // 4. Mắt To Tròn: mở to tròn long lanh hai mí
      eyeScaleX = 1.12;
      eyeScaleY = 1.35;
      eyeTiltZ = 0;
    }

    if (this.leftEyeGroup) {
      this.leftEyeGroup.scale.set(eyeScaleX, eyeScaleY, 1.0);
      this.leftEyeGroup.rotation.z = -eyeTiltZ;
    }
    if (this.rightEyeGroup) {
      this.rightEyeGroup.scale.set(eyeScaleX, eyeScaleY, 1.0);
      this.rightEyeGroup.rotation.z = eyeTiltZ;
    }

    // Cập nhật dáng chân mày (Cánh Cung mềm mại hoặc Chân Mày Kiếm sắc sảo - chìm sát mặt da trán)
    const isSwordBrow = config?.eyebrowShapeId === 'brow_sword_bold';
    [-1, 1].forEach((dir) => {
      const browMesh = dir < 0 ? this.leftBrowMesh : this.rightBrowMesh;
      if (browMesh) {
        const peakY = isSwordBrow ? 0.0225 : 0.0212;
        const tailY = isSwordBrow ? 0.0200 : 0.0175;
        const pts = [
          new THREE.Vector3(dir * 0.0075, 0.0188, 0.0436),
          new THREE.Vector3(dir * 0.0185, peakY, 0.0402),
          new THREE.Vector3(dir * 0.0305, tailY, 0.0322),
        ];
        const browCurve = new THREE.CatmullRomCurve3(pts);
        const oldGeo = browMesh.geometry;
        browMesh.geometry = new THREE.TubeGeometry(browCurve, 16, isSwordBrow ? 0.00048 : 0.00038, 8, false);
        if (oldGeo) oldGeo.dispose();
      }
    });

    if (config?.hairColor && this.browMaterial) {
      this.browMaterial.color.set(config.hairColor);
    }

    // Cập nhật 3 dáng môi 3D (Mỏng Tự Nhiên, Căng Mọng, Môi Trề To Dày Cộp - Chìm Khớp Vào Khối Mặt)
    const isTreLipMesh = config?.mouthShapeId === 'mouth_pouting_thick_tre';
    const isPlumpLipMesh = config?.mouthShapeId === 'mouth_plump_full';

    if (this.upperLipMesh) {
      let upperLipPts: THREE.Vector3[];
      let uRadius = 0.00055;

      if (isTreLipMesh) {
        // Môi trên dẩu nhô cao
        upperLipPts = [
          new THREE.Vector3(-0.0135, -0.0245, 0.0430),
          new THREE.Vector3(-0.0055, -0.0210, 0.0480),
          new THREE.Vector3(0.0000, -0.0220, 0.0476),
          new THREE.Vector3(0.0055, -0.0210, 0.0480),
          new THREE.Vector3(0.0135, -0.0245, 0.0430),
        ];
        uRadius = 0.00115;
      } else if (isPlumpLipMesh) {
        // Môi trên căng mọng
        upperLipPts = [
          new THREE.Vector3(-0.0125, -0.0245, 0.0425),
          new THREE.Vector3(-0.0050, -0.0215, 0.0460),
          new THREE.Vector3(0.0000, -0.0226, 0.0456),
          new THREE.Vector3(0.0050, -0.0215, 0.0460),
          new THREE.Vector3(0.0125, -0.0245, 0.0425),
        ];
        uRadius = 0.00085;
      } else {
        // Môi trên mỏng tự nhiên
        upperLipPts = [
          new THREE.Vector3(-0.0115, -0.0245, 0.0418),
          new THREE.Vector3(-0.0045, -0.0220, 0.0442),
          new THREE.Vector3(0.0000, -0.0232, 0.0438),
          new THREE.Vector3(0.0045, -0.0220, 0.0442),
          new THREE.Vector3(0.0115, -0.0245, 0.0418),
        ];
        uRadius = 0.00055;
      }

      const upperLipCurve = new THREE.CatmullRomCurve3(upperLipPts);
      const oldUpperGeo = this.upperLipMesh.geometry;
      this.upperLipMesh.geometry = new THREE.TubeGeometry(upperLipCurve, 20, uRadius, 8, false);
      if (oldUpperGeo) oldUpperGeo.dispose();
    }

    if (this.lowerLipMesh) {
      let lowerLipPts: THREE.Vector3[];
      let lRadius = 0.00070;

      if (isTreLipMesh) {
        // Môi dưới trề hẳn ra phía trước và trễ xuống dày cộp
        lowerLipPts = [
          new THREE.Vector3(-0.0140, -0.0255, 0.0432),
          new THREE.Vector3(0.0000, -0.0295, 0.0515),
          new THREE.Vector3(0.0140, -0.0255, 0.0432),
        ];
        lRadius = 0.00150;
      } else if (isPlumpLipMesh) {
        // Môi dưới đầy đặn căng mọng
        lowerLipPts = [
          new THREE.Vector3(-0.0118, -0.0255, 0.0426),
          new THREE.Vector3(0.0000, -0.0285, 0.0468),
          new THREE.Vector3(0.0118, -0.0255, 0.0426),
        ];
        lRadius = 0.00105;
      } else {
        // Môi dưới mỏng thanh thoát
        lowerLipPts = [
          new THREE.Vector3(-0.0105, -0.0255, 0.0420),
          new THREE.Vector3(0.0000, -0.0280, 0.0442),
          new THREE.Vector3(0.0105, -0.0255, 0.0420),
        ];
        lRadius = 0.00070;
      }

      const lowerLipCurve = new THREE.CatmullRomCurve3(lowerLipPts);
      const oldLowerGeo = this.lowerLipMesh.geometry;
      this.lowerLipMesh.geometry = new THREE.TubeGeometry(lowerLipCurve, 18, lRadius, 8, false);
      if (oldLowerGeo) oldLowerGeo.dispose();
    }

    if (config?.lipColor && this.lipMaterial) {
      this.lipMaterial.color.set(config.lipColor);
    }

    // Cập nhật tỉ lệ cơ thể 3D (Chiều cao mầm non chuẩn WHO: 95cm - 115cm & Tỉ lệ dài chân)
    if (config?.body) {
      // 1. Chiều cao mầm non (chuẩn 105cm)
      const heightCm = config.body.heightCm || 105;
      const heightRatio = heightCm / 105;
      this.spineRoot.scale.set(heightRatio, heightRatio, heightRatio);

      // 2. Tỉ lệ chiều dài chân (Leg Length Ratio)
      // Chỉ scale leftThigh và rightThigh, vì leftShin và leftFoot là con trong cây phân cấp
      // nên đã tự động kế thừa scale Y. Giữ leftShin/rightShin scale (1,1,1) để tránh bị nhân đôi (legScale^2)
      const legScale = config.body.legLengthScale || 1.0;
      this.currentLegScale = legScale;
      this.leftThigh.scale.set(1, legScale, 1);
      this.rightThigh.scale.set(1, legScale, 1);
      this.leftShin.scale.set(1, 1, 1);
      this.rightShin.scale.set(1, 1, 1);
    }
  }

  // ===========================================================================
  // 5 DYNAMIC POSE PRESETS SYSTEM
  // ===========================================================================
  private currentPoseId: MannequinPoseId = 'relaxed';

  /**
   * Đặt tư thế cho nhân vật với chuyển động mượt mà (smooth blend)
   */
  public setPose(poseId: MannequinPoseId | string) {
    if (poseId in MANNEQUIN_POSES) {
      this.currentPoseId = poseId as MannequinPoseId;
    }
  }

  /**
   * Lấy tư thế hiện tại
   */
  public getPose(): MannequinPoseId {
    return this.currentPoseId;
  }

  private smoothRotate(
    group: THREE.Group,
    target: [number, number, number] | undefined,
    lerpSpeed: number,
    extraX = 0,
    extraY = 0,
    extraZ = 0
  ) {
    if (!target) return;
    const tx = target[0] + extraX;
    const ty = target[1] + extraY;
    const tz = target[2] + extraZ;
    group.rotation.x += (tx - group.rotation.x) * lerpSpeed;
    group.rotation.y += (ty - group.rotation.y) * lerpSpeed;
    group.rotation.z += (tz - group.rotation.z) * lerpSpeed;
  }

  private smoothPosition(
    group: THREE.Group,
    target: [number, number, number] | undefined,
    lerpSpeed: number,
    extraX = 0,
    extraY = 0,
    extraZ = 0
  ) {
    if (!target) return;
    const tx = target[0] + extraX;
    const ty = target[1] + extraY;
    const tz = target[2] + extraZ;
    group.position.x += (tx - group.position.x) * lerpSpeed;
    group.position.y += (ty - group.position.y) * lerpSpeed;
    group.position.z += (tz - group.position.z) * lerpSpeed;
  }

  /**
   * Hoạt ảnh vi mô sống động (Breathing, Head-Tracking, Subtle Weight-Shift, Wave & Martial Arts live physics)
   */
  public update(delta: number, time: number, mouseNormalized: { x: number; y: number }) {
    const lerpSpeed = Math.min(1.0, 10.0 * delta);
    const pose = MANNEQUIN_POSES[this.currentPoseId] || MANNEQUIN_POSES.relaxed;

    // 1. Natural Diaphragmatic Idle Breathing (Thở nhịp nhàng)
    const breath = Math.sin(time * 1.8);
    this.chestBone.position.y = 0.12 + breath * 0.004;
    this.chestBone.scale.y = 1.0 + breath * 0.008;

    // 2. Damped Head & Neck Tracking (Đầu và cổ dõi mắt nhìn theo trỏ chuột)
    const targetHeadX = -mouseNormalized.y * 0.28;
    const targetHeadY = mouseNormalized.x * 0.42;

    this.neckBone.rotation.y += (targetHeadY * 0.35 - this.neckBone.rotation.y) * 0.10;
    this.neckBone.rotation.x += (targetHeadX * 0.35 - this.neckBone.rotation.x) * 0.10;

    this.headBone.rotation.y += (targetHeadY * 0.65 - this.headBone.rotation.y) * 0.12;
    this.headBone.rotation.x += (targetHeadX * 0.65 - this.headBone.rotation.x) * 0.12;

    // 3. Live Physics & Micro-motion theo từng Pose
    let rightForearmWaveExtraZ = 0;
    let combatBounceY = 0;
    let livingShiftX = 0;
    let livingShiftZ = 0;

    if (this.currentPoseId === 'wave') {
      // Hoạt ảnh vẫy tay nhịp nhàng sống động
      rightForearmWaveExtraZ = Math.sin(time * 6.5) * 0.22;
    } else if (this.currentPoseId === 'martial_arts') {
      // Nhún nhịp nhàng theo thế tấn võ thuật
      combatBounceY = Math.sin(time * 3.5) * 0.005;
    } else {
      this.weightShiftCycle += delta * 0.45;
      const shift = Math.sin(this.weightShiftCycle);
      livingShiftX = shift * 0.005;
      livingShiftZ = shift * 0.008;
    }

    // 4. Smoothly Blend All Skeletal Joints into Selected Pose (có scale theo tỉ lệ chân)
    const rawPelvisY = pose.pelvisPos ? pose.pelvisPos[1] : 0.662;
    // 0.030m là khoảng cách cố định từ pelvisBone đến chỏm khớp háng (dropDownPeg).
    // Chiều dài chân từ khớp háng đến đáy bàn chân là (rawPelvisY - 0.030)m, được co giãn tuyến tính theo currentLegScale.
    const basePelvisY = 0.030 + (rawPelvisY - 0.030) * this.currentLegScale;
    const adjustedPelvisPos: [number, number, number] = [
      pose.pelvisPos ? pose.pelvisPos[0] : 0,
      basePelvisY,
      pose.pelvisPos ? pose.pelvisPos[2] : 0,
    ];

    this.smoothPosition(this.pelvisBone, adjustedPelvisPos, lerpSpeed, livingShiftX, combatBounceY, 0);
    this.smoothRotate(this.pelvisBone, pose.pelvisRot, lerpSpeed, 0, 0, livingShiftZ);
    this.smoothRotate(this.waistBone, pose.waistRot, lerpSpeed);
    this.smoothRotate(this.chestBone, pose.chestRot, lerpSpeed);

    this.smoothRotate(this.leftShoulder, pose.leftShoulderRot, lerpSpeed);
    this.smoothRotate(this.rightShoulder, pose.rightShoulderRot, lerpSpeed);

    this.smoothRotate(this.leftUpperArm, pose.leftUpperArmRot, lerpSpeed);
    this.smoothRotate(this.rightUpperArm, pose.rightUpperArmRot, lerpSpeed);

    this.smoothRotate(this.leftForearm, pose.leftForearmRot, lerpSpeed);
    this.smoothRotate(this.rightForearm, pose.rightForearmRot, lerpSpeed, 0, 0, rightForearmWaveExtraZ);

    this.smoothRotate(this.leftHand, pose.leftHandRot, lerpSpeed);
    this.smoothRotate(this.rightHand, pose.rightHandRot, lerpSpeed, 0, 0, rightForearmWaveExtraZ * 0.6);

    this.smoothRotate(this.leftThigh, pose.leftThighRot, lerpSpeed);
    this.smoothRotate(this.rightThigh, pose.rightThighRot, lerpSpeed);

    this.smoothRotate(this.leftKnee, pose.leftKneeRot, lerpSpeed);
    this.smoothRotate(this.rightKnee, pose.rightKneeRot, lerpSpeed);

    this.smoothRotate(this.leftShin, pose.leftShinRot, lerpSpeed);
    this.smoothRotate(this.rightShin, pose.rightShinRot, lerpSpeed);

    this.smoothRotate(this.leftFoot, pose.leftFootRot, lerpSpeed);
    this.smoothRotate(this.rightFoot, pose.rightFootRot, lerpSpeed);
  }

  /**
   * Giải phóng tài nguyên đồ họa WebGL
   */
  public dispose() {
    this.bodyMaterial.dispose();
    this.jointMaterial.dispose();
    this.accentMaterial.dispose();
    if (this.eyeTexture) {
      this.eyeTexture.dispose();
      this.eyeTexture = null;
    }
    this.eyeMaterial.dispose();
    this.pupilMaterial.dispose();
    this.browMaterial.dispose();

    this.root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
      }
    });
  }
}

// =============================================================================
// POSE DEFINITIONS & CONFIGURATION
// =============================================================================
export type MannequinPoseId = 'relaxed' | 'cross_arms' | 'hands_on_hips' | 'wave' | 'martial_arts';

interface JointTransforms {
  pelvisRot?: [number, number, number];
  pelvisPos?: [number, number, number];
  waistRot?: [number, number, number];
  chestRot?: [number, number, number];
  leftShoulderRot?: [number, number, number];
  rightShoulderRot?: [number, number, number];
  leftUpperArmRot?: [number, number, number];
  rightUpperArmRot?: [number, number, number];
  leftForearmRot?: [number, number, number];
  rightForearmRot?: [number, number, number];
  leftHandRot?: [number, number, number];
  rightHandRot?: [number, number, number];
  leftThighRot?: [number, number, number];
  rightThighRot?: [number, number, number];
  leftKneeRot?: [number, number, number];
  rightKneeRot?: [number, number, number];
  leftShinRot?: [number, number, number];
  rightShinRot?: [number, number, number];
  leftFootRot?: [number, number, number];
  rightFootRot?: [number, number, number];
}

export const MANNEQUIN_POSES: Record<MannequinPoseId, JointTransforms> = {
  // 1. Dáng thư thái, tự nhiên (Mặc định)
  relaxed: {
    pelvisRot: [0, 0, 0],
    pelvisPos: [0, 0.662, 0],
    waistRot: [0, 0, 0],
    chestRot: [0, 0, 0],
    leftShoulderRot: [0, 0, 0],
    rightShoulderRot: [0, 0, 0],
    leftUpperArmRot: [-0.04, 0, -0.05],
    rightUpperArmRot: [-0.04, 0, 0.05],
    leftForearmRot: [-0.08, 0, -0.02],
    rightForearmRot: [-0.08, 0, 0.02],
    leftHandRot: [0, 0, 0],
    rightHandRot: [0, 0, 0],
    leftThighRot: [0, 0, -0.02],
    rightThighRot: [0, 0, 0.02],
    leftKneeRot: [0, 0, 0],
    rightKneeRot: [0, 0, 0],
    leftShinRot: [0, 0, 0],
    rightShinRot: [0, 0, 0],
    leftFootRot: [0, 0, 0],
    rightFootRot: [0, 0, 0],
  },

  // 2. Khoanh tay ngầu, 2 tay khoanh chéo ôm ngang ngực
  cross_arms: {
    pelvisRot: [0, 0.04, 0],
    pelvisPos: [0, 0.662, 0],
    waistRot: [0, -0.02, 0],
    chestRot: [-0.03, 0, 0],
    leftShoulderRot: [-0.04, 0.08, 0.03],
    rightShoulderRot: [-0.04, -0.08, -0.03],
    leftUpperArmRot: [-0.45, 0.95, -0.25],
    rightUpperArmRot: [-0.48, -0.90, 0.22],
    leftForearmRot: [-1.75, -0.25, 0.45],
    rightForearmRot: [-1.70, 0.25, -0.45],
    leftHandRot: [-0.10, -0.30, -0.15],
    rightHandRot: [-0.10, 0.30, 0.15],
    leftThighRot: [0, -0.04, -0.04],
    rightThighRot: [0, 0.06, 0.06],
    leftKneeRot: [0, 0, 0],
    rightKneeRot: [0, 0, 0],
    leftShinRot: [0, 0, 0],
    rightShinRot: [0, 0, 0],
    leftFootRot: [0, 0, 0],
    rightFootRot: [0, 0, 0],
  },

  // 3. Chống nạnh tự tin, 2 tay chống vững chãi ôm sát hai bên mào chậu eo
  hands_on_hips: {
    pelvisRot: [0, 0, 0],
    pelvisPos: [0, 0.662, 0],
    waistRot: [0, 0, 0],
    chestRot: [0.06, 0, 0],
    leftShoulderRot: [0, 0, 0.04],
    rightShoulderRot: [0, 0, -0.04],
    leftUpperArmRot: [0.45, 0.75, -0.75],
    rightUpperArmRot: [0.45, -0.75, 0.75],
    leftForearmRot: [-1.65, -0.20, 0.35],
    rightForearmRot: [-1.65, 0.20, -0.35],
    leftHandRot: [0.20, -0.40, -0.25],
    rightHandRot: [0.20, 0.40, 0.25],
    leftThighRot: [0, 0.04, -0.08],
    rightThighRot: [0, -0.04, 0.08],
    leftKneeRot: [0, 0, 0],
    rightKneeRot: [0, 0, 0],
    leftShinRot: [0, 0, 0.02],
    rightShinRot: [0, 0, -0.02],
    leftFootRot: [0, 0, 0],
    rightFootRot: [0, 0, 0],
  },

  // 4. Vẫy tay chào thân thiện
  wave: {
    pelvisRot: [0, -0.04, -0.02],
    pelvisPos: [0, 0.662, 0],
    waistRot: [0, -0.04, 0.02],
    chestRot: [0, -0.04, 0.02],
    leftShoulderRot: [0, 0, 0],
    rightShoulderRot: [0.06, -0.10, -0.15],
    leftUpperArmRot: [-0.04, 0, -0.06],
    rightUpperArmRot: [-1.45, -0.45, 0.90],
    leftForearmRot: [-0.08, 0, -0.02],
    rightForearmRot: [-1.35, 0.35, 0.30],
    leftHandRot: [0, 0, 0],
    rightHandRot: [0, 0, 0.20],
    leftThighRot: [0, -0.04, -0.03],
    rightThighRot: [0, 0.06, 0.05],
    leftKneeRot: [0, 0, 0],
    rightKneeRot: [0.08, 0, 0],
    leftShinRot: [0, 0, 0],
    rightShinRot: [0, 0, 0],
    leftFootRot: [0, 0, 0],
    rightFootRot: [0, 0, 0],
  },

  // 5. Thế võ Kungfu / Siêu anh hùng thủ thế phía trước
  martial_arts: {
    pelvisRot: [-0.04, 0.35, 0],
    pelvisPos: [0.01, 0.650, 0],
    waistRot: [0, -0.12, 0],
    chestRot: [0.04, -0.15, 0],
    leftShoulderRot: [-0.08, -0.06, -0.04],
    rightShoulderRot: [0.06, 0.10, 0.04],
    leftUpperArmRot: [-0.65, 0.25, -0.35],
    rightUpperArmRot: [0.22, -0.30, 0.35],
    leftForearmRot: [-1.45, 0.15, 0.20],
    rightForearmRot: [-1.40, 0.15, -0.15],
    leftHandRot: [-0.10, -0.15, 0],
    rightHandRot: [0, 0, 0],
    leftThighRot: [-0.28, 0, -0.12],
    rightThighRot: [0.22, 0, 0.16],
    leftKneeRot: [0.32, 0, 0],
    rightKneeRot: [0.18, 0, 0],
    leftShinRot: [0, 0, -0.02],
    rightShinRot: [0, 0, 0.02],
    leftFootRot: [-0.04, 0.10, 0],
    rightFootRot: [-0.02, -0.12, 0],
  },
};
