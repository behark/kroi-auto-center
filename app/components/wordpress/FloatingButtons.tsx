/**
 * WordPress-Style Floating Buttons
 * WhatsApp Chat & Scroll-to-Top
 */

'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronUp } from 'lucide-react';

// WhatsApp Chat Button
export function WhatsAppButton() {
  const [showPopup, setShowPopup] = useState(false);

  const handleWhatsAppClick = () => {
    // Replace with your WhatsApp number
    const phoneNumber = '358123456789'; // Format: country code + number (no + or spaces)
    const message = encodeURIComponent('Miten voin autaa?');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Popup Message */}
      {showPopup && (
        <div className="absolute bottom-full right-0 mb-4 bg-white rounded-lg shadow-xl p-4 min-w-[250px]">
          <div className="text-sm font-semibold text-gray-800 mb-1">
            Miten voin autaa?
          </div>
          <div className="text-xs text-gray-600">
            Keskustele meidän tiimin kanssa
          </div>
          <div className="absolute bottom-0 right-6 transform translate-y-1/2">
            <div className="w-3 h-3 bg-white transform rotate-45"></div>
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setShowPopup(true)}
        onMouseLeave={() => setShowPopup(false)}
        className="bg-whatsapp text-white w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center"
        aria-label="WhatsApp Chat"
      >
        <MessageCircle className="w-8 h-8" fill="white" />
      </button>
    </div>
  );
}

// Scroll-to-Top Button
export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-28 right-6 z-50 bg-kroi-pink text-white w-14 h-14 rounded-full shadow-lg hover:bg-kroi-pink-dark hover:scale-110 transition-all duration-300 flex items-center justify-center"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-7 h-7" strokeWidth={3} />
    </button>
  );
}

// Combined Floating Buttons Component
export function FloatingButtons() {
  return (
    <>
      <WhatsAppButton />
      <ScrollToTopButton />
    </>
  );
}

export default FloatingButtons;
