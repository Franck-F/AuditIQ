'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

export function ParallaxComponent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');

    if (triggerElement) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0
        }
      });

      const layers = [
        { layer: "1", yPercent: 70 },
        { layer: "2", yPercent: 55 },
        { layer: "3", yPercent: 40 },
        { layer: "4", yPercent: 10 }
      ];

      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: "none"
          },
          idx === 0 ? undefined : "<"
        );
      });
    }

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Clean up GSAP and ScrollTrigger instances
      ScrollTrigger.getAll().forEach(st => st.kill());
      gsap.killTweensOf(triggerElement);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="parallax" ref={parallaxRef}>
      <section className="parallax__header relative h-[600px] w-full overflow-hidden rounded-xl border border-border shadow-2xl">
        <div className="parallax__visuals absolute inset-0">
          <div data-parallax-layers className="parallax__layers relative h-full w-full">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hero-BEOjmENrQnvTAFgPAHeIe3SZA7SzBA.png" 
              loading="eager" 
              width="800" 
              data-parallax-layer="1" 
              alt="Dashboard Layer 1" 
              className="parallax__layer-img absolute left-0 top-0 h-full w-full object-cover opacity-50" 
            />
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hero-BEOjmENrQnvTAFgPAHeIe3SZA7SzBA.png" 
              loading="eager" 
              width="800" 
              data-parallax-layer="2" 
              alt="Dashboard Layer 2" 
              className="parallax__layer-img absolute left-[10%] top-[10%] h-[80%] w-[80%] rounded-lg border border-primary/20 object-cover shadow-xl" 
            />
            <div data-parallax-layer="3" className="parallax__layer-title absolute inset-0 flex items-center justify-center">
              {/* Optional overlay content */}
            </div>
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hero-BEOjmENrQnvTAFgPAHeIe3SZA7SzBA.png" 
              loading="eager" 
              width="800" 
              data-parallax-layer="4" 
              alt="Dashboard Layer 3" 
              className="parallax__layer-img absolute -bottom-10 -right-10 h-[40%] w-[40%] rounded-lg border border-primary/20 object-cover shadow-2xl" 
            />
          </div>
        </div>
      </section>
    </div>
  );
}