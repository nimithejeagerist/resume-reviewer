"use client";

import dynamic from "next/dynamic";
import { useCallback } from "react";
import { loadSlim } from "@tsparticles/slim";

const Particles = dynamic(() => import("@tsparticles/react").then(m => m.default), {
  ssr: false,
});

export default function BgParticles() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
      options={{
        fullScreen: { enable: false },
        background: { color: "#000" },
        particles: {
          number: { value: 120 },
          color: { value: "#fff" },
          move: {
            enable: true,
            speed: 1.5,
            outModes: { default: "out" },
          },
          opacity: { value: 0.8, random: true },
          size: { value: 1, random: true },
        },
      }}
    />
  );
}
