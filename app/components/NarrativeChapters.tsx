import CinematicVideoChapter from "./CinematicVideoChapter";
import SequentialVideoChapter from "./SequentialVideoChapter";
import { VIDEOS } from "../lib/videos";

const FIRE_SLIDES = [
  { src: VIDEOS.oven },
  { src: VIDEOS.flour },
  { src: VIDEOS.dough },
];

const SOURCE_SLIDES = [
  { src: VIDEOS.tomato, label: "San Marzano · Campania" },
  { src: VIDEOS.mozzarela, label: "Fior di Latte · Agerola" },
  { src: VIDEOS.basil, label: "Genovese · Highlands" },
];

const CRAFT_SLIDES = [
  { src: VIDEOS.doughWork },
  { src: VIDEOS.sause },
  { src: VIDEOS.oliveOil },
  { src: VIDEOS.preparation },
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
      title="Born from fire"
      chapterLabel="Chapter I — Fire"
      slides={FIRE_SLIDES}
      pinScrollPerSlide={1000}
    />
  );
}

export function SourceChapterSection() {
  return (
    <CinematicVideoChapter
      id="menu"
      dataSection="ingredients"
      title="The Source"
      chapterLabel="Chapter II — The Source"
      slides={SOURCE_SLIDES}
      pinScrollPerSlide={1100}
    />
  );
}

export function CraftChapterSection() {
  return (
    <SequentialVideoChapter
      id="craft"
      dataSection="craft"
      title="The Craft"
      chapterLabel="Chapter III — The Craft"
      slides={CRAFT_SLIDES}
    />
  );
}

export function ResultChapterSection() {
  return (
    <SequentialVideoChapter
      id="result"
      dataSection="result"
      title="The Result"
      chapterLabel="Chapter IV — The Result"
      slides={RESULT_SLIDES}
    />
  );
}
