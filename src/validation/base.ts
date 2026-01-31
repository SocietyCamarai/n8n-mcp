/**
 * Base Validation Schemas
 * Reusable building blocks for all tool validations
 */

import { z } from 'zod';

// Base string schemas
export const NonEmptyString = z.string().min(1, 'String cannot be empty');
export const OptionalString = z.string().optional();
export const StringWithMax = (max: number) => z.string().max(max);

// Number schemas
export const PositiveInteger = z.number().int().positive();
export const NonNegativeInteger = z.number().int().min(0);
export const IntegerRange = (min: number, max: number) => z.number().int().min(min).max(max);

// Boolean schemas
export const BooleanDefault = (defaultValue: boolean) => z.boolean().default(defaultValue);

// Array schemas
export const StringArray = z.array(z.string());
export const NonEmptyArray = <T extends z.ZodType>(schema: T) => z.array(schema).min(1);

// Pagination schemas
export const PaginationParams = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

// Common ID parameter
export const IdParam = z.string().min(1, 'ID is required');

// Validation helper functions
export function validate<T>(schema: z.ZodSchema<T>, data: unknown, context?: string): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(e => 
      `${e.path.join('.')}: ${e.message}`
    ).join('; ');
    
    const prefix = context ? `${context}: ` : '';
    throw new Error(`${prefix}Validation failed - ${errors}`);
  }
  
  return result.data;
}

export function validateSafe<T>(schema: z.ZodSchema<T>, data: unknown): 
  { success: true; data: T } | { success: false; errors: string[] } {
  
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { 
      success: false, 
      errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
    };
  }
}
