/**
 * Template service
 * Abstracts template data fetching from components
 * In production, this will call an API
 */

import type { Template } from "@/types";
import { mockTemplates } from "@/lib/mock-data/templates";

/**
 * Get all available templates
 * @returns Promise resolving to array of templates
 */
export async function getTemplates(): Promise<Template[]> {
  // Simulate API delay for realistic behavior
  await new Promise((resolve) => setTimeout(resolve, 100));

  return mockTemplates;
}

/**
 * Get a template by ID
 * @param id - Template ID
 * @returns Promise resolving to template or undefined if not found
 */
export async function getTemplateById(id: string): Promise<Template | undefined> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return mockTemplates.find((t) => t.id === id);
}

/**
 * Get templates by category
 * @param category - Category to filter by
 * @returns Promise resolving to filtered templates
 */
export async function getTemplatesByCategory(category: string): Promise<Template[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return mockTemplates.filter((t) => t.category === category);
}
