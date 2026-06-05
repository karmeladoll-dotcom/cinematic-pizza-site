import CinematicVideoChapter from "./CinematicVideoChapter";
import SequentialVideoChapter from "./SequentialVideoChapter";
import { VIDEOS } from "../lib/videos";

const FIRE_SLIDES = [{ src: VIDEOS.oven }, { src: VIDEOS.flour }];

const SOURCE_SLIDES = [
  { src: VIDEOS.tomato, label: "San Marzano · Campania" },
  { src: VIDEOS.mozzarela, label: "Fior di Latte · Agerola" },
  { src: VIDEOS.basil, label: "Genovese · Highlands" },
];

const CRAFT_SLIDES = [{ src: VIDEOS.doughWork, weight: 1.2 }];

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
      pinScrollPerSlide={780}
      mobilePinScrollPerSlide={460}
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
      pinScrollPerSlide={820}
      mobilePinScrollPerSlide={480}
    />
  );
}

export function CraftChapterSection() {
  return (
    <SequentialVideoChapter
      id="craft"
      dataSection="craft"
      title="The Craft"
      chapterLabel="CHAPTER III — The Craft"
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
      chapterLabel="CHAPTER IV — The Result"
      slides={RESULT_SLIDES}
    />
  );
}
