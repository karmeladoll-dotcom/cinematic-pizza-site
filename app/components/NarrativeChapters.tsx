import CinematicVideoChapter from "./CinematicVideoChapter";
import { VIDEOS } from "../lib/videos";

const FIRE_SLIDES = [{ src: VIDEOS.oven }];

const SOURCE_SLIDES = [
  { src: VIDEOS.tomato, label: "I — San Marzano · Campania" },
  { src: VIDEOS.mozzarela, label: "II — Fior di Latte · Agerola" },
  { src: VIDEOS.basil, label: "III — Genovese Basil" },
];

const RESULT_SLIDES = [
  { src: VIDEOS.cut },
  { src: VIDEOS.slice },
  { src: VIDEOS.sliceWholePizza },
];

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
      pinScrollPerSlide={620}
      mobilePinScrollPerSlide={380}
      titleHold={0.38}
      slideHold={0.24}
      slideFade={0.2}
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
      pinScrollPerSlide={380}
      mobilePinScrollPerSlide={260}
      titleHold={0.2}
      slideHold={0.12}
      slideFade={0.16}
    />
  );
}
