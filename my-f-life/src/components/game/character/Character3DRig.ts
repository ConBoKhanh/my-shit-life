import * as THREE from 'three';
import type { CharacterAvatarConfig } from '../../../types/game';

export class Character3DRig {
  public root: THREE.Group;
  public pelvis: THREE.Group;
  public spine: THREE.Group;
  public chest: THREE.Group;
  public neck: THREE.Group;
  public head: THREE.Group;

  // Limbs
  public leftShoulder: THREE.Group;
  public leftUpperArm: THREE.Group;
  public leftForearm: THREE.Group;
  public leftHand: THREE.Group;

  public rightShoulder: THREE.Group;
  public rightUpperArm: THREE.Group;
  public rightForearm: THREE.Group;
  public rightHand: THREE.Group;

  public leftThigh: THREE.Group;
  public leftKnee: THREE.Group;
  public leftFoot: THREE.Group;

  public rightThigh: THREE.Group;
  public rightKnee: THREE.Group;
  public rightFoot: THREE.Group;

  // Modular outfit groups
  private hairGroup: THREE.Group;
  private faceGroup: THREE.Group;
  private shirtGroup: THREE.Group;
  private pantsGroup: THREE.Group;
  private shoesGroup: THREE.Group;
  private accessoryGroup: THREE.Group;

  // Eyes and eyelids for blinking
  private leftEye: THREE.Mesh | null = null;
  private rightEye: THREE.Mesh | null = null;
  private leftEyelid: THREE.Mesh | null = null;
  private rightEyelid: THREE.Mesh | null = null;

  // Materials cache
  private skinMaterial: THREE.MeshStandardMaterial;
  private hairMaterial: THREE.MeshStandardMaterial;

  // Animation states
  private blinkTimer: number = 0;
  private happyHopTime: number = 0;

  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'CharacterRoot';

