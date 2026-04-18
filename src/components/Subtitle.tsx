import { loadDefaultJapaneseParser } from "budoux";
import React from "react";

interface Props {
  text: string;
  fontFamily: string;
  strokeColor?: string;
}

const DEFAULT_STROKE_COLOR = "#4a8a2a";
const STROKE_WIDTH = 14;
const CHAR_WIDTH_SCALE = 1.15;
const BASE_FONT_SIZE = 64;
const MIN_FONT_SIZE = 36;
const CONTAINER_WIDTH = 1840; // 1920 - 40*2
const MAX_WIDTH_RATIO = 0.85;
const MAX_TEXT_WIDTH = CONTAINER_WIDTH * MAX_WIDTH_RATIO;
const MAX_SUBTITLE_HEIGHT = 200;
const LINE_HEIGHT = 1.5;
const FONT_SIZE_STEP = 2;

const parser = loadDefaultJapaneseParser();

function effectiveCharWidth(fontSize: number): number {
  return fontSize * CHAR_WIDTH_SCALE + STROKE_WIDTH;
}

function trimOrphanPunctuation(
  segments: string[],
  fontSize: number
): string[] {
  if (segments.length === 0) return segments;
  const totalChars = segments.reduce((sum, s) => sum + s.length, 0);
  if (totalChars <= MAX_TEXT_WIDTH / effectiveCharWidth(fontSize))
    return segments;
  const last = segments[segments.length - 1];
  const trimmed = last.replace(/[。！？]+$/, "");
  if (trimmed === last) return segments;
  if (trimmed === "") return segments.slice(0, -1);
  return [...segments.slice(0, -1), trimmed];
}

function calcSubtitleFontSize(segments: string[]): number {
  for (
    let fontSize = BASE_FONT_SIZE;
    fontSize >= MIN_FONT_SIZE;
    fontSize -= FONT_SIZE_STEP
  ) {
    const charsPerLine = MAX_TEXT_WIDTH / effectiveCharWidth(fontSize);
    let lineCount = 1;
    let currentLineChars = 0;

    for (const seg of segments) {
      const segLen = seg.length;
      if (currentLineChars + segLen <= charsPerLine) {
        currentLineChars += segLen;
      } else {
        lineCount++;
        currentLineChars = segLen;
      }
    }

    if (lineCount * fontSize * LINE_HEIGHT <= MAX_SUBTITLE_HEIGHT) {
      return fontSize;
    }
  }
  return MIN_FONT_SIZE;
}

const SegmentedText: React.FC<{ segments: string[] }> = ({ segments }) => {
  return (
    <span style={{ wordBreak: "keep-all" }}>
      {segments.map((seg, i) => (
        <span key={i}>{seg}</span>
      ))}
    </span>
  );
};

export const Subtitle: React.FC<Props> = ({
  text,
  fontFamily,
  strokeColor = DEFAULT_STROKE_COLOR,
}) => {
  const { segments, fontSize } = React.useMemo(() => {
    const raw = parser.parse(text);
    const fs = calcSubtitleFontSize(raw);
    return { segments: trimOrphanPunctuation(raw, fs), fontSize: fs };
  }, [text]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: 40,
        right: 40,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize,
          fontWeight: 700,
          lineHeight: LINE_HEIGHT,
          maxWidth: `${MAX_WIDTH_RATIO * 100}%`,
          textAlign: "center",
          fontFamily: `'${fontFamily}', sans-serif`,
          color: "#fff",
          WebkitTextStroke: `${STROKE_WIDTH}px ${strokeColor}`,
          paintOrder: "stroke fill",
          overflowWrap: "break-word",
        }}
      >
        <SegmentedText segments={segments} />
      </div>
    </div>
  );
};
