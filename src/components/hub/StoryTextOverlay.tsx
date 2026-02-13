import { memo } from 'react';

export interface TextOverlayData {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number; // px
  color: string;
  backgroundColor: string | null;
  rotation: number;
  scale: number;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
}

interface StoryTextOverlayProps {
  overlay: TextOverlayData;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  containerRef?: React.RefObject<HTMLDivElement>;
  onPositionChange?: (id: string, x: number, y: number) => void;
  onScaleChange?: (id: string, scale: number) => void;
}

export const StoryTextOverlay = memo(function StoryTextOverlay({
  overlay,
  isEditing = false,
  isSelected = false,
  onSelect,
}: StoryTextOverlayProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${overlay.x}%`,
    top: `${overlay.y}%`,
    transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg) scale(${overlay.scale})`,
    fontSize: `${overlay.fontSize}px`,
    color: overlay.color,
    backgroundColor: overlay.backgroundColor || 'transparent',
    padding: overlay.backgroundColor ? '4px 12px' : '0',
    borderRadius: overlay.backgroundColor ? '6px' : '0',
    textAlign: overlay.textAlign,
    fontWeight: overlay.fontWeight,
    lineHeight: 1.3,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxWidth: '80%',
    userSelect: isEditing ? 'none' : 'auto',
    cursor: isEditing ? 'grab' : 'default',
    fontFamily: "'Bebas Neue', sans-serif",
    letterSpacing: '0.05em',
    textShadow: !overlay.backgroundColor ? '0 2px 8px rgba(0,0,0,0.7)' : 'none',
    zIndex: 10,
  };

  return (
    <div
      style={style}
      className={`${isSelected && isEditing ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {overlay.text}
    </div>
  );
});

export const DEFAULT_OVERLAY: Omit<TextOverlayData, 'id'> = {
  text: 'TAP TO EDIT',
  x: 50,
  y: 50,
  fontSize: 32,
  color: '#FFFFFF',
  backgroundColor: null,
  rotation: 0,
  scale: 1,
  textAlign: 'center',
  fontWeight: 'bold',
};
