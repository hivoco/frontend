"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Debug component to test camera functionality
 * Helps diagnose camera issues
 */
export function CameraDebug() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<string>("Ready");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCamera = async () => {
    addLog("Starting camera test...");
    setStatus("Testing...");

    try {
      addLog("Checking getUserMedia support...");
      if (!navigator.mediaDevices?.getUserMedia) {
        addLog("❌ getUserMedia not supported");
        setStatus("Not supported");
        return;
      }
      addLog("✅ getUserMedia supported");

      addLog("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      addLog("✅ Camera stream received");
      const tracks = stream.getVideoTracks();
      addLog(`✅ Video tracks: ${tracks.length}`);

      if (tracks.length > 0) {
        const settings = tracks[0].getSettings();
        addLog(`✅ Resolution: ${settings.width}x${settings.height}`);
        addLog(`✅ Facing: ${settings.facingMode}`);
      }

      if (!videoRef.current) {
        addLog("❌ Video ref not available");
        setStatus("Ref error");
        return;
      }

      addLog("Connecting stream to video element...");
      videoRef.current.srcObject = stream;
      addLog("✅ Stream connected");

      addLog("Attempting to play video...");
      try {
        await videoRef.current.play();
        addLog("✅ Video playing");
      } catch (playErr) {
        addLog(`⚠️ Play failed (may auto-play): ${(playErr as Error).message}`);
      }

      addLog("Checking video dimensions...");
      setTimeout(() => {
        if (videoRef.current) {
          addLog(`Video element size: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
          addLog(`Video element display: ${videoRef.current.offsetWidth}x${videoRef.current.offsetHeight}`);
          addLog(`Video ready state: ${videoRef.current.readyState}`);
          addLog(`Video paused: ${videoRef.current.paused}`);
        }
      }, 1000);

      setStatus("✅ Camera working!");
    } catch (err) {
      const error = err as DOMException;
      addLog(`❌ Error: ${error.name}`);
      addLog(`Message: ${error.message}`);

      if (error.name === "NotAllowedError") {
        addLog("→ Permission denied. Check browser settings.");
      } else if (error.name === "NotFoundError") {
        addLog("→ No camera device found.");
      } else if (error.name === "NotReadableError") {
        addLog("→ Camera in use by another app.");
      } else if (error.name === "SecurityError") {
        addLog("→ Requires HTTPS or localhost.");
      }

      setStatus("❌ Camera error");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      addLog("✅ Camera stopped");
      setStatus("Stopped");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Camera Debug Tool</CardTitle>
          <CardDescription>Test camera functionality and diagnose issues</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status */}
          <div className="p-3 rounded-md bg-muted">
            <p className="text-sm font-medium">Status: {status}</p>
          </div>

          {/* Video Element */}
          <div className="bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button onClick={testCamera} className="flex-1">
              Test Camera
            </Button>
            <Button onClick={stopCamera} variant="outline" className="flex-1">
              Stop
            </Button>
          </div>

          {/* Logs */}
          <div className="border border-border rounded-lg p-3 bg-muted/50 text-xs font-mono space-y-1 max-h-40 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">Logs will appear here...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-foreground/70">
                  {log}
                </div>
              ))
            )}
          </div>

          {/* Browser Info */}
          <div className="border border-border rounded-lg p-3 bg-muted/50 text-xs space-y-1">
            <p className="text-muted-foreground">Open browser console (F12) to see detailed diagnostic info</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
