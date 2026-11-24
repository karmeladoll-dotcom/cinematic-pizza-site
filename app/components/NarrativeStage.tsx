import CinematicStage, { type StageChapter } from "./CinematicStage";
import { VIDEOS } from "../lib/videos";

/** Same content and order as the previous three separate chapters. */
const CHAPTERS: StageChapter[] = [
  {
    id: "story",
    kicker: "CHAPTER I — Born From Fire",
    title: "Born From Fire",
    slides: [{ src: VIDEOS.oven }],
  },
  {
    id: "menu",
    kicker: "CHAPTER II — The Source",
    title: "The Source",
    slides: [
      { src: VIDEOS.sourceMozzarella, label: "Mozzarella di Bufala" },
      { src: VIDEOS.sourceBasil, label: "Basilico Genovese" },
      { src: VIDEOS.sourceTomato, label: "Pomodoro San Marzano" },
    ],
  },
  {
    id: "result",
    kicker: "CHAPTER III — The Result",
    title: "The Result",
    slides: [
      { src: "/videos/result-focaccia.mp4", label: "L'Impasto" },
      { src: "/videos/result-pizza-pull.mp4", label: "La Tavola" },
    ],
  },
];

export default function NarrativeStage() {
  return <CinematicStage chapters={CHAPTERS} />;
}
