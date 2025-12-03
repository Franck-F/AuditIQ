"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface ScrollAnimatedTextProps {
  text: string;
  className?: string;
}

const Character = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
}: {
  char: string;
  index: number;
  centerIndex: number;
  scrollYProgress: any;
}) => {
  const isSpace = char === " ";
  const distanceFromCenter = index - centerIndex;

  // Reduced intensity for better readability
  const x = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 10, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 10, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0.5, 1]);

  return (
    <motion.span
      className={cn("inline-block", isSpace && "w-[0.3em]")}
      style={{ x, rotateX, opacity }}
    >
      {char}
    </motion.span>
  );
};

export function ScrollAnimatedText({ text, className }: ScrollAnimatedTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const characters = text.split("");
  const centerIndex = Math.floor(characters.length / 2);

  return (
    <div ref={ref} className={cn("inline-block", className)} style={{ perspective: "500px" }}>
      {characters.map((char, index) => (
        <Character
          key={index}
          char={char}
          index={index}
          centerIndex={centerIndex}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}
