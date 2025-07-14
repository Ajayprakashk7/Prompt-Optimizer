// Neural Prompt Evolution Service
// Revolutionary genetic algorithm-based prompt optimization system

export interface PromptGene {
  id: string;
  type: 'persona' | 'instruction' | 'structure' | 'reasoning' | 'example' | 'constraint';
  content: string;
  weight: number; // 0-1, importance in the prompt
  effectiveness: number; // 0-100, measured performance
  mutationRate: number; // 0-1, likelihood of mutation
}

export interface PromptChromosome {
  id: string;
  genes: PromptGene[];
  fitness: number; // 0-100, overall quality score
  generation: number;
  parentIds: string[];
  mutations: number;
  prompt: string; // Assembled prompt from genes
}

export interface EvolutionConfig {
  populationSize: number;
  maxGenerations: number;
  mutationRate: number;
  crossoverRate: number;
  elitismRate: number; // Percentage of top performers to keep
  fitnessThreshold: number; // Stop when this fitness is reached
  diversityWeight: number; // 0-1, importance of genetic diversity
}

export interface EvolutionResult {
  bestChromosome: PromptChromosome;
  evolutionHistory: GenerationStats[];
  totalGenerations: number;
  convergenceReached: boolean;
  finalPopulation: PromptChromosome[];
  insights: EvolutionInsight[];
}

export interface GenerationStats {
  generation: number;
  bestFitness: number;
  averageFitness: number;
  diversityScore: number;
  mutations: number;
  crossovers: number;
  timestamp: Date;
}

export interface EvolutionInsight {
  type: 'gene_effectiveness' | 'structure_pattern' | 'convergence_pattern' | 'diversity_impact';
  description: string;
  data: any;
  significance: number; // 0-100
}

export class NeuralPromptEvolutionService {
  private static instance: NeuralPromptEvolutionService;
  private genePool: PromptGene[] = [];
  private evolutionHistory: EvolutionResult[] = [];

  static getInstance(): NeuralPromptEvolutionService {
    if (!NeuralPromptEvolutionService.instance) {
      NeuralPromptEvolutionService.instance = new NeuralPromptEvolutionService();
      NeuralPromptEvolutionService.instance.initializeGenePool();
    }
    return NeuralPromptEvolutionService.instance;
  }

  // Main evolution process
  async evolvePrompt(
    objective: string,
    config: Partial<EvolutionConfig> = {}
  ): Promise<EvolutionResult> {
    const evolutionConfig: EvolutionConfig = {
      populationSize: 50,
      maxGenerations: 20,
      mutationRate: 0.1,
      crossoverRate: 0.8,
      elitismRate: 0.2,
      fitnessThreshold: 95,
      diversityWeight: 0.3,
      ...config
    };

    // Initialize population
    let population = await this.initializePopulation(objective, evolutionConfig.populationSize);
    const evolutionHistory: GenerationStats[] = [];
    let generation = 0;
    let convergenceReached = false;

    console.log(`🧬 Starting prompt evolution for: "${objective}"`);
    console.log(`📊 Population: ${evolutionConfig.populationSize}, Max Generations: ${evolutionConfig.maxGenerations}`);

    while (generation < evolutionConfig.maxGenerations && !convergenceReached) {
      // Evaluate fitness for all chromosomes
      await this.evaluatePopulation(population, objective);

      // Record generation statistics
      const stats = this.calculateGenerationStats(population, generation);
      evolutionHistory.push(stats);

      console.log(`🔬 Generation ${generation}: Best=${stats.bestFitness.toFixed(1)}, Avg=${stats.averageFitness.toFixed(1)}, Diversity=${stats.diversityScore.toFixed(2)}`);

      // Check convergence
      if (stats.bestFitness >= evolutionConfig.fitnessThreshold) {
        convergenceReached = true;
        console.log(`🎯 Convergence reached! Fitness threshold ${evolutionConfig.fitnessThreshold} achieved.`);
        break;
      }

      // Create next generation
      population = await this.createNextGeneration(population, evolutionConfig);
      generation++;
    }

    // Final evaluation
    await this.evaluatePopulation(population, objective);
    population.sort((a, b) => b.fitness - a.fitness);

    const result: EvolutionResult = {
      bestChromosome: population[0],
      evolutionHistory,
      totalGenerations: generation,
      convergenceReached,
      finalPopulation: population.slice(0, 10), // Top 10
      insights: this.generateEvolutionInsights(evolutionHistory, population)
    };

    this.evolutionHistory.push(result);
    console.log(`🏆 Evolution complete! Best fitness: ${result.bestChromosome.fitness.toFixed(1)}`);

    return result;
  }

