"use client";

import { CameraDebug } from "@/components/CameraDebug";

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Camera Debug Tool</h1>
          <p className="text-muted-foreground">
            This tool helps diagnose camera issues. Click "Test Camera" to see detailed logs.
          </p>
        </div>

        <CameraDebug />

        {/* Instructions */}
        <div className="mt-8 space-y-4">
          <div className="border border-border rounded-lg p-6 bg-card">
            <h2 className="text-lg font-semibold mb-3">How to use:</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Click "Test Camera" button</li>
              <li>Watch the logs for success/error messages</li>
              <li>Check if video preview appears</li>
              <li>Open browser console (F12) for additional details</li>
            </ol>
          </div>

          <div className="border border-border rounded-lg p-6 bg-card">
            <h2 className="text-lg font-semibold mb-3">Troubleshooting:</h2>
            <div className="space-y-2 text-sm">
              <div>
                <strong className="text-foreground">Black video with no error:</strong>
                <p className="text-muted-foreground ml-4">Check browser console (F12) for permission issues</p>
              </div>
              <div>
                <strong className="text-foreground">NotAllowedError:</strong>
                <p className="text-muted-foreground ml-4">Grant camera permission in browser settings</p>
              </div>
              <div>
                <strong className="text-foreground">NotFoundError:</strong>
                <p className="text-muted-foreground ml-4">No camera device detected. Check if camera is connected.</p>
              </div>
              <div>
                <strong className="text-foreground">NotReadableError:</strong>
                <p className="text-muted-foreground ml-4">Camera is in use by another application. Close other apps.</p>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-6 bg-card">
            <h2 className="text-lg font-semibold mb-3">Tips:</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Make sure you're using localhost:3000 or HTTPS</li>
              <li>Check that no other tabs have camera access</li>
              <li>Try a different browser if possible</li>
              <li>Restart your browser completely</li>
              <li>Check camera permissions in your OS settings</li>
            </ul>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <a href="/" className="text-primary hover:underline">
            ← Back to Photo Upload
          </a>
        </div>
      </div>
    </div>
  );
}
