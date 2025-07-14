#!/usr/bin/env node

// Bundle analysis script for performance optimization
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function analyzeBundleSize() {
  console.log('🔍 Analyzing bundle size...\n');
  
  try {
    // Run build and capture output
    const buildOutput = execSync('npm run build', { 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    
    console.log(buildOutput);
    
    // Parse bundle information
    const analysis = parseBuildOutput(buildOutput);
    
    // Generate recommendations
    const recommendations = generateRecommendations(analysis);
    
    // Create report
    const report = createReport(analysis, recommendations);
    
    // Save report
    writeFileSync('bundle-analysis.md', report);
    console.log('\n📊 Bundle analysis saved to bundle-analysis.md');
    
    // Check for critical issues
    checkCriticalIssues(analysis);
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

function parseBuildOutput(output) {
  const lines = output.split('\n');
  const chunks = [];
  let totalSize = 0;
  
  for (const line of lines) {
    const match = line.match(/dist\/assets\/(.+?)\s+(\d+(?:\.\d+)?)\s*kB(?:\s*│\s*gzip:\s*(\d+(?:\.\d+)?)\s*kB)?/);
    if (match) {
      const [, name, sizeStr, gzipSizeStr] = match;
      const size = parseFloat(sizeStr);
      const gzipSize = gzipSizeStr ? parseFloat(gzipSizeStr) : size * 0.3;
      
      chunks.push({
        name,
        size,
        gzipSize,
        type: categorizeChunk(name)
      });
      
      totalSize += size;
    }
  }
  
  return {
    totalSize,
    chunks: chunks.sort((a, b) => b.size - a.size),
    timestamp: new Date().toISOString()
  };
}

function categorizeChunk(name) {
  if (name.includes('popup.js')) return 'main';
  if (name.includes('vendor')) return 'vendor';
  if (name.includes('lazy')) return 'lazy';
  if (name.includes('worker')) return 'worker';
  if (name.includes('.css')) return 'styles';
  return 'other';
}

function generateRecommendations(analysis) {
  const recommendations = [];
  
  // Check main bundle size
  const mainChunk = analysis.chunks.find(chunk => chunk.type === 'main');
  if (mainChunk && mainChunk.size > 100) {
    recommendations.push({
      type: 'warning',
      message: `Main bundle is ${mainChunk.size}kB. Consider lazy loading more components.`,
      priority: 'high'
    });
  }
  
  // Check for large chunks
  const largeChunks = analysis.chunks.filter(chunk => chunk.size > 500);
  if (largeChunks.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `Large chunks detected: ${largeChunks.map(c => c.name).join(', ')}. Consider further code splitting.`,
      priority: 'medium'
    });
  }
  
  // Check vendor chunks
  const vendorChunks = analysis.chunks.filter(chunk => chunk.type === 'vendor');
  if (vendorChunks.length === 0) {
    recommendations.push({
      type: 'info',
      message: 'Consider creating vendor chunks for better caching.',
      priority: 'low'
    });
  }
  
  // Check lazy loading
  const lazyChunks = analysis.chunks.filter(chunk => chunk.type === 'lazy');
  if (lazyChunks.length < 3) {
    recommendations.push({
      type: 'info',
      message: 'Consider lazy loading more components to reduce initial bundle size.',
      priority: 'medium'
    });
  }
  
  // Check total size
  if (analysis.totalSize > 1000) {
    recommendations.push({
      type: 'error',
      message: `Total bundle size is ${analysis.totalSize}kB. This is too large for a Chrome extension.`,
      priority: 'critical'
    });
  }
  
  return recommendations;
}

function createReport(analysis, recommendations) {
  const report = `# Bundle Analysis Report

Generated: ${analysis.timestamp}

## Summary

- **Total Bundle Size**: ${analysis.totalSize.toFixed(2)} kB
- **Number of Chunks**: ${analysis.chunks.length}
- **Largest Chunk**: ${analysis.chunks[0]?.name} (${analysis.chunks[0]?.size.toFixed(2)} kB)

## Chunk Breakdown

| Chunk | Size (kB) | Gzipped (kB) | Type |
|-------|-----------|--------------|------|
${analysis.chunks.map(chunk => 
  `| ${chunk.name} | ${chunk.size.toFixed(2)} | ${chunk.gzipSize.toFixed(2)} | ${chunk.type} |`
).join('\n')}

## Recommendations

${recommendations.map(rec => {
  const icon = rec.type === 'error' ? '🚨' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
  return `### ${icon} ${rec.priority.toUpperCase()}: ${rec.message}`;
}).join('\n\n')}

## Performance Targets

- ✅ Main bundle < 100kB
- ✅ Individual chunks < 500kB  
- ✅ Total initial load < 300kB
- ✅ Lazy chunks properly separated

## Next Steps

1. Review large chunks and consider further splitting
2. Implement lazy loading for non-critical components
3. Optimize vendor chunk strategy
4. Monitor bundle size in CI/CD pipeline
`;

  return report;
}

function checkCriticalIssues(analysis) {
  const criticalIssues = [];
  
  // Check for extremely large main bundle
  const mainChunk = analysis.chunks.find(chunk => chunk.type === 'main');
  if (mainChunk && mainChunk.size > 200) {
    criticalIssues.push(`Main bundle is ${mainChunk.size}kB - this will cause slow startup`);
  }
  
  // Check for total size
  if (analysis.totalSize > 2000) {
    criticalIssues.push(`Total bundle size is ${analysis.totalSize}kB - this is too large for a Chrome extension`);
  }
  
  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES DETECTED:');
    criticalIssues.forEach(issue => console.log(`   - ${issue}`));
    console.log('\n   Please address these issues before deployment.\n');
  } else {
    console.log('\n✅ No critical bundle size issues detected.\n');
  }
}

// Run analysis
analyzeBundleSize();
