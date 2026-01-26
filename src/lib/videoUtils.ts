/**
 * Video utilities for thumbnail generation and compression
 */

/**
 * Generates a thumbnail from a video file by capturing the first frame
 */
export async function generateVideoThumbnail(
  videoFile: File,
  width: number = 640,
  height: number = 360
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      // Seek to first frame
      video.currentTime = 0.1;
    };

    video.onseeked = () => {
      // Calculate aspect ratio
      const aspectRatio = video.videoWidth / video.videoHeight;
      let drawWidth = width;
      let drawHeight = height;

      if (aspectRatio > width / height) {
        drawHeight = width / aspectRatio;
      } else {
        drawWidth = height * aspectRatio;
      }

      canvas.width = drawWidth;
      canvas.height = drawHeight;

      if (ctx) {
        ctx.drawImage(video, 0, 0, drawWidth, drawHeight);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(video.src);
            resolve(blob);
          },
          'image/jpeg',
          0.8
        );
      } else {
        URL.revokeObjectURL(video.src);
        resolve(null);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve(null);
    };

    video.src = URL.createObjectURL(videoFile);
  });
}

/**
 * Compresses a video file by reducing quality/resolution
 * Uses MediaRecorder API for basic compression
 */
export async function compressVideo(
  videoFile: File,
  targetSizeMB: number = 10,
  maxWidth: number = 1280
): Promise<File> {
  // If file is already small enough, return as-is
  const fileSizeMB = videoFile.size / (1024 * 1024);
  if (fileSizeMB <= targetSizeMB) {
    return videoFile;
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      // Calculate compression ratio
      const compressionRatio = targetSizeMB / fileSizeMB;
      
      // Calculate new dimensions
      let newWidth = video.videoWidth;
      let newHeight = video.videoHeight;
      
      if (video.videoWidth > maxWidth) {
        const scale = maxWidth / video.videoWidth;
        newWidth = maxWidth;
        newHeight = Math.round(video.videoHeight * scale);
      }

      // Further reduce if needed for compression
      if (compressionRatio < 0.5) {
        const additionalScale = Math.sqrt(compressionRatio * 2);
        newWidth = Math.round(newWidth * additionalScale);
        newHeight = Math.round(newHeight * additionalScale);
      }

      // Create canvas for frame capture
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(video.src);
        resolve(videoFile); // Return original if canvas fails
        return;
      }

      // Check for MediaRecorder support
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
      ];

      let supportedMimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          supportedMimeType = type;
          break;
        }
      }

      if (!supportedMimeType) {
        console.warn('No supported video encoding format, returning original');
        URL.revokeObjectURL(video.src);
        resolve(videoFile);
        return;
      }

      // Calculate target bitrate based on compression needs
      const videoDuration = video.duration;
      const targetBitsPerSecond = Math.floor((targetSizeMB * 8 * 1024 * 1024) / videoDuration);
      const videoBitsPerSecond = Math.min(targetBitsPerSecond * 0.9, 2500000); // Cap at 2.5 Mbps

      try {
        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: supportedMimeType,
          videoBitsPerSecond,
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          URL.revokeObjectURL(video.src);
          const blob = new Blob(chunks, { type: supportedMimeType });
          const compressedFile = new File([blob], videoFile.name.replace(/\.[^/.]+$/, '.webm'), {
            type: supportedMimeType,
          });
          resolve(compressedFile);
        };

        mediaRecorder.onerror = () => {
          URL.revokeObjectURL(video.src);
          resolve(videoFile);
        };

        // Start recording
        mediaRecorder.start();

        // Draw frames
        video.currentTime = 0;
        video.play();

        const drawFrame = () => {
          if (video.ended || video.paused) {
            mediaRecorder.stop();
            return;
          }
          ctx.drawImage(video, 0, 0, newWidth, newHeight);
          requestAnimationFrame(drawFrame);
        };

        video.onplay = drawFrame;

        video.onended = () => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        };
      } catch (error) {
        console.error('Compression error:', error);
        URL.revokeObjectURL(video.src);
        resolve(videoFile);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video for compression'));
    };

    video.src = URL.createObjectURL(videoFile);
  });
}

/**
 * Get video metadata (duration, dimensions)
 */
export function getVideoMetadata(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const metadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      };
      URL.revokeObjectURL(video.src);
      resolve(metadata);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(file);
  });
}
