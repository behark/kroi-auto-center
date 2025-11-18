/**
 * WordPress-Style About Section
 * Purple gradient overlay with Finnish text
 */

'use client';

import React from 'react';
import Image from 'next/image';

export function AboutSection() {
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/about-background.jpg"
          alt="Kroi Auto Center Background"
          fill
          className="object-cover"
        />
      </div>

      {/* Purple Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.90) 0%, rgba(124, 58, 237, 0.85) 100%)',
        }}
      />

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 py-16 md:py-24">
        <div className="max-w-3xl">
          {/* Section Title */}
          <h2 className="text-white text-lg md:text-xl font-semibold mb-4 uppercase tracking-wider">
            MEISTÄ
          </h2>

          {/* Company Name */}
          <h3 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            Kroi Auto Center Oy
          </h3>

          {/* Description - Finnish Text */}
          <div className="text-white text-lg md:text-xl leading-relaxed space-y-4 italic">
            <p>
              Uuden auton ostaminen on iso päätös. Siksi on tärkeää valita luotettava jälleenmyyjä joka takaa myymänsä tuotteen laadun - juuri sellainen olemme me, kasvava perheyritys Kroi Auto Center. Pienen henkilöstömme ansiosta voimme tarjota joustavaa ja henkilökohtaista palvelua. Meillä on yli 15 vuoden kokemus autojen ostosta ja myynnistä. Palvelemme sinua suomeksi, ruotsiksi ja englanniksi.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator (Optional) */}
      <div className="absolute bottom-8 right-8 z-20">
        <div className="bg-kroi-pink w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </div>
    </section>
  );
}

// Commitment Footer Banner
export function CommitmentBanner() {
  return (
    <div className="bg-white py-8">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h4 className="text-2xl md:text-3xl font-bold text-gray-800 uppercase tracking-wide border-b-4 border-gray-800 inline-block pb-2">
          100% SITOUTUNUT
        </h4>
      </div>
    </div>
  );
}

export default AboutSection;
