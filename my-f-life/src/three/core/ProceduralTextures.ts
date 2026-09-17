import * as THREE from 'three';

/**
 * ProceduralTextures.ts
 * Generates high-fidelity PBR procedural textures (normals, roughness, bump, patterns)
 * completely client-side via HTML5 Canvas without relying on external image files.
 */

// Cache textures to avoid recreating canvases and WebGL textures repeatedly
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * 1. Micro Skin Pore Normal Map
 * Gives skin realistic subsurface micro-texture, preventing the "plastic toy" look.
 */
export function getSkinPoreTexture(): THREE.CanvasTexture {
  const key = 'skin_pore';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Neutral tangent-space normal base color: RGB(128, 128, 255)
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // Generate subtle organic skin pores via pseudo-cellular noise
  for (let i = 0; i < data.length; i += 4) {
    const noiseX = (Math.random() - 0.5) * 16;
    const noiseY = (Math.random() - 0.5) * 16;
    const microDepth = (Math.random() - 0.5) * 12;

    data[i] = Math.min(255, Math.max(0, 128 + noiseX)); // Normal X
    data[i + 1] = Math.min(255, Math.max(0, 128 + noiseY)); // Normal Y
    data[i + 2] = Math.min(255, Math.max(0, 240 + microDepth)); // Normal Z
    data[i + 3] = 255;
  }

  // Stamp tiny darker pore dots
  for (let p = 0; p < 800; p++) {
    const px = Math.floor(Math.random() * size);
    const py = Math.floor(Math.random() * size);
    const idx = (py * size + px) * 4;
    data[idx] = Math.max(0, data[idx] - 25);
    data[idx + 1] = Math.max(0, data[idx + 1] - 25);
    data[idx + 2] = Math.max(180, data[idx + 2] - 40);
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  texture.needsUpdate = true;

  textureCache.set(key, texture);
  return texture;
}

/**
 * 2. Fine Woven Cotton Fabric Normal Map
 * For T-Shirts and casual clothing.
 */
export function getCottonFabricTexture(): THREE.CanvasTexture {
  const key = 'cotton_fabric';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // Interlocking thread weave pattern
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const threadX = Math.sin((x / 4) * Math.PI) * 18;
      const threadY = Math.cos((y / 4) * Math.PI) * 18;
      const weave = ((x % 8 < 4 ? 1 : -1) * (y % 8 < 4 ? 1 : -1)) * 14;

      data[idx] = Math.min(255, Math.max(0, 128 + threadX + weave));
      data[idx + 1] = Math.min(255, Math.max(0, 128 + threadY - weave));
      data[idx + 2] = 235;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.needsUpdate = true;

  textureCache.set(key, texture);
  return texture;
}

/**
 * 3. Diagonal Denim Twill Weave Normal Map
 * Distinct diagonal 3x1 twill pattern for jeans.
 */
export function getDenimTwillTexture(): THREE.CanvasTexture {
  const key = 'denim_twill';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // 45-degree diagonal twill ridges
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const diag = Math.sin(((x + y) / 3.5) * Math.PI) * 28;
      const microCross = Math.cos(((x - y) / 7.0) * Math.PI) * 12;

      data[idx] = Math.min(255, Math.max(0, 128 + diag * 0.7));
      data[idx + 1] = Math.min(255, Math.max(0, 128 + diag * 0.7 + microCross));
      data[idx + 2] = 230;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(18, 18);
  texture.needsUpdate = true;

  textureCache.set(key, texture);
  return texture;
}

/**
 * 4. Sneaker Rubber Sole Tread Pattern
 * Geometric hexagon / diamond grip for shoe outsoles.
 */
export function getSoleTreadTexture(): THREE.CanvasTexture {
  const key = 'sole_tread';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep rubber background
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(0, 0, size, size);

  // Diamond grip pattern
  ctx.strokeStyle = '#444444';
  ctx.lineWidth = 4;

  const step = 24;
  for (let i = -size; i < size * 2; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i + size, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 8);
  texture.needsUpdate = true;

  textureCache.set(key, texture);
  return texture;
}

/**
 * 5. Detailed Eye Iris Texture
 * Realistic radial fibrous pattern with pupil, limbal ring, and color gradations.
 */
export function getEyeIrisTexture(eyeColorHex: string = '#2d5a7b'): THREE.CanvasTexture {
  const key = `eye_iris_${eyeColorHex}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2;

  // 1. Sclera edge fade
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, size, size);

  // 2. Limbal ring (darker outer boundary of the iris)
  const limbalGrad = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 0.98);
  limbalGrad.addColorStop(0, eyeColorHex);
  limbalGrad.addColorStop(0.85, eyeColorHex);
  limbalGrad.addColorStop(1, '#0f172a');

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.95, 0, Math.PI * 2);
  ctx.fillStyle = limbalGrad;
  ctx.fill();

  // 3. Radial striations (collagen fibers in human iris)
  ctx.save();
  ctx.translate(cx, cy);
  const fiberCount = 280;
  for (let i = 0; i < fiberCount; i++) {
    const angle = (i / fiberCount) * Math.PI * 2;
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(radius * 0.28, 0);
    ctx.lineTo(radius * 0.92, 0);
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.22)';
    ctx.lineWidth = 1.2 + Math.random() * 1.5;
    ctx.stroke();
    ctx.rotate(-angle);
  }
  ctx.restore();

  // 4. Central pupil (pitch black with subtle soft perimeter)
  const pupilGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.32);
  pupilGrad.addColorStop(0, '#000000');
  pupilGrad.addColorStop(0.85, '#050505');
  pupilGrad.addColorStop(1, '#111827');

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = pupilGrad;
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  textureCache.set(key, texture);
  return texture;
}

/**
 * 6. Leather Grain Bump Map for formal shoes & accessories
 */
export function getLeatherGrainTexture(): THREE.CanvasTexture {
  const key = 'leather_grain';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const bump = (Math.random() - 0.5) * 22;
    data[i] = Math.min(255, Math.max(0, 128 + bump));
    data[i + 1] = Math.min(255, Math.max(0, 128 + bump));
    data[i + 2] = 230;
    data[i + 3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.needsUpdate = true;

  textureCache.set(key, texture);
  return texture;
}

/**
 * 7. Longitudinal Hair Strand Flow Normal Map
 * Simulates fine parallel hair fibers with specular highlights along strand direction.
 */
export function getHairStrandTexture(): THREE.CanvasTexture {
  const key = 'hair_strands';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // High-frequency horizontal variations to simulate vertical hair fibers
      const strand = Math.sin((x / 1.8) * Math.PI) * 32 + (Math.random() - 0.5) * 14;
      data[idx] = Math.min(255, Math.max(0, 128 + strand));
      data[idx + 1] = 128;
      data[idx + 2] = 238;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 12);
  texture.needsUpdate = true;

  textureCache.set(key, texture);
  return texture;
}

/**
 * 8. Tailored Stitching Normal Map
 * For jean seams, shirt cuffs, collar edges, and shoe welts.
 */
export function getStitchingTexture(): THREE.CanvasTexture {
  const key = 'stitching_pattern';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, size, size);

  // Dashed thread stitches
  ctx.strokeStyle = '#a0a0ff';
  ctx.lineWidth = 6;
  ctx.setLineDash([14, 8]);

  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 16);
  texture.needsUpdate = true;

  textureCache.set(key, texture);
  return texture;
}
