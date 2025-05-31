/**
 * @file adaptiveStrategySelector.ts
 * @version 1.1.1
 * @lastModified 2025-05-31
 * @changelog Fixed unused variable in strategy iteration loop
 *
 * Dynamic strategy selection based on performance benchmarks
 *
 * Key features:
 * - Selects the most efficient strategy based on runtime characteristics
 * - Benchmarks multiple strategies to determine optimal choice
 * - Adapts to different input patterns
 * - Maintains mathematical correctness while optimizing performance
 */

import { Point, DisplayConfiguration, PositionCalculationStrategy } from '../core/types';
import { TransformationStrategy } from './transformationStrategy';
import { DirectFormulaStrategy } from './directFormulaStrategy';
import { CachedTransformationStrategy } from './cachedTransformationStrategy';
import { PerformanceBenchmark } from '../utils/performanceBenchmark';

/**
 * Configuration options for adaptive strategy selector
 */
export interface AdaptiveStrategyOptions {
  /** Strategy implementations to consider (default: TransformationStrategy, DirectFormulaStrategy) */
  availableStrategies?: Map<string, PositionCalculationStrategy>;
  /** Enable automatic periodic re-benchmarking (default: false) */
  enableAutoBenchmarking?: boolean;
  /** Number of operations between benchmarks (default: 10000) */
  benchmarkInterval?: number;
  /** Number of times to run each strategy during benchmarking (default: 100) */
  benchmarkIterations?: number;
  /** Number of random points to use for benchmarking (default: 50) */
  benchmarkPointCount?: number;
  /** Enable caching for the selected strategy (default: true) */
  enableCaching?: boolean;
  /** Maximum number of strategy switches to allow before settling on a strategy (default: 5) */
  maxStrategySwitches?: number;
}

/**
 * Scenario information for strategy selection
 */
interface Scenario {
  /** Configuration pair identifier */
  configPairId: string;
  /** Number of calculations performed */
  operationCount: number;
  /** Current best strategy name */
  bestStrategyName: string;
  /** Number of strategy switches */
  switchCount: number;
  /** Last time benchmarked */
  lastBenchmarked: number;
}

/**
 * Adaptive strategy selector that dynamically selects the most efficient strategy
 * based on benchmarks and runtime characteristics
 */
export class AdaptiveStrategySelector implements PositionCalculationStrategy {
  /** Available strategy implementations */
  private strategies: Map<string, PositionCalculationStrategy>;
  
  /** Current selected strategy name for each scenario */
  private scenarioBestStrategy: Map<string, Scenario>;
  
  /** Benchmark utility for measuring performance */
  private benchmark: PerformanceBenchmark;
  
  /** Enable automatic periodic re-benchmarking */
  private autoBenchmarking: boolean;
  
  /** Number of operations between benchmarks */
  private benchmarkInterval: number;
  
  /** Number of times to run each strategy during benchmarking */
  private benchmarkIterations: number;
  
  /** Number of random points to use for benchmarking */
  private benchmarkPointCount: number;
  
  /** Enable caching for the selected strategy */
  private enableCaching: boolean;
  
  /** Maximum number of strategy switches to allow */
  private maxStrategySwitches: number;
  
  /** Default strategy to use before benchmarking */
  private defaultStrategy: PositionCalculationStrategy;
  
  /** Default strategy name */
  private defaultStrategyName: string;
  
  /** Strategy cache to avoid creating duplicate instances */
  private strategyCache: Map<string, PositionCalculationStrategy>;
  
  /**
   * Create a new adaptive strategy selector
   * 
   * @param options Configuration options
   */
  constructor(options?: AdaptiveStrategyOptions) {
    // Set up benchmarking utility
    this.benchmark = new PerformanceBenchmark();
    
    // Configure options
    this.autoBenchmarking = options?.enableAutoBenchmarking ?? false;
    this.benchmarkInterval = options?.benchmarkInterval ?? 10000;
    this.benchmarkIterations = options?.benchmarkIterations ?? 100;
    this.benchmarkPointCount = options?.benchmarkPointCount ?? 50;
    this.enableCaching = options?.enableCaching ?? true;
    this.maxStrategySwitches = options?.maxStrategySwitches ?? 5;
    
    // Register available strategies
    if (options?.availableStrategies) {
      this.strategies = new Map(options.availableStrategies);
    } else {
      // Default strategies
      this.strategies = new Map([
        ['transformation', new TransformationStrategy()],
        ['directFormula', new DirectFormulaStrategy()]
      ]);
    }
    
    // Initialize scenario tracking
    this.scenarioBestStrategy = new Map<string, Scenario>();
    
    // Set default strategy
    this.defaultStrategyName = 'transformation';
    this.defaultStrategy = this.strategies.get(this.defaultStrategyName)!;
    
    // Initialize strategy cache
    this.strategyCache = new Map<string, PositionCalculationStrategy>();
    
    // Add cached versions if caching is enabled
    if (this.enableCaching) {
      for (const [name, strategy] of this.strategies.entries()) {
        this.strategyCache.set(
          `cached_${name}`, 
          new CachedTransformationStrategy(strategy)
        );
      }
    }
  }
  
