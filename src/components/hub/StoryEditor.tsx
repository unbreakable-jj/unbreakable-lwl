import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Type, Trash2, X, Check, Image, Video, Palette,
  AlignLeft, AlignCenter, AlignRight, Bold, Loader2,
  Globe, Users, Lock, Undo2, Square, Minus, Plus,
} from 'lucide-react';
import { TextOverlayData, DEFAULT_OVERLAY, StoryTextOverlay, FONT_OPTIONS } from './StoryTextOverlay';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { compressVideo } from '@/lib/videoUtils';
import { toast } from 'sonner';

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#FF3B30', '#FF9500', '#FFCC00',
  '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
  '#1C1C1E', '#0A0A0A', '#1A1A2E', '#16213E', '#0F3460',
  '#533483', '#2C061F', '#374045', '#2C3333',
];

interface StoryEditorProps {
  onPublish: (data: {
    content: string | null;
    image_url: string | null;
    video_url: string | null;
    visibility: string;
    text_overlays: TextOverlayData[];
    background_color: string | null;
  }) => Promise<void>;
  onClose: () => void;
  preFill?: {
    content?: string;
    image_url?: string;
    video_url?: string;
    background_color?: string;
  };
}

export function StoryEditor({ onPublish, onClose, preFill }: StoryEditorProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [bgType, setBgType] = useState<'color' | 'image' | 'video'>(
    preFill?.video_url ? 'video' : preFill?.image_url ? 'image' : 'color'
  );
  const [bgColor, setBgColor] = useState(preFill?.background_color || '#1C1C1E');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(preFill?.image_url || null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(preFill?.video_url || null);

  // Image transform state
  const [imgScale, setImgScale] = useState(1);
  const [imgPos, setImgPos] = useState({ x: 0, y: 0 });
  const [imgRotation, setImgRotation] = useState(0);
  const imgDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const imgPinchRef = useRef<{ dist: number; scale: number; angle: number; rotation: number } | null>(null);

  const [overlays, setOverlays] = useState<TextOverlayData[]>(() => {
    if (preFill?.content) {
      const id = crypto.randomUUID();
      return [{ ...DEFAULT_OVERLAY, id, text: preFill.content, x: 50, y: 50, fontSize: 24 }];
    }
    return [];
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorTarget, setColorTarget] = useState<'text' | 'bg' | 'overlay-bg' | 'border'>('bg');
  const [undoStack, setUndoStack] = useState<TextOverlayData[][]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; overlayX: number; overlayY: number } | null>(null);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);
  const [initialAngle, setInitialAngle] = useState(0);
  const [initialRotation, setInitialRotation] = useState(0);

  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [publishing, setPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const selectedOverlay = overlays.find(o => o.id === selectedId);

  const cycleVisibility = () => {
    setVisibility(v => v === 'public' ? 'friends' : v === 'friends' ? 'private' : 'public');
  };

  const visIcon = visibility === 'public' ? <Globe className="w-4 h-4" /> : visibility === 'friends' ? <Users className="w-4 h-4" /> : <Lock className="w-4 h-4" />;

  const pushUndo = () => {
    setUndoStack(prev => [...prev.slice(-20), overlays.map(o => ({ ...o }))]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setOverlays(last);
    setSelectedId(null);
  };

  const addTextOverlay = () => {
    pushUndo();
    const id = `txt_${Date.now()}`;
    const newOverlay: TextOverlayData = { ...DEFAULT_OVERLAY, id };
    setOverlays(prev => [...prev, newOverlay]);
    setSelectedId(id);
    setEditingTextId(id);
    setEditText(DEFAULT_OVERLAY.text);
    setShowColorPicker(false);
  };

  const updateOverlay = useCallback((id: string, updates: Partial<TextOverlayData>) => {
    setOverlays(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, []);

  const deleteSelected = () => {
    if (!selectedId) return;
    pushUndo();
    setOverlays(prev => prev.filter(o => o.id !== selectedId));
    setSelectedId(null);
  };

  const commitTextEdit = () => {
    if (editingTextId && editText.trim()) {
      updateOverlay(editingTextId, { text: editText.trim() });
    }
    setEditingTextId(null);
  };

  // Toggle border on/off for selected overlay
  const toggleBorder = () => {
    if (!selectedOverlay) return;
    pushUndo();
    if (selectedOverlay.showBorder) {
      updateOverlay(selectedOverlay.id, { showBorder: false, borderWidth: 0 });
    } else {
      updateOverlay(selectedOverlay.id, { showBorder: true, borderWidth: 2, borderColor: '#FFFFFF' });
    }
  };

  // Toggle background box on selected overlay
  const toggleOverlayBg = () => {
    if (!selectedOverlay) return;
    pushUndo();
    if (selectedOverlay.backgroundColor) {
      updateOverlay(selectedOverlay.id, { backgroundColor: null });
    } else {
      updateOverlay(selectedOverlay.id, { backgroundColor: 'rgba(0,0,0,0.6)' });
    }
  };

  // Overlay drag
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !selectedId || !dragStartRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
    const newX = Math.max(5, Math.min(95, dragStartRef.current.overlayX + deltaX));
    const newY = Math.max(5, Math.min(95, dragStartRef.current.overlayY + deltaY));
    updateOverlay(selectedId, { x: newX, y: newY });
  }, [isDragging, selectedId, updateOverlay]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  const getTouchAngle = (t1: React.Touch, t2: React.Touch) =>
    Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = getTouchAngle(e.touches[0], e.touches[1]);

      if (selectedId) {
        const overlay = overlays.find(o => o.id === selectedId);
        setInitialPinchDistance(dist);
        setInitialScale(overlay?.scale || 1);
        setInitialAngle(angle);
        setInitialRotation(overlay?.rotation || 0);
      } else if (bgType === 'image' && imagePreview) {
        imgPinchRef.current = { dist, scale: imgScale, angle, rotation: imgRotation };
      }
    }
  }, [selectedId, overlays, bgType, imagePreview, imgScale, imgRotation]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const currentAngle = getTouchAngle(e.touches[0], e.touches[1]);

      if (selectedId && initialPinchDistance) {
        const newScale = Math.max(0.3, Math.min(3, initialScale * (currentDist / initialPinchDistance)));
        const angleDelta = currentAngle - initialAngle;
        const newRotation = Math.round(initialRotation + angleDelta);
        updateOverlay(selectedId, { scale: newScale, rotation: newRotation });
      } else if (imgPinchRef.current) {
        const newScale = Math.max(0.5, Math.min(5, imgPinchRef.current.scale * (currentDist / imgPinchRef.current.dist)));
        const angleDelta = currentAngle - imgPinchRef.current.angle;
        setImgScale(newScale);
        setImgRotation(imgPinchRef.current.rotation + angleDelta);
      }
    }
  }, [selectedId, initialPinchDistance, initialScale, initialAngle, initialRotation, updateOverlay]);

  const handleTouchEnd = useCallback(() => {
    setInitialPinchDistance(null);
    imgPinchRef.current = null;
  }, []);

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-overlay]')) return;
    setSelectedId(null);
    setShowColorPicker(false);

    if (bgType === 'image' && imagePreview) {
      imgDragRef.current = { startX: e.clientX, startY: e.clientY, origX: imgPos.x, origY: imgPos.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (imgDragRef.current) {
      const dx = e.clientX - imgDragRef.current.startX;
      const dy = e.clientY - imgDragRef.current.startY;
      setImgPos({ x: imgDragRef.current.origX + dx, y: imgDragRef.current.origY + dy });
    }
  };

  const handleCanvasPointerUp = () => {
    imgDragRef.current = null;
  };

  // Media handlers - no auto-crop, use object-contain
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setVideoFile(null); setVideoPreview(null);
    setBgType('image'); setImageFile(file);
    setImgScale(1); setImgPos({ x: 0, y: 0 }); setImgRotation(0);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setShowColorPicker(false);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) { toast.error('Video must be under 500MB'); return; }
    setImageFile(null); setImagePreview(null);
    setBgType('video'); setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setShowColorPicker(false);
  };

  // Publish
  const handlePublish = async () => {
    if (overlays.length === 0 && !imageFile && !videoFile && !imagePreview && !videoPreview && bgType === 'color') {
      toast.error('Add some content to your story');
      return;
    }
    setPublishing(true);
    let imageUrl: string | null = null;
    let videoUrl: string | null = null;
    try {
      if (imageFile) {
        setUploadProgress('Uploading image...');
        const ext = imageFile.name.split('.').pop();
        const path = `${user!.id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('post-images').upload(path, imageFile);
        if (error) throw error;
        const { data } = supabase.storage.from('post-images').getPublicUrl(path);
        imageUrl = data.publicUrl;
      } else if (imagePreview && bgType === 'image') {
        imageUrl = imagePreview;
      }
      if (videoFile) {
        setUploadProgress('Compressing video...');
        const compressed = await compressVideo(videoFile, 10, 1080);
        setUploadProgress('Uploading video...');
        const ext = compressed.name.split('.').pop() || 'webm';
        const path = `stories/${user!.id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('post-videos').upload(path, compressed);
        if (error) throw error;
        const { data } = supabase.storage.from('post-videos').getPublicUrl(path);
        videoUrl = data.publicUrl;
      } else if (videoPreview && bgType === 'video') {
        videoUrl = videoPreview;
      }
      setUploadProgress('Publishing...');
      await onPublish({
        content: null,
        image_url: imageUrl,
        video_url: videoUrl,
        visibility,
        text_overlays: overlays,
        background_color: bgType === 'color' ? bgColor : null,
      });
    } catch (err) {
      toast.error('Failed to publish story');
      console.error(err);
    } finally {
      setPublishing(false);
      setUploadProgress(null);
    }
  };

  useEffect(() => {
    return () => { if (videoPreview) URL.revokeObjectURL(videoPreview); };
  }, [videoPreview]);

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col" style={{ touchAction: 'none' }}>
      {/* Transparent top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-[env(safe-area-inset-top,12px)] py-3 z-30">
        <button
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
            onClick={cycleVisibility}
          >
            {visIcon}
          </button>
          <button
            className="h-10 px-5 rounded-full bg-primary text-primary-foreground font-display tracking-wide text-sm flex items-center gap-1.5 disabled:opacity-50"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">{uploadProgress || 'POSTING'}</span></>
            ) : 'SHARE'}
          </button>
        </div>
      </div>

      {/* Full-screen 9:16 canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden"
        style={{ backgroundColor: bgType === 'color' ? bgColor : '#000' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
      >
        {/* Image background - object-contain to avoid cropping */}
        {bgType === 'image' && imagePreview && (
          <img
            src={imagePreview}
            alt="Background"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{
              transform: `translate(${imgPos.x}px, ${imgPos.y}px) scale(${imgScale}) rotate(${imgRotation}deg)`,
              transformOrigin: 'center center',
            }}
            draggable={false}
          />
        )}
        {bgType === 'video' && videoPreview && (
          <video src={videoPreview} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
        )}

        {/* Text overlays on canvas */}
        {overlays.map(overlay => (
          <div
            key={overlay.id}
            data-overlay
            onPointerDown={(e) => {
              e.stopPropagation();
              setSelectedId(overlay.id);
              setShowColorPicker(false);
              pushUndo();
              const ov = overlays.find(o => o.id === overlay.id);
              if (ov) {
                setIsDragging(true);
                dragStartRef.current = { x: e.clientX, y: e.clientY, overlayX: ov.x, overlayY: ov.y };
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
              }
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingTextId(overlay.id);
              setEditText(overlay.text);
            }}
            style={{ touchAction: 'none' }}
          >
            <StoryTextOverlay
              overlay={overlay}
              isEditing={true}
              isSelected={selectedId === overlay.id}
              onSelect={() => { setSelectedId(overlay.id); setShowColorPicker(false); }}
            />
          </div>
        ))}
      </div>

      {/* Text editing overlay */}
      {editingTextId && (
        <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-4">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-transparent border-0 text-white text-center text-2xl font-display tracking-wide min-h-32 resize-none outline-none placeholder:text-white/30"
              placeholder="Type your text..."
              autoFocus
              maxLength={150}
            />
            <div className="flex gap-3 justify-center">
              <button className="text-white/50 text-sm font-display" onClick={() => setEditingTextId(null)}>Cancel</button>
              <button className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-display" onClick={commitTextEdit}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal colour slider */}
      {showColorPicker && !editingTextId && (
        <div className="absolute bottom-24 left-0 right-0 z-30 px-4 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-1 mb-2 justify-center">
            {colorTarget === 'border' && selectedOverlay && (
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                <button
                  className="text-white/70 text-[10px] font-display"
                  onClick={() => {
                    if (!selectedOverlay) return;
                    const w = Math.max(1, (selectedOverlay.borderWidth || 2) - 1);
                    updateOverlay(selectedOverlay.id, { borderWidth: w });
                  }}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-white text-[10px] font-display w-4 text-center">{selectedOverlay.borderWidth || 2}</span>
                <button
                  className="text-white/70 text-[10px] font-display"
                  onClick={() => {
                    if (!selectedOverlay) return;
                    const w = Math.min(8, (selectedOverlay.borderWidth || 2) + 1);
                    updateOverlay(selectedOverlay.id, { borderWidth: w });
                  }}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-hide">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                className={`w-8 h-8 rounded-full shrink-0 border-2 transition-all ${
                  (colorTarget === 'bg' ? bgColor : 
                   colorTarget === 'border' ? selectedOverlay?.borderColor :
                   colorTarget === 'overlay-bg' ? selectedOverlay?.backgroundColor :
                   selectedOverlay?.color) === c
                    ? 'border-white scale-125' 
                    : 'border-white/20'
                }`}
                style={{ backgroundColor: c }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (colorTarget === 'bg') {
                    setBgColor(c);
                    setBgType('color');
                    setImageFile(null); setImagePreview(null);
                    setVideoFile(null); if (videoPreview) URL.revokeObjectURL(videoPreview); setVideoPreview(null);
                  } else if (colorTarget === 'border' && selectedId) {
                    updateOverlay(selectedId, { borderColor: c });
                  } else if (colorTarget === 'overlay-bg' && selectedId) {
                    updateOverlay(selectedId, { backgroundColor: c });
                  } else if (selectedId) {
                    updateOverlay(selectedId, { color: c });
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Selected overlay quick actions - two rows for better spacing */}
      {selectedOverlay && !editingTextId && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-31 flex flex-col items-center gap-1 animate-in fade-in duration-150 ${showColorPicker ? 'bottom-40' : 'bottom-24'}`}>
          {/* Row 1: Text formatting */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full px-2 py-1">
            {(['left', 'center', 'right'] as const).map(align => (
              <button
                key={align}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedOverlay.textAlign === align ? 'bg-white/20' : ''} text-white`}
                onClick={(e) => { e.stopPropagation(); updateOverlay(selectedOverlay.id, { textAlign: align }); }}
              >
                {align === 'left' ? <AlignLeft className="w-3.5 h-3.5" /> : align === 'center' ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
              </button>
            ))}
            <button
              className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedOverlay.fontWeight === 'bold' ? 'bg-white/20' : ''} text-white`}
              onClick={(e) => { e.stopPropagation(); updateOverlay(selectedOverlay.id, { fontWeight: selectedOverlay.fontWeight === 'bold' ? 'normal' : 'bold' }); }}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              onClick={(e) => { e.stopPropagation(); setEditingTextId(selectedOverlay.id); setEditText(selectedOverlay.text); }}
            >
              <Type className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Row 2: Color & border controls */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full px-2 py-1">
            {/* Text colour */}
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              onClick={(e) => { e.stopPropagation(); setColorTarget('text'); setShowColorPicker(true); }}
              title="Text colour"
            >
              <div className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: selectedOverlay.color }} />
            </button>
            {/* Box background toggle */}
            <button
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${selectedOverlay.backgroundColor ? 'bg-white/20' : ''}`}
              onClick={(e) => { e.stopPropagation(); toggleOverlayBg(); }}
              title="Toggle box"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            {/* Box bg colour */}
            {selectedOverlay.backgroundColor && (
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                onClick={(e) => { e.stopPropagation(); setColorTarget('overlay-bg'); setShowColorPicker(true); }}
                title="Box colour"
              >
                <div className="w-4 h-4 rounded border border-white/50" style={{ backgroundColor: selectedOverlay.backgroundColor }} />
              </button>
            )}
            {/* Border toggle */}
            <button
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${selectedOverlay.showBorder ? 'bg-white/20' : ''}`}
              onClick={(e) => { e.stopPropagation(); toggleBorder(); }}
              title="Toggle border"
            >
              <span className="text-[10px] font-bold border border-white/60 px-1 rounded">B</span>
            </button>
            {/* Border colour */}
            {selectedOverlay.showBorder && (
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                onClick={(e) => { e.stopPropagation(); setColorTarget('border'); setShowColorPicker(true); }}
                title="Border colour"
              >
                <div className="w-4 h-4 rounded border-2" style={{ borderColor: selectedOverlay.borderColor || '#FFF', backgroundColor: 'transparent' }} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom floating toolbar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pb-[env(safe-area-inset-bottom,8px)]">
        <div className="flex items-center justify-center gap-4 py-3">
          <button
            className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform"
            onClick={(e) => { e.stopPropagation(); addTextOverlay(); }}
          >
            <Type className="w-5 h-5" />
          </button>
          <button
            className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform"
            onClick={(e) => { e.stopPropagation(); imageInputRef.current?.click(); }}
          >
            <Image className="w-5 h-5" />
          </button>
          <button
            className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform"
            onClick={(e) => { e.stopPropagation(); videoInputRef.current?.click(); }}
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform ${showColorPicker ? 'bg-white/30' : 'bg-white/15'}`}
            onClick={(e) => { e.stopPropagation(); setColorTarget('bg'); setShowColorPicker(!showColorPicker); }}
          >
            <Palette className="w-5 h-5" />
          </button>
          <button
            className={`w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center transition-transform active:scale-90 ${undoStack.length === 0 ? 'text-white/30' : 'text-white'}`}
            onClick={(e) => { e.stopPropagation(); handleUndo(); }}
            disabled={undoStack.length === 0}
          >
            <Undo2 className="w-5 h-5" />
          </button>
          {selectedId && (
            <button
              className="w-12 h-12 rounded-full bg-red-500/30 backdrop-blur-sm flex items-center justify-center text-red-400 active:scale-90 transition-transform"
              onClick={(e) => { e.stopPropagation(); deleteSelected(); }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
    </div>
  );
}
