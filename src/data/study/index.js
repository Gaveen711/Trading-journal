// Study library — single entry point.
// Shelf order is deliberate: a beginner reads Foundations before the
// gold-specific material, and risk last only because it needs the vocabulary
// the first two shelves establish.

import { articles as foundations } from './foundations.js';
import { articles as gold } from './gold.js';
import { articles as risk } from './risk.js';

/** Every article, flat, in reading order: Foundations → Gold & Sessions → Risk & Psychology. */
export const studyArticles = [...foundations, ...gold, ...risk];

/** Unique categories in shelf order. */
export const studyCategories = [...new Set(studyArticles.map((article) => article.category))];

/** Look up one article by its URL slug. Returns undefined for unknown slugs. */
export function getArticle(slug) {
  return studyArticles.find((article) => article.slug === slug);
}
