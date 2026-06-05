import CinematicVideoChapter from "./CinematicVideoChapter";
import { VIDEOS } from "../lib/videos";

/**
 * TEMPORARY NARRATIVE RESET — chapter-by-chapter rebuild baseline.
 * Active video: oven.mp4 only (Chapter I).
 * Chapters II & III retain structure, no videos yet.
 */

const FIRE_SLIDES = [{ src: VIDEOS.oven }];

const SOURCE_SLIDES: { src: string; label?: string }[] = [];

const RESULT_SLIDES: { src: string }[] = [];

export default function FireChapterSection() {
  return (
    <CinematicVideoChapter
      id="story"
      dataSection="story"
      title="Born From Fire"
      chapterLabel="CHAPTER I — Born From Fire"
      slides={FIRE_SLIDES}
      pinScrollPerSlide={420}
      mobilePinScrollPerSlide={280}
      titleHold={0.22}
    />
  );
}

export function SourceChapterSection() {
  return (
    <CinematicVideoChapter
      id="menu"
      dataSection="ingredients"
      title="The Source"
      chapterLabel="CHAPTER II — The Source"
      slides={SOURCE_SLIDES}
      pinScrollPerSlide={420}
      mobilePinScrollPerSlide={280}
      titleHold={0.22}
    />
  );
}

export function ResultChapterSection() {
  return (
    <CinematicVideoChapter
      id="result"
      dataSection="result"
      title="The Result"
      chapterLabel="CHAPTER III — The Result"
      slides={RESULT_SLIDES}
      pinScrollPerSlide={420}
      mobilePinScrollPerSlide={280}
      titleHold={0.22}
    />
  );
}
