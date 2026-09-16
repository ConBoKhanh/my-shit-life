import React, { useRef, useState, useEffect } from 'react';
import type { InputState } from '../../../game/tadpole/input/InputState';

interface VirtualJoystickProps {
  onInputChange: (input: InputState) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onInputChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  const radius = 45; // Compact joystick base radius for mobile
  const activePointerIdRef = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (activePointerIdRef.current !== null) return;
    activePointerIdRef.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsActive(true);
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    activePointerIdRef.current = null;
    setIsActive(false);
    setKnobPos({ x: 0, y: 0 });
    onInputChange({ x: 0, y: 0, magnitude: 0 });
  };

  const updateKnob = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    let magnitude = Math.min(1, distance / radius);
    if (distance > radius) {
      dx = (dx / distance) * radius;
      dy = (dy / distance) * radius;
    }

    setKnobPos({ x: dx, y: dy });

    // Output normalized vector
    const normX = radius > 0 ? dx / radius : 0;
    const normY = radius > 0 ? dy / radius : 0;
    onInputChange({
      x: normX,
      y: normY,
      magnitude,
    });
  };

  useEffect(() => {
    return () => {
      onInputChange({ x: 0, y: 0, magnitude: 0 });
    };
  }, [onInputChange]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'fixed',
        bottom: '22px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        borderRadius: '50%',
        backgroundColor: isActive ? 'rgba(108, 92, 231, 0.35)' : 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(10px)',
        border: `1.5px solid ${isActive ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.25)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        userSelect: 'none',
        zIndex: 50,
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* Knob */}
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: isActive ? '#00F2FE' : '#FFFFFF',
          boxShadow: isActive
            ? '0 0 14px rgba(0, 242, 254, 0.8)'
            : '0 3px 10px rgba(0, 0, 0, 0.3)',
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          transition: isActive ? 'none' : 'transform 0.15s ease-out',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
