/**
 * @file cachedTransformationStrategy.ts
 * @version 1.0.3
 * @lastModified 2025-05-18
 * @changelog Initial implementation of cached transformation strategy
 *
 * Implementation of position calculation strategy with caching for improved performance
 *
 * Key features:
 * - Caches results of previous calculations to avoid redundant computation
 * - Uses LRU (Least Recently Used) cache eviction policy
 * - Maintains mathematical correctness while improving performance
 * - Cache size and TTL are configurable
 */

import { Point, DisplayConfiguration, PositionCalculationStrategy } from '../core/types';
import { TransformationStrategy } from './transformationStrategy';

/**
 * Cache options for the CachedTransformationStrategy
 */
export interface CacheOptions {
  /** Maximum number of entries in the cache */
  maxSize?: number;
  /** Time-to-live for cache entries in milliseconds (0 means no expiration) */
  ttl?: number;
}

/**
 * Internal cache entry structure
 */
interface CacheEntry<T> {
  /** Value stored in the cache */
  value: T;
  /** Timestamp when the entry was last accessed */
  lastAccessed: number;
  /** Timestamp when the entry was created */
  created: number;
}

/**
 * Cache key for position calculations
 */
interface PositionCacheKey {
  /** Source point x coordinate */
  sx: number;
  /** Source point y coordinate */
  sy: number;
  /** Source configuration identifier */
  sourceConfigId: string;
  /** Target configuration identifier */
  targetConfigId: string;
}

/**
 * Position calculation strategy with caching to improve performance
 * 
 * This strategy wraps another strategy and caches its results.
 * The cache uses an LRU (Least Recently Used) eviction policy
 * and optionally supports time-based expiration.
 * 
 * The cache is effective when:
 * - The same calculations are performed repeatedly
 * - The calculations are computationally expensive
 * - The display configurations remain stable
 */
export class CachedTransformationStrategy implements PositionCalculationStrategy {
  /** Underlying strategy used for calculations */
  private strategy: PositionCalculationStrategy;
  
  /** Maximum cache size */
  private maxCacheSize: number;
  
  /** Cache TTL in milliseconds (0 means no expiration) */
  private cacheTtl: number;
  
  /** Cache for target position calculations */
  private targetPositionCache: Map<string, CacheEntry<Point>>;
  
  /** Cache for source position calculations */
  private sourcePositionCache: Map<string, CacheEntry<Point>>;
  
  /** Cache hit counter for statistics */
  private cacheHits = 0;
  
  /** Cache miss counter for statistics */
  private cacheMisses = 0;
  
  /**
   * Create a new cached transformation strategy
   * 
   * @param strategy Underlying strategy to cache (defaults to TransformationStrategy)
   * @param options Cache options
   */
  constructor(
    strategy?: PositionCalculationStrategy,
    options?: CacheOptions
  ) {
    this.strategy = strategy || new TransformationStrategy();
    this.maxCacheSize = options?.maxSize || 1000;
    this.cacheTtl = options?.ttl || 0; // 0 means no expiration
    
    this.targetPositionCache = new Map<string, CacheEntry<Point>>();
    this.sourcePositionCache = new Map<string, CacheEntry<Point>>();
  }
  
  /**
   * Calculate target position using cached results when available
   * 
   * @param sourcePoint Source point in original screen coordinates
   * @param sourceConfig Source display configuration
   * @param targetConfig Target display configuration
   * @returns Target point in target logical coordinates
   */
  calculateTargetPosition(
    sourcePoint: Point,
    sourceConfig: DisplayConfiguration,
    targetConfig: DisplayConfiguration
  ): Point {
    // Create cache key
    const key = this.createPositionCacheKey(
      sourcePoint,
      sourceConfig,
      targetConfig
    );
    
    // Try to get from cache
    const cached = this.getFromCache(this.targetPositionCache, key);
    
    if (cached) {
      this.cacheHits++;
      return cached;
    }
    
    // Cache miss, calculate and store
    this.cacheMisses++;
    const result = this.strategy.calculateTargetPosition(
      sourcePoint,
      sourceConfig,
      targetConfig
    );
    
    this.addToCache(this.targetPositionCache, key, result);
    
    return result;
  }
  