  // Initialize population with diverse chromosomes
  private async initializePopulation(objective: string, size: number): Promise<PromptChromosome[]> {
    const population: PromptChromosome[] = [];

    for (let i = 0; i < size; i++) {
      const chromosome = await this.createRandomChromosome(objective, 0);
      population.push(chromosome);
    }

    return population;
  }

  // Create a random chromosome
  private async createRandomChromosome(objective: string, generation: number): Promise<PromptChromosome> {
    const genes: PromptGene[] = [];

    // Always include essential genes
    genes.push(this.selectRandomGene('persona'));
    genes.push(this.selectRandomGene('instruction'));
    genes.push(this.selectRandomGene('structure'));

    // Randomly add optional genes
    if (Math.random() > 0.5) genes.push(this.selectRandomGene('reasoning'));
    if (Math.random() > 0.6) genes.push(this.selectRandomGene('example'));
    if (Math.random() > 0.7) genes.push(this.selectRandomGene('constraint'));

    const chromosome: PromptChromosome = {
      id: this.generateChromosomeId(),
      genes,
      fitness: 0,
      generation,
      parentIds: [],
      mutations: 0,
      prompt: this.assemblePrompt(genes, objective)
    };

    return chromosome;
  }

  // Evaluate fitness of entire population
  private async evaluatePopulation(population: PromptChromosome[], objective: string): Promise<void> {
    const evaluationPromises = population.map(chromosome => this.evaluateFitness(chromosome, objective));
    await Promise.all(evaluationPromises);
  }

  // Evaluate fitness of a single chromosome
  private async evaluateFitness(chromosome: PromptChromosome, objective: string): Promise<void> {
    // Simulate fitness evaluation (would use actual AI model in production)
    let fitness = 50; // Base fitness

    // Evaluate based on gene composition
    const geneTypes = chromosome.genes.map(g => g.type);
    
    // Bonus for essential components
    if (geneTypes.includes('persona')) fitness += 15;
    if (geneTypes.includes('instruction')) fitness += 15;
    if (geneTypes.includes('structure')) fitness += 10;
    if (geneTypes.includes('reasoning')) fitness += 10;

    // Bonus for gene effectiveness
    const avgGeneEffectiveness = chromosome.genes.reduce((sum, gene) => sum + gene.effectiveness, 0) / chromosome.genes.length;
    fitness += avgGeneEffectiveness * 0.3;

    // Penalty for too many or too few genes
    if (chromosome.genes.length < 3) fitness -= 20;
    if (chromosome.genes.length > 8) fitness -= 10;

    // Bonus for prompt length optimization
    const promptLength = chromosome.prompt.length;
    if (promptLength > 500 && promptLength < 2000) fitness += 5;

    // Random variation to simulate real-world testing
    fitness += (Math.random() - 0.5) * 10;

    chromosome.fitness = Math.max(0, Math.min(100, fitness));
  }

