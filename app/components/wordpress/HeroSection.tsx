/**
 * WordPress-Style Hero Section
 * Black background with Finnish text and KROI branding
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { KroiLogo } from '../ui/KroiLogo';

export function HeroSection() {
  return (
    <section className="relative bg-black min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
      {/* Background Car Image (Right Side) */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-40">
        <Image
          src="/hero-car.jpg"
          alt="Luxury Car"
          fill
          className="object-cover object-left"
          priority
        />
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-2xl">
          {/* KROI Logo */}
          <div className="mb-8 md:mb-12">
            <KroiLogo variant="header" />
          </div>

          {/* Hero Text - Finnish */}
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 md:mb-12">
            Me autamme sinua löytämään juuri sinun tarpeisiisi sopivan auton.
          </h1>

          {/* Call-to-Action Button */}
          <button className="bg-kroi-pink text-white px-12 py-4 rounded-lg text-xl font-bold uppercase hover:bg-kroi-pink-dark transition-colors duration-300 shadow-lg hover:shadow-xl">
            SOITA
          </button>
        </div>
      </div>

      {/* Mobile Menu Icon (Top Right) */}
      <div className="absolute top-6 right-6 md:hidden">
        <button className="text-white">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </section>
  );
}

// Search Section Component (Below Hero)
export function SearchSection() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-700 text-center mb-8">
          Meiltä löydät suuren valikoiman käytettyjä autoja.
        </h2>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Hae..."
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-kroi-blue"
            />
            <button className="bg-gray-800 text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-700 transition-colors">
              Haku
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
