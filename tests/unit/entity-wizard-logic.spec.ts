import { describe, it, expect } from 'vitest';
import { evaluateWizardState, countEntitiesByDomain } from '../../src/services/entityTypeWizardLogic';
import { sampleEntities } from './fixtures/entities';

describe('entity type wizard logic helpers', () => {
  it('reports offline when not connected', () => {
    const state = evaluateWizardState({
      isConnected: false,
      loading: false,
      entities: [],
      categories: [],
    });
    expect(state).toBe('offline');
  });

  it('reports loading state', () => {
    const state = evaluateWizardState({
      isConnected: true,
      loading: true,
      entities: [],
      categories: [],
    });
    expect(state).toBe('loading');
  });

  it('reports empty when connected but no entities/categories', () => {
    const state = evaluateWizardState({
      isConnected: true,
      loading: false,
      entities: [],
      categories: [],
    });
    expect(state).toBe('empty');
  });

  it('reports error when an error message is present', () => {
    const state = evaluateWizardState({
      isConnected: true,
      loading: false,
      entities: [],
      categories: [],
      error: 'failed',
    });
    expect(state).toBe('error');
  });

  it('reports ready when connected with entities and categories', () => {
    const state = evaluateWizardState({
      isConnected: true,
      loading: false,
      entities: sampleEntities,
      categories: [{ id: 'lights', name: 'Lights', description: '', icon: '', requiredDomains: ['light'], helpText: '' }],
    });
    expect(state).toBe('ready');
  });

  it('counts entities by domain for cache/availability decisions', () => {
    const counts = countEntitiesByDomain(sampleEntities);
    expect(counts.light).toBe(2);
    expect(counts.camera).toBe(1);
    expect(counts.sensor).toBeGreaterThanOrEqual(4);
  });
});

