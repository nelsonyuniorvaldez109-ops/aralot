import { safeImage } from "./products/images";

export const MAX_CAROUSEL_IMAGES = 10;
export type CarouselImage = { id: string; image_url: string; active: boolean };

export function isCarouselRevision(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

// Match the existing uploader: unique filename at the product-images bucket root.
export function carouselImageUrl(value: unknown): value is string {
  return typeof value === "string" && value.length <= 2048 && Boolean(safeImage(value)) &&
    /^https:\/\/[^/]+\/storage\/v1\/object\/public\/product-images\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(value);
}

export function validateCarousel(value: unknown): CarouselImage[] | null {
  if (!Array.isArray(value) || value.length > MAX_CAROUSEL_IMAGES) return null;
  const ids = new Set<string>(), urls = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== "object" || typeof item.id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id) ||
      !carouselImageUrl(item.image_url) || typeof item.active !== "boolean" ||
      ids.has(item.id.toLowerCase()) || urls.has(item.image_url)) return null;
    ids.add(item.id.toLowerCase()); urls.add(item.image_url);
  }
  return value.map(({ id, image_url, active }) => ({ id, image_url, active }));
}