    // Materials
    this.skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe8d6,
      roughness: 0.65,
      metalness: 0.05,
    });

    this.hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x22202a,
      roughness: 0.55,
      metalness: 0.1,
    });

    // 1. Khung xương hông (Pelvis)
    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 1.05;
    this.root.add(this.pelvis);

    // 2. Chân trái
    this.leftThigh = new THREE.Group();
    this.leftThigh.position.set(-0.18, 0, 0);
    this.pelvis.add(this.leftThigh);

    this.leftKnee = new THREE.Group();
    this.leftKnee.position.set(0, -0.36, 0);
    this.leftThigh.add(this.leftKnee);

    this.leftFoot = new THREE.Group();
    this.leftFoot.position.set(0, -0.32, 0.06);
    this.leftKnee.add(this.leftFoot);

    // 3. Chân phải
    this.rightThigh = new THREE.Group();
    this.rightThigh.position.set(0.18, 0, 0);
    this.pelvis.add(this.rightThigh);

    this.rightKnee = new THREE.Group();
    this.rightKnee.position.set(0, -0.36, 0);
    this.rightThigh.add(this.rightKnee);

    this.rightFoot = new THREE.Group();
    this.rightFoot.position.set(0, -0.32, 0.06);
    this.rightKnee.add(this.rightFoot);

    // 4. Thân trên: Cột sống (Spine) & Ngực (Chest)
    this.spine = new THREE.Group();
    this.spine.position.y = 0.15;
    this.pelvis.add(this.spine);

    this.chest = new THREE.Group();
    this.chest.position.y = 0.28;
    this.spine.add(this.chest);

    // 5. Tay trái
    this.leftShoulder = new THREE.Group();
    this.leftShoulder.position.set(-0.35, 0.14, 0);
    this.chest.add(this.leftShoulder);

    this.leftUpperArm = new THREE.Group();
    this.leftUpperArm.position.set(0, -0.05, 0);
    this.leftShoulder.add(this.leftUpperArm);

    this.leftForearm = new THREE.Group();
    this.leftForearm.position.set(0, -0.25, 0);
    this.leftUpperArm.add(this.leftForearm);

    this.leftHand = new THREE.Group();
    this.leftHand.position.set(0, -0.22, 0);
    this.leftForearm.add(this.leftHand);

    // 6. Tay phải
    this.rightShoulder = new THREE.Group();
    this.rightShoulder.position.set(0.35, 0.14, 0);
    this.chest.add(this.rightShoulder);

    this.rightUpperArm = new THREE.Group();
    this.rightUpperArm.position.set(0, -0.05, 0);
    this.rightShoulder.add(this.rightUpperArm);

    this.rightForearm = new THREE.Group();
    this.rightForearm.position.set(0, -0.25, 0);
    this.rightUpperArm.add(this.rightForearm);

    this.rightHand = new THREE.Group();
    this.rightHand.position.set(0, -0.22, 0);
    this.rightForearm.add(this.rightHand);

    // 7. Cổ & Đầu (Neck & Head)
    this.neck = new THREE.Group();
    this.neck.position.y = 0.32;
    this.chest.add(this.neck);

    this.head = new THREE.Group();
    this.head.position.y = 0.32;
    this.neck.add(this.head);

    // Các nhóm trang phục modular
    this.hairGroup = new THREE.Group();
    this.faceGroup = new THREE.Group();
    this.shirtGroup = new THREE.Group();
    this.pantsGroup = new THREE.Group();
    this.shoesGroup = new THREE.Group();
    this.accessoryGroup = new THREE.Group();

    this.head.add(this.hairGroup);
    this.head.add(this.faceGroup);
    this.chest.add(this.shirtGroup);
    this.pelvis.add(this.pantsGroup);
    this.root.add(this.shoesGroup);
    this.chest.add(this.accessoryGroup);

    // Dựng khung xương cơ thể cơ bản
    this.buildBaseSkeleton();
  }

  // Tạo khung cơ thể da Chibi (đầu tròn, cổ, bàn tay, bắp chân)
  private buildBaseSkeleton() {
    // 1. Đầu tròn Chibi
    const headGeo = new THREE.SphereGeometry(0.52, 32, 32);
    headGeo.scale(1, 1.05, 1);
    const headMesh = new THREE.Mesh(headGeo, this.skinMaterial);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    this.head.add(headMesh);

    // Tai 2 bên
    const earGeo = new THREE.SphereGeometry(0.1, 16, 16);
    earGeo.scale(0.5, 1, 0.8);
    const leftEar = new THREE.Mesh(earGeo, this.skinMaterial);
    leftEar.position.set(-0.52, 0, 0);
    this.head.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, this.skinMaterial);
    rightEar.position.set(0.52, 0, 0);
    this.head.add(rightEar);

    // Má hồng 2 bên
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.55 });
    const blushGeo = new THREE.CircleGeometry(0.08, 16);
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.25, -0.1, 0.47);
    leftBlush.rotation.y = -0.3;
    this.head.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.25, -0.1, 0.47);
    rightBlush.rotation.y = 0.3;
    this.head.add(rightBlush);

    // Mũi nhỏ xíu dễ thương
    const noseGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const noseMesh = new THREE.Mesh(noseGeo, this.skinMaterial);
    noseMesh.position.set(0, -0.04, 0.52);
    this.head.add(noseMesh);

    // Cổ
    const neckGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.18, 16);
    const neckMesh = new THREE.Mesh(neckGeo, this.skinMaterial);
    neckMesh.castShadow = true;
    this.neck.add(neckMesh);

    // Bàn tay trái & phải
    const handGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const leftHandMesh = new THREE.Mesh(handGeo, this.skinMaterial);
    leftHandMesh.castShadow = true;
    this.leftHand.add(leftHandMesh);

    const rightHandMesh = new THREE.Mesh(handGeo, this.skinMaterial);
    rightHandMesh.castShadow = true;
    this.rightHand.add(rightHandMesh);

    // Cẳng tay
    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.22, 16);
    const leftArmMesh = new THREE.Mesh(armGeo, this.skinMaterial);
    leftArmMesh.position.y = -0.11;
    leftArmMesh.castShadow = true;
    this.leftForearm.add(leftArmMesh);

    const rightArmMesh = new THREE.Mesh(armGeo, this.skinMaterial);
    rightArmMesh.position.y = -0.11;
    rightArmMesh.castShadow = true;
    this.rightForearm.add(rightArmMesh);

    // Cẳng chân da
    const legGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.3, 16);
    const leftShinMesh = new THREE.Mesh(legGeo, this.skinMaterial);
    leftShinMesh.position.y = -0.15;
    leftShinMesh.castShadow = true;
    this.leftKnee.add(leftShinMesh);

    const rightShinMesh = new THREE.Mesh(legGeo, this.skinMaterial);
    rightShinMesh.position.y = -0.15;
    rightShinMesh.castShadow = true;
    this.rightKnee.add(rightShinMesh);
  }

  // Kích hoạt animation nhảy cẫng vui vẻ khi chọn đồ mới
  public triggerHappyHop() {
    this.happyHopTime = 1.0;
  }

  // Cập nhật diện mạo 3D theo config
  public updateOutfit(config: CharacterAvatarConfig) {
    // Cập nhật màu da và màu tóc
    if (config.skinTone) {
      this.skinMaterial.color.set(config.skinTone);
    }
    if (config.hairColor) {
      this.hairMaterial.color.set(config.hairColor);
    }

    // Tự động scale chiều cao khung xương (Dynamic Growth)
    const heightScale = config.heightScale || 1.0;
    const legScale = config.legScale || 1.0;
    const headScale = config.headScale || 1.0;

    this.spine.scale.set(1, heightScale, 1);
    this.leftThigh.scale.set(1, legScale, 1);
    this.rightThigh.scale.set(1, legScale, 1);
    this.head.scale.set(headScale, headScale, headScale);

    // Làm mới các cụm trang phục 3D
    this.rebuildHair(config.hairId);
    this.rebuildFace(config.faceId);
    this.rebuildShirt(config.shirtId);
    this.rebuildPants(config.pantsId);
    this.rebuildShoes(config.shoesId);
    this.rebuildAccessory(config.accessoryId);
  }

  // 1. Tạo hình Tóc 3D
  private rebuildHair(hairId: string) {
    this.clearGroup(this.hairGroup);

    switch (hairId) {
      case 'hair_spiky_cool': { // Vuốt dựng cá tính
        const baseCapGeo = new THREE.SphereGeometry(0.53, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const cap = new THREE.Mesh(baseCapGeo, this.hairMaterial);
        this.hairGroup.add(cap);

        // 7 lọn tóc nhọn vuốt ngược 3D
        for (let i = 0; i < 9; i++) {
          const spikeGeo = new THREE.ConeGeometry(0.12, 0.35, 8);
          const spike = new THREE.Mesh(spikeGeo, this.hairMaterial);
          const angle = (i / 8) * Math.PI - Math.PI / 2;
          spike.position.set(Math.sin(angle) * 0.32, 0.48 + Math.cos(angle) * 0.1, Math.cos(angle) * 0.2 - 0.05);
          spike.rotation.x = -0.35;
          spike.rotation.z = -angle * 0.4;
          spike.castShadow = true;
          this.hairGroup.add(spike);
        }
        break;
      }

      case 'hair_twintails_ribbon': { // Song búi nơ hồng
        const baseCapGeo = new THREE.SphereGeometry(0.53, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const cap = new THREE.Mesh(baseCapGeo, this.hairMaterial);
        this.hairGroup.add(cap);

        // 2 Búi tóc tròn 2 bên
        const bunGeo = new THREE.SphereGeometry(0.18, 16, 16);
        const leftBun = new THREE.Mesh(bunGeo, this.hairMaterial);
        leftBun.position.set(-0.48, 0.38, 0);
        leftBun.castShadow = true;
        this.hairGroup.add(leftBun);

        const rightBun = new THREE.Mesh(bunGeo, this.hairMaterial);
        rightBun.position.set(0.48, 0.38, 0);
        rightBun.castShadow = true;
        this.hairGroup.add(rightBun);

        // Nơ hồng
        const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 });
        const ribbonGeo = new THREE.TorusGeometry(0.08, 0.03, 8, 16);
        const leftRibbon = new THREE.Mesh(ribbonGeo, ribbonMat);
        leftRibbon.position.set(-0.45, 0.3, 0.08);
        this.hairGroup.add(leftRibbon);

        const rightRibbon = new THREE.Mesh(ribbonGeo, ribbonMat);
        rightRibbon.position.set(0.45, 0.3, 0.08);
        this.hairGroup.add(rightRibbon);
        break;
      }

      case 'hair_kpop_part': { // 2 mái lãng tử K-Pop
        const capGeo = new THREE.SphereGeometry(0.54, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.65);
        const cap = new THREE.Mesh(capGeo, this.hairMaterial);
        this.hairGroup.add(cap);

        // 2 Lọn mái cong rẽ sang 2 bên
        const fringeMat = this.hairMaterial;
        const leftFringe = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.08, 8, 16, Math.PI * 0.6), fringeMat);
        leftFringe.position.set(-0.2, 0.28, 0.42);
        leftFringe.rotation.set(0.3, 0.2, 0.8);
        this.hairGroup.add(leftFringe);

        const rightFringe = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.08, 8, 16, Math.PI * 0.6), fringeMat);
        rightFringe.position.set(0.2, 0.28, 0.42);
        rightFringe.rotation.set(0.3, -0.2, -0.8);
        this.hairGroup.add(rightFringe);
        break;
      }

      case 'hair_curly_afro': { // Xoăn xù mì
        const capGeo = new THREE.SphereGeometry(0.53, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const cap = new THREE.Mesh(capGeo, this.hairMaterial);
        this.hairGroup.add(cap);

        // Các khối xoăn tròn bồng bềnh
        for (let i = 0; i < 22; i++) {
          const curlGeo = new THREE.SphereGeometry(0.14, 12, 12);
          const curl = new THREE.Mesh(curlGeo, this.hairMaterial);
          const phi = Math.random() * Math.PI * 0.5;
          const theta = Math.random() * Math.PI * 2;
          curl.position.setFromSphericalCoords(0.54, phi, theta);
          curl.castShadow = true;
          this.hairGroup.add(curl);
        }
        break;
      }

      case 'hair_snapback_cap': { // Mũ Snapback đội ngược 3D
        const capMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
        const capGeo = new THREE.SphereGeometry(0.54, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
        const cap = new THREE.Mesh(capGeo, capMat);
        this.hairGroup.add(cap);

        // Vành lưỡi trai đội ngược ra phía sau
        const brimGeo = new THREE.BoxGeometry(0.42, 0.04, 0.25);
        const brim = new THREE.Mesh(brimGeo, new THREE.MeshStandardMaterial({ color: 0x18181b }));
        brim.position.set(0, 0.08, -0.56);
        brim.rotation.x = 0.2;
        this.hairGroup.add(brim);

        // Nút tròn vàng trên đỉnh
        const buttonGeo = new THREE.SphereGeometry(0.04, 12, 12);
        const btn = new THREE.Mesh(buttonGeo, new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
        btn.position.set(0, 0.55, 0);
        this.hairGroup.add(btn);
        break;
      }

      case 'hair_mohawk_punk': { // Mào gà Mohawk
        // Vệt mào gà chạy dọc đỉnh đầu
        for (let i = 0; i < 7; i++) {
          const spikeGeo = new THREE.ConeGeometry(0.1, 0.35, 6);
          const spike = new THREE.Mesh(spikeGeo, this.hairMaterial);
          spike.position.set(0, 0.52 - i * 0.02, 0.3 - i * 0.12);
          spike.rotation.x = -0.2 + i * 0.08;
          spike.castShadow = true;
          this.hairGroup.add(spike);
        }
        break;
      }

      case 'hair_bald_monk': { // Đầu trọc bóng lưỡng
        // Chỉ thêm đốm highlight sáng bóng
        break;
      }

      default: { // Tóc úp nồi / ngố chuẩn
        const capGeo = new THREE.SphereGeometry(0.54, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.65);
        const cap = new THREE.Mesh(capGeo, this.hairMaterial);
        cap.castShadow = true;
        this.hairGroup.add(cap);

        // Mái ngang
        const fringeGeo = new THREE.BoxGeometry(0.55, 0.14, 0.15);
        const fringe = new THREE.Mesh(fringeGeo, this.hairMaterial);
        fringe.position.set(0, 0.26, 0.46);
        fringe.rotation.x = 0.25;
        this.hairGroup.add(fringe);
        break;
      }
    }
  }

  // 2. Tạo hình Khuôn Mặt & Cảm Xúc 3D
  private rebuildFace(faceId: string) {
    this.clearGroup(this.faceGroup);

    // Mắt 3D (2 tròng mắt tròn)
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
    const eyeSparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const eyeGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const pupilGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const sparkleGeo = new THREE.SphereGeometry(0.025, 12, 12);

    // Mắt trái
    const leftEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-0.2, 0.02, 0.48);

    const leftWhite = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    leftWhite.scale.set(1, 1.2, 0.5);
    leftEyeGroup.add(leftWhite);

    const leftPupil = new THREE.Mesh(pupilGeo, eyePupilMat);
    leftPupil.position.set(0, 0, 0.04);
    leftPupil.scale.set(1, 1.1, 0.5);
    leftEyeGroup.add(leftPupil);

    const leftSparkle = new THREE.Mesh(sparkleGeo, eyeSparkleMat);
    leftSparkle.position.set(-0.02, 0.03, 0.07);
    leftEyeGroup.add(leftSparkle);

    // Mí mắt trái (dùng để nhắm mắt/chớp mắt)
    const eyelidGeo = new THREE.SphereGeometry(0.095, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const leftEyelid = new THREE.Mesh(eyelidGeo, this.skinMaterial);
    leftEyelid.rotation.x = Math.PI;
    leftEyelid.position.set(0, 0.02, 0.01);
    leftEyelid.visible = false;
    leftEyeGroup.add(leftEyelid);
    this.leftEyelid = leftEyelid;

    this.faceGroup.add(leftEyeGroup);
    this.leftEye = leftWhite;

    // Mắt phải
    const rightEyeGroup = new THREE.Group();
    rightEyeGroup.position.set(0.2, 0.02, 0.48);

    const rightWhite = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    rightWhite.scale.set(1, 1.2, 0.5);
    rightEyeGroup.add(rightWhite);

    const rightPupil = new THREE.Mesh(pupilGeo, eyePupilMat);
    rightPupil.position.set(0, 0, 0.04);
    rightPupil.scale.set(1, 1.1, 0.5);
    rightEyeGroup.add(rightPupil);

    const rightSparkle = new THREE.Mesh(sparkleGeo, eyeSparkleMat);
    rightSparkle.position.set(-0.02, 0.03, 0.07);
    rightEyeGroup.add(rightSparkle);

    const rightEyelid = new THREE.Mesh(eyelidGeo, this.skinMaterial);
    rightEyelid.rotation.x = Math.PI;
    rightEyelid.position.set(0, 0.02, 0.01);
    rightEyelid.visible = false;
    rightEyeGroup.add(rightEyelid);
    this.rightEyelid = rightEyelid;

    this.faceGroup.add(rightEyeGroup);
    this.rightEye = rightWhite;

    // Miệng cười 3D
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const mouthGeo = new THREE.TorusGeometry(0.08, 0.025, 8, 16, Math.PI);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.18, 0.48);
    mouth.rotation.x = 0.4;
    this.faceGroup.add(mouth);

    // Kính râm 3D hoặc Kính cận
    if (faceId === 'face_cool_shades') {
      const shadesMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.15, metalness: 0.7 });
      const frameGeo = new THREE.BoxGeometry(0.56, 0.18, 0.04);
      const shades = new THREE.Mesh(frameGeo, shadesMat);
      shades.position.set(0, 0.04, 0.56);
      this.faceGroup.add(shades);
    } else if (faceId === 'face_nerdy_glasses') {
      const glassesMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.5 });
      const ringGeo = new THREE.TorusGeometry(0.12, 0.018, 8, 24);
      const leftLens = new THREE.Mesh(ringGeo, glassesMat);
      leftLens.position.set(-0.2, 0.02, 0.54);
      this.faceGroup.add(leftLens);

      const rightLens = new THREE.Mesh(ringGeo, glassesMat);
      rightLens.position.set(0.2, 0.02, 0.54);
      this.faceGroup.add(rightLens);

      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.14), glassesMat);
      bridge.rotation.z = Math.PI / 2;
      bridge.position.set(0, 0.02, 0.54);
      this.faceGroup.add(bridge);
    }
  }

  // 3. Tạo hình Áo 3D
  private rebuildShirt(shirtId: string) {
    this.clearGroup(this.shirtGroup);

    // Thân áo chính
    let shirtColor = 0xfbbf24; // Vàng mầm non mặc định
    let isVest = false;
    let isHoodie = false;

    if (shirtId === 'shirt_cr7_football' || shirtId === 'shirt_superhero_fake') {
      shirtColor = 0xdc2626; // Đỏ
    } else if (shirtId === 'shirt_messi_argentina' || shirtId === 'shirt_stretched_collar') {
      shirtColor = 0x38bdf8; // Xanh dương nhạt
    } else if (shirtId === 'shirt_dino_roar') {
      shirtColor = 0x16a34a; // Xanh lá
    } else if (shirtId === 'shirt_rich_suit_vest') {
      shirtColor = 0x18181b; // Đen tổng tài
      isVest = true;
    } else if (shirtId === 'shirt_bear_hoodie') {
      shirtColor = 0x92400e; // Nâu gấu
      isHoodie = true;
    } else if (shirtId === 'shirt_sloppy_tanktop' || shirtId === 'shirt_food_stain') {
      shirtColor = 0xf8fafc; // Trắng ngà
    } else if (shirtId === 'shirt_hawaii_floral') {
      shirtColor = 0xf97316; // Cam Hawaii
    }

    const shirtMat = new THREE.MeshStandardMaterial({
      color: shirtColor,
      roughness: 0.65,
      metalness: 0.05,
    });

    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.52, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    this.shirtGroup.add(torsoMesh);

    // Cổ áo sen hoặc nơ vest
    if (isVest) {
      // Sơ mi trắng bên trong & nơ đỏ
      const innerShirt = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.3), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      innerShirt.position.set(0, 0.1, 0.33);
      this.shirtGroup.add(innerShirt);

      const bowtie = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
      bowtie.scale.set(1.6, 0.9, 0.8);
      bowtie.position.set(0, 0.22, 0.34);
      this.shirtGroup.add(bowtie);
    } else if (isHoodie) {
      // Tai gấu trên vai áo
      const earGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const earMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const leftEar = new THREE.Mesh(earGeo, earMat);
      leftEar.position.set(-0.25, 0.32, 0);
      this.shirtGroup.add(leftEar);

      const rightEar = new THREE.Mesh(earGeo, earMat);
      rightEar.position.set(0.25, 0.32, 0);
      this.shirtGroup.add(rightEar);
    } else {
      // Cổ áo sen tròn xanh navy chuẩn mầm non
      const collarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });
      const collarGeo = new THREE.TorusGeometry(0.24, 0.035, 8, 24);
      const collar = new THREE.Mesh(collarGeo, collarMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.set(0, 0.26, 0);
      this.shirtGroup.add(collar);
    }

    // Tay áo ngắn trên cánh tay
    const sleeveGeo = new THREE.CylinderGeometry(0.12, 0.11, 0.16, 16);
    const leftSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
    leftSleeve.position.y = -0.04;
    this.leftUpperArm.add(leftSleeve);

    const rightSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
    rightSleeve.position.y = -0.04;
    this.rightUpperArm.add(rightSleeve);
  }

  // 4. Tạo hình Quần 3D
  private rebuildPants(pantsId: string) {
    this.clearGroup(this.pantsGroup);

    let pantsColor = 0x1e3a8a; // Xanh navy chuẩn
    let isSkirt = false;

    if (pantsId === 'pants_pleated_tartan' || pantsId === 'pants_basketball_mesh') {
      pantsColor = 0xb91c1c; // Đỏ ca rô
      if (pantsId === 'pants_pleated_tartan') isSkirt = true;
    } else if (pantsId === 'pants_denim_dungarees') {
      pantsColor = 0x2563eb; // Xanh jeans
    } else if (pantsId === 'pants_tuxedo_slacks' || pantsId === 'pants_leather_moto') {
      pantsColor = 0x18181b; // Đen
    } else if (pantsId === 'pants_cartoon_sponge' || pantsId === 'pants_gold_silk') {
      pantsColor = 0xfacc15; // Vàng
    } else if (pantsId === 'pants_tutu_ballerina') {
      pantsColor = 0xf472b6; // Hồng công chúa
      isSkirt = true;
    } else if (pantsId === 'pants_floral_boxer') {
      pantsColor = 0xf43f5e; // Đỏ hoa
    } else if (pantsId === 'pants_camo_cargo') {
      pantsColor = 0x4d7c0f; // Rằn ri
    }

    const pantsMat = new THREE.MeshStandardMaterial({
      color: pantsColor,
      roughness: 0.7,
      metalness: 0.05,
    });

    if (isSkirt) {
      // Váy xếp ly xòe 3D
      const skirtGeo = new THREE.ConeGeometry(0.48, 0.38, 24, 1, true);
      const skirtMesh = new THREE.Mesh(skirtGeo, pantsMat);
      skirtMesh.rotation.x = Math.PI;
      skirtMesh.position.y = -0.15;
      skirtMesh.castShadow = true;
      this.pantsGroup.add(skirtMesh);
    } else {
      // Quần soóc đùi 3D
      const pelvisPants = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.34, 0.22, 24), pantsMat);
      pelvisPants.position.y = -0.06;
      pelvisPants.castShadow = true;
      this.pantsGroup.add(pelvisPants);

      // Ống quần 2 bên đùi
      const pantLegGeo = new THREE.CylinderGeometry(0.15, 0.14, 0.22, 16);
      const leftPantLeg = new THREE.Mesh(pantLegGeo, pantsMat);
      leftPantLeg.position.y = -0.12;
      this.leftThigh.add(leftPantLeg);

      const rightPantLeg = new THREE.Mesh(pantLegGeo, pantsMat);
      rightPantLeg.position.y = -0.12;
      this.rightThigh.add(rightPantLeg);
    }
  }

  // 5. Tạo hình Giày 3D
  private rebuildShoes(shoesId: string) {
    this.clearGroup(this.shoesGroup);

    let shoeColor = 0x1e293b;
    let isLightUp = false;

    if (shoesId === 'shoes_lightup_red') {
      shoeColor = 0xef4444;
      isLightUp = true;
    } else if (shoesId === 'shoes_pink_bow') {
      shoeColor = 0xf472b6;
    } else if (shoesId === 'shoes_yellow_boots') {
      shoeColor = 0xfbbf24;
    } else if (shoesId === 'shoes_white_kicks') {
      shoeColor = 0xffffff;
    } else if (shoesId === 'shoes_shark_slippers') {
      shoeColor = 0x60a5fa;
    }

    const shoeMat = new THREE.MeshStandardMaterial({
      color: shoeColor,
      roughness: 0.5,
      metalness: 0.1,
    });

    const shoeGeo = new THREE.BoxGeometry(0.18, 0.12, 0.28);

    // Giày trái
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, 0, 0.05);
    leftShoe.castShadow = true;
    this.leftFoot.add(leftShoe);

    // Giày phải
    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, 0, 0.05);
    rightShoe.castShadow = true;
    this.rightFoot.add(rightShoe);

    // Đèn LED phát sáng dưới đế nếu là giày LED
    if (isLightUp) {
      const ledLight = new THREE.PointLight(0xfacc15, 1.2, 1.2);
      ledLight.position.set(0, -0.08, 0.1);
      this.leftFoot.add(ledLight);

      const ledLight2 = new THREE.PointLight(0x60a5fa, 1.2, 1.2);
      ledLight2.position.set(0, -0.08, 0.1);
      this.rightFoot.add(ledLight2);
    }
  }

  // 6. Tạo hình Phụ Kiện 3D
  private rebuildAccessory(accessoryId?: string) {
    this.clearGroup(this.accessoryGroup);

    if (accessoryId === 'acc_egg_backpack') {
      // Balo quả trứng vàng 3D sau lưng
      const packMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.35, metalness: 0.2 });
      const eggGeo = new THREE.SphereGeometry(0.25, 24, 24);
      eggGeo.scale(1, 1.25, 0.85);
      const backpack = new THREE.Mesh(eggGeo, packMat);
      backpack.position.set(0, 0, -0.32);
      backpack.castShadow = true;
      this.accessoryGroup.add(backpack);

      // Quai đeo balo
      const strapMat = new THREE.MeshBasicMaterial({ color: 0xb45309 });
      const strapGeo = new THREE.TorusGeometry(0.28, 0.02, 8, 16, Math.PI);
      const leftStrap = new THREE.Mesh(strapGeo, strapMat);
      leftStrap.rotation.y = Math.PI / 2;
      leftStrap.position.set(-0.2, 0.05, -0.15);
      this.accessoryGroup.add(leftStrap);

      const rightStrap = new THREE.Mesh(strapGeo, strapMat);
      rightStrap.rotation.y = Math.PI / 2;
      rightStrap.position.set(0.2, 0.05, -0.15);
      this.accessoryGroup.add(rightStrap);
    } else if (accessoryId === 'acc_giant_lollipop') {
      // Cây kẹo mút khổng lồ trên tay phải
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      stick.position.set(0.05, 0.15, 0);

      const candy = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 24), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
      candy.rotation.x = Math.PI / 2;
      candy.position.set(0.05, 0.35, 0);

      const lollipopGroup = new THREE.Group();
      lollipopGroup.add(stick);
      lollipopGroup.add(candy);
      this.rightHand.add(lollipopGroup);
    }
  }

  // Dọn dẹp mesh trong group
  private clearGroup(group: THREE.Group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    }
  }

  // Cập nhật hoạt ảnh liên tục theo thời gian (Animation Loop)
  public update(_delta: number, time: number, mouseNormalized: { x: number; y: number }) {
    // 1. Nhịp thở tự nhiên (Idle Breathing)
    const breath = Math.sin(time * 2.4);
    this.chest.position.y = 0.28 + breath * 0.015;
    this.chest.scale.set(1 + breath * 0.02, 1 + breath * 0.015, 1 + breath * 0.02);

    // Cánh tay đung đưa nhẹ
    this.leftUpperArm.rotation.z = 0.18 + Math.sin(time * 2.0) * 0.04;
    this.rightUpperArm.rotation.z = -0.18 - Math.sin(time * 2.0) * 0.04;

    // 2. Đầu xoay theo con trỏ chuột (Head Tracking)
    const targetHeadRotY = mouseNormalized.x * 0.45;
    const targetHeadRotX = -mouseNormalized.y * 0.3;
    this.head.rotation.y += (targetHeadRotY - this.head.rotation.y) * 0.1;
    this.head.rotation.x += (targetHeadRotX - this.head.rotation.x) * 0.1;

    // 3. Chớp mắt 3D (Blinking Eye Animation)
    this.blinkTimer += _delta;
    if (this.blinkTimer > 3.4) {
      if (this.leftEyelid && this.rightEyelid) {
        this.leftEyelid.visible = true;
        this.rightEyelid.visible = true;
      }
      if (this.leftEye && this.rightEye) {
        this.leftEye.visible = false;
        this.rightEye.visible = false;
      }

      if (this.blinkTimer > 3.55) {
        this.blinkTimer = 0;
        if (this.leftEyelid && this.rightEyelid) {
          this.leftEyelid.visible = false;
          this.rightEyelid.visible = false;
        }
        if (this.leftEye && this.rightEye) {
          this.leftEye.visible = true;
          this.rightEye.visible = true;
        }
      }
    }

    // 4. Nhảy cẫng lên vui vẻ (Happy Hop) khi đổi đồ
    if (this.happyHopTime > 0) {
      this.happyHopTime -= _delta * 2.2;
      const hopProgress = Math.max(0, this.happyHopTime);
      const hopY = Math.sin((1 - hopProgress) * Math.PI) * 0.28;
      this.pelvis.position.y = 1.05 + hopY;

      // Vẫy tay chào khi nhảy
      this.rightUpperArm.rotation.z = -1.2 + Math.sin(time * 18) * 0.3;
      this.leftUpperArm.rotation.z = 1.2 - Math.sin(time * 18) * 0.3;
    } else {
      this.pelvis.position.y = 1.05;
    }
  }

  // Giải phóng bộ nhớ
  public dispose() {
    this.skinMaterial.dispose();
    this.hairMaterial.dispose();
  }
}
