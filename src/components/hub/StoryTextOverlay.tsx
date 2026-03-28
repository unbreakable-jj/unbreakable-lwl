import { memo } from 'react';

export const FONT_OPTIONS = [
  { value: "'Bebas Neue', sans-serif", label: 'Bebas Neue' },
  { value: "'Arial', sans-serif", label: 'Arial' },
  { value: "'Georgia', serif", label: 'Georgia' },
  { value: "'Courier New', monospace", label: 'Courier' },
  { value: "'Impact', sans-serif", label: 'Impact' },
  { value: "'Comic Sans MS', cursive", label: 'Comic Sans' },
  { value: "'Trebuchet MS', sans-serif", label: 'Trebuchet' },
  { value: "'Palatino', serif", label: 'Palatino' },
] as const;

export interface TextOverlayData {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  backgroundColor: string | null;
  rotation: number;
  scale: number;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  fontFamily?: string;
  slideIndex?: number;
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
  const hasBg = !!overlay.backgroundColor && overlay.backgroundColor !== 'transparent';
  const hasBorder = overlay.showBorder && overlay.borderWidth && overlay.borderWidth > 0;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${overlay.x}%`,
    top: `${overlay.y}%`,
    transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg) scale(${overlay.scale})`,
    fontSize: `${overlay.fontSize}px`,
    color: overlay.color,
    backgroundColor: overlay.backgroundColor || 'transparent',
    padding: hasBg || hasBorder ? '6px 14px' : '0',
    borderRadius: hasBg || hasBorder ? '8px' : '0',
    border: hasBorder ? `${overlay.borderWidth}px solid ${overlay.borderColor || '#FFFFFF'}` : 'none',
    textAlign: overlay.textAlign,
    fontWeight: overlay.fontWeight,
    lineHeight: 1.3,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxWidth: '80%',
    userSelect: isEditing ? 'none' : 'auto',
    cursor: isEditing ? 'grab' : 'default',
    fontFamily: overlay.fontFamily || "'Bebas Neue', sans-serif",
    letterSpacing: '0.05em',
    textShadow: !hasBg ? '0 2px 8px rgba(0,0,0,0.7)' : 'none',
    zIndex: 10,
  };

  return (
    <div
      style={style}
      className={isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-transparent rounded-md' : ''}
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
  showBorder: false,
  borderColor: '#FFFFFF',
  borderWidth: 0,
  fontFamily: "'Bebas Neue', sans-serif",
};
