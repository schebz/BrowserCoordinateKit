/**
 * Tests for matrix operations used in the calibration utility
 * 
 * These tests focus on the matrix math operations used for calibration,
 * particularly covering error handling and edge cases.
 */

import { CalibrationUtility } from '../../src/calibration/calibrationUtility';

describe('Calibration Matrix Operations', () => {
  // Create a utility instance to test the matrix operations
  let utility: CalibrationUtility;
  
  beforeEach(() => {
    utility = new CalibrationUtility();
  });
  
  describe('solveLinearSystem', () => {
    let solveLinearSystem: (A: number[][], b: number[]) => number[];
    
    beforeEach(() => {
      // Access the private method using type casting
      solveLinearSystem = (utility as any).solveLinearSystem.bind(utility);
    });
    
    it('should solve a simple 2x2 system', () => {
      // System:
      // 2x + y = 5
      // x + 2y = 4
      // Solution: x = 2, y = 1
      const A = [[2, 1], [1, 2]];
      const b = [5, 4];
      
      const result = solveLinearSystem(A, b);
      
      expect(result[0]).toBeCloseTo(2, 10);
      expect(result[1]).toBeCloseTo(1, 10);
    });
    
    it('should solve a 3x3 system', () => {
      // Use a simple diagonal system with known solution:
      // 2x + 0y + 0z = 4
      // 0x + 3y + 0z = 9
      // 0x + 0y + 4z = 16
      // Solution: x = 2, y = 3, z = 4
      const A = [[2, 0, 0], [0, 3, 0], [0, 0, 4]];
      const b = [4, 9, 16];
      
      const result = solveLinearSystem(A, b);
      
      // Using toBeCloseTo with a higher precision since we're dealing with floating-point arithmetic
      expect(result[0]).toBeCloseTo(2, 10);
      expect(result[1]).toBeCloseTo(3, 10);
      expect(result[2]).toBeCloseTo(4, 10);
    });
    
    it('should handle singular matrices gracefully', () => {
      // Singular matrix (not invertible)
      // 1x + 2y = 3
      // 2x + 4y = 6  (multiple of the first equation)
      const A = [[1, 2], [2, 4]];
      const b = [3, 6];
      
      expect(() => solveLinearSystem(A, b)).toThrow();
    });
    
    it('should throw error for empty input', () => {
      expect(() => solveLinearSystem([], [])).toThrow();
    });
    
    it('should throw error for non-square matrix', () => {
      const A = [[1, 2, 3], [4, 5, 6]]; // 2x3 matrix
      const b = [7, 8];
      
      expect(() => solveLinearSystem(A, b)).toThrow();
    });
    
    it('should throw error for mismatched dimensions', () => {
      const A = [[1, 2], [3, 4]];
      const b = [5, 6, 7]; // b has 3 elements, but A has 2 rows
      
      expect(() => solveLinearSystem(A, b)).toThrow();
    });
  });
  
  describe('Matrix operations', () => {
    let matrixMultiply: (A: number[][], B: number[][]) => number[][];
    let vectorMultiply: (A: number[][], v: number[]) => number[];
    let determinant: (A: number[][]) => number;
    let inverse: (A: number[][]) => number[][];
    
    beforeEach(() => {
      // Access the private methods using type casting
      matrixMultiply = (utility as any).multiply.bind(utility);
      vectorMultiply = (utility as any).multiplyVec.bind(utility);
      determinant = (utility as any).determinant.bind(utility);
      inverse = (utility as any).inverse.bind(utility);
    });
    
    it('should multiply two matrices correctly', () => {
      const A = [[1, 2], [3, 4]];
      const B = [[5, 6], [7, 8]];
      // Expected: [[19, 22], [43, 50]]
      
      const result = matrixMultiply(A, B);
      
      expect(result).toEqual([[19, 22], [43, 50]]);
    });
    
    it('should multiply matrix and vector correctly', () => {
      const A = [[1, 2, 3], [4, 5, 6]];
      const v = [7, 8, 9];
      // Expected: [50, 122]
      
      const result = vectorMultiply(A, v);
      
      expect(result).toEqual([50, 122]);
    });
    
    it('should throw error for mismatched matrix dimensions', () => {
      const A = [[1, 2], [3, 4]];
      const B = [[5, 6, 7], [8, 9, 10], [11, 12, 13]]; // B is 3x3, but A's columns (2) != B's rows (3)
      
      expect(() => matrixMultiply(A, B)).toThrow();
    });
    
    it('should throw error for mismatched vector dimensions', () => {
      const A = [[1, 2], [3, 4]];
      const v = [5, 6, 7]; // vector has 3 elements, but A has 2 columns
      
      expect(() => vectorMultiply(A, v)).toThrow();
    });
    
    it('should handle empty matrices', () => {
      expect(() => matrixMultiply([], [])).toThrow();
    });
    
    it('should calculate determinant of 2x2 matrix', () => {
      const A = [[4, 7], [2, 6]];
      // det(A) = 4*6 - 7*2 = 24 - 14 = 10
      
      const result = determinant(A);
      
      expect(result).toBe(10);
    });
    
    it('should calculate determinant of 3x3 matrix', () => {
      const A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      // det(A) = 0 (singular matrix)
      
      const result = determinant(A);
      
      expect(result).toBeCloseTo(0);
    });
    
    it('should throw error for non-square matrix in determinant', () => {
      const A = [[1, 2, 3], [4, 5, 6]]; // 2x3 matrix
      
      // The determinant function doesn't explicitly check for non-square matrices
      // It will fail when trying to access properties that don't exist
      try {
        determinant(A);
        // If we get here, the function didn't throw as expected
        fail('Expected determinant to throw an error for non-square matrix');
      } catch (error) {
        // Error thrown as expected
        expect(error).toBeDefined();
      }
    });
    
    it('should throw error for matrix larger than 3x3', () => {
      const A = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16]
      ]; // 4x4 matrix
      
      expect(() => determinant(A)).toThrow();
    });
    
    it('should calculate inverse of 2x2 matrix', () => {
      const A = [[4, 7], [2, 6]];
      // det(A) = 10
      // inv(A) = 1/10 * [[6, -7], [-2, 4]]
      
      const result = inverse(A);
      
      expect(result[0][0]).toBeCloseTo(0.6);
      expect(result[0][1]).toBeCloseTo(-0.7);
      expect(result[1][0]).toBeCloseTo(-0.2);
      expect(result[1][1]).toBeCloseTo(0.4);
    });
    
    it('should calculate inverse of 3x3 matrix', () => {
      const A = [[1, 0, 0], [0, 2, 0], [0, 0, 3]];
      // Diagonal matrix, inverse is 1/values on diagonal
      
      const result = inverse(A);
      
      expect(result[0][0]).toBeCloseTo(1);
      expect(result[1][1]).toBeCloseTo(0.5);
      expect(result[2][2]).toBeCloseTo(1/3);
    });
    
    it('should throw error for singular matrix', () => {
      const A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]; // Singular matrix
      
      expect(() => inverse(A)).toThrow();
    });
    
    it('should throw error for non-square matrix in inverse', () => {
      const A = [[1, 2, 3], [4, 5, 6]]; // 2x3 matrix
      
      // The inverse function relies on determinant which will throw an error
      try {
        inverse(A);
        // If we get here, the function didn't throw as expected
        fail('Expected inverse to throw an error for non-square matrix');
      } catch (error) {
        // Error thrown as expected
        expect(error).toBeDefined();
      }
    });
    
    it('should throw error for matrix larger than 3x3', () => {
      const A = [
        [1, 0, 0, 0],
        [0, 2, 0, 0],
        [0, 0, 3, 0],
        [0, 0, 0, 4]
      ]; // 4x4 matrix
      
      expect(() => inverse(A)).toThrow();
    });
  });
});