import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Type, Plus, Trash2, X, Check, Image, Video, Palette,
  AlignLeft, AlignCenter, AlignRight, Bold, Loader2,
  Globe, Users, Lock, RotateCcw, ChevronDown, ChevronUp, Square
} from 'lucide-react';
import { TextOverlayData, DEFAULT_OVERLAY, StoryTextOverlay } from './StoryTextOverlay';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { compressVideo } from '@/lib/videoUtils';
import { toast } from 'sonner';

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#FF3B30', '#FF9500', '#FFCC00',
  '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
];

const HIGHLIGHT_COLORS = [
  null, '#000000CC', '#FFFFFFCC', '#FF3B30CC', '#007AFFCC',
  '#34C759CC', '#5856D6CC', '#FF2D55CC',
];

const BACKGROUND_COLORS = [
  '#1C1C1E', '#000000', '#0A0A0A', '#1A1A2E', '#16213E',
  '#0F3460', '#533483', '#2C061F', '#374045', '#2C3333',
  '#FF3B30', '#FF9500', '#007AFF', '#34C759', '#5856D6',
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
}

export function StoryEditor({ onPublish, onClose }: StoryEditorProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [bgType, setBgType] = useState<'color' | 'image' | 'video'>('color');
  const [bgColor, setBgColor] = useState('#1C1C1E');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [overlays, setOverlays] = useState<TextOverlayData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showStyleTray, setShowStyleTray] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; overlayX: number; overlayY: number } | null>(null);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);

  // Toolbar drag state
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  const toolbarDragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [publishing, setPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const selectedOverlay = overlays.find(o => o.id === selectedId);

  const cycleVisibility = () => {
    setVisibility(v => v === 'public' ? 'friends' : v === 'friends' ? 'private' : 'public');
  };

  const visIcon = visibility === 'public' ? <Globe className="w-4 h-4" /> : visibility === 'friends' ? <Users className="w-4 h-4" /> : <Lock className="w-4 h-4" />;

  const addTextOverlay = () => {
    const id = `txt_${Date.now()}`;
    const newOverlay: TextOverlayData = { ...DEFAULT_OVERLAY, id };
    setOverlays(prev => [...prev, newOverlay]);
    setSelectedId(id);
    setEditingTextId(id);
    setEditText(DEFAULT_OVERLAY.text);
    setShowBgPicker(false);
  };

  const updateOverlay = useCallback((id: string, updates: Partial<TextOverlayData>) => {
    setOverlays(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, []);

  const deleteOverlay = (id: string) => {
    setOverlays(prev => prev.filter(o => o.id !== id));
    if (selectedId === id) { setSelectedId(null); setShowStyleTray(false); }
  };

  const commitTextEdit = () => {
    if (editingTextId && editText.trim()) {
      updateOverlay(editingTextId, { text: editText.trim() });
    }
    setEditingTextId(null);
  };

  // Drag handlers
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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && selectedId) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setInitialPinchDistance(Math.sqrt(dx * dx + dy * dy));
      const overlay = overlays.find(o => o.id === selectedId);
      setInitialScale(overlay?.scale || 1);
    }
  }, [selectedId, overlays]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && selectedId && initialPinchDistance) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const newScale = Math.max(0.3, Math.min(3, initialScale * (currentDistance / initialPinchDistance)));
      updateOverlay(selectedId, { scale: newScale });
    }
  }, [selectedId, initialPinchDistance, initialScale, updateOverlay]);

  const handleTouchEnd = useCallback(() => { setInitialPinchDistance(null); }, []);

  // Media handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setVideoFile(null); setVideoPreview(null);
    setBgType('image'); setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setShowBgPicker(false);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) { toast.error('Video must be under 500MB'); return; }
    setImageFile(null); setImagePreview(null);
    setBgType('video'); setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setShowBgPicker(false);
  };

  const clearMedia = () => {
    setImageFile(null); setImagePreview(null);
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setBgType('color');
  };

  // Publish
  const handlePublish = async () => {
    if (overlays.length === 0 && !imageFile && !videoFile && bgType === 'color') {
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
      toast.success('Story published! 🎉');
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

  // When selecting an overlay, show style tray
  useEffect(() => {
    if (selectedId) setShowStyleTray(true);
  }, [selectedId]);

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Top bar — minimal: close + visibility + share */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-[env(safe-area-inset-top,0px)] py-2 z-30">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-10 w-10" onClick={onClose}>
          <X className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 h-10 w-10"
            onClick={cycleVisibility}
          >
            {visIcon}
          </Button>
          <Button
            size="sm"
            className="font-display tracking-wide text-xs px-5 h-9"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? (
              <><Loader2 className="w-3 h-3 animate-spin mr-1" />{uploadProgress || 'POSTING...'}</>
            ) : 'SHARE'}
          </Button>
        </div>
      </div>

      {/* Full-screen canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden"
        style={{ backgroundColor: bgType === 'color' ? bgColor : '#1C1C1E' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (!isDragging) {
            setSelectedId(null);
            setShowStyleTray(false);
            setShowBgPicker(false);
          }
        }}
      >
        {bgType === 'image' && imagePreview && (
          <img src={imagePreview} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {bgType === 'video' && videoPreview && (
          <video src={videoPreview} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
        )}

        {/* Text overlays on canvas */}
        {overlays.map(overlay => (
          <div
            key={overlay.id}
            data-overlay
            onPointerDown={(e) => {
              e.stopPropagation();
              setSelectedId(overlay.id);
              setShowBgPicker(false);
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
              onSelect={() => { setSelectedId(overlay.id); setShowBgPicker(false); }}
            />
          </div>
        ))}
      </div>

      {/* Text editing modal */}
      {editingTextId && (
        <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-4">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="bg-white/10 border-white/20 text-white text-center text-xl font-display min-h-32 tracking-wide"
              placeholder="Type your text..."
              autoFocus
              maxLength={150}
            />
            <div className="flex gap-2 justify-center">
              <Button variant="ghost" size="sm" className="text-white/60" onClick={() => setEditingTextId(null)}>Cancel</Button>
              <Button size="sm" onClick={commitTextEdit}><Check className="w-4 h-4 mr-1" /> Done</Button>
            </div>
          </div>
        </div>
      )}

      {/* Style tray — slides up when an overlay is selected */}
      {selectedOverlay && showStyleTray && !editingTextId && (
        <div className="absolute bottom-16 left-0 right-0 z-30 px-3 pb-1 animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl p-3 space-y-2.5 max-h-[40vh] overflow-y-auto">
            {/* Size */}
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-[10px] font-display w-8 shrink-0">SIZE</span>
              <Slider value={[selectedOverlay.fontSize]} onValueChange={([v]) => updateOverlay(selectedOverlay.id, { fontSize: v })} min={14} max={72} step={1} className="flex-1" />
              <span className="text-white/60 text-[10px] w-6 text-right">{selectedOverlay.fontSize}</span>
            </div>
            {/* Scale */}
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-[10px] font-display w-8 shrink-0">SCALE</span>
              <Slider value={[selectedOverlay.scale * 100]} onValueChange={([v]) => updateOverlay(selectedOverlay.id, { scale: v / 100 })} min={30} max={300} step={5} className="flex-1" />
              <span className="text-white/60 text-[10px] w-6 text-right">{Math.round(selectedOverlay.scale * 100)}%</span>
            </div>
            {/* Rotation */}
            <div className="flex items-center gap-2">
              <RotateCcw className="w-3 h-3 text-white/50 shrink-0 ml-0.5" />
              <Slider value={[selectedOverlay.rotation]} onValueChange={([v]) => updateOverlay(selectedOverlay.id, { rotation: v })} min={-180} max={180} step={1} className="flex-1 ml-1.5" />
              <span className="text-white/60 text-[10px] w-6 text-right">{selectedOverlay.rotation}°</span>
            </div>
            {/* Colour dots */}
            <div className="flex gap-1 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button key={c} className={`w-6 h-6 rounded-full border-2 transition-transform ${selectedOverlay.color === c ? 'border-white scale-110' : 'border-white/20'}`} style={{ backgroundColor: c }} onClick={(e) => { e.stopPropagation(); updateOverlay(selectedOverlay.id, { color: c }); }} />
              ))}
            </div>
            {/* Highlight dots */}
            <div className="flex gap-1 flex-wrap">
              <span className="text-white/40 text-[10px] font-display mr-1 self-center">BG</span>
              {HIGHLIGHT_COLORS.map((c, i) => (
                <button key={i} className={`w-6 h-6 rounded-full border-2 transition-transform ${selectedOverlay.backgroundColor === c ? 'border-white scale-110' : 'border-white/20'}`} style={{ backgroundColor: c || 'transparent' }} onClick={(e) => { e.stopPropagation(); updateOverlay(selectedOverlay.id, { backgroundColor: c }); }}>
                  {!c && <X className="w-2.5 h-2.5 text-white/40 mx-auto" />}
                </button>
              ))}
            </div>
            {/* Align / Bold / Edit / Delete row */}
            <div className="flex items-center gap-1 pt-0.5">
              {(['left', 'center', 'right'] as const).map(align => (
                <Button key={align} variant="ghost" size="icon" className={`h-7 w-7 ${selectedOverlay.textAlign === align ? 'bg-white/20' : ''} text-white`} onClick={(e) => { e.stopPropagation(); updateOverlay(selectedOverlay.id, { textAlign: align }); }}>
                  {align === 'left' ? <AlignLeft className="w-3.5 h-3.5" /> : align === 'center' ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
                </Button>
              ))}
              <Button variant="ghost" size="icon" className={`h-7 w-7 ${selectedOverlay.fontWeight === 'bold' ? 'bg-white/20' : ''} text-white`} onClick={(e) => { e.stopPropagation(); updateOverlay(selectedOverlay.id, { fontWeight: selectedOverlay.fontWeight === 'bold' ? 'normal' : 'bold' }); }}>
                <Bold className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className={`h-7 w-7 ${selectedOverlay.showBorder ? 'bg-white/20' : ''} text-white`} onClick={(e) => { e.stopPropagation(); updateOverlay(selectedOverlay.id, { showBorder: !selectedOverlay.showBorder }); }}>
                <Square className="w-3.5 h-3.5" />
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white" onClick={(e) => { e.stopPropagation(); setEditingTextId(selectedOverlay.id); setEditText(selectedOverlay.text); }}>
                <Type className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); deleteOverlay(selectedOverlay.id); }}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Background colour picker tray */}
      {showBgPicker && !editingTextId && (
        <div className="absolute bottom-16 left-0 right-0 z-30 px-3 pb-1 animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl p-3">
            <div className="flex gap-2 flex-wrap justify-center">
              {BACKGROUND_COLORS.map(c => (
                <button
                  key={c}
                  className={`w-9 h-9 rounded-xl border-2 transition-transform ${bgColor === c && bgType === 'color' ? 'border-white scale-110' : 'border-white/20'}`}
                  style={{ backgroundColor: c }}
                  onClick={(e) => { e.stopPropagation(); setBgColor(c); setBgType('color'); clearMedia(); }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Draggable icon toolbar */}
      <div
        ref={toolbarRef}
        className="absolute z-30"
        style={toolbarPos
          ? { left: toolbarPos.x, top: toolbarPos.y }
          : { bottom: 'env(safe-area-inset-bottom, 8px)', left: '50%', transform: 'translateX(-50%)' }
        }
        onPointerDown={(e) => {
          // Only start drag from the handle area
          if (!(e.target as HTMLElement).closest('[data-toolbar-handle]')) return;
          e.stopPropagation();
          e.preventDefault();
          const el = toolbarRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const currentX = toolbarPos?.x ?? rect.left;
          const currentY = toolbarPos?.y ?? rect.top;
          setIsDraggingToolbar(true);
          toolbarDragRef.current = { startX: e.clientX, startY: e.clientY, originX: currentX, originY: currentY };
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!isDraggingToolbar || !toolbarDragRef.current) return;
          e.stopPropagation();
          const dx = e.clientX - toolbarDragRef.current.startX;
          const dy = e.clientY - toolbarDragRef.current.startY;
          const newX = Math.max(0, Math.min(window.innerWidth - 240, toolbarDragRef.current.originX + dx));
          const newY = Math.max(0, Math.min(window.innerHeight - 80, toolbarDragRef.current.originY + dy));
          setToolbarPos({ x: newX, y: newY });
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          setIsDraggingToolbar(false);
          toolbarDragRef.current = null;
        }}
      >
        {/* Drag handle */}
        <div data-toolbar-handle className="flex justify-center py-1 cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }}>
          <div className="w-8 h-1 rounded-full bg-white/30" />
        </div>
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-full px-4 py-2">
          <button className="text-white/80 active:scale-90 transition-transform" onClick={(e) => { e.stopPropagation(); addTextOverlay(); }}>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Type className="w-5 h-5" />
            </div>
          </button>
          <button className="text-white/80 active:scale-90 transition-transform" onClick={(e) => { e.stopPropagation(); imageInputRef.current?.click(); }}>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Image className="w-5 h-5" />
            </div>
          </button>
          <button className="text-white/80 active:scale-90 transition-transform" onClick={(e) => { e.stopPropagation(); videoInputRef.current?.click(); }}>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
          </button>
          <button className={`active:scale-90 transition-transform ${showBgPicker ? 'text-white' : 'text-white/80'}`} onClick={(e) => { e.stopPropagation(); setShowBgPicker(!showBgPicker); setShowStyleTray(false); setSelectedId(null); }}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${showBgPicker ? 'bg-white/25' : 'bg-white/10'}`}>
              <Palette className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
    </div>
  );
}
