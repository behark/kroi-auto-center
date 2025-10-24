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
export async function generateMetadata({
  params,
}: {
  params: { id: string }; // FIX: This is a simple object, not a Promise
}): Promise<Metadata> {
  const { id } = params; // FIX: No await needed here
  const car = await getCarById(id); // FIX: Added 'await' for data fetching

  if (!car) {
    return {
      title: 'Auto ei löytynyt - Kroi Auto Center',
    };
  }

  // Generate enhanced metadata
  return {
    title: `${car.name} ${car.year} - ${car.price} | Kroi Auto Center`,
    description: car.description,
    keywords: [
      car.brand,
      car.model,
      car.year,
      car.fuel,
      car.transmission,
      'käytetty auto',
      'auto myynti',
      'Kroi Auto',
    ].join(', '),
    openGraph: {
      title: `${car.name} ${car.year} - ${car.price} | Kroi Auto Center`,
      description: car.description,
      images: [car.image],
    },
  };
}

/**
 * Server Component - Car Detail Page
 * Handles params extraction and passes to client component with structured data
 */
export default async function CarDetailPage({
  params,
}: {
  params: { id: string }; // FIX: This is a simple object, not a Promise
}) {
  const { id } = params; // FIX: No await needed here
  const car = await getCarById(id); // FIX: Added 'await' for data fetching

  // Return 404 if car not found
  if (!car) {
    notFound();
  }

  // Get related cars
  const relatedCars = await getRelatedCars(car.id); // FIX: Added 'await' for data fetching

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
