/**
 * KROI Auto Center Logo Component
 * Matches WordPress design exactly
 */

import React from 'react';
import { Car } from 'lucide-react';

interface KroiLogoProps {
  variant?: 'default' | 'watermark' | 'header';
  className?: string;
}

export function KroiLogo({ variant = 'default', className = '' }: KroiLogoProps) {
  if (variant === 'watermark') {
    return (
      <div className={`inline-flex items-center gap-2 bg-kroi-pink px-4 py-2 rounded-lg ${className}`}>
        <Car className="w-8 h-8 text-white" strokeWidth={2} />
        <div className="text-white">
          <div className="text-2xl font-bold leading-none">KROI</div>
          <div className="text-xs leading-none">Auto Center -</div>
        </div>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className={`inline-flex items-center gap-3 bg-kroi-pink px-6 py-3 rounded-xl ${className}`}>
        <Car className="w-10 h-10 text-white" strokeWidth={2} />
        <div className="text-white">
          <div className="text-3xl font-bold leading-none">KROI</div>
          <div className="text-sm leading-none">Auto Center -</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 bg-kroi-pink px-5 py-2.5 rounded-xl ${className}`}>
      <Car className="w-9 h-9 text-white" strokeWidth={2} />
      <div className="text-white">
        <div className="text-2xl font-bold leading-none">KROI</div>
        <div className="text-xs leading-none">Auto Center -</div>
      </div>
    </div>
  );
}

export default KroiLogo;
