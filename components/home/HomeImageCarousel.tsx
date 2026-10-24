import { publicClient } from "@/lib/products/public-client";
import { carouselImageUrl, MAX_CAROUSEL_IMAGES } from "@/lib/home-carousel";
import { HomeImageCarouselTrack } from "./HomeImageCarouselTrack";

export async function HomeImageCarousel() {
  try {
    const { data, error } = await publicClient().from("home_carousel_images")
      .select("id,image_url").eq("active", true).order("sort_order").limit(MAX_CAROUSEL_IMAGES);
    // Optional section: an unapplied migration or temporary outage must not break the home.
    if (error || !data?.length) return null;
    const images = data.filter(image => carouselImageUrl(image.image_url));
    return images.length ? <HomeImageCarouselTrack images={images} /> : null;
  } catch { return null; }
}
