import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-black text-white/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-sky-400 to-blue-600" />
          <span className="text-white font-medium">CuraLink</span>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} CuraLink. All rights reserved.</p>
        <div className="flex items-center gap-4 text-sm">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Contact</a>
        </div>
      </div>
    </footer>
  );
}
