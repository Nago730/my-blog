"use client";

import Image from "next/image";

interface CloudinaryImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

// Extract publicId from Cloudinary URL
function extractPublicId(url: string): string {
  try {
    // Example URL: https://res.cloudinary.com/divweajsy/image/upload/v1770899921/my-portfolio/xaxelu3r91asua9zslaq.jpg
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    if (match && match[1]) {
      return match[1];
    }
    return url;
  } catch {
    return url;
  }
}

// Cloudinary loader for Next.js Image
function cloudinaryLoader({ src, quality }: { src: string; width: number; quality?: number }) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "divweajsy";
  const publicId = extractPublicId(src);

  // Build Cloudinary URL with transformations
  // w_${width} 를 제거하여 원본 크기를 유지합니다.
  const params = [
    `q_${quality || 'auto'}`,
    'f_auto', // automatic format selection (WebP, AVIF, etc.)
  ];

  return `https://res.cloudinary.com/${cloudName}/image/upload/${params.join(',')}/${publicId}`;
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

  // Cloudinary URL 인지 확인
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

  // Use Next.js Image with Cloudinary loader for optimization
  return (
    <Image
      loader={cloudinaryLoader}
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized // 원본 크기와 품질을 그대로 유지
      sizes="100vw"
      quality={100}
    />
  );
}
