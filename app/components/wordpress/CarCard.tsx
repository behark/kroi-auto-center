/**
 * WordPress-Style Car Card Component
 * Exactly matches the original kroiautocenter.fi design
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { KroiLogo } from '../ui/KroiLogo';

interface CarCardProps {
  id: string;
  slug: string;
  name: string;
  price: string;
  year: string;
  km: string;
  fuel: string;
  transmission: string;
  image: string;
  images?: Array<{ url: string; altText: string }>;
}

export function CarCard({
  id,
  slug,
  name,
  price,
  year,
  km,
  fuel,
  transmission,
  image,
  images,
}: CarCardProps) {
  // Use first image if available, otherwise use the primary image or placeholder
  const displayImage = images && images.length > 0 ? images[0].url : image;
  const imageAlt = images && images.length > 0 ? images[0].altText : name;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-card hover:shadow-platform transition-shadow duration-300">
      {/* Car Image with Circular Platform Effect */}
      <div className="relative bg-gradient-to-br from-gray-200 to-gray-300 aspect-[4/3] overflow-hidden">
        {/* KROI Logo Watermark */}
        <div className="absolute top-4 left-4 z-10">
          <KroiLogo variant="watermark" />
        </div>

        {/* Circular Platform Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[85%] h-[85%] rounded-full"
            style={{
              background: 'radial-gradient(circle, #E5E7EB 0%, #D1D5DB 70%, #9CA3AF 100%)',
              boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.2), inset 0 -5px 15px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>

        {/* Car Image */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
          <Image
            src={displayImage}
            alt={imageAlt}
            fill
            className="object-contain drop-shadow-2xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Car Name - UPPERCASE like WordPress */}
        <h3 className="text-xl font-bold text-black uppercase mb-4 tracking-wide">
          {name}
        </h3>

        {/* Price - Large Pink Text */}
        <div className="text-4xl font-bold text-kroi-pink mb-4">
          {price}
        </div>

        {/* Specifications - Gray Text */}
        <div className="text-gray-600 text-base mb-6 space-y-1">
          <div>{km} / {fuel} / {transmission}</div>
        </div>

        {/* View More Button - Blue Outline */}
        <Link href={`/cars/${slug}`}>
          <button className="w-full py-3 px-6 border-2 border-kroi-blue text-kroi-blue font-medium rounded-lg hover:bg-kroi-blue hover:text-white transition-all duration-300 uppercase tracking-wide">
            NÄYTÄ LISÄÄ
          </button>
        </Link>
      </div>
    </div>
  );
}

export default CarCard;
