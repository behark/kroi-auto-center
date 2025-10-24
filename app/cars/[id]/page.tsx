import { CarDetailContent } from './CarDetailContent';
import { getCarById, getRelatedCars } from '@/app/data/cars';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Force dynamic rendering to avoid database issues during build
// This tells Next.js to render this page on every request (dynamic)
export const dynamic = 'force-dynamic';

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const car = await getCarById(id);

  if (!car) {
    return {
      title: 'Auto ei löytynyt - Kroi Auto Center',
    };
  }

  // Generate enhanced metadata
  return {
    title: `${car.name} ${car.year} - ${car.priceEur} | Kroi Auto Center`,
    description: car.description,
    keywords: [
      car.brand,
      car.model,
      String(car.year),
      car.fuel,
      car.transmission,
      'käytetty auto',
      'auto myynti',
      'Kroi Auto',
    ].join(', '),
    openGraph: {
      title: `${car.name} ${car.year} - ${car.priceEur} | Kroi Auto Center`,
      description: car.description,
      images: [car.images[0]?.url || ''],
    },
  };
}

/**
 * Server Component - Car Detail Page
 * Handles params extraction and passes to client component with structured data
 */
export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCarById(id);

  // Return 404 if car not found
  if (!car) {
    notFound();
  }

  // Get related cars
  const relatedCars = await getRelatedCars(car.id);

  // Transform car data to match CarData interface
  const transformedCar = {
    ...car,
    features: car.features?.map((f) => ({ feature: f })),
  };

  const transformedRelatedCars = relatedCars.map((c) => ({
    ...c,
    features: c.features?.map((f) => ({ feature: f })),
  }));

  return (
    <CarDetailContent car={transformedCar} relatedCars={transformedRelatedCars} />
  );
}