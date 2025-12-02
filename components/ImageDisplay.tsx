"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import JSZip from "jszip";

type imgItem = {
  image_url: string;
};

type Props = {
  images: imgItem[];
};

export default function ImageDisplay({ images }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  // const images = [
  //   "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  //   "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  //   "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  //   "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
  //   "https://images.unsplash.com/photo-1526045612212-70caf35c14df",
  //   "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  //   "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  //   "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  //   "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
  //   "https://images.unsplash.com/photo-1526045612212-70caf35c14df",
  //   "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  //   "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  //   "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  //   "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
  //   "https://images.unsplash.com/photo-1526045612212-70caf35c14df",
  // ];

  const downloadSingle = async (imageUrl: string, index: number) => {
    setDownloadingIndex(index);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `image-${index + 1}.jpg`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloadingIndex(null);
    }
  };

  const downloadAll = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();

      await Promise.all(
        images.map(async (item, index) => {
          const response = await fetch(item.image_url);
          // const response = await fetch(item);

          const blob = await response.blob();
          zip.file(`image-${index + 1}.jpg`, blob);
        })
      );

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "images.zip";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] p-6 space-y-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2">Your Photos</h2>
          <p className="text-muted-foreground">
            All your captured photos from the Amway Leadership Summit
          </p>
        </div>
        <Button
          onClick={downloadAll}
          disabled={downloading}
          className="w-full sm:w-auto bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download All
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((item, i) => (
          <div
            key={i}
            className="relative w-full h-40 rounded-xl overflow-hidden border border-primary/20 shadow-md hover:shadow-xl hover:border-primary/40 transition-all group"
          >
            <Image
              src={item.image_url}
              // src={item}
              alt="img"
              fill
              className="object-cover group-hover:scale-110 transition-all duration-300"
            />

            <Button
              onClick={() => downloadSingle(item.image_url, i)}
              disabled={downloadingIndex === i}
              size="icon"
              className="absolute bottom-2 right-2 bg-primary/60 hover:bg-primary text-white rounded-full shadow-lg transition-all"
            >
              {downloadingIndex === i ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </main>
  );
}
