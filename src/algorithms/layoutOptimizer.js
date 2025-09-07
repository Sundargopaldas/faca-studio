/**
 * Algoritmo de Otimização de Layout para Facas de Embalagens
 * Implementa algoritmos para maximizar o aproveitamento de material
 */

class LayoutOptimizer {
  constructor() {
    this.algorithms = {
      'first_fit': this.firstFitAlgorithm.bind(this),
      'best_fit': this.bestFitAlgorithm.bind(this),
      'genetic': this.geneticAlgorithm.bind(this),
      'simulated_annealing': this.simulatedAnnealingAlgorithm.bind(this)
    };
  }

  /**
   * Otimizar layout usando algoritmo especificado
   * @param {Object} params - Parâmetros de otimização
   * @param {Array} params.pieces - Array de peças para otimizar
   * @param {Object} params.sheet - Dimensões da folha (width, height)
   * @param {string} params.algorithm - Algoritmo a usar
   * @param {Object} params.options - Opções adicionais
   * @returns {Object} Resultado da otimização
   */
  optimize(params) {
    const { pieces, sheet, algorithm = 'best_fit', options = {} } = params;
    
    if (!pieces || pieces.length === 0) {
      throw new Error('Nenhuma peça fornecida para otimização');
    }
    
    if (!sheet || !sheet.width || !sheet.height) {
      throw new Error('Dimensões da folha inválidas');
    }
    
    const algorithmFunction = this.algorithms[algorithm];
    if (!algorithmFunction) {
      throw new Error(`Algoritmo '${algorithm}' não encontrado`);
    }
    
    const startTime = Date.now();
    const result = algorithmFunction(pieces, sheet, options);
    const endTime = Date.now();
    
    return {
      ...result,
      algorithm,
      executionTime: endTime - startTime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Algoritmo First Fit - Coloca cada peça na primeira posição disponível
   */
  firstFitAlgorithm(pieces, sheet, options = {}) {
    const { allowRotation = true, margin = 1 } = options;
    const placedPieces = [];
    const remainingArea = this.calculateRemainingArea(sheet, placedPieces, margin);
    
    for (const piece of pieces) {
      const positions = this.findPossiblePositions(piece, remainingArea, allowRotation);
      
      if (positions.length > 0) {
        const position = positions[0]; // Primeira posição disponível
        placedPieces.push({
          ...piece,
          x: position.x,
          y: position.y,
          rotation: position.rotation || 0
        });
        
        // Atualizar área restante
        this.updateRemainingArea(remainingArea, position, piece);
      }
    }
    
    return this.calculateResult(placedPieces, pieces, sheet);
  }

  /**
   * Algoritmo Best Fit - Coloca cada peça na melhor posição disponível
   */
  bestFitAlgorithm(pieces, sheet, options = {}) {
    const { allowRotation = true, margin = 1 } = options;
    const placedPieces = [];
    const remainingArea = this.calculateRemainingArea(sheet, placedPieces, margin);
    
    for (const piece of pieces) {
      const positions = this.findPossiblePositions(piece, remainingArea, allowRotation);
      
      if (positions.length > 0) {
        // Escolher a posição que deixa menos desperdício
        const bestPosition = this.selectBestPosition(positions, piece, remainingArea);
        
        placedPieces.push({
          ...piece,
          x: bestPosition.x,
          y: bestPosition.y,
          rotation: bestPosition.rotation || 0
        });
        
        // Atualizar área restante
        this.updateRemainingArea(remainingArea, bestPosition, piece);
      }
    }
    
    return this.calculateResult(placedPieces, pieces, sheet);
  }

  /**
   * Algoritmo Genético - Usa evolução para encontrar soluções melhores
   */
  geneticAlgorithm(pieces, sheet, options = {}) {
    const {
      populationSize = 50,
      generations = 100,
      mutationRate = 0.1,
      crossoverRate = 0.8,
      allowRotation = true
    } = options;
    
    // Inicializar população
    let population = this.initializePopulation(pieces, sheet, populationSize, allowRotation);
    
    for (let generation = 0; generation < generations; generation++) {
      // Avaliar fitness da população
      const fitnessScores = population.map(individual => 
        this.calculateFitness(individual, sheet)
      );
      
      // Selecionar pais para reprodução
      const parents = this.selectParents(population, fitnessScores);
      
      // Criar nova geração
      const newGeneration = [];
      
      for (let i = 0; i < populationSize; i += 2) {
        const parent1 = parents[i];
        const parent2 = parents[i + 1];
        
        // Crossover
        if (Math.random() < crossoverRate) {
          const [child1, child2] = this.crossover(parent1, parent2);
          newGeneration.push(child1, child2);
        } else {
          newGeneration.push(parent1, parent2);
        }
      }
      
      // Mutação
      newGeneration.forEach(individual => {
        if (Math.random() < mutationRate) {
          this.mutate(individual, sheet);
        }
      });
      
      population = newGeneration;
    }
    
    // Encontrar melhor solução
    const bestIndividual = population.reduce((best, current) => {
      const bestFitness = this.calculateFitness(best, sheet);
      const currentFitness = this.calculateFitness(current, sheet);
      return currentFitness > bestFitness ? current : best;
    });
    
    return this.calculateResult(bestIndividual, pieces, sheet);
  }

  /**
   * Algoritmo Simulated Annealing - Busca local com temperatura decrescente
   */
  simulatedAnnealingAlgorithm(pieces, sheet, options = {}) {
    const {
      initialTemperature = 1000,
      coolingRate = 0.95,
      minTemperature = 1,
      maxIterations = 1000,
      allowRotation = true
    } = options;
    
    // Solução inicial
    let currentSolution = this.generateRandomSolution(pieces, sheet, allowRotation);
    let bestSolution = [...currentSolution];
    let temperature = initialTemperature;
    
    for (let iteration = 0; iteration < maxIterations && temperature > minTemperature; iteration++) {
      // Gerar solução vizinha
      const neighborSolution = this.generateNeighbor(currentSolution, sheet);
      
      // Calcular diferença de fitness
      const currentFitness = this.calculateFitness(currentSolution, sheet);
      const neighborFitness = this.calculateFitness(neighborSolution, sheet);
      const delta = neighborFitness - currentFitness;
      
      // Aceitar solução se for melhor ou com probabilidade baseada na temperatura
      if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
        currentSolution = neighborSolution;
        
        if (neighborFitness > this.calculateFitness(bestSolution, sheet)) {
          bestSolution = [...neighborSolution];
        }
      }
      
      // Resfriar
      temperature *= coolingRate;
    }
    
    return this.calculateResult(bestSolution, pieces, sheet);
  }

  /**
   * Encontrar posições possíveis para uma peça
   */
  findPossiblePositions(piece, remainingArea, allowRotation = true) {
    const positions = [];
    const rotations = allowRotation ? [0, 90, 180, 270] : [0];
    
    for (const rotation of rotations) {
      const rotatedPiece = this.rotatePiece(piece, rotation);
      
      for (const area of remainingArea) {
        if (this.canFit(rotatedPiece, area)) {
          positions.push({
            x: area.x,
            y: area.y,
            rotation,
            area: area
          });
        }
      }
    }
    
    return positions;
  }

  /**
   * Verificar se uma peça cabe em uma área
   */
  canFit(piece, area) {
    return piece.width <= area.width && piece.height <= area.height;
  }

  /**
   * Rotacionar peça
   */
  rotatePiece(piece, rotation) {
    if (rotation === 0) return piece;
    
    const radians = (rotation * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    return {
      ...piece,
      width: Math.abs(piece.width * cos - piece.height * sin),
      height: Math.abs(piece.width * sin + piece.height * cos)
    };
  }

  /**
   * Calcular área restante
   */
  calculateRemainingArea(sheet, placedPieces, margin = 1) {
    if (placedPieces.length === 0) {
      return [{
        x: margin,
        y: margin,
        width: sheet.width - 2 * margin,
        height: sheet.height - 2 * margin
      }];
    }
    
    // Implementar cálculo de área restante
    // Por simplicidade, retornar área inicial
    return [{
      x: margin,
      y: margin,
      width: sheet.width - 2 * margin,
      height: sheet.height - 2 * margin
    }];
  }

  /**
   * Atualizar área restante após colocar uma peça
   */
  updateRemainingArea(remainingArea, position, piece) {
    // Implementar atualização da área restante
    // Por simplicidade, não fazer nada
  }

  /**
   * Selecionar melhor posição
   */
  selectBestPosition(positions, piece, remainingArea) {
    // Por simplicidade, retornar a primeira posição
    return positions[0];
  }

  /**
   * Inicializar população para algoritmo genético
   */
  initializePopulation(pieces, sheet, populationSize, allowRotation) {
    const population = [];
    
    for (let i = 0; i < populationSize; i++) {
      const individual = this.generateRandomSolution(pieces, sheet, allowRotation);
      population.push(individual);
    }
    
    return population;
  }

  /**
   * Gerar solução aleatória
   */
  generateRandomSolution(pieces, sheet, allowRotation) {
    const solution = [];
    const margin = 1;
    
    for (const piece of pieces) {
      const rotations = allowRotation ? [0, 90, 180, 270] : [0];
      const rotation = rotations[Math.floor(Math.random() * rotations.length)];
      const rotatedPiece = this.rotatePiece(piece, rotation);
      
      // Posição aleatória
      const x = margin + Math.random() * (sheet.width - rotatedPiece.width - 2 * margin);
      const y = margin + Math.random() * (sheet.height - rotatedPiece.height - 2 * margin);
      
      solution.push({
        ...rotatedPiece,
        x,
        y,
        rotation
      });
    }
    
    return solution;
  }

  /**
   * Calcular fitness de uma solução
   */
  calculateFitness(solution, sheet) {
    const totalArea = sheet.width * sheet.height;
    const usedArea = solution.reduce((sum, piece) => {
      return sum + (piece.width * piece.height);
    }, 0);
    
    const efficiency = usedArea / totalArea;
    const overlapPenalty = this.calculateOverlapPenalty(solution);
    
    return efficiency - overlapPenalty;
  }

  /**
   * Calcular penalidade por sobreposição
   */
  calculateOverlapPenalty(solution) {
    let penalty = 0;
    
    for (let i = 0; i < solution.length; i++) {
      for (let j = i + 1; j < solution.length; j++) {
        if (this.piecesOverlap(solution[i], solution[j])) {
          penalty += 0.1;
        }
      }
    }
    
    return penalty;
  }

  /**
   * Verificar se duas peças se sobrepõem
   */
  piecesOverlap(piece1, piece2) {
    return !(
      piece1.x + piece1.width <= piece2.x ||
      piece2.x + piece2.width <= piece1.x ||
      piece1.y + piece1.height <= piece2.y ||
      piece2.y + piece2.height <= piece1.y
    );
  }

  /**
   * Selecionar pais para reprodução
   */
  selectParents(population, fitnessScores) {
    const parents = [];
    const totalFitness = fitnessScores.reduce((sum, score) => sum + score, 0);
    
    for (let i = 0; i < population.length; i++) {
      const random = Math.random() * totalFitness;
      let cumulative = 0;
      
      for (let j = 0; j < population.length; j++) {
        cumulative += fitnessScores[j];
        if (cumulative >= random) {
          parents.push(population[j]);
          break;
        }
      }
    }
    
    return parents;
  }

  /**
   * Crossover entre dois pais
   */
  crossover(parent1, parent2) {
    const crossoverPoint = Math.floor(Math.random() * parent1.length);
    
    const child1 = [
      ...parent1.slice(0, crossoverPoint),
      ...parent2.slice(crossoverPoint)
    ];
    
    const child2 = [
      ...parent2.slice(0, crossoverPoint),
      ...parent1.slice(crossoverPoint)
    ];
    
    return [child1, child2];
  }

  /**
   * Mutar uma solução
   */
  mutate(individual, sheet) {
    const pieceIndex = Math.floor(Math.random() * individual.length);
    const piece = individual[pieceIndex];
    
    // Mutar posição
    piece.x = Math.random() * (sheet.width - piece.width);
    piece.y = Math.random() * (sheet.height - piece.height);
    
    // Mutar rotação
    if (Math.random() < 0.5) {
      const rotations = [0, 90, 180, 270];
      piece.rotation = rotations[Math.floor(Math.random() * rotations.length)];
    }
  }

  /**
   * Gerar solução vizinha para simulated annealing
   */
  generateNeighbor(solution, sheet) {
    const neighbor = [...solution];
    const pieceIndex = Math.floor(Math.random() * neighbor.length);
    const piece = neighbor[pieceIndex];
    
    // Pequena mudança na posição
    piece.x += (Math.random() - 0.5) * 10;
    piece.y += (Math.random() - 0.5) * 10;
    
    // Garantir que a peça fique dentro da folha
    piece.x = Math.max(0, Math.min(piece.x, sheet.width - piece.width));
    piece.y = Math.max(0, Math.min(piece.y, sheet.height - piece.height));
    
    return neighbor;
  }

  /**
   * Calcular resultado final
   */
  calculateResult(placedPieces, originalPieces, sheet) {
    const totalArea = sheet.width * sheet.height;
    const usedArea = placedPieces.reduce((sum, piece) => {
      return sum + (piece.width * piece.height);
    }, 0);
    
    const efficiency = (usedArea / totalArea) * 100;
    const wastePercentage = 100 - efficiency;
    
    return {
      pieces: placedPieces,
      sheet,
      efficiency: Math.round(efficiency * 100) / 100,
      waste_percentage: Math.round(wastePercentage * 100) / 100,
      total_pieces: placedPieces.length,
      used_area: Math.round(usedArea * 100) / 100,
      total_area: Math.round(totalArea * 100) / 100,
      estimated_cost: this.calculateEstimatedCost(placedPieces, sheet)
    };
  }

  /**
   * Calcular custo estimado
   */
  calculateEstimatedCost(pieces, sheet) {
    const costPerCm2 = 0.02; // R$ 0,02 por cm²
    const usedArea = pieces.reduce((sum, piece) => {
      return sum + (piece.width * piece.height);
    }, 0);
    
    return Math.round(usedArea * costPerCm2 * 100) / 100;
  }
}

module.exports = LayoutOptimizer;
