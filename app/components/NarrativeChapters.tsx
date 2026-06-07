import CinematicVideoChapter from "./CinematicVideoChapter";
import { VIDEOS } from "../lib/videos";

const FIRE_SLIDES = [{ src: VIDEOS.oven }];

const SOURCE_SLIDES: { src: string; label?: string }[] = [
  { src: VIDEOS.sourceMozzarella, label: "Mozzarella di Bufala" },
  { src: VIDEOS.sourceBasil, label: "Basilico Genovese" },
  { src: VIDEOS.sourceTomato, label: "Pomodoro San Marzano" },
];

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
      blendOutSrc={VIDEOS.sourceMozzarella}
      overlapPrevVh={12}
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
      overlapPrevVh={10}
      slideFade={0.38}
      labelVariant="title"
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
