# Doxiny Lazy vs Greedy Benchmark

This benchmark compares the performance and result quality between lazy and greedy validation approaches in the exercise generator.

## What it tests

- **Lazy validation**: Returns first valid solution found (fast)
- **Greedy validation**: Finds all solutions, returns optimal one (thorough)

## Quick Start

### Local Testing

```bash
# Test small range (2-100) - quick test
npm run benchmark:small

# Test medium range (2-1000) - moderate test
npm run benchmark:medium

# Test full range (2-10000) - comprehensive test (may take several minutes)
npm run benchmark

# Custom range
START_NUMBER=50 END_NUMBER=500 npm run benchmark
```

### GitHub Actions (Recommended)

For cloud-based benchmarking with artifact storage:

1. Go to **Actions** tab in GitHub repository
2. Select **"🔬 Doxiny Validation Benchmark"**
3. Click **"Run workflow"** and choose your configuration
4. View results in job logs and download artifacts

See [GitHub Actions Benchmark Guide](.github/BENCHMARK_ACTION.md) for detailed instructions.

## Environment Variables

- `START_NUMBER`: Starting number (default: 2)
- `END_NUMBER`: Ending number (default: 10000)
- `MAX_MOVES`: Maximum moves for validation (default: 30)

## Sample Output

The benchmark provides:

- **Performance comparison**: Total time, average time per number, speed improvement
- **Solvability comparison**: Success rates, error counts
- **Solution quality**: Move efficiency, algorithm usage
- **Recommendations**: Which approach to use when

## Expected Results

Based on the algorithm design:

- **Lazy should be faster**: Early exit saves computation
- **Quality should be similar**: Both find valid solutions
- **Greedy may be slightly better**: Explores all options for optimal path

## Interpreting Results

- **Speed improvement >1.5x**: Lazy provides significant performance benefit
- **Move difference <0.5**: Solution quality is essentially the same
- **Same solutions >90%**: Methods are highly consistent

Use this data to decide when to use lazy vs greedy validation in your application.
