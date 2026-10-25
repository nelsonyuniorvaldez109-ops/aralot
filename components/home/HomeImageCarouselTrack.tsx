/* eslint-disable @next/next/no-img-element -- Natural image widths keep mixed photo ratios uncropped without fixed white frames. URLs are validated by the server component. */
"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./HomeImageCarousel.module.css";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function HomeImageCarouselTrack({ images }: { images: { id: string; image_url: string }[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const resumeAt = useRef(0);
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
  const looping = !reduced && images.length > 1;
  const [repetitions, setRepetitions] = useState(1);
  const sequence = looping ? Array.from({ length: repetitions }, () => images).flat() : images;

  useEffect(() => {
    const element = viewport.current, track = group.current;
    if (!element || !track || !looping) return;
    let width = 0, frame = 0, last = 0, fraction = 0, visible = true;
    const measure = () => {
      const photos = Array.from(track.querySelectorAll("img"));
      if (photos.some(photo => !photo.complete || !photo.naturalWidth)) return;
      const measured = track.getBoundingClientRect().width;
      if (!measured) return;
      const needed = Math.ceil(element.clientWidth / (measured / repetitions)) + 1;
      if (needed !== repetitions) { setRepetitions(needed); return; }
      const offset = width ? ((element.scrollLeft % width) + width) % width : 0;
      const previousWidth = width;
      width = measured;
      element.scrollLeft = width + (previousWidth ? offset * width / previousWidth : 0);
    };
    const resize = new ResizeObserver(measure);
    resize.observe(track);
    resize.observe(element);
    track.addEventListener("load", measure, true);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(element);
    const wrap = () => {
      if (!width) return;
      if (element.scrollLeft < width / 2) element.scrollLeft += width;
      else if (element.scrollLeft >= width * 2) element.scrollLeft -= width;
    };
    element.addEventListener("scroll", wrap, { passive: true });
    const releasePointer = () => { resumeAt.current = performance.now() + 2000; };
    window.addEventListener("pointerup", releasePointer);
    window.addEventListener("pointercancel", releasePointer);
    const tick = (time: number) => {
      const elapsed = Math.min(time - (last || time), 50);
      last = time;
      if (width && visible && !document.hidden && !paused.current && time >= resumeAt.current) {
        fraction += elapsed * 0.028; // 28 px/second, independent of display refresh rate.
        const pixels = Math.floor(fraction);
        fraction -= pixels;
        if (pixels) element.scrollLeft += pixels;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
      element.removeEventListener("scroll", wrap);
      track.removeEventListener("load", measure, true);
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", releasePointer);
    };
  }, [looping, images, repetitions]);

  function advance(direction: number) {
    resumeAt.current = performance.now() + 1600;
    const element = viewport.current;
    if (element) element.scrollBy({ left: direction * element.clientWidth * 0.75, behavior: reduced ? "instant" : "smooth" });
  }

  return <section className={styles.carousel} aria-label="Fotografías de ARA LOT" aria-roledescription="carrusel"
    onMouseEnter={() => { paused.current = true; }} onMouseLeave={event => { paused.current = event.currentTarget.contains(document.activeElement); }}
    onFocus={() => { paused.current = true; }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) paused.current = event.currentTarget.matches(":hover"); }}>
    <div ref={viewport} className={styles.viewport} tabIndex={0} aria-label="Fotografías; usa las flechas para desplazarte"
      onPointerDown={() => { resumeAt.current = Infinity; }}
      onPointerUp={() => { resumeAt.current = performance.now() + 2000; }}
      onPointerCancel={() => { resumeAt.current = performance.now() + 2000; }}
      onKeyDown={event => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); advance(event.key === "ArrowRight" ? 1 : -1); }
      }}>
      <div className={styles.track}>
        {(looping ? [0, 1, 2] : [0]).map(copy => <div className={styles.group} ref={copy === 0 ? group : undefined} key={copy} aria-hidden={copy > 0 || undefined}>
          {sequence.map((image, index) => <div className={styles.frame} key={`${image.id}-${index}`}>
            <img src={image.image_url} alt={copy === 0 && index < images.length ? `Fotografía de ARA LOT ${index + 1}` : ""}
              decoding="async" draggable={false} />
          </div>)}
        </div>)}
      </div>
    </div>
  </section>;
}