  /**
   * Calculate target position using the most efficient strategy
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
    // Select the best strategy for this configuration pair
    const strategy = this.selectStrategy(sourceConfig, targetConfig);
    
    // Delegate to the selected strategy
    return strategy.calculateTargetPosition(
      sourcePoint,
      sourceConfig,
      targetConfig
    );
  }
  
  /**
   * Calculate source position using the most efficient strategy
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
    // Select the best strategy for this configuration pair
    const strategy = this.selectStrategy(sourceConfig, targetConfig);
    
    // Delegate to the selected strategy
    return strategy.calculateSourcePosition(
      targetPoint,
      sourceConfig,
      targetConfig
    );
  }
  
  /**
   * Explicitly trigger benchmarking for a configuration pair
   * 
   * @param sourceConfig Source display configuration
   * @param targetConfig Target display configuration
   * @returns Name of the selected best strategy
   */
  benchmarkStrategies(
    sourceConfig: DisplayConfiguration,
    targetConfig: DisplayConfiguration
  ): string {
    // Generate a configuration pair ID
    const configPairId = this.getConfigPairId(sourceConfig, targetConfig);
    
    // Generate benchmark points
    const points = this.benchmark.generateTestPoints(
      this.benchmarkPointCount,
      sourceConfig
    );
    
    // Create a map of strategies to benchmark
    const strategiesToBenchmark = new Map<string, PositionCalculationStrategy>();
    
    // Add base strategies
    for (const [name, strategy] of this.strategies.entries()) {
      strategiesToBenchmark.set(name, strategy);
    }
    
    // Add cached versions if enabled
    if (this.enableCaching) {
      for (const [name] of this.strategies.entries()) {
        strategiesToBenchmark.set(
          `cached_${name}`,
          this.getCachedStrategy(name)
        );
      }
    }
    
    // Run benchmarks
    const results = this.benchmark.compareStrategies(
      strategiesToBenchmark,
      points,
      sourceConfig,
      targetConfig,
      this.benchmarkIterations
    );
    
    // Find the strategy with the lowest median execution time
    let bestStrategyName = this.defaultStrategyName;
    let bestTime = Infinity;
    
    for (const [name, result] of results.entries()) {
      if (result.medianExecutionTime < bestTime) {
        bestTime = result.medianExecutionTime;
        bestStrategyName = name;
      }
    }
    
    // Update scenario information
    let scenario = this.scenarioBestStrategy.get(configPairId);
    
    if (scenario) {
      // Update existing scenario
      const previousBest = scenario.bestStrategyName;
      
      scenario.bestStrategyName = bestStrategyName;
      scenario.lastBenchmarked = Date.now();
      
      // Track strategy switches
      if (previousBest !== bestStrategyName) {
        scenario.switchCount++;
      }
    } else {
      // Create new scenario
      scenario = {
        configPairId,
        operationCount: 0,
        bestStrategyName,
        switchCount: 0,
        lastBenchmarked: Date.now()
      };
      
      this.scenarioBestStrategy.set(configPairId, scenario);
    }
    
    return bestStrategyName;
  }
  
  /**
   * Get the currently selected strategy for a configuration pair
   * 
   * @param sourceConfig Source display configuration
   * @param targetConfig Target display configuration
   * @returns Currently selected strategy name
   */
  getCurrentStrategyName(
    sourceConfig: DisplayConfiguration,
    targetConfig: DisplayConfiguration
  ): string {
    const configPairId = this.getConfigPairId(sourceConfig, targetConfig);
    const scenario = this.scenarioBestStrategy.get(configPairId);
    
    return scenario?.bestStrategyName || this.defaultStrategyName;
  }
  
