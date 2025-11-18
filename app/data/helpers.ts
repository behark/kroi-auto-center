// Helper functions for car data
import { cars, Car } from './cars';

/**
 * Get a car by its ID
 */
export function getCarById(id: string): Car | undefined {
  return cars.find(car => car.id === id || car.slug === id);
}

/**
 * Get cars by brand
 */
export function getCarsByBrand(brand: string): Car[] {
  const brandLower = brand.toLowerCase();
  return cars.filter(car =>
    car.brand.toLowerCase() === brandLower ||
    car.brand.toLowerCase().includes(brandLower)
  );
}

/**
 * Get cars by category
 */
export function getCarsByCategory(category: string): Car[] {
  const categoryLower = category.toLowerCase();
  return cars.filter(car =>
    car.category.toLowerCase() === categoryLower ||
    car.category.toLowerCase().includes(categoryLower) ||
    car.type?.toLowerCase() === categoryLower
  );
}

/**
 * Get related cars (same brand or category)
 */
export function getRelatedCars(car: Car, limit: number = 4): Car[] {
  return cars
    .filter(c =>
      c.id !== car.id && (
        c.brand === car.brand ||
        c.category === car.category
      )
    )
    .slice(0, limit);
}

/**
 * Get featured cars
 */
export function getFeaturedCars(limit?: number): Car[] {
  const featured = cars.filter(car => car.featured);
  return limit ? featured.slice(0, limit) : featured;
}

/**
 * Search cars by query
 */
export function searchCars(query: string): Car[] {
  const queryLower = query.toLowerCase();
  return cars.filter(car =>
    car.name.toLowerCase().includes(queryLower) ||
    car.brand.toLowerCase().includes(queryLower) ||
    car.model.toLowerCase().includes(queryLower) ||
    car.description.toLowerCase().includes(queryLower)
  );
}

/**
 * Get all unique brands
 */
export function getAllBrands(): string[] {
  const brands = new Set(cars.map(car => car.brand));
  return Array.from(brands).sort();
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const categories = new Set(cars.map(car => car.category));
  return Array.from(categories).filter(Boolean).sort();
}

/**
 * Filter cars by multiple criteria
 */
export interface CarFilters {
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  fuel?: string;
  transmission?: string;
  minYear?: number;
  maxYear?: number;
}

export function filterCars(filters: CarFilters): Car[] {
  return cars.filter(car => {
    if (filters.brand && car.brand.toLowerCase() !== filters.brand.toLowerCase()) {
      return false;
    }

    if (filters.category && car.category.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }

    if (filters.minPrice && car.priceEur < filters.minPrice) {
      return false;
    }

    if (filters.maxPrice && car.priceEur > filters.maxPrice) {
      return false;
    }

    if (filters.fuel && car.fuel.toLowerCase() !== filters.fuel.toLowerCase()) {
      return false;
    }

    if (filters.transmission && car.transmission.toLowerCase() !== filters.transmission.toLowerCase()) {
      return false;
    }

    if (filters.minYear && parseInt(car.year) < filters.minYear) {
      return false;
    }

    if (filters.maxYear && parseInt(car.year) > filters.maxYear) {
      return false;
    }

    return true;
  });
}

/**
 * Get cars sorted by price
 */
export function getCarsByPrice(ascending: boolean = true): Car[] {
  return [...cars].sort((a, b) =>
    ascending ? a.priceEur - b.priceEur : b.priceEur - a.priceEur
  );
}

/**
 * Get cars sorted by year
 */
export function getCarsByYear(ascending: boolean = false): Car[] {
  return [...cars].sort((a, b) => {
    const yearA = parseInt(a.year) || 0;
    const yearB = parseInt(b.year) || 0;
    return ascending ? yearA - yearB : yearB - yearA;
  });
}

/**
 * Get cars sorted by mileage
 */
export function getCarsByMileage(ascending: boolean = true): Car[] {
  return [...cars].sort((a, b) =>
    ascending ? a.kmNumber - b.kmNumber : b.kmNumber - a.kmNumber
  );
}

/**
 * Get total number of cars
 */
export function getTotalCars(): number {
  return cars.length;
}

/**
 * Get cars count by brand
 */
export function getCarCountByBrand(): Record<string, number> {
  return cars.reduce((acc, car) => {
    acc[car.brand] = (acc[car.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
