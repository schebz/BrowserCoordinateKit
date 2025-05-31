/**
 * @file composite.ts
 * @version 1.0.0
 * @lastModified 2025-05-18
 * @changelog Initial implementation of composite transformation
 *
 * Combines multiple transformations into a single transformation
 *
 * Key features:
 * - Allows composition of transformations
 * - Automatically handles inverse transformations
 * - Supports different input and output types
 */

import { Transformation } from '../core/types';

/**
 * CompositeTransformation
 * 
 * Combines multiple transformations into a single transformation
 * For transformations T₁: A → B and T₂: B → C, the composition T₂ ∘ T₁: A → C
 * is defined as (T₂ ∘ T₁)(p) = T₂(T₁(p))
 */
export class CompositeTransformation<TInput, TIntermediate, TOutput> implements Transformation<TInput, TOutput> {
  /**
   * @param first The first transformation to apply
   * @param second The second transformation to apply after the first
   */
  constructor(
    private first: Transformation<TInput, TIntermediate>,
    private second: Transformation<TIntermediate, TOutput>
  ) {}
  
  /**
   * Apply the first transformation followed by the second transformation
   * 
   * (T₂ ∘ T₁)(p) = T₂(T₁(p))
   * 
   * @param point The point in the input coordinate space
   * @returns The transformed point in the output coordinate space
   */
  transform(point: TInput): TOutput {
    const intermediate = this.first.transform(point);
    return this.second.transform(intermediate);
  }
  
  /**
   * Get the inverse of the composite transformation
   * 
   * (T₂ ∘ T₁)⁻¹ = T₁⁻¹ ∘ T₂⁻¹
   * 
   * The order is reversed for the inverse composition
   * 
   * @returns The inverse transformation
   */
  getInverse(): Transformation<TOutput, TInput> {
    return new CompositeTransformation<TOutput, TIntermediate, TInput>(
      this.second.getInverse(),
      this.first.getInverse()
    );
  }
}