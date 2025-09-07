/**
 * Testes para o LayoutOptimizer
 */

const { LayoutOptimizer } = require('../../src/algorithms');

describe('LayoutOptimizer', () => {
  let optimizer;

  beforeEach(() => {
    optimizer = new LayoutOptimizer();
  });

  describe('Otimização básica', () => {
    test('deve otimizar layout com algoritmo first_fit', () => {
      const pieces = [
        { id: 'piece1', width: 10, height: 15 },
        { id: 'piece2', width: 8, height: 12 }
      ];
      const sheet = { width: 21, height: 29.7 };

      const result = optimizer.optimize({
        pieces,
        sheet,
        algorithm: 'first_fit'
      });

      expect(result).toBeDefined();
      expect(result.pieces).toBeDefined();
      expect(result.efficiency).toBeGreaterThan(0);
      expect(result.waste_percentage).toBeGreaterThanOrEqual(0);
      expect(result.total_pieces).toBeGreaterThan(0);
      expect(result.algorithm).toBe('first_fit');
    });

    test('deve otimizar layout com algoritmo best_fit', () => {
      const pieces = [
        { id: 'piece1', width: 10, height: 15 },
        { id: 'piece2', width: 8, height: 12 }
      ];
      const sheet = { width: 21, height: 29.7 };

      const result = optimizer.optimize({
        pieces,
        sheet,
        algorithm: 'best_fit'
      });

      expect(result).toBeDefined();
      expect(result.algorithm).toBe('best_fit');
      expect(result.efficiency).toBeGreaterThan(0);
    });

    test('deve falhar com algoritmo inválido', () => {
      const pieces = [{ id: 'piece1', width: 10, height: 15 }];
      const sheet = { width: 21, height: 29.7 };

      expect(() => {
        optimizer.optimize({
          pieces,
          sheet,
          algorithm: 'algoritmo_inexistente'
        });
      }).toThrow('Algoritmo \'algoritmo_inexistente\' não encontrado');
    });

    test('deve falhar sem peças', () => {
      const sheet = { width: 21, height: 29.7 };

      expect(() => {
        optimizer.optimize({
          pieces: [],
          sheet,
          algorithm: 'best_fit'
        });
      }).toThrow('Nenhuma peça fornecida para otimização');
    });

    test('deve falhar sem dimensões da folha', () => {
      const pieces = [{ id: 'piece1', width: 10, height: 15 }];

      expect(() => {
        optimizer.optimize({
          pieces,
          sheet: {},
          algorithm: 'best_fit'
        });
      }).toThrow('Dimensões da folha inválidas');
    });
  });

  describe('Algoritmos específicos', () => {
    const testPieces = [
      { id: 'piece1', width: 10, height: 15 },
      { id: 'piece2', width: 8, height: 12 },
      { id: 'piece3', width: 12, height: 8 }
    ];
    const testSheet = { width: 21, height: 29.7 };

    test('algoritmo genético deve funcionar', () => {
      const result = optimizer.optimize({
        pieces: testPieces,
        sheet: testSheet,
        algorithm: 'genetic',
        options: {
          populationSize: 10,
          generations: 5
        }
      });

      expect(result).toBeDefined();
      expect(result.algorithm).toBe('genetic');
      expect(result.efficiency).toBeGreaterThan(0);
    });

    test('simulated annealing deve funcionar', () => {
      const result = optimizer.optimize({
        pieces: testPieces,
        sheet: testSheet,
        algorithm: 'simulated_annealing',
        options: {
          initialTemperature: 100,
          coolingRate: 0.95,
          maxIterations: 50
        }
      });

      expect(result).toBeDefined();
      expect(result.algorithm).toBe('simulated_annealing');
      expect(result.efficiency).toBeGreaterThan(0);
    });
  });

  describe('Cálculos de eficiência', () => {
    test('deve calcular eficiência corretamente', () => {
      const pieces = [{ id: 'piece1', width: 10, height: 15 }];
      const sheet = { width: 21, height: 29.7 };

      const result = optimizer.optimize({
        pieces,
        sheet,
        algorithm: 'best_fit'
      });

      expect(result.efficiency).toBeGreaterThan(0);
      expect(result.efficiency).toBeLessThanOrEqual(100);
      expect(result.waste_percentage).toBe(100 - result.efficiency);
    });

    test('deve calcular custo estimado', () => {
      const pieces = [{ id: 'piece1', width: 10, height: 15 }];
      const sheet = { width: 21, height: 29.7 };

      const result = optimizer.optimize({
        pieces,
        sheet,
        algorithm: 'best_fit'
      });

      expect(result.estimated_cost).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    test('deve executar em tempo razoável', () => {
      const pieces = Array.from({ length: 10 }, (_, i) => ({
        id: `piece${i}`,
        width: 5 + (i % 5),
        height: 8 + (i % 3)
      }));
      const sheet = { width: 21, height: 29.7 };

      const startTime = Date.now();
      const result = optimizer.optimize({
        pieces,
        sheet,
        algorithm: 'best_fit'
      });
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Menos de 5 segundos
    });
  });
});
