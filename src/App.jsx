import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AudienceOnboarding from './components/AudienceOnboarding';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white font-inter">
      <Navbar />
      <main>
        <Hero />
        <AudienceOnboarding />
      </main>
      <Footer />
    </div>
  );
}

export default App;
