import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Video, Square, Loader2, AlertCircle } from "lucide-react";

type Mode = "photo" | "video";

export function MediaCapture({
  mode,
  facingMode = "environment",
  previewUrl,
  onCaptured,
  disabled,
}: {
  mode: Mode;
  facingMode?: "environment" | "user";
  previewUrl?: string | null;
  onCaptured: (blob: Blob, previewUrl: string) => void;
  disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setReady(false);
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === "video",
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setReady(true);
    } catch {
      setError("Camera access denied or unavailable. Allow camera permission and retry.");
    }
  }, [facingMode, mode, stopStream]);

  useEffect(() => {
    if (previewUrl) {
      stopStream();
      return;
    }
    startCamera();
    return () => stopStream();
  }, [previewUrl, startCamera, stopStream]);

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => {
      setRecordSec((s) => {
        if (s >= 59) recorderRef.current?.stop();
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [recording]);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCaptured(blob, URL.createObjectURL(blob));
        stopStream();
      },
      "image/jpeg",
      0.9,
    );
  };

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType: mime });
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime });
      onCaptured(blob, URL.createObjectURL(blob));
      setRecording(false);
      setRecordSec(0);
      stopStream();
    };
    recorder.start(200);
    setRecording(true);
    setRecordSec(0);
  };

  if (previewUrl) {
    return (
      <div className="relative aspect-video max-h-52 rounded-xl overflow-hidden border border-border bg-black">
        {mode === "video" ? (
          <video src={previewUrl} className="w-full h-full object-cover" controls playsInline />
        ) : (
          <img src={previewUrl} alt="Captured" className="w-full h-full object-cover" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-video max-h-52 rounded-xl overflow-hidden border border-border bg-black">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-xs text-muted-foreground">
            <AlertCircle className="size-8 text-destructive" />
            <p>{error}</p>
            <button type="button" onClick={startCamera} className="btn-md border border-border bg-card">
              Retry camera
            </button>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
            {!ready && (
              <div className="absolute inset-0 grid place-items-center bg-black/40">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            )}
            {recording && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/90 text-white text-[10px] font-mono">
                <span className="size-2 rounded-full bg-white animate-pulse" />
                REC {recordSec}s
              </div>
            )}
          </>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Live camera · {mode === "video" ? "Record walkaround (max 60s)" : "Capture photo in real time"}
      </p>
      {!error && (
        <div className="flex flex-wrap gap-2">
          {mode === "photo" ? (
            <button
              type="button"
              disabled={!ready || disabled}
              onClick={capturePhoto}
              className="btn-md bg-primary text-primary-foreground shadow-md shadow-primary/20 inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Camera className="size-4" /> Capture now
            </button>
          ) : !recording ? (
            <button
              type="button"
              disabled={!ready || disabled}
              onClick={startRecording}
              className="btn-md bg-primary text-primary-foreground shadow-md shadow-primary/20 inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Video className="size-4" /> Start recording
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="btn-md bg-destructive text-destructive-foreground inline-flex items-center gap-2"
            >
              <Square className="size-4" /> Stop & save
            </button>
          )}
        </div>
      )}
    </div>
  );
}
