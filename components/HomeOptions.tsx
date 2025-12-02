"use client";

import { Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface HomeOptionsProps {
  onSelectWithID: () => void;
  onSelectWithoutID: () => void;
}

export function HomeOptions({ onSelectWithID, onSelectWithoutID }: HomeOptionsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Upload Your Photo
        </h2>
        <p className="text-muted-foreground text-lg">
          Choose how you want to manage your photos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: With ID */}
        <Card className="border-primary/30 shadow-2xl hover:shadow-3xl card-lift overflow-hidden backdrop-blur-sm bg-white/95 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
          onClick={onSelectWithID}
        >
          <div className="p-8 flex flex-col items-center text-center space-y-4 h-full justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-accent/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-300" />
              <Camera className="relative h-16 w-16 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="space-y-2">
              {/* <h3 className="text-2xl font-bold text-foreground">
                Option 1
              </h3> */}
              <p className="text-muted-foreground">
                Upload photo + Enter your ID number
              </p>
              <p className="text-xs text-muted-foreground/70 mt-3 font-medium">
                Your photo will be saved with your ID
              </p>
            </div>
            <Button
              className="mt-6 gap-2 bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white group-hover:scale-105 transition-transform duration-300"
              onClick={(e) => {
                e.stopPropagation();
                onSelectWithID();
              }}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Option 2: Without ID */}
        <Card className="border-secondary/30 shadow-2xl hover:shadow-3xl card-lift overflow-hidden backdrop-blur-sm bg-white/95 hover:border-secondary/50 transition-all duration-300 cursor-pointer group"
          onClick={onSelectWithoutID}
        >
          <div className="p-8 flex flex-col items-center text-center space-y-4 h-full justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-secondary/30 to-accent/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-300" />
              <Camera className="relative h-16 w-16 text-secondary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                Option 2
              </h3>
              <p className="text-muted-foreground">
                Just upload your photo
              </p>
              <p className="text-xs text-muted-foreground/70 mt-3 font-medium">
                You'll be routed to your photo gallery
              </p>
            </div>
            <Button
              className="mt-6 gap-2 bg-linear-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white group-hover:scale-105 transition-transform duration-300"
              onClick={(e) => {
                e.stopPropagation();
                onSelectWithoutID();
              }}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
