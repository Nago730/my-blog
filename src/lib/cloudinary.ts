import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Cloudinary URL에서 public ID를 추출합니다.
 * 예: https://res.cloudinary.com/demo/image/upload/v12345678/sample.jpg -> sample
 */
export function getPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes("cloudinary.com")) return null;

  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    // 확장자 제거
    const publicId = filename.split(".")[0];

    // 만약 폴더가 포함된 경우 (예: /upload/v123/folder/name.jpg)
    // 업로드 시 프리셋 설정에 따라 구조가 다를 수 있으나, 
    // 기본적으로는 마지막 슬래시 이후가 파일명입니다.
    // 더 정확한 추출이 필요하면 정규식을 사용할 수 있습니다.

    // 버전 번호(v123456) 바로 다음부터 확장자 전까지를 찾는 방식
    const versionMatch = url.match(/\/v\d+\/(.+)\.[a-z]+$/);
    if (versionMatch && versionMatch[1]) {
      return versionMatch[1];
    }

    return publicId;
  } catch (error) {
    console.error("Error extracting publicId from URL:", error);
    return null;
  }
}

/**
 * Cloudinary에서 이미지를 삭제합니다.
 */
export async function deleteImage(url: string) {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;

  return deleteImageById(publicId);
}

/**
 * publicId를 사용하여 Cloudinary에서 이미지를 삭제합니다.
 */
export async function deleteImageById(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary image deleted: ${publicId}`, result);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    // 삭제 실패가 전체 프로세스를 중단시키지 않도록 에러만 출력
  }
}