  // Create next generation through selection, crossover, and mutation
  private async createNextGeneration(
    population: PromptChromosome[], 
    config: EvolutionConfig
  ): Promise<PromptChromosome[]> {
    // Sort by fitness
    population.sort((a, b) => b.fitness - a.fitness);

    const nextGeneration: PromptChromosome[] = [];
    const eliteCount = Math.floor(population.length * config.elitismRate);

    // Elitism: Keep top performers
    for (let i = 0; i < eliteCount; i++) {
      const elite = { ...population[i] };
      elite.generation++;
      nextGeneration.push(elite);
    }

    // Fill rest through crossover and mutation
    while (nextGeneration.length < population.length) {
      if (Math.random() < config.crossoverRate) {
        // Crossover
        const parent1 = this.selectParent(population);
        const parent2 = this.selectParent(population);
        const offspring = await this.crossover(parent1, parent2);
        
        if (Math.random() < config.mutationRate) {
          await this.mutate(offspring);
        }
        
        nextGeneration.push(offspring);
      } else {
        // Mutation only
        const parent = this.selectParent(population);
        const offspring = { ...parent };
        offspring.id = this.generateChromosomeId();
        offspring.generation++;
        await this.mutate(offspring);
        nextGeneration.push(offspring);
      }
    }

    return nextGeneration;
  }

