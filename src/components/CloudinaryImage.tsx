"use client";

import { CldImage } from "next-cloudinary";

interface CloudinaryImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function CloudinaryImage({
  src,
  alt,
  className,
  width = 1200,
  height = 630,
  priority = false,
}: CloudinaryImageProps) {
  // Validate src is a valid string
  if (!src || typeof src !== 'string') {
    return (
      <div className={className} style={{ width, height, background: '#f1f5f9' }}>
        <div className="w-full h-full flex items-center justify-center text-slate-400">
          No image
        </div>
      </div>
    );
  }

  // Cloudinary URL 인지 확인 (이미 full URL인 경우 public ID 추출 시도)
  const isCloudinary = src.includes("cloudinary.com");

  if (!isCloudinary) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  // URL에서 public ID 추출 시도 (복잡한 경우를 대비해 최대한 src를 그대로 활용하거나 publicId만 추출)
  // next-cloudinary의 CldImage는 src에 full URL이 들어가도 동작하지만, 
  // 보통은 publicId를 권장함. 여기서는 src를 그대로 넘겨도 내부적으로 처리됨.

  return (
    <CldImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      crop="fill"
      gravity="auto"
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+Z9PQAI8AKp767S2wAAAABJRU5ErkJggg=="
      priority={priority}
    />
  );
}
