"use client";

import { useState, useEffect, useCallback } from "react";
import CloudinaryImage from "./CloudinaryImage";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageItem {
  url: string;
  alt?: string;
  publicId?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (images.length === 0) return null;

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  // Sync keyboard events
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    // Block scroll
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isLightboxOpen, handlePrev, handleNext, closeLightbox]);

  return (
    <div className="space-y-8">
      {/* Main Image Container */}
      <div
        onClick={() => setIsLightboxOpen(true)}
        className="w-full bg-slate-100 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-100/20 border border-slate-100 relative group aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] cursor-zoom-in"
      >
        {/* Blurred backdrop for premium feel when image doesn't fill the container */}
        <div
          className="absolute inset-0 opacity-30 blur-2xl scale-110 pointer-events-none"
          style={{
            backgroundImage: `url(${images[activeIndex].url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <div className="relative w-full h-full flex items-center justify-center z-0">
          <CloudinaryImage
            src={images[activeIndex].url}
            alt={images[activeIndex].alt || title}
            width={1600}
            height={1200}
            priority
            className="max-w-full max-h-full w-auto h-auto object-contain transition-all duration-500 ease-out"
          />
        </div>

        {/* Navigation Buttons (shown on hover) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-indigo-600 rounded-full shadow-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
              title="이전 이미지"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-indigo-600 rounded-full shadow-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
              title="다음 이미지"
            >
              <ChevronRight size={24} />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? "w-8 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox / Full-screen View */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 md:top-10 md:right-10 text-white/50 hover:text-white p-3 z-50 transition-all rounded-full hover:bg-white/10"
            onClick={closeLightbox}
          >
            <X size={32} />
          </button>

          {/* Full Screen Image */}
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12 lg:p-20">
            <img
              src={images[activeIndex].url}
              alt={images[activeIndex].alt || title}
              className="max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Lightbox Navigation - Enhanced visibility */}
          {images.length > 1 && (
            <>
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 md:px-10 flex justify-between pointer-events-none">
                <button
                  onClick={handlePrev}
                  className="pointer-events-auto w-14 h-14 md:w-20 md:h-20 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-all flex items-center justify-center group"
                >
                  <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleNext}
                  className="pointer-events-auto w-14 h-14 md:w-20 md:h-20 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-all flex items-center justify-center group"
                >
                  <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </>
          )}

          {/* Lightbox Counter */}
          <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
            <span className="px-4 py-2 bg-white/5 rounded-full text-white/60 text-xs md:text-sm font-medium backdrop-blur-sm border border-white/10">
              {activeIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      )}

      {/* Thumbnails Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 group/thumb ${activeIndex === index
                ? "ring-2 ring-indigo-500 ring-offset-2 scale-95"
                : "opacity-60 hover:opacity-100 hover:scale-105"
                }`}
            >
              <CloudinaryImage
                src={img.url}
                alt={`${title} thumbnail ${index}`}
                width={300}
                height={300}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-indigo-600/10 transition-opacity ${activeIndex === index ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
