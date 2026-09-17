import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CharacterAvatarConfig } from '../../../types/game';
import {
  type RealisticAvatarConfig,
  DEFAULT_REALISTIC_CONFIG,
  normalizeToRealisticConfig,
} from '../../../three/character/RealisticAssetsCatalog';
import {
  CharacterModelLoader,
  SculptedGlbCharacter,
  type IHumanCharacter,
} from '../../../three/core/CharacterModelLoader';
import { ArticulatedMannequin } from '../../../three/core/ArticulatedMannequin';

export const CHARACTER_POSES = [
  { id: 'relaxed', name: 'Tự Nhiên', icon: '🧍', desc: 'Đứng thư thái chuẩn studio' },
  { id: 'cross_arms', name: 'Khoanh Tay', icon: '💪', desc: 'Điềm tĩnh & tự tin' },
  { id: 'hands_on_hips', name: 'Thuyết trình', icon: '🦸', desc: 'Hiên ngang siêu anh hùng' },
  { id: 'wave', name: 'Vẫy Tay', icon: '👋', desc: 'Chào đón thân thiện' },
  { id: 'martial_arts', name: 'Thế Võ', icon: '🥋', desc: 'Thủ thế võ thuật sống động' },
] as const;

export type CharacterPoseId = (typeof CHARACTER_POSES)[number]['id'];

interface Character3DViewerProps {
  config?: CharacterAvatarConfig | RealisticAvatarConfig | any;
  autoRotate?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  showPodium?: boolean;
  enableControls?: boolean;
  cameraFov?: number;
  cameraDistance?: number;
  onCharacterClick?: () => void;
  customModelFile?: File | null;
  customModelUrl?: string | null;
  focusTarget?: 'body' | 'face' | 'head' | 'torso' | 'legs' | 'shoes' | 'feet' | 'hair';
  currentPose?: CharacterPoseId | string;
}