  /**
   * Get performance statistics for the adaptive selector
   * 
   * @returns Object with performance statistics
   */
  getStatistics(): {
    scenarioCount: number;
    strategyDistribution: Map<string, number>;
    averageSwitchCount: number;
  } {
    // Count scenarios using each strategy
    const strategyDistribution = new Map<string, number>();
    let totalSwitchCount = 0;
    
    for (const scenario of this.scenarioBestStrategy.values()) {
      // Count strategy usage
      const count = strategyDistribution.get(scenario.bestStrategyName) || 0;
      strategyDistribution.set(scenario.bestStrategyName, count + 1);
      
      // Accumulate switch count
      totalSwitchCount += scenario.switchCount;
    }
    
    // Calculate average switch count
    const scenarioCount = this.scenarioBestStrategy.size;
    const averageSwitchCount = scenarioCount > 0 ? totalSwitchCount / scenarioCount : 0;
    
    return {
      scenarioCount,
      strategyDistribution,
      averageSwitchCount
    };
  }
  
  /**
   * Reset all benchmark data and strategy selections
   */
  reset(): void {
    this.scenarioBestStrategy.clear();
  }
  
  /**
   * Select the best strategy for a configuration pair
   * 
   * @param sourceConfig Source display configuration
   * @param targetConfig Target display configuration
   * @returns Selected strategy instance
   */
  private selectStrategy(
    sourceConfig: DisplayConfiguration,
    targetConfig: DisplayConfiguration
  ): PositionCalculationStrategy {
    // Generate a configuration pair ID
    const configPairId = this.getConfigPairId(sourceConfig, targetConfig);
    
    // Get or create scenario information
    let scenario = this.scenarioBestStrategy.get(configPairId);
    
    if (!scenario) {
      // New scenario, initialize with default strategy
      scenario = {
        configPairId,
        operationCount: 0,
        bestStrategyName: this.defaultStrategyName,
        switchCount: 0,
        lastBenchmarked: 0
      };
      
      this.scenarioBestStrategy.set(configPairId, scenario);
    }
    
    // Increment operation count
    scenario.operationCount++;
    
    // Check if we need to benchmark
    if (this.shouldBenchmark(scenario)) {
      this.benchmarkStrategies(sourceConfig, targetConfig);
    }
    
    // Get the selected strategy
    const strategyName = scenario.bestStrategyName;
    
    // Check if it's a cached strategy
    if (strategyName.startsWith('cached_')) {
      const baseName = strategyName.substring(7); // Remove 'cached_' prefix
      return this.getCachedStrategy(baseName);
    }
    
    // Return the selected strategy
    return this.strategies.get(strategyName) || this.defaultStrategy;
  }
  
  /**
   * Determine if benchmarking should be performed for a scenario
   * 
   * @param scenario Scenario information
   * @returns True if benchmarking should be performed
   */
  private shouldBenchmark(scenario: Scenario): boolean {
    // Always benchmark if never benchmarked before
    if (scenario.lastBenchmarked === 0) {
      return true;
    }
    
    // Limit the number of strategy switches
    if (scenario.switchCount >= this.maxStrategySwitches) {
      return false;
    }
    
    // Skip benchmarking if auto-benchmarking is disabled
    if (!this.autoBenchmarking) {
      return false;
    }
    
    // Benchmark periodically based on operation count
    return scenario.operationCount % this.benchmarkInterval === 0;
  }
  
  /**
   * Generate a unique identifier for a configuration pair
   * 
   * @param sourceConfig Source display configuration
   * @param targetConfig Target display configuration
   * @returns Configuration pair identifier string
   */
  private getConfigPairId(
    sourceConfig: DisplayConfiguration,
    targetConfig: DisplayConfiguration
  ): string {
    // Create identifiers for each configuration
    const sourceId = this.getConfigId(sourceConfig);
    const targetId = this.getConfigId(targetConfig);
    
    // Combine them to form a pair ID
    return `${sourceId}|${targetId}`;
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
   * Get or create a cached version of a strategy
   * 
   * @param baseName Base strategy name
   * @returns Cached strategy instance
   */
  private getCachedStrategy(baseName: string): PositionCalculationStrategy {
    const cacheKey = `cached_${baseName}`;
    
    // Check if already in cache
    if (this.strategyCache.has(cacheKey)) {
      return this.strategyCache.get(cacheKey)!;
    }
    
    // Get base strategy
    const baseStrategy = this.strategies.get(baseName);
    
    if (!baseStrategy) {
      return this.defaultStrategy;
    }
    
    // Create cached version
    const cachedStrategy = new CachedTransformationStrategy(baseStrategy);
    
    // Store in cache
    this.strategyCache.set(cacheKey, cachedStrategy);
    
    return cachedStrategy;
  }
}