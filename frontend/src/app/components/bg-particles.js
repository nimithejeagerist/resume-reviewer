"use client";
import { useCallback } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

export default function BgParticles() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: {
          color: "#000",
        },
        particles: {
          color: {
            value: "#ffffff",
          },
          move: {
            enable: true,
            direction: "none",
            random: true,
            speed: 1.5,
            straight: false,
            outModes: "out",
          },
          number: {
            value: 300,
          },
          opacity: {
            value: 0.8,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0,
              sync: false,
            },
          },
          size: {
            value: 1,
            random: true,
          },
        },
      }}
    />
  );
}
