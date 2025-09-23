"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WordCloudProps {
  keywords: Array<{ word: string; count: number }>;
  width?: number;
  height?: number;
}

interface WordPosition {
  word: string;
  count: number;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export function WordCloud({
  keywords,
  width = 600,
  height = 400,
}: WordCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wordPositions, setWordPositions] = useState<WordPosition[]>([]);

  const colors = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
    "#ec4899", // pink
    "#6b7280", // gray
  ];

  useEffect(() => {
    if (!keywords.length) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const maxCount = Math.max(...keywords.map((k) => k.count));
    const minCount = Math.min(...keywords.map((k) => k.count));
    const maxFontSize = 48;
    const minFontSize = 14;

    const positions: WordPosition[] = [];
    const attempts = 50;

    keywords.forEach((keyword, index) => {
      const fontSize =
        minFontSize +
        ((keyword.count - minCount) / (maxCount - minCount)) *
          (maxFontSize - minFontSize);
      const color = colors[index % colors.length];

      let placed = false;
      let attempt = 0;

      while (!placed && attempt < attempts) {
        const x =
          Math.random() * (width - fontSize * keyword.word.length * 0.6);
        const y = fontSize + Math.random() * (height - fontSize * 2);

        const hasCollision = positions.some((pos) => {
          const distance = Math.sqrt(
            Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)
          );
          const minDistance = (fontSize + pos.fontSize) * 0.8;
          return distance < minDistance;
        });

        if (!hasCollision || attempt === attempts - 1) {
          positions.push({
            word: keyword.word,
            count: keyword.count,
            x,
            y,
            fontSize,
            color,
          });
          placed = true;
        }

        attempt++;
      }
    });

    setWordPositions(positions);

    // Draw words on canvas
    positions.forEach((pos) => {
      ctx.font = `bold ${pos.fontSize}px Inter, sans-serif`;
      ctx.fillStyle = pos.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      // Add subtle shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(pos.word, pos.x, pos.y);

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    });
  }, [keywords, width, height]);

  if (!keywords.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Word Cloud</CardTitle>
          <CardDescription>Most frequently mentioned keywords</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 opacity-50 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <p>Word cloud will appear after analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Word Cloud</CardTitle>
        <CardDescription>
          Most frequently mentioned keywords ({keywords.length} unique words)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-auto border rounded-lg bg-gradient-to-br from-slate-50 to-slate-100"
            style={{ maxWidth: "100%", height: "auto" }}
          />

          {/* Word frequency legend */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {keywords.slice(0, 12).map((keyword, index) => (
              <div
                key={keyword.word}
                className="flex items-center gap-2 text-sm"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="font-medium">{keyword.word}</span>
                <span className="text-muted-foreground">({keyword.count})</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
