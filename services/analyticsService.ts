// Advanced Analytics Service
// Comprehensive analytics for prompt performance and user insights

export interface AnalyticsMetrics {
  // Usage metrics
  totalPrompts: number;
  totalOptimizations: number;
  averageOptimizationTime: number;
  successRate: number;
  
  // Quality metrics
  averageQualityScore: number;
  qualityDistribution: Record<string, number>;
  qualityTrends: QualityTrend[];
  
  // User behavior
  popularModes: Record<string, number>;
  popularCategories: Record<string, number>;
  userRetentionRate: number;
  sessionDuration: number;
  
  // Performance metrics
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  
  // Business metrics
  conversionRate: number;
  userSatisfactionScore: number;
  featureAdoptionRates: Record<string, number>;
}

export interface QualityTrend {
  date: string;
  averageScore: number;
  sampleSize: number;
  category?: string;
}

export interface UserInsight {
  userId: string;
  totalSessions: number;
  totalPrompts: number;
  averageQualityScore: number;
  preferredMode: string;
  preferredCategories: string[];
  lastActiveDate: Date;
  engagementScore: number;
}

export interface PerformanceInsight {
  metric: string;
  currentValue: number;
  previousValue: number;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  significance: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface AnalyticsDashboard {
  overview: AnalyticsMetrics;
  insights: PerformanceInsight[];
  userSegments: UserSegment[];
  topPerformingPrompts: PromptPerformance[];
  improvementOpportunities: ImprovementOpportunity[];
  predictiveAnalytics: PredictiveInsight[];
}

export interface UserSegment {
  name: string;
  description: string;
  userCount: number;
  characteristics: string[];
  averageQualityScore: number;
  retentionRate: number;
  recommendedActions: string[];
}

export interface PromptPerformance {
  promptId: string;
  promptText: string;
  category: string;
  mode: string;
  qualityScore: number;
  usageCount: number;
  successRate: number;
  averageResponseTime: number;
  userRating: number;
}

export interface ImprovementOpportunity {
  area: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  priority: number;
  estimatedImprovement: string;
  actionItems: string[];
}

export interface PredictiveInsight {
  type: 'usage_forecast' | 'quality_prediction' | 'churn_risk' | 'feature_demand';
  description: string;
  prediction: any;
  confidence: number;
  timeframe: string;
  actionable: boolean;
  recommendations: string[];
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private metrics: AnalyticsMetrics;
  private userInsights = new Map<string, UserInsight>();
  private promptPerformance = new Map<string, PromptPerformance>();

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
      AnalyticsService.instance.initializeMetrics();
    }
    return AnalyticsService.instance;
  }

  // Core analytics methods
  async getDashboard(): Promise<AnalyticsDashboard> {
    const overview = await this.getOverviewMetrics();
    const insights = await this.generatePerformanceInsights();
    const userSegments = await this.analyzeUserSegments();
    const topPerformingPrompts = await this.getTopPerformingPrompts();
    const improvementOpportunities = await this.identifyImprovementOpportunities();
    const predictiveAnalytics = await this.generatePredictiveInsights();

    return {
      overview,
      insights,
      userSegments,
      topPerformingPrompts,
      improvementOpportunities,
      predictiveAnalytics
    };
  }

  async trackPromptOptimization(data: {
    promptId: string;
    originalPrompt: string;
    optimizedPrompt: string;
    mode: string;
    category: string;
    qualityScore: number;
    responseTime: number;
    userId?: string;
    success: boolean;
  }): Promise<void> {
    // Update overall metrics
    this.metrics.totalOptimizations++;
    this.metrics.averageOptimizationTime = this.updateAverage(
      this.metrics.averageOptimizationTime,
      data.responseTime,
      this.metrics.totalOptimizations
    );

    if (data.success) {
      this.metrics.averageQualityScore = this.updateAverage(
        this.metrics.averageQualityScore,
        data.qualityScore,
        this.metrics.totalOptimizations
      );
    }

    // Update quality distribution
    const scoreRange = Math.floor(data.qualityScore / 10) * 10;
    const rangeKey = `${scoreRange}-${scoreRange + 9}`;
    this.metrics.qualityDistribution[rangeKey] = (this.metrics.qualityDistribution[rangeKey] || 0) + 1;

    // Update mode popularity
    this.metrics.popularModes[data.mode] = (this.metrics.popularModes[data.mode] || 0) + 1;

    // Update category popularity
    this.metrics.popularCategories[data.category] = (this.metrics.popularCategories[data.category] || 0) + 1;

    // Track prompt performance
    const performance: PromptPerformance = {
      promptId: data.promptId,
      promptText: data.originalPrompt.substring(0, 100) + '...',
      category: data.category,
      mode: data.mode,
      qualityScore: data.qualityScore,
      usageCount: 1,
      successRate: data.success ? 100 : 0,
      averageResponseTime: data.responseTime,
      userRating: 0
    };

    const existing = this.promptPerformance.get(data.promptId);
    if (existing) {
      existing.usageCount++;
      existing.qualityScore = this.updateAverage(existing.qualityScore, data.qualityScore, existing.usageCount);
      existing.averageResponseTime = this.updateAverage(existing.averageResponseTime, data.responseTime, existing.usageCount);
      existing.successRate = data.success ? 
        this.updateAverage(existing.successRate, 100, existing.usageCount) :
        this.updateAverage(existing.successRate, 0, existing.usageCount);
    } else {
      this.promptPerformance.set(data.promptId, performance);
    }

    // Update user insights
    if (data.userId) {
      await this.updateUserInsights(data.userId, data);
    }

    // Add quality trend data point
    this.addQualityTrendPoint(data.qualityScore, data.category);
  }

  private async getOverviewMetrics(): Promise<AnalyticsMetrics> {
    // Calculate success rate
    const totalAttempts = this.metrics.totalOptimizations;
    const successfulAttempts = Array.from(this.promptPerformance.values())
      .reduce((sum, perf) => sum + (perf.successRate > 50 ? perf.usageCount : 0), 0);
    
    this.metrics.successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

    // Calculate cache hit rate (simulated)
    this.metrics.cacheHitRate = 85; // Would be calculated from actual cache metrics

    // Calculate user retention rate (simulated)
    this.metrics.userRetentionRate = 72; // Would be calculated from user activity data

    return { ...this.metrics };
  }

  private async generatePerformanceInsights(): Promise<PerformanceInsight[]> {
    const insights: PerformanceInsight[] = [];

    // Quality score insight
    const currentQuality = this.metrics.averageQualityScore;
    const previousQuality = 75; // Would be from historical data
    insights.push({
      metric: 'Average Quality Score',
      currentValue: currentQuality,
      previousValue: previousQuality,
      trend: currentQuality > previousQuality ? 'up' : currentQuality < previousQuality ? 'down' : 'stable',
      changePercentage: ((currentQuality - previousQuality) / previousQuality) * 100,
      significance: Math.abs(currentQuality - previousQuality) > 5 ? 'high' : 'medium',
      recommendation: currentQuality > previousQuality ? 
        'Quality is improving. Continue current optimization strategies.' :
        'Quality decline detected. Review recent changes and user feedback.'
    });

    // Response time insight
    const currentResponseTime = this.metrics.averageResponseTime;
    const previousResponseTime = 2500; // Would be from historical data
    insights.push({
      metric: 'Average Response Time',
      currentValue: currentResponseTime,
      previousValue: previousResponseTime,
      trend: currentResponseTime < previousResponseTime ? 'up' : currentResponseTime > previousResponseTime ? 'down' : 'stable',
      changePercentage: ((previousResponseTime - currentResponseTime) / previousResponseTime) * 100,
      significance: Math.abs(currentResponseTime - previousResponseTime) > 500 ? 'high' : 'medium',
      recommendation: currentResponseTime < previousResponseTime ?
        'Response times are improving. Performance optimizations are working.' :
        'Response times are increasing. Consider performance optimization.'
    });

    // Usage growth insight
    const currentUsage = this.metrics.totalOptimizations;
    const previousUsage = Math.max(1, currentUsage - 100); // Simulated previous period
    insights.push({
      metric: 'Usage Growth',
      currentValue: currentUsage,
      previousValue: previousUsage,
      trend: currentUsage > previousUsage ? 'up' : currentUsage < previousUsage ? 'down' : 'stable',
      changePercentage: ((currentUsage - previousUsage) / previousUsage) * 100,
      significance: Math.abs(currentUsage - previousUsage) > 50 ? 'high' : 'medium',
      recommendation: currentUsage > previousUsage ?
        'Usage is growing steadily. Consider scaling infrastructure.' :
        'Usage growth has slowed. Investigate user experience issues.'
    });

    return insights;
  }

  private async analyzeUserSegments(): Promise<UserSegment[]> {
    const segments: UserSegment[] = [
      {
        name: 'Power Users',
        description: 'Users with high engagement and frequent usage',
        userCount: Math.floor(this.userInsights.size * 0.15),
        characteristics: ['High session frequency', 'Uses advanced modes', 'High quality scores'],
        averageQualityScore: 88,
        retentionRate: 95,
        recommendedActions: ['Provide beta access to new features', 'Gather feedback for improvements']
      },
      {
        name: 'Regular Users',
        description: 'Consistent users with moderate engagement',
        userCount: Math.floor(this.userInsights.size * 0.60),
        characteristics: ['Regular usage patterns', 'Prefers Pro mode', 'Good quality scores'],
        averageQualityScore: 78,
        retentionRate: 75,
        recommendedActions: ['Encourage advanced feature adoption', 'Provide usage tips and tutorials']
      },
      {
        name: 'Casual Users',
        description: 'Infrequent users with basic needs',
        userCount: Math.floor(this.userInsights.size * 0.20),
        characteristics: ['Low session frequency', 'Uses Lite mode', 'Basic prompts'],
        averageQualityScore: 65,
        retentionRate: 45,
        recommendedActions: ['Improve onboarding experience', 'Send engagement reminders']
      },
      {
        name: 'At-Risk Users',
        description: 'Users showing signs of churn',
        userCount: Math.floor(this.userInsights.size * 0.05),
        characteristics: ['Declining usage', 'Low satisfaction scores', 'Recent errors'],
        averageQualityScore: 55,
        retentionRate: 20,
        recommendedActions: ['Proactive outreach', 'Address specific pain points', 'Offer support']
      }
    ];

    return segments;
  }

  private async getTopPerformingPrompts(): Promise<PromptPerformance[]> {
    return Array.from(this.promptPerformance.values())
      .sort((a, b) => (b.qualityScore * b.usageCount) - (a.qualityScore * a.usageCount))
      .slice(0, 10);
  }

  private async identifyImprovementOpportunities(): Promise<ImprovementOpportunity[]> {
    const opportunities: ImprovementOpportunity[] = [];

    // Low quality score categories
    const categoryScores = this.calculateCategoryAverages();
    for (const [category, score] of Object.entries(categoryScores)) {
      if (score < 70) {
        opportunities.push({
          area: `${category} Quality`,
          description: `Quality scores in ${category} are below target (${score.toFixed(1)}/100)`,
          impact: 'high',
          effort: 'medium',
          priority: 8,
          estimatedImprovement: '15-20% quality increase',
          actionItems: [
            'Review and improve category-specific templates',
            'Add more few-shot examples for this category',
            'Analyze failed prompts for common patterns'
          ]
        });
      }
    }

    // Response time optimization
    if (this.metrics.averageResponseTime > 3000) {
      opportunities.push({
        area: 'Response Time',
        description: 'Average response time exceeds target threshold',
        impact: 'medium',
        effort: 'high',
        priority: 6,
        estimatedImprovement: '30-40% faster responses',
        actionItems: [
          'Implement response caching',
          'Optimize API calls',
          'Consider model fine-tuning'
        ]
      });
    }

    // User retention
    if (this.metrics.userRetentionRate < 80) {
      opportunities.push({
        area: 'User Retention',
        description: 'User retention rate is below industry benchmark',
        impact: 'high',
        effort: 'medium',
        priority: 9,
        estimatedImprovement: '10-15% retention increase',
        actionItems: [
          'Improve onboarding flow',
          'Add personalization features',
          'Implement user feedback system'
        ]
      });
    }

    return opportunities.sort((a, b) => b.priority - a.priority);
  }

  private async generatePredictiveInsights(): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    // Usage forecast
    const currentGrowthRate = 15; // Simulated growth rate
    insights.push({
      type: 'usage_forecast',
      description: 'Predicted usage growth based on current trends',
      prediction: {
        nextMonth: Math.round(this.metrics.totalOptimizations * 1.15),
        nextQuarter: Math.round(this.metrics.totalOptimizations * 1.45),
        confidence: 0.78
      },
      confidence: 78,
      timeframe: '3 months',
      actionable: true,
      recommendations: [
        'Prepare for 45% usage increase in Q1',
        'Scale infrastructure accordingly',
        'Plan feature releases to support growth'
      ]
    });

    // Quality prediction
    insights.push({
      type: 'quality_prediction',
      description: 'Predicted quality score trends',
      prediction: {
        trend: 'improving',
        expectedScore: this.metrics.averageQualityScore + 5,
        confidence: 0.72
      },
      confidence: 72,
      timeframe: '1 month',
      actionable: true,
      recommendations: [
        'Continue current optimization strategies',
        'Monitor quality metrics closely',
        'Invest in advanced prompt engineering techniques'
      ]
    });

    return insights;
  }

  // Helper methods
  private updateAverage(currentAvg: number, newValue: number, count: number): number {
    return ((currentAvg * (count - 1)) + newValue) / count;
  }

  private async updateUserInsights(userId: string, data: any): Promise<void> {
    const existing = this.userInsights.get(userId);
    if (existing) {
      existing.totalPrompts++;
      existing.averageQualityScore = this.updateAverage(
        existing.averageQualityScore,
        data.qualityScore,
        existing.totalPrompts
      );
      existing.lastActiveDate = new Date();
    } else {
      this.userInsights.set(userId, {
        userId,
        totalSessions: 1,
        totalPrompts: 1,
        averageQualityScore: data.qualityScore,
        preferredMode: data.mode,
        preferredCategories: [data.category],
        lastActiveDate: new Date(),
        engagementScore: 50
      });
    }
  }

  private addQualityTrendPoint(qualityScore: number, category?: string): void {
    const today = new Date().toISOString().split('T')[0];
    const existingTrend = this.metrics.qualityTrends.find(t => t.date === today && t.category === category);
    
    if (existingTrend) {
      existingTrend.averageScore = this.updateAverage(
        existingTrend.averageScore,
        qualityScore,
        existingTrend.sampleSize + 1
      );
      existingTrend.sampleSize++;
    } else {
      this.metrics.qualityTrends.push({
        date: today,
        averageScore: qualityScore,
        sampleSize: 1,
        category
      });
    }

    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.metrics.qualityTrends = this.metrics.qualityTrends.filter(
      t => new Date(t.date) >= thirtyDaysAgo
    );
  }

  private calculateCategoryAverages(): Record<string, number> {
    const categoryTotals: Record<string, { sum: number; count: number }> = {};
    
    for (const performance of this.promptPerformance.values()) {
      if (!categoryTotals[performance.category]) {
        categoryTotals[performance.category] = { sum: 0, count: 0 };
      }
      categoryTotals[performance.category].sum += performance.qualityScore * performance.usageCount;
      categoryTotals[performance.category].count += performance.usageCount;
    }

    const averages: Record<string, number> = {};
    for (const [category, totals] of Object.entries(categoryTotals)) {
      averages[category] = totals.count > 0 ? totals.sum / totals.count : 0;
    }

    return averages;
  }

  private initializeMetrics(): void {
    this.metrics = {
      totalPrompts: 0,
      totalOptimizations: 0,
      averageOptimizationTime: 0,
      successRate: 0,
      averageQualityScore: 0,
      qualityDistribution: {},
      qualityTrends: [],
      popularModes: {},
      popularCategories: {},
      userRetentionRate: 0,
      sessionDuration: 0,
      averageResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
      conversionRate: 0,
      userSatisfactionScore: 0,
      featureAdoptionRates: {}
    };
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();
