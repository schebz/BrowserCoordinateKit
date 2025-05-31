/**
 * Performance Optimisation Example
 * 
 * This example demonstrates the Phase 1 performance optimisation features:
 * - Performance benchmarking
 * - Cached transformation
 * - Adaptive strategy selection
 */

import {
  BrowserPositionCalculator,
  CoordinateUtils,
  DirectFormulaStrategy,
  TransformationStrategy,
  CachedTransformationStrategy,
  AdaptiveStrategySelector,
  PerformanceBenchmark
} from '../src';

function performanceExample() {
  console.log('BrowserCoordinateKit - Performance Optimization Example');
  console.log('-----------------------------------------------------');

  // Create source and target configurations
  const sourceConfig = CoordinateUtils.createDisplayConfig(
    2560, 1440,   // Original screen dimensions
    100, 50,      // Original browser position
    2000, 1000,   // Original viewport dimensions
    2             // Original DPI scaling
  );
  
  const targetConfig = CoordinateUtils.createDisplayConfig(
    1920, 1080,   // Target screen dimensions
    75, 37.5,     // Target browser position
    1800, 900,    // Target viewport dimensions
    1.5           // Target DPI scaling
  );
  
  // Create points for testing
  const benchmark = new PerformanceBenchmark();
  const testPoints = benchmark.generateTestPoints(1000, sourceConfig);
  
  console.log(`Generated ${testPoints.length} test points`);
  
  // Example 1: Comparing different strategies
  console.log('\n1. Comparing Strategy Performance:');
  
  const strategies = new Map([
    ['transformation', new TransformationStrategy()],
    ['directFormula', new DirectFormulaStrategy()],
    ['cachedTransformation', new CachedTransformationStrategy(new TransformationStrategy())],
    ['cachedDirectFormula', new CachedTransformationStrategy(new DirectFormulaStrategy())]
  ]);
  
  const results = benchmark.compareStrategies(
    strategies,
    testPoints,
    sourceConfig,
    targetConfig,
    1000 // iterations
  );
  
  console.log('Strategy comparison results (execution time in milliseconds):');
  
  for (const [name, result] of results.entries()) {
    console.log(`${name}:`);
    console.log(`  Median: ${result.medianExecutionTime.toFixed(6)} ms`);
    console.log(`  Average: ${result.averageExecutionTime.toFixed(6)} ms`);
    console.log(`  Min: ${result.minExecutionTime.toFixed(6)} ms`);
    console.log(`  Max: ${result.maxExecutionTime.toFixed(6)} ms`);
    console.log(`  StdDev: ${result.standardDeviation.toFixed(6)} ms`);
  }
  
  // Example 2: Cached transformation strategy with repeated points
  console.log('\n2. Caching Performance with Repeated Points:');
  
  const cachedStrategy = new CachedTransformationStrategy(new TransformationStrategy());
  const uncachedStrategy = new TransformationStrategy();
  
  // Create a set of points that will be repeated
  const repeatedPoints = testPoints.slice(0, 10);
  
  // First run with uncached strategy
  console.log('Without caching:');
  let startTime = performance.now();
  
  for (let i = 0; i < 1000; i++) {
    for (const point of repeatedPoints) {
      uncachedStrategy.calculateTargetPosition(point, sourceConfig, targetConfig);
    }
  }
  
  let endTime = performance.now();
  console.log(`Execution time: ${(endTime - startTime).toFixed(3)} ms`);
  
  // Now run with a cached strategy
  console.log('With caching:');
  startTime = performance.now();
  
  for (let i = 0; i < 1000; i++) {
    for (const point of repeatedPoints) {
      cachedStrategy.calculateTargetPosition(point, sourceConfig, targetConfig);
    }
  }
  
  endTime = performance.now();
  console.log(`Execution time: ${(endTime - startTime).toFixed(3)} ms`);
  
  // Print cache statistics
  const cacheStats = cachedStrategy.getCacheStatistics();
  console.log('Cache statistics:');
  console.log(`  Hits: ${cacheStats.hits}`);
  console.log(`  Misses: ${cacheStats.misses}`);
  console.log(`  Hit rate: ${(cacheStats.hitRate * 100).toFixed(2)}%`);
  
  // Example 3: Adaptive strategy selection
  console.log('\n3. Adaptive Strategy Selection:');
  
  // Create calculator with adaptive strategy
  const calculator = new BrowserPositionCalculator({
    useAdaptiveStrategy: true,
    adaptiveOptions: {
      enableAutoBenchmarking: true,
      benchmarkInterval: 1000,
      enableCaching: true
    }
  });
  
  // Force benchmarking to select best strategy
  calculator.getMostEfficientStrategy(sourceConfig, targetConfig);
  
  // Get the adaptive strategy selector
  const adaptiveSelector = calculator.getStrategy() as AdaptiveStrategySelector;
  
  // Print the selected strategy
  const selectedStrategy = adaptiveSelector.getCurrentStrategyName(
    sourceConfig,
    targetConfig
  );
  
  console.log(`Selected strategy: ${selectedStrategy}`);
  
  // Perform some calculations
  console.log('Calculating 1000 points with adaptive strategy...');
  
  startTime = performance.now();
  
  for (const point of testPoints.slice(0, 1000)) {
    calculator.calculateTargetPosition(point, sourceConfig, targetConfig);
  }
  
  endTime = performance.now();
  console.log(`Execution time: ${(endTime - startTime).toFixed(3)} ms`);
  
  // Example 4: Complex scenario with multiple config pairs
  console.log('\n4. Multiple Configuration Pairs:');
  
  const configs = [
    // Different screen sizes
    CoordinateUtils.createDisplayConfig(1920, 1080, 50, 30, 1800, 950, 1),
    CoordinateUtils.createDisplayConfig(3840, 2160, 200, 100, 3600, 1900, 2),
    CoordinateUtils.createDisplayConfig(1366, 768, 30, 20, 1300, 700, 1)
  ];
  
  // Use adaptive strategy with these configurations
  const multiConfigCalculator = new BrowserPositionCalculator({
    useAdaptiveStrategy: true,
    adaptiveOptions: {
      enableAutoBenchmarking: false, // We'll benchmark manually
      enableCaching: true
    }
  });
  
  // Benchmark each configuration pair
  for (const sourceConf of configs) {
    for (const targetConf of configs) {
      if (sourceConf !== targetConf) {
        multiConfigCalculator.getMostEfficientStrategy(sourceConf, targetConf);
      }
    }
  }
  
  // Get statistics
  const adaptiveMultiSelector = multiConfigCalculator.getStrategy() as AdaptiveStrategySelector;
  const stats = adaptiveMultiSelector.getStatistics();
  
  console.log(`Total scenarios: ${stats.scenarioCount}`);
  console.log('Strategy distribution:');
  
  for (const [name, count] of stats.strategyDistribution.entries()) {
    console.log(`  ${name}: ${count} scenarios (${((count / stats.scenarioCount) * 100).toFixed(1)}%)`);
  }
  
  console.log(`Average strategy switches per scenario: ${stats.averageSwitchCount.toFixed(2)}`);
}

// Run the example
performanceExample();