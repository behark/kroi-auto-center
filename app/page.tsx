/**
 * WordPress-Style Homepage
 * Completely recreated to match kroiautocenter.fi
 */

import { Metadata } from 'next';
import { cars } from '@/app/data/cars';
import { HeroSection, SearchSection } from './components/wordpress/HeroSection';
import { CarCard } from './components/wordpress/CarCard';
import { AboutSection, CommitmentBanner } from './components/wordpress/AboutSection';
import { FloatingButtons } from './components/wordpress/FloatingButtons';

export const metadata: Metadata = {
  title: 'Kroi Auto Center - Laadukkaita käytettyjä autoja Helsingissä',
  description: 'Kroi Auto Center on luotettava autoliike Helsingissä. Meiltä löydät laadukkaita käytettyjä autoja, rahoitusratkaisuja ja ammattitaitoista palvelua. Yli 15 vuoden kokemus.',
};

export default function WordPressHomepage() {
  // Get latest cars sorted by year
  const displayCars = cars
    .sort((a, b) => parseInt(b.year) - parseInt(a.year))
    .slice(0, 12); // Show 12 cars

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section - Black background with Finnish text */}
      <HeroSection />

      {/* Search Section */}
      <SearchSection />

      {/* Car Listings Section */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Section Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-kroi-pink mb-12 text-center">
            Myynnissä olevat autot
          </h2>

          {/* Car Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {displayCars.map((car) => (
              <CarCard
                key={car.id}
                id={car.id}
                slug={car.slug}
                name={car.name}
                price={car.price}
                year={car.year}
                km={car.km}
                fuel={car.fuel}
                transmission={car.transmission}
                image={car.image}
                images={car.images}
              />
            ))}
          </div>

          {/* View All Cars Button */}
          <div className="text-center mt-12">
            <a
              href="/cars"
              className="inline-block bg-kroi-pink text-white px-10 py-4 rounded-lg text-lg font-bold uppercase hover:bg-kroi-pink-dark transition-colors shadow-lg"
            >
              Katso kaikki autot
            </a>
          </div>
        </div>
      </section>

      {/* About Section - Purple gradient */}
      <AboutSection />

      {/* Commitment Banner */}
      <CommitmentBanner />

      {/* Floating Buttons (WhatsApp & Scroll-to-Top) */}
      <FloatingButtons />
    </main>
  );
}
