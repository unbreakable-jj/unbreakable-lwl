import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Type, Plus, Trash2, X, Check, Image, Video, Palette,
  AlignLeft, AlignCenter, AlignRight, Bold, Move, Loader2,
  Globe, Users, Lock, RotateCcw
} from 'lucide-react';
import { TextOverlayData, DEFAULT_OVERLAY, StoryTextOverlay } from './StoryTextOverlay';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { compressVideo } from '@/lib/videoUtils';
import { toast } from 'sonner';

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#FF3B30', '#FF9500', '#FFCC00',
  '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
  '#8E8E93', '#48484A', '#1C1C1E',
];

const HIGHLIGHT_COLORS = [
  null, '#000000CC', '#FFFFFFCC', '#FF3B30CC', '#FF9500CC',
  '#007AFFCC', '#34C759CC', '#5856D6CC', '#FF2D55CC',
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

  // Background state
  const [bgType, setBgType] = useState<'color' | 'image' | 'video'>('color');
  const [bgColor, setBgColor] = useState('#1C1C1E');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Text overlays
  const [overlays, setOverlays] = useState<TextOverlayData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Toolbar state
  const [activePanel, setActivePanel] = useState<'none' | 'text' | 'bg' | 'color'>('none');

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; overlayX: number; overlayY: number } | null>(null);

  // Pinch/scale state
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);

  // Publishing
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [publishing, setPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const selectedOverlay = overlays.find(o => o.id === selectedId);

  const addTextOverlay = () => {
    const id = `txt_${Date.now()}`;
    const newOverlay: TextOverlayData = { ...DEFAULT_OVERLAY, id };
    setOverlays(prev => [...prev, newOverlay]);
    setSelectedId(id);
    setEditingTextId(id);
    setEditText(DEFAULT_OVERLAY.text);
    setActivePanel('text');
  };

  const updateOverlay = useCallback((id: string, updates: Partial<TextOverlayData>) => {
    setOverlays(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, []);

  const deleteOverlay = (id: string) => {
    setOverlays(prev => prev.filter(o => o.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setEditingTextId(null);
      setActivePanel('none');
    }
  };

  const commitTextEdit = () => {
    if (editingTextId && editText.trim()) {
      updateOverlay(editingTextId, { text: editText.trim() });
    }
    setEditingTextId(null);
  };

  // Touch/mouse drag handlers for positioning
  const getRelativePosition = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 50, y: 50 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));
    return { x, y };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!selectedId) return;
    const overlay = overlays.find(o => o.id === selectedId);
    if (!overlay) return;

    // Check if click is on an overlay element
    const target = e.target as HTMLElement;
    if (!target.closest('[data-overlay]')) {
      setSelectedId(null);
      setActivePanel('none');
      return;
    }

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      overlayX: overlay.x,
      overlayY: overlay.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [selectedId, overlays]);

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

  // Touch pinch-to-scale
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
      const scaleRatio = currentDistance / initialPinchDistance;
      const newScale = Math.max(0.3, Math.min(3, initialScale * scaleRatio));
      updateOverlay(selectedId, { scale: newScale });
    }
  }, [selectedId, initialPinchDistance, initialScale, updateOverlay]);

  const handleTouchEnd = useCallback(() => {
    setInitialPinchDistance(null);
  }, []);

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setVideoFile(null); setVideoPreview(null);
    setBgType('image');
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) { toast.error('Video must be under 500MB'); return; }
    setImageFile(null); setImagePreview(null);
    setBgType('video');
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
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
    } catch (err) {
      toast.error('Failed to publish story');
      console.error(err);
    } finally {
      setPublishing(false);
      setUploadProgress(null);
    }
  };

  // Clean up video preview URL
  useEffect(() => {
    return () => { if (videoPreview) URL.revokeObjectURL(videoPreview); };
  }, [videoPreview]);

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 z-20">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={onClose}>
          <X className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Select value={visibility} onValueChange={(v) => setVisibility(v as any)}>
            <SelectTrigger className="w-auto bg-white/10 border-none text-white text-xs h-8 gap-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public"><div className="flex items-center gap-2"><Globe className="w-3 h-3" />Public</div></SelectItem>
              <SelectItem value="friends"><div className="flex items-center gap-2"><Users className="w-3 h-3" />Friends</div></SelectItem>
              <SelectItem value="private"><div className="flex items-center gap-2"><Lock className="w-3 h-3" />Only Me</div></SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="font-display tracking-wide text-xs"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                {uploadProgress || 'POSTING...'}
              </>
            ) : 'SHARE'}
          </Button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex items-center justify-center px-4 pb-4 overflow-hidden">
        <div
          ref={canvasRef}
          className="relative w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden"
          style={{
            backgroundColor: bgType === 'color' ? bgColor : '#1C1C1E',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            if (!isDragging) {
              setSelectedId(null);
              setActivePanel('none');
            }
          }}
        >
          {/* Background image */}
          {bgType === 'image' && imagePreview && (
            <img src={imagePreview} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
          )}

          {/* Background video */}
          {bgType === 'video' && videoPreview && (
            <video
              src={videoPreview}
              autoPlay loop muted playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Text overlays */}
          {overlays.map(overlay => (
            <div
              key={overlay.id}
              data-overlay
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelectedId(overlay.id);
                setActivePanel('text');
                // Start drag
                const ov = overlays.find(o => o.id === overlay.id);
                if (ov) {
                  setIsDragging(true);
                  dragStartRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    overlayX: ov.x,
                    overlayY: ov.y,
                  };
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
                onSelect={() => {
                  setSelectedId(overlay.id);
                  setActivePanel('text');
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Text editing modal */}
      {editingTextId && (
        <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center p-6">
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
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60"
                onClick={() => { setEditingTextId(null); }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={commitTextEdit}>
                <Check className="w-4 h-4 mr-1" /> Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom toolbar */}
      <div className="p-4 space-y-3 z-20">
        {/* Selected overlay controls */}
        {selectedOverlay && activePanel === 'text' && (
          <div className="bg-white/10 rounded-xl p-3 space-y-3 backdrop-blur-sm">
            {/* Font size slider */}
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-xs font-display w-10">SIZE</span>
              <Slider
                value={[selectedOverlay.fontSize]}
                onValueChange={([v]) => updateOverlay(selectedOverlay.id, { fontSize: v })}
                min={14}
                max={72}
                step={1}
                className="flex-1"
              />
              <span className="text-white text-xs w-8 text-right">{selectedOverlay.fontSize}</span>
            </div>

            {/* Scale slider */}
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-xs font-display w-10">SCALE</span>
              <Slider
                value={[selectedOverlay.scale * 100]}
                onValueChange={([v]) => updateOverlay(selectedOverlay.id, { scale: v / 100 })}
                min={30}
                max={300}
                step={5}
                className="flex-1"
              />
              <span className="text-white text-xs w-8 text-right">{Math.round(selectedOverlay.scale * 100)}%</span>
            </div>

            {/* Rotation */}
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-xs font-display w-10">
                <RotateCcw className="w-3 h-3" />
              </span>
              <Slider
                value={[selectedOverlay.rotation]}
                onValueChange={([v]) => updateOverlay(selectedOverlay.id, { rotation: v })}
                min={-180}
                max={180}
                step={1}
                className="flex-1"
              />
              <span className="text-white text-xs w-8 text-right">{selectedOverlay.rotation}°</span>
            </div>

            {/* Font color */}
            <div>
              <span className="text-white/60 text-xs font-display block mb-1.5">COLOUR</span>
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    className={`w-7 h-7 rounded-full border-2 ${selectedOverlay.color === c ? 'border-white scale-110' : 'border-white/20'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => updateOverlay(selectedOverlay.id, { color: c })}
                  />
                ))}
              </div>
            </div>

            {/* Highlight */}
            <div>
              <span className="text-white/60 text-xs font-display block mb-1.5">HIGHLIGHT</span>
              <div className="flex gap-1.5 flex-wrap">
                {HIGHLIGHT_COLORS.map((c, i) => (
                  <button
                    key={i}
                    className={`w-7 h-7 rounded-full border-2 ${selectedOverlay.backgroundColor === c ? 'border-white scale-110' : 'border-white/20'} ${!c ? 'bg-transparent' : ''}`}
                    style={{ backgroundColor: c || 'transparent' }}
                    onClick={() => updateOverlay(selectedOverlay.id, { backgroundColor: c })}
                  >
                    {!c && <X className="w-3 h-3 text-white/40 mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Alignment & weight */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className={`h-8 w-8 ${selectedOverlay.textAlign === 'left' ? 'bg-white/20' : ''} text-white`} onClick={() => updateOverlay(selectedOverlay.id, { textAlign: 'left' })}>
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className={`h-8 w-8 ${selectedOverlay.textAlign === 'center' ? 'bg-white/20' : ''} text-white`} onClick={() => updateOverlay(selectedOverlay.id, { textAlign: 'center' })}>
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className={`h-8 w-8 ${selectedOverlay.textAlign === 'right' ? 'bg-white/20' : ''} text-white`} onClick={() => updateOverlay(selectedOverlay.id, { textAlign: 'right' })}>
                <AlignRight className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-white/20" />
              <Button variant="ghost" size="icon" className={`h-8 w-8 ${selectedOverlay.fontWeight === 'bold' ? 'bg-white/20' : ''} text-white`} onClick={() => updateOverlay(selectedOverlay.id, { fontWeight: selectedOverlay.fontWeight === 'bold' ? 'normal' : 'bold' })}>
                <Bold className="w-4 h-4" />
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={() => { setEditingTextId(selectedOverlay.id); setEditText(selectedOverlay.text); }}>
                <Type className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => deleteOverlay(selectedOverlay.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Background panel */}
        {activePanel === 'bg' && (
          <div className="bg-white/10 rounded-xl p-3 space-y-3 backdrop-blur-sm">
            <span className="text-white/60 text-xs font-display block">BACKGROUND COLOUR</span>
            <div className="flex gap-1.5 flex-wrap">
              {BACKGROUND_COLORS.map(c => (
                <button
                  key={c}
                  className={`w-8 h-8 rounded-lg border-2 ${bgColor === c && bgType === 'color' ? 'border-white scale-110' : 'border-white/20'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => { setBgColor(c); setBgType('color'); clearMedia(); }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main action buttons */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white text-xs font-display gap-1.5"
            onClick={addTextOverlay}
          >
            <Type className="w-4 h-4" /> TEXT
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white text-xs font-display gap-1.5"
            onClick={() => imageInputRef.current?.click()}
          >
            <Image className="w-4 h-4" /> PHOTO
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white text-xs font-display gap-1.5"
            onClick={() => videoInputRef.current?.click()}
          >
            <Video className="w-4 h-4" /> VIDEO
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-white text-xs font-display gap-1.5 ${activePanel === 'bg' ? 'bg-white/20' : ''}`}
            onClick={() => setActivePanel(activePanel === 'bg' ? 'none' : 'bg')}
          >
            <Palette className="w-4 h-4" /> BG
          </Button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
    </div>
  );
}