  /**
   * Calculate source position using cached results when available
   * 
   * @param targetPoint Target point in target logical coordinates
   * @param sourceConfig Source display configuration
   * @param targetConfig Target display configuration
   * @returns Source point in original screen coordinates
   */
  calculateSourcePosition(
    targetPoint: Point,
    sourceConfig: DisplayConfiguration,
    targetConfig: DisplayConfiguration
  ): Point {
    // Create cache key
    const key = this.createPositionCacheKey(
      targetPoint,
      targetConfig,
      sourceConfig
    );
    
    // Try to get from cache
    const cached = this.getFromCache(this.sourcePositionCache, key);
    
    if (cached) {
      this.cacheHits++;
      return cached;
    }
    
    // Cache miss, calculate and store
    this.cacheMisses++;
    const result = this.strategy.calculateSourcePosition(
      targetPoint,
      sourceConfig,
      targetConfig
    );
    
    this.addToCache(this.sourcePositionCache, key, result);
    
    return result;
  }
  
  /**
   * Get underlying strategy
   * 
   * @returns The underlying position calculation strategy
   */
  getUnderlyingStrategy(): PositionCalculationStrategy {
    return this.strategy;
  }
  
  /**
   * Clear all caches
   */
  clearCache(): void {
    this.targetPositionCache.clear();
    this.sourcePositionCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
  
  /**
   * Get cache statistics
   * 
   * @returns Object with cache statistics
   */
  getCacheStatistics(): {
    hits: number;
    misses: number;
    hitRate: number;
    targetCacheSize: number;
    sourceCacheSize: number
  } {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? this.cacheHits / totalRequests : 0;
    
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate,
      targetCacheSize: this.targetPositionCache.size,
      sourceCacheSize: this.sourcePositionCache.size
    };
  }
  
  /**
   * Create a serializable cache key for position calculation
   * 
   * @param point Source or target point
   * @param configA First configuration (source or target)
   * @param configB Second configuration (target or source)
   * @returns Stringified cache key
   */
  private createPositionCacheKey(
    point: Point,
    configA: DisplayConfiguration,
    configB: DisplayConfiguration
  ): string {
    // Create a serializable key structure
    const key: PositionCacheKey = {
      sx: point.x,
      sy: point.y,
      sourceConfigId: this.getConfigId(configA),
      targetConfigId: this.getConfigId(configB)
    };
    
    // Stringify for use as map key
    return JSON.stringify(key);
  }
  
  /**
   * Generate a unique identifier for a display configuration
   * 
   * @param config Display configuration
   * @returns Configuration identifier string
   */
  private getConfigId(config: DisplayConfiguration): string {
    // Create a string that uniquely identifies the configuration
    return `${config.screenDimensions.width}x${config.screenDimensions.height}_${config.browserPosition.x},${config.browserPosition.y}_${config.viewportDimensions.width}x${config.viewportDimensions.height}_${config.dpiScaling}`;
  }
  
  /**
   * Add an entry to the cache
   * 
   * @param cache Cache map to add to
   * @param key Cache key
   * @param value Value to cache
   */
  private addToCache<T>(
    cache: Map<string, CacheEntry<T>>,
    key: string,
    value: T
  ): void {
    // If cache is at capacity, evict least recently used entry
    if (cache.size >= this.maxCacheSize) {
      this.evictLRU(cache);
    }
    
    // Add new entry
    const now = Date.now();
    cache.set(key, {
      value,
      lastAccessed: now,
      created: now
    });
  }
  
  /**
   * Get value from cache if available
   * 
   * @param cache Cache map to get from
   * @param key Cache key
   * @returns Cached value if available, undefined otherwise
   */
  private getFromCache<T>(
    cache: Map<string, CacheEntry<T>>,
    key: string
  ): T | undefined {
    const entry = cache.get(key);
    
    // If no entry, it's a cache miss
    if (!entry) {
      return undefined;
    }
    
    // If entry has expired, remove it and return undefined
    if (this.cacheTtl > 0 && Date.now() - entry.created > this.cacheTtl) {
      cache.delete(key);
      return undefined;
    }
    
    // Update last accessed time
    entry.lastAccessed = Date.now();
    
    return entry.value;
  }
  
  /**
   * Evict the least recently used cache entry
   * 
   * @param cache Cache map to evict from
   */
  private evictLRU<T>(cache: Map<string, CacheEntry<T>>): void {
    if (cache.size === 0) return;
    
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    // Find the least recently used entry
    for (const [key, entry] of cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    // Remove the oldest entry
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }
}