"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Loader2, X, ChevronDown } from "lucide-react";
import JSZip from "jszip";

type imgItem = {
  image_url: string;
};

type Props = {
  images: imgItem[];
};

const IMAGES_PER_PAGE = 8;

export default function ImageDisplay({ images }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(IMAGES_PER_PAGE);

  const displayedImages = images.slice(0, displayCount);
  const hasMore = displayCount < images.length;
  const remainingCount = images.length - displayCount;

  const loadMore = () => {
    setDisplayCount((prev) => Math.min(prev + IMAGES_PER_PAGE, images.length));
  };

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
            All your captured photos from the Amway Leadership Summit ({images.length} {images.length === 1 ? 'photo' : 'photos'})
          </p>
        </div>
        <Button
          onClick={downloadAll}
          disabled={downloading}
          className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
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
        {displayedImages.map((item, i) => (
          <div
            key={i}
            className="relative w-full h-40 rounded-xl overflow-hidden border border-primary/20 shadow-md hover:shadow-xl hover:border-primary/40 transition-all group cursor-pointer"
            onClick={() => setExpandedIndex(i)}
          >
            <Image
              src={item.image_url}
              alt="img"
              fill
              className="object-cover group-hover:scale-110 transition-all duration-300"
            />

            <Button
              onClick={(e) => {
                e.stopPropagation();
                downloadSingle(item.image_url, i);
              }}
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

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={loadMore}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white gap-2 px-8 h-12 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ChevronDown className="w-5 h-5" />
            Load More ({remainingCount} remaining)
          </Button>
        </div>
      )}

      {/* Expanded Image Modal */}
      {expandedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedIndex(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={displayedImages[expandedIndex].image_url}
              alt="Expanded"
              fill
              className="object-contain"
            />

            {/* Close Button */}
            <Button
              onClick={() => setExpandedIndex(null)}
              size="icon"
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full shadow-lg transition-all backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Download Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                downloadSingle(displayedImages[expandedIndex].image_url, expandedIndex);
              }}
              disabled={downloadingIndex === expandedIndex}
              className="absolute bottom-4 right-4 bg-primary/80 hover:bg-primary text-white shadow-lg transition-all backdrop-blur-sm"
            >
              {downloadingIndex === expandedIndex ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}