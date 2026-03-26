# 🚀 GitHub Actions Benchmark

This repository includes a GitHub Action workflow to run the Doxiny validation benchmark on-demand in the cloud.

## How to Run

1. **Go to the Actions tab** in your GitHub repository
2. **Select "🔬 Doxiny Validation Benchmark"** from the left sidebar
3. **Click "Run workflow"** button (top right)
4. **Choose your benchmark configuration:**

### Benchmark Types

| Type       | Range       | Numbers  | Runtime        | Best For           |
| ---------- | ----------- | -------- | -------------- | ------------------ |
| **Small**  | 2-100       | 99       | ~30 seconds    | Quick testing      |
| **Medium** | 2-1,000     | 999      | ~2-5 minutes   | Balanced analysis  |
| **Full**   | 2-10,000    | 9,999    | ~10-30 minutes | Comprehensive data |
| **Custom** | Your choice | Variable | Variable       | Targeted testing   |

### Custom Configuration

When selecting "Custom", you can specify:

- **Start Number**: Starting number for the range (minimum: 2)
- **End Number**: Ending number for the range
- **Max Moves**: Maximum moves allowed for validation (default: 30)

**Limits for Custom:**

- Maximum range size: 50,000 numbers
- Start must be less than end number
- All values must be positive integers

## What You Get

### During the Run

- Real-time progress output in the job logs
- Performance comparison between lazy vs greedy validation
- Detailed statistics and algorithm usage

### After Completion

- **Job Summary**: Overview with key metrics and recommendations
- **Downloadable Artifacts**: Benchmark script and documentation (kept for 30 days)
- **Complete Results**: Full analysis output available in the job logs

### Sample Results

The benchmark provides:

- ⚡ **Performance**: Speed improvements and timing data
- ✅ **Quality**: Solution optimality and consistency metrics
- 🧪 **Analysis**: Algorithm usage patterns
- 🎯 **Recommendations**: Which approach to use when

## Use Cases

- **Performance Testing**: Compare validation approaches before deployment
- **Algorithm Analysis**: Understand which solving strategies are most effective
- **Regression Testing**: Ensure changes don't affect benchmark performance
- **Research**: Gather data on exercise generation efficiency

## Tips

- Start with **Small** to verify everything works
- Use **Medium** for regular performance monitoring
- Run **Full** for comprehensive analysis before major releases
- Use **Custom** to focus on specific problem ranges

## Permissions

Only repository collaborators can trigger the workflow. The workflow runs on GitHub's Ubuntu runners and typically completes within the allocated time limits.
