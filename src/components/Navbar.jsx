import React from 'react';

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-sky-400 to-blue-600" />
          <span className="text-white text-lg font-semibold tracking-tight">CuraLink</span>
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <a href="#patients" className="hover:text-white">Patients</a>
          <a href="#researchers" className="hover:text-white">Researchers</a>
          <a href="#features" className="hover:text-white">Features</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-white/90 hover:text-white">Sign in</button>
          <a href="#onboarding" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-white text-black hover:bg-white/90 transition">
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}
