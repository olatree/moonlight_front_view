import React, { useState, useEffect } from "react";

const heroImages = [
  "/img1.jpg",
  "/img2.jpg",
  "/img3.jpg",
  "/img4.jpg",
  "/img5.jpg",
];

const HeroSlider = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="relative h-[80vh] overflow-hidden">
      {/* SLIDES WITH DARK OVERLAY */}
      {heroImages.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out 
            ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={img}
            alt={`Hero slide ${i + 1}`}
            className="w-full h-full object-cover"
          />
          {/* Beautiful subtle dark overlay - adjust opacity as needed */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ))}

      {/* Optional: Keep your blue tint (looks premium) */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

      {/* TEXT CONTENT */}
      <div className="absolute inset-0 flex items-center justify-center text-center text-white z-10">
        <div className="px-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Welcome to Moonlight College
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto opacity-95">
            Building the future of Nigeria through quality education and character development.
          </p>

          <a
            href="#about"
            className="mt-8 inline-block px-8 py-4 bg-green-600 rounded-xl text-white font-semibold hover:bg-green-700 transition shadow-lg"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* DOT INDICATORS */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 
              ${index === i ? "bg-white w-8" : "bg-white/60 hover:bg-white/80"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;