  // Tournament selection for parent selection
  private selectParent(population: PromptChromosome[]): PromptChromosome {
    const tournamentSize = 3;
    const tournament = [];
    
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]);
    }
    
    tournament.sort((a, b) => b.fitness - a.fitness);
    return tournament[0];
  }

  // Crossover operation
  private async crossover(parent1: PromptChromosome, parent2: PromptChromosome): Promise<PromptChromosome> {
    const genes: PromptGene[] = [];
    const allGenes = [...parent1.genes, ...parent2.genes];
    const geneTypes = new Set<string>();

    // Ensure essential genes are included
    const essentialTypes = ['persona', 'instruction', 'structure'];
    for (const type of essentialTypes) {
      const candidates = allGenes.filter(g => g.type === type);
      if (candidates.length > 0) {
        const selected = candidates[Math.floor(Math.random() * candidates.length)];
        genes.push({ ...selected, id: this.generateGeneId() });
        geneTypes.add(type);
      }
    }

    // Add other genes randomly
    const otherGenes = allGenes.filter(g => !geneTypes.has(g.type));
    for (const gene of otherGenes) {
      if (Math.random() > 0.5 && genes.length < 8) {
        genes.push({ ...gene, id: this.generateGeneId() });
      }
    }

    const offspring: PromptChromosome = {
      id: this.generateChromosomeId(),
      genes,
      fitness: 0,
      generation: Math.max(parent1.generation, parent2.generation) + 1,
      parentIds: [parent1.id, parent2.id],
      mutations: 0,
      prompt: this.assemblePrompt(genes, 'crossover_objective')
    };

    return offspring;
  }

  // Mutation operation
  private async mutate(chromosome: PromptChromosome): Promise<void> {
    const mutationType = Math.random();
    
    if (mutationType < 0.3) {
      // Gene replacement mutation
      if (chromosome.genes.length > 0) {
        const randomIndex = Math.floor(Math.random() * chromosome.genes.length);
        const oldType = chromosome.genes[randomIndex].type;
        chromosome.genes[randomIndex] = this.selectRandomGene(oldType);
        chromosome.mutations++;
      }
    } else if (mutationType < 0.6) {
      // Gene addition mutation
      if (chromosome.genes.length < 8) {
        const newGene = this.selectRandomGene();
        chromosome.genes.push(newGene);
        chromosome.mutations++;
      }
    } else {
      // Gene removal mutation
      if (chromosome.genes.length > 3) {
        const randomIndex = Math.floor(Math.random() * chromosome.genes.length);
        chromosome.genes.splice(randomIndex, 1);
        chromosome.mutations++;
      }
    }

    // Reassemble prompt
    chromosome.prompt = this.assemblePrompt(chromosome.genes, 'mutation_objective');
  }

  // Select random gene from pool
  private selectRandomGene(type?: string): PromptGene {
    const candidates = type ? 
      this.genePool.filter(g => g.type === type) : 
      this.genePool;
    
    if (candidates.length === 0) {
      return this.createDefaultGene(type || 'instruction');
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    const selected = candidates[randomIndex];
    
    return {
      ...selected,
      id: this.generateGeneId(),
      weight: Math.random(),
      mutationRate: 0.1 + Math.random() * 0.1
    };
  }

  // Assemble prompt from genes
  private assemblePrompt(genes: PromptGene[], objective: string): string {
    const sections: string[] = [];

    // Sort genes by type priority
    const typePriority = { persona: 1, instruction: 2, structure: 3, reasoning: 4, example: 5, constraint: 6 };
    const sortedGenes = genes.sort((a, b) => 
      (typePriority[a.type as keyof typeof typePriority] || 7) - 
      (typePriority[b.type as keyof typeof typePriority] || 7)
    );

    for (const gene of sortedGenes) {
      sections.push(gene.content);
    }

    return sections.join('\n\n');
  }

  // Calculate generation statistics
  private calculateGenerationStats(population: PromptChromosome[], generation: number): GenerationStats {
    const fitnesses = population.map(c => c.fitness);
    const bestFitness = Math.max(...fitnesses);
    const averageFitness = fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length;
    
    // Calculate diversity score
    const diversityScore = this.calculateDiversityScore(population);
    
    const mutations = population.reduce((sum, c) => sum + c.mutations, 0);
    const crossovers = population.filter(c => c.parentIds.length > 0).length;

    return {
      generation,
      bestFitness,
      averageFitness,
      diversityScore,
      mutations,
      crossovers,
      timestamp: new Date()
    };
  }

  // Calculate genetic diversity
  private calculateDiversityScore(population: PromptChromosome[]): number {
    const geneSignatures = population.map(c => 
      c.genes.map(g => g.type).sort().join(',')
    );
    
    const uniqueSignatures = new Set(geneSignatures);
    return uniqueSignatures.size / population.length;
  }

  // Generate evolution insights
  private generateEvolutionInsights(
    history: GenerationStats[], 
    finalPopulation: PromptChromosome[]
  ): EvolutionInsight[] {
    const insights: EvolutionInsight[] = [];

    // Convergence pattern analysis
    const fitnessProgression = history.map(h => h.bestFitness);
    const improvement = fitnessProgression[fitnessProgression.length - 1] - fitnessProgression[0];
    
    insights.push({
      type: 'convergence_pattern',
      description: `Evolution improved fitness by ${improvement.toFixed(1)} points over ${history.length} generations`,
      data: { improvement, generations: history.length, finalFitness: fitnessProgression[fitnessProgression.length - 1] },
      significance: Math.min(100, improvement * 2)
    });

    // Gene effectiveness analysis
    const allGenes = finalPopulation.flatMap(c => c.genes);
    const geneTypeEffectiveness: Record<string, number[]> = {};
    
    for (const gene of allGenes) {
      if (!geneTypeEffectiveness[gene.type]) {
        geneTypeEffectiveness[gene.type] = [];
      }
      geneTypeEffectiveness[gene.type].push(gene.effectiveness);
    }

    const avgEffectiveness: Record<string, number> = {};
    for (const [type, values] of Object.entries(geneTypeEffectiveness)) {
      avgEffectiveness[type] = values.reduce((a, b) => a + b, 0) / values.length;
    }

    insights.push({
      type: 'gene_effectiveness',
      description: 'Analysis of gene type effectiveness in final population',
      data: avgEffectiveness,
      significance: 80
    });

    // Diversity impact analysis
    const diversityTrend = history.map(h => h.diversityScore);
    const avgDiversity = diversityTrend.reduce((a, b) => a + b, 0) / diversityTrend.length;
    
    insights.push({
      type: 'diversity_impact',
      description: `Average genetic diversity maintained at ${(avgDiversity * 100).toFixed(1)}%`,
      data: { averageDiversity: avgDiversity, trend: diversityTrend },
      significance: avgDiversity > 0.5 ? 90 : 60
    });

    return insights;
  }

  // Initialize gene pool with diverse genetic material
  private initializeGenePool(): void {
    // Persona genes
    this.genePool.push(
      { id: 'persona_1', type: 'persona', content: 'Act as a senior expert with 15+ years of experience', weight: 0.9, effectiveness: 85, mutationRate: 0.1 },
      { id: 'persona_2', type: 'persona', content: 'You are a world-class specialist and thought leader', weight: 0.8, effectiveness: 90, mutationRate: 0.1 },
      { id: 'persona_3', type: 'persona', content: 'Take the role of an innovative problem-solver', weight: 0.7, effectiveness: 75, mutationRate: 0.15 }
    );

    // Instruction genes
    this.genePool.push(
      { id: 'inst_1', type: 'instruction', content: 'Analyze this systematically and provide comprehensive insights', weight: 0.8, effectiveness: 80, mutationRate: 0.1 },
      { id: 'inst_2', type: 'instruction', content: 'Think step by step and explain your reasoning', weight: 0.9, effectiveness: 88, mutationRate: 0.1 },
      { id: 'inst_3', type: 'instruction', content: 'Provide actionable recommendations with clear rationale', weight: 0.7, effectiveness: 82, mutationRate: 0.12 }
    );

    // Structure genes
    this.genePool.push(
      { id: 'struct_1', type: 'structure', content: 'Organize your response with clear headings and bullet points', weight: 0.6, effectiveness: 75, mutationRate: 0.1 },
      { id: 'struct_2', type: 'structure', content: 'Use a logical framework: Analysis → Strategy → Implementation', weight: 0.8, effectiveness: 85, mutationRate: 0.1 },
      { id: 'struct_3', type: 'structure', content: 'Structure as: Problem → Solution → Validation → Next Steps', weight: 0.7, effectiveness: 80, mutationRate: 0.1 }
    );

    // Reasoning genes
    this.genePool.push(
      { id: 'reason_1', type: 'reasoning', content: 'Apply chain-of-thought reasoning for complex analysis', weight: 0.8, effectiveness: 90, mutationRate: 0.1 },
      { id: 'reason_2', type: 'reasoning', content: 'Consider multiple perspectives and potential alternatives', weight: 0.7, effectiveness: 85, mutationRate: 0.1 },
      { id: 'reason_3', type: 'reasoning', content: 'Validate your conclusions with evidence and examples', weight: 0.6, effectiveness: 78, mutationRate: 0.12 }
    );

    // Example genes
    this.genePool.push(
      { id: 'example_1', type: 'example', content: 'Include relevant examples to illustrate key points', weight: 0.5, effectiveness: 70, mutationRate: 0.15 },
      { id: 'example_2', type: 'example', content: 'Provide concrete case studies where applicable', weight: 0.6, effectiveness: 75, mutationRate: 0.15 }
    );

    // Constraint genes
    this.genePool.push(
      { id: 'constraint_1', type: 'constraint', content: 'Ensure accuracy and cite sources when making claims', weight: 0.7, effectiveness: 85, mutationRate: 0.1 },
      { id: 'constraint_2', type: 'constraint', content: 'Maintain professional tone and clear communication', weight: 0.6, effectiveness: 80, mutationRate: 0.1 }
    );
  }

  // Helper methods
  private createDefaultGene(type: string): PromptGene {
    return {
      id: this.generateGeneId(),
      type: type as any,
      content: `Default ${type} content`,
      weight: 0.5,
      effectiveness: 50,
      mutationRate: 0.2
    };
  }

  private generateChromosomeId(): string {
    return `chr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private generateGeneId(): string {
    return `gene_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  // Public API methods
  getEvolutionHistory(): EvolutionResult[] {
    return this.evolutionHistory;
  }

  getGenePool(): PromptGene[] {
    return [...this.genePool];
  }

  addGeneToPool(gene: Omit<PromptGene, 'id'>): void {
    this.genePool.push({
      ...gene,
      id: this.generateGeneId()
    });
  }

  async quickEvolve(objective: string): Promise<PromptChromosome> {
    const result = await this.evolvePrompt(objective, {
      populationSize: 20,
      maxGenerations: 10,
      fitnessThreshold: 85
    });
    return result.bestChromosome;
  }
}

// Export singleton instance
export const neuralPromptEvolutionService = NeuralPromptEvolutionService.getInstance();
