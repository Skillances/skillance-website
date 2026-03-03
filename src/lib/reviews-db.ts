/**
 * LocalStorage-based Review Storage
 */

export interface Review {
  id: number;
  name: string;
  role: 'client' | 'skillancer';
  rating: number;
  comment: string;
  isAnonymous: boolean;
  location: string;
  date: string;
}

const STORAGE_KEY = 'skillance_reviews_db';

export const getReviews = (): Review[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  return JSON.parse(stored);
};

export const addReview = (review: Omit<Review, 'id' | 'date'>): Review => {
  const reviews = getReviews();
  const newReview: Review = {
    ...review,
    id: Date.now(),
    date: 'Just now',
  };
  const updatedReviews = [newReview, ...reviews];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));
  return newReview;
};
