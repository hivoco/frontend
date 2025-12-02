"use client";

import { useState, useEffect } from "react";
import { Zap, Wifi, Eye, Network, Clock } from "lucide-react";
import { ZipUpload } from "@/components/ZipUpload";
import { Card } from "@/components/ui/card";
import { Login } from "@/components/Login";

export default function AdminPage() {
  const [backendUrl, setBackendUrl] = useState(
    "http://your-backend.com/upload"
  );
  const [showSettings, setShowSettings] = useState(false);
  const [isLogin, setIsLogin] = useState(false);


  useEffect(() => {
    const checkLogin = () => {
      if (typeof window !== "undefined" && localStorage.isLogin) {
        setIsLogin(true);
      }
    };
    checkLogin();
  }, []);

  if (!isLogin) {
    return (
      <Login
        onSubmit={() => {
          setIsLogin(true);
        }}
      />
    );
  }
  return (
    <div className="min-h-screen bg-background pt-8 pb-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Main Content Card */}
        <Card className="border-primary/20 shadow-2xl hover:shadow-3xl card-lift overflow-hidden backdrop-blur-sm bg-white/95 p-8">
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              ZIP File Upload
            </h2>
          </div>

          <ZipUpload/>
        </Card>



        {/* Backend Settings - Optional */}
        {showSettings && (
          <Card className="border-primary/20 p-6 space-y-4">
            <h3 className="font-semibold text-foreground">
              Backend Configuration
            </h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Backend URL
              </label>
              <input
                type="url"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-primary/20 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="http://your-backend.com/upload"
              />
              <p className="text-xs text-muted-foreground">
                Update this if your backend URL changes
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
