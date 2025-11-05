import React from 'react';
import Spline from '@splinetool/react-spline';

export default function Hero() {
  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden bg-black text-white">
      {/* 3D Spline Background */}
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/2fSS9b44gtYBt4RI/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Subtle gradient overlay - does not block interaction */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-16 flex flex-col md:flex-row items-center gap-10">
        <div className="md:w-1/2 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80">
            Healthcare • AI • Research
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Connect patients and researchers with intelligence
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-xl">
            CuraLink helps patients discover clinical trials, experts, and publications while enabling researchers to find collaborators and participants — all in one place.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="#onboarding" className="inline-flex items-center justify-center rounded-md bg-white text-black px-5 py-3 text-sm font-medium hover:bg-white/90 transition">
              Start your journey
            </a>
            <a href="#features" className="inline-flex items-center justify-center rounded-md border border-white/20 px-5 py-3 text-sm font-medium text-white hover:bg-white/10 transition">
              Explore features
            </a>
          </div>
        </div>
        <div className="md:w-1/2" />
      </div>
    </section>
  );
}