export const Character3DViewer: React.FC<Character3DViewerProps> = ({
  config = DEFAULT_REALISTIC_CONFIG,
  autoRotate = false,
  width = '100%',
  height = '100%',
  className = '',
  style = {},
  showPodium = true,
  enableControls = true,
  cameraFov = 38,
  cameraDistance = 2.15,
  onCharacterClick,
  customModelFile,
  customModelUrl,
  focusTarget = 'body',
  currentPose = 'relaxed',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rigRef = useRef<IHumanCharacter | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mouseNormalizedRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const focusTargetRef = useRef<string>(focusTarget);
  const currentPoseRef = useRef<string>(currentPose);
  const configRef = useRef<RealisticAvatarConfig>(config);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    focusTargetRef.current = focusTarget;
  }, [focusTarget]);

  useEffect(() => {
    currentPoseRef.current = currentPose;
    if (rigRef.current && rigRef.current.setPose) {
      rigRef.current.setPose(currentPose);
    }
  }, [currentPose]);

  // Khởi tạo Scene Three.js
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const containerW = rect.width || 360;
    const containerH = rect.height || 420;

    // 1. Scene & Background
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera - Căn chỉnh góc nhìn vào đúng trung tâm cơ thể người (chính giữa khung hình)
    const camera = new THREE.PerspectiveCamera(cameraFov, containerW / containerH, 0.1, 50);
    const targetY = showPodium ? 0.75 : 0.59;
    camera.position.set(0, showPodium ? 0.75 : 0.59, cameraDistance);

    // 3. Renderer với khử răng cưa và bóng đổ mềm
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(containerW, containerH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    container.appendChild(renderer.domElement);

    // 4. OrbitControls xoay 360 độ tự do
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = enableControls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, targetY, 0);
    controls.minDistance = 0.35;
    controls.maxDistance = 6.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Không xoay xuống dưới lòng đất
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.8;
    controlsRef.current = controls;

    // 5. Hệ Thống Ánh Sáng Studio 3 Điểm (Loại bỏ hoàn toàn cảm giác nhựa phẳng)
    // Ambient light ấm áp
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.1);
    scene.add(ambientLight);

    // Key Light chính có bóng đổ
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(2.4, 4.2, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 12;
    keyLight.shadow.camera.left = -2;
    keyLight.shadow.camera.right = 2;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -1;
    keyLight.shadow.bias = -0.0008;
    scene.add(keyLight);

    // Fill Light mềm màu xanh nhạt từ góc trái
    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.9);
    fillLight.position.set(-2.8, 2.2, 2.0);
    scene.add(fillLight);

    // Rim Light rực rỡ từ phía sau tạo viền sáng hào quang (Tạo chiều sâu 3D rõ nét)
    const rimLight = new THREE.DirectionalLight(0xddd6fe, 2.0);
    rimLight.position.set(0, 3.2, -3.0);
    scene.add(rimLight);

    // Spotlight rọi thẳng từ trần bục
    const spotLight = new THREE.SpotLight(0xfffbeb, 1.4, 8, Math.PI / 5, 0.4);
    spotLight.position.set(0, 4.5, 1.2);
    scene.add(spotLight);

    // 6. Sân Khấu Bục Tròn 3D Turntable (nếu showPodium = true)
    if (showPodium) {
      const podiumGeo = new THREE.CylinderGeometry(1.2, 1.25, 0.16, 48);
      const podiumMat = new THREE.MeshStandardMaterial({
        color: 0x241d3d,
        roughness: 0.35,
        metalness: 0.3,
      });
      const podium = new THREE.Mesh(podiumGeo, podiumMat);
      podium.position.y = 0.08;
      podium.receiveShadow = true;
      scene.add(podium);

      // Viền vàng kim loại bao quanh bục
      const rimGeo = new THREE.TorusGeometry(1.22, 0.035, 12, 48);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.8,
        roughness: 0.25,
      });
      const podiumRim = new THREE.Mesh(rimGeo, rimMat);
      podiumRim.rotation.x = Math.PI / 2;
      podiumRim.position.y = 0.16;
      scene.add(podiumRim);
    }

    // Sàn bóng đổ tiếp xúc (Contact Shadow)
    const shadowGeo = new THREE.PlaneGeometry(2.1, 2.1);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0f081c,
      transparent: true,
      opacity: 0.45,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = showPodium ? 0.165 : 0.005;
    scene.add(shadowPlane);

    // 7. Nhân Vật 3D Realistic Human Base Mesh
    const activeModelUrl = customModelUrl || null;
    const loader = new CharacterModelLoader();

    const applyFallbackRig = () => {
      if (rigRef.current) {
        scene.remove(rigRef.current.root);
        rigRef.current.dispose();
        rigRef.current = null;
      }
      const mannequin = new ArticulatedMannequin('#B57850');
      mannequin.root.position.y = showPodium ? 0.16 : 0;
      scene.add(mannequin.root);
      const normalizedConfig = normalizeToRealisticConfig(config);
      mannequin.updateOutfit(normalizedConfig);
      mannequin.setPose(currentPoseRef.current);
      rigRef.current = mannequin;
      setIsLoaded(true);
    };

    if (customModelFile || activeModelUrl) {
      const loadPromise = customModelFile
        ? loader.loadFromFile(customModelFile)
        : activeModelUrl
          ? loader.loadFromUrl(activeModelUrl)
          : null;

      if (loadPromise) {
        loadPromise
          .then((loadedScene) => {
            if (rigRef.current) {
              scene.remove(rigRef.current.root);
              rigRef.current.dispose();
            }
            const sculptedRig = new SculptedGlbCharacter(loadedScene, showPodium);
            scene.add(sculptedRig.root);
            const normalizedConfig = normalizeToRealisticConfig(config);
            sculptedRig.updateOutfit(normalizedConfig);
            rigRef.current = sculptedRig;
            setIsLoaded(true);
          })
          .catch((err) => {
            console.warn('[Character3DViewer] Không nạp được GLB, chuyển sang ArticulatedMannequin fallback:', err);
            applyFallbackRig();
          });
      } else {
        applyFallbackRig();
      }
    } else {
      applyFallbackRig();
    }

    // 8. Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Tính toán vị trí không gian 3D thực tế theo tỉ lệ Chiều cao (heightCm) & Chân (legScale)
      const currentConfig = configRef.current;
      const heightCm = currentConfig?.body?.heightCm || 105;
      const heightRatio = heightCm / 105;
      const legScale = currentConfig?.body?.legLengthScale || 1.0;

      const yBase = showPodium ? 0.16 : 0.0;
      const pelvisHeight = (0.030 + 0.632 * legScale) * heightRatio;
      const totalHeadCenter = pelvisHeight + 0.402 * heightRatio;
      const totalBodyHeight = (0.030 + 0.632 * legScale + 0.470) * heightRatio;

      // Nội suy mượt mà camera zoom vào từng bộ phận (Đầu/Ngũ quan, Thân/Áo, Chân/Quần, Bàn Chân/Giày)
      const currentFocus = focusTargetRef.current;
      let desiredY = yBase + totalBodyHeight * 0.50; // Tâm toàn thân
      let desiredDist = cameraDistance; // Giữ cự ly chuẩn để thấy rõ nhân vật cao/thấp thực tế

      if (currentFocus === 'face' || currentFocus === 'head' || currentFocus === 'hair') {
        desiredY = yBase + totalHeadCenter;
        desiredDist = 0.82;
      } else if (currentFocus === 'torso') {
        desiredY = yBase + pelvisHeight + 0.14 * heightRatio;
        desiredDist = 1.30;
      } else if (currentFocus === 'legs') {
        desiredY = yBase + pelvisHeight * 0.50;
        desiredDist = 1.40;
      } else if (currentFocus === 'shoes' || currentFocus === 'feet') {
        desiredY = yBase + 0.08;
        desiredDist = 1.00;
      }

      // Dịch chuyển tâm ngắm (target)
      controls.target.y += (desiredY - controls.target.y) * 0.08;

      // Dịch chuyển khoảng cách camera (zoom)
      const camOffset = camera.position.clone().sub(controls.target);
      const curDist = camOffset.length();
      if (curDist > 0.01) {
        const nextDist = curDist + (desiredDist - curDist) * 0.08;
        camOffset.setLength(nextDist);
        camera.position.copy(controls.target).add(camOffset);
      }

      // Cập nhật OrbitControls
      controls.update();

      // Cập nhật hoạt ảnh khung xương (thở, chớp mắt, quay đầu theo chuột, nhún nhảy)
      if (rigRef.current) {
        rigRef.current.update(delta, elapsedTime, mouseNormalizedRef.current);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Lắng nghe Resize Container
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const newWidth = entry.contentRect.width;
      const newHeight = entry.contentRect.height;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    });

    resizeObserver.observe(container);

    // 10. Lắng nghe di chuột để đầu nhân vật quay nhìn theo
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseNormalizedRef.current = { x, y };
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Cleanup khi component unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      controls.dispose();
      renderer.dispose();
      if (rigRef.current) {
        rigRef.current.dispose();
        rigRef.current = null;
      }
      sceneRef.current = null;
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Cập nhật trang phục khi props config thay đổi
  useEffect(() => {
    if (rigRef.current && isLoaded) {
      const normalized = normalizeToRealisticConfig(config);
      rigRef.current.updateOutfit(normalized);
    }
  }, [config, isLoaded]);

  // Cập nhật chế độ tự động xoay
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Đổi file GLB động khi người dùng tải file mới lên
  useEffect(() => {
    if (!sceneRef.current || !customModelFile) return;
    const loader = new CharacterModelLoader();
    loader
      .loadFromFile(customModelFile)
      .then((loadedScene) => {
        if (rigRef.current && sceneRef.current) {
          sceneRef.current.remove(rigRef.current.root);
          rigRef.current.dispose();
        }
        const sculptedRig = new SculptedGlbCharacter(loadedScene, showPodium);
        sceneRef.current?.add(sculptedRig.root);
        const normalizedConfig = normalizeToRealisticConfig(config);
        sculptedRig.updateOutfit(normalizedConfig);
        rigRef.current = sculptedRig;
      })
      .catch((err) => {
        console.warn('[Character3DViewer] Lỗi khi đổi file GLB:', err);
      });
  }, [customModelFile, showPodium, config]);

  const handleClick = () => {
    onCharacterClick?.();
  };

  return (
    <div
      ref={mountRef}
      className={`character-3d-viewer-container ${className}`}
      style={{
        position: 'relative',
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        overflow: 'hidden',
        cursor: enableControls ? 'grab' : 'default',
        pointerEvents: enableControls || onCharacterClick ? 'auto' : 'none',
        ...style,
      }}
      onClick={handleClick}
    >
      {/* Vòng sáng hào quang nền */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(99, 102, 241, 0.12) 50%, transparent 75%)',
          filter: 'blur(36px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </div>
  );
};
