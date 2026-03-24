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
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { uploadMediaFile, validateVideoDuration, type MediaUploadItem } from '@/lib/mediaUpload';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#FF3B30', '#FF9500', '#FFCC00',
  '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
  '#1C1C1E', '#0A0A0A', '#1A1A2E', '#16213E', '#0F3460',
  '#533483', '#2C061F', '#374045', '#2C3333',
];

const MAX_MEDIA = 5;
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

export interface StoryMediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail_url?: string | null;
}

interface StoryEditorProps {
  onPublish: (data: {
    content: string | null;
    image_url: string | null;
    video_url: string | null;
    visibility: string;
    text_overlays: TextOverlayData[];
    background_color: string | null;
    media_items: StoryMediaItem[];
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Media items state (up to 5)
  const [mediaItems, setMediaItems] = useState<MediaUploadItem[]>(() => {
    const items: MediaUploadItem[] = [];
    if (preFill?.image_url) {
      items.push({
        file: new File([], 'prefill.jpg'),
        type: 'image',
        previewUrl: preFill.image_url,
        progress: 100,
        status: 'done',
        uploadedUrl: preFill.image_url,
      });
    }
    if (preFill?.video_url) {
      items.push({
        file: new File([], 'prefill.mp4'),
        type: 'video',
        previewUrl: preFill.video_url,
        progress: 100,
        status: 'done',
        uploadedUrl: preFill.video_url,
      });
    }
    return items;
  });
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const [bgColor, setBgColor] = useState(preFill?.background_color || '#1C1C1E');

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
  const [overallProgress, setOverallProgress] = useState(0);

  const selectedOverlay = overlays.find(o => o.id === selectedId);
  const hasMedia = mediaItems.length > 0;
  const currentMedia = mediaItems[activeMediaIndex];

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

  const toggleBorder = () => {
    if (!selectedOverlay) return;
    pushUndo();
    if (selectedOverlay.showBorder) {
      updateOverlay(selectedOverlay.id, { showBorder: false, borderWidth: 0 });
    } else {
      updateOverlay(selectedOverlay.id, { showBorder: true, borderWidth: 2, borderColor: '#FFFFFF' });
    }
  };

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
    if (e.touches.length === 2 && selectedId) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = getTouchAngle(e.touches[0], e.touches[1]);
      const overlay = overlays.find(o => o.id === selectedId);
      setInitialPinchDistance(dist);
      setInitialScale(overlay?.scale || 1);
      setInitialAngle(angle);
      setInitialRotation(overlay?.rotation || 0);
    }
  }, [selectedId, overlays]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && selectedId && initialPinchDistance) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const currentAngle = getTouchAngle(e.touches[0], e.touches[1]);
      const newScale = Math.max(0.3, Math.min(3, initialScale * (currentDist / initialPinchDistance)));
      const angleDelta = currentAngle - initialAngle;
      const newRotation = Math.round(initialRotation + angleDelta);
      updateOverlay(selectedId, { scale: newScale, rotation: newRotation });
    }
  }, [selectedId, initialPinchDistance, initialScale, initialAngle, initialRotation, updateOverlay]);

  const handleTouchEnd = useCallback(() => {
    setInitialPinchDistance(null);
  }, []);

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-overlay]')) return;
    setSelectedId(null);
    setShowColorPicker(false);
  };

  // Media file selection - supports multiple
  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_MEDIA - mediaItems.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_MEDIA} media items allowed`);
      return;
    }

    const toAdd = files.slice(0, remaining);
    if (files.length > remaining) {
      toast.info(`Only ${remaining} more item${remaining > 1 ? 's' : ''} can be added`);
    }

    const newItems: MediaUploadItem[] = [];

    for (const file of toAdd) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) {
        toast.error(`${file.name} is not a supported format`);
        continue;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} exceeds 20MB limit`);
        continue;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        toast.error(`${file.name} exceeds 500MB limit`);
        continue;
      }

      if (isVideo) {
        const { valid, duration } = await validateVideoDuration(file);
        if (!valid) {
          toast.error(`${file.name} exceeds 90 second limit (${Math.round(duration)}s)`);
          continue;
        }
      }

      newItems.push({
        file,
        type: isVideo ? 'video' : 'image',
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: 'pending',
      });
    }

    if (newItems.length) {
      setMediaItems(prev => [...prev, ...newItems]);
      setActiveMediaIndex(mediaItems.length); // Show newly added
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMediaItem = (index: number) => {
    setMediaItems(prev => {
      const item = prev[index];
      if (item && !item.uploadedUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    setActiveMediaIndex(prev => Math.max(0, Math.min(prev, mediaItems.length - 2)));
  };

  // Publish
  const handlePublish = async () => {
    if (overlays.length === 0 && mediaItems.length === 0 && !bgColor) {
      toast.error('Add some content to your story');
      return;
    }
    if (!user) return;

    setPublishing(true);
    setOverallProgress(0);

    try {
      const uploadedMedia: StoryMediaItem[] = [];
      const totalItems = mediaItems.length;

      // Upload all pending media
      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i];

        // Already uploaded (prefill)
        if (item.status === 'done' && item.uploadedUrl) {
          uploadedMedia.push({
            type: item.type,
            url: item.uploadedUrl,
            thumbnail_url: item.thumbnailUrl || null,
          });
          continue;
        }

        const itemLabel = `${item.type === 'image' ? 'Image' : 'Video'} ${i + 1}/${totalItems}`;

        setMediaItems(prev =>
          prev.map((m, idx) => idx === i ? { ...m, status: 'uploading' as const } : m)
        );

        const result = await uploadMediaFile(
          user.id,
          item.file,
          item.type,
          (pct, stage) => {
            const baseProgress = (i / totalItems) * 100;
            const itemProgress = (pct / 100) * (100 / totalItems);
            setOverallProgress(Math.round(baseProgress + itemProgress));
            setUploadProgress(`${itemLabel}: ${stage}`);
            setMediaItems(prev =>
              prev.map((m, idx) => idx === i ? { ...m, progress: pct } : m)
            );
          }
        );

        if (result.error) {
          toast.error(`Failed to upload ${item.file.name}`);
          setMediaItems(prev =>
            prev.map((m, idx) => idx === i ? { ...m, status: 'error' as const } : m)
          );
          setPublishing(false);
          setOverallProgress(0);
          setUploadProgress(null);
          return;
        }

        setMediaItems(prev =>
          prev.map((m, idx) =>
            idx === i ? { ...m, status: 'done' as const, progress: 100, uploadedUrl: result.url, thumbnailUrl: result.thumbnailUrl || undefined } : m
          )
        );

        uploadedMedia.push({
          type: item.type,
          url: result.url,
          thumbnail_url: result.thumbnailUrl,
        });
      }

      setUploadProgress('Publishing...');
      setOverallProgress(95);

      // For backward compat, set first image/video on the story row
      const firstImage = uploadedMedia.find(m => m.type === 'image');
      const firstVideo = uploadedMedia.find(m => m.type === 'video');

      await onPublish({
        content: null,
        image_url: firstImage?.url || null,
        video_url: firstVideo?.url || null,
        visibility,
        text_overlays: overlays,
        background_color: mediaItems.length === 0 ? bgColor : null,
        media_items: uploadedMedia,
      });
      toast.success('Story published!');
    } catch (err) {
      toast.error('Failed to publish story');
      console.error(err);
    } finally {
      setPublishing(false);
      setUploadProgress(null);
      setOverallProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      mediaItems.forEach(item => {
        if (!item.uploadedUrl && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

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

      {/* Full-screen canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden"
        style={{ backgroundColor: !hasMedia ? bgColor : '#000' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handleCanvasPointerDown}
      >
        {/* Current media display */}
        {hasMedia && currentMedia && (
          <>
            {currentMedia.type === 'image' ? (
              <img
                src={currentMedia.uploadedUrl || currentMedia.previewUrl}
                alt="Story media"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
            ) : (
              <video
                src={currentMedia.uploadedUrl || currentMedia.previewUrl}
                autoPlay loop muted playsInline
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
            )}
          </>
        )}

        {/* Media dot indicators */}
        {mediaItems.length > 1 && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
            {mediaItems.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === activeMediaIndex ? 'bg-white scale-125' : 'bg-white/40'
                }`}
                onClick={(e) => { e.stopPropagation(); setActiveMediaIndex(idx); }}
              />
            ))}
          </div>
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

      {/* Media thumbnails strip */}
      {mediaItems.length > 0 && (
        <div className="absolute bottom-28 left-0 right-0 z-30 px-4">
          <div className="flex items-center gap-2 justify-center">
            {mediaItems.map((item, idx) => (
              <div
                key={idx}
                className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  idx === activeMediaIndex ? 'border-primary scale-110' : 'border-white/20'
                }`}
                onClick={(e) => { e.stopPropagation(); setActiveMediaIndex(idx); }}
              >
                {item.type === 'image' ? (
                  <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                    <Video className="w-4 h-4 text-white/70" />
                  </div>
                )}

                {item.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}

                {!publishing && (
                  <button
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); removeMediaItem(idx); }}
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            ))}

            {/* Add more button */}
            {mediaItems.length < MAX_MEDIA && !publishing && (
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="w-14 h-14 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center text-white/50 hover:border-white/60 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-center text-white/40 text-[10px] mt-1 font-display">
            {mediaItems.length}/{MAX_MEDIA} MEDIA
          </p>
        </div>
      )}

      {/* Upload progress bar */}
      {publishing && overallProgress > 0 && (
        <div className="absolute bottom-24 left-4 right-4 z-30 space-y-1">
          <Progress value={overallProgress} className="h-1.5" />
          <p className="text-center text-white/60 text-[10px]">{uploadProgress || `${overallProgress}%`}</p>
        </div>
      )}

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

      {/* Selected overlay quick actions */}
      {selectedOverlay && !editingTextId && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-31 flex flex-col items-center gap-1 animate-in fade-in duration-150 ${showColorPicker || hasMedia ? 'bottom-44' : 'bottom-24'}`}>
          {/* Row 0: Font size slider + font family */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 min-w-[260px]">
            <span className="text-white/60 text-[10px] font-display shrink-0">Aa</span>
            <Slider
              value={[selectedOverlay.fontSize]}
              onValueChange={([v]) => updateOverlay(selectedOverlay.id, { fontSize: v })}
              min={12}
              max={72}
              step={1}
              className="flex-1"
            />
            <span className="text-white text-[10px] font-display w-5 text-center shrink-0">{selectedOverlay.fontSize}</span>
          </div>
          {/* Font family selector */}
          <div className="flex items-center gap-1 overflow-x-auto bg-black/60 backdrop-blur-md rounded-full px-2 py-1 max-w-[300px] scrollbar-hide">
            {FONT_OPTIONS.map(f => (
              <button
                key={f.value}
                className={`shrink-0 px-2 py-1 rounded-full text-[10px] transition-colors ${
                  (selectedOverlay.fontFamily || "'Bebas Neue', sans-serif") === f.value
                    ? 'bg-white/25 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
                style={{ fontFamily: f.value }}
                onClick={(e) => { e.stopPropagation(); updateOverlay(selectedOverlay.id, { fontFamily: f.value }); }}
              >
                {f.label}
              </button>
            ))}
          </div>
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
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              onClick={(e) => { e.stopPropagation(); setColorTarget('text'); setShowColorPicker(true); }}
              title="Text colour"
            >
              <div className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: selectedOverlay.color }} />
            </button>
            <button
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${selectedOverlay.backgroundColor ? 'bg-white/20' : ''}`}
              onClick={(e) => { e.stopPropagation(); toggleOverlayBg(); }}
              title="Toggle box"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            {selectedOverlay.backgroundColor && (
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                onClick={(e) => { e.stopPropagation(); setColorTarget('overlay-bg'); setShowColorPicker(true); }}
                title="Box colour"
              >
                <div className="w-4 h-4 rounded border border-white/50" style={{ backgroundColor: selectedOverlay.backgroundColor }} />
              </button>
            )}
            <button
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${selectedOverlay.showBorder ? 'bg-white/20' : ''}`}
              onClick={(e) => { e.stopPropagation(); toggleBorder(); }}
              title="Toggle border"
            >
              <span className="text-[10px] font-bold border border-white/60 px-1 rounded">B</span>
            </button>
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
            className={`w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform ${mediaItems.length >= MAX_MEDIA ? 'opacity-30' : ''}`}
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            disabled={mediaItems.length >= MAX_MEDIA}
          >
            <Image className="w-5 h-5" />
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

      {/* Hidden file input - accepts both images and videos, multiple */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFilesSelect}
        multiple
      />
    </div>
  );
}
