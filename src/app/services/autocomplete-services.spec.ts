import { TestBed } from '@angular/core/testing';
import { AutocompleteFilterService } from './autocomplete-filter.service';
import { AutocompleteValidationService } from './autocomplete-validation.service';
import { AutocompleteStateService } from './autocomplete-state.service';
import { ICellRestriction } from '../Model/interfaces/ICellRestrictions';

describe('Autocomplete Services', () => {
  let filterService: AutocompleteFilterService;
  let validationService: AutocompleteValidationService;
  let stateService: AutocompleteStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    filterService = TestBed.inject(AutocompleteFilterService);
    validationService = TestBed.inject(AutocompleteValidationService);
    stateService = TestBed.inject(AutocompleteStateService);
  });

  describe('AutocompleteFilterService', () => {
    it('should filter data correctly', () => {
      const data: Array<Partial<ICellRestriction>> = [
        { value: 'test1' },
        { value: 'test2' },
        { value: 'other' }
      ];
      
      const result = filterService.filterData(data, 'test');
      expect(result.length).toBe(2);
      expect(result[0].value).toBe('test1');
      expect(result[1].value).toBe('test2');
    });

    it('should handle empty data', () => {
      const result = filterService.filterData([], 'test');
      expect(result.length).toBe(0);
    });
  });

  describe('AutocompleteValidationService', () => {
    it('should validate matching values correctly', () => {
      const data: Array<Partial<ICellRestriction>> = [
        { value: 'valid1' },
        { value: 'valid2' }
      ];
      
      expect(validationService.doesValueMatchRestrictions(data, 'valid1')).toBe(true);
      expect(validationService.doesValueMatchRestrictions(data, 'invalid')).toBe(false);
      expect(validationService.doesValueMatchRestrictions(data, '')).toBe(true);
    });

    it('should find matching restrictions', () => {
      const data: Array<Partial<ICellRestriction>> = [
        { value: 'test1', rowIdRestriction: 'id1' },
        { value: 'test2', rowIdRestriction: 'id2' }
      ];
      
      const result = validationService.findMatchingRestriction(data, 'test1');
      expect(result?.rowIdRestriction).toBe('id1');
    });
  });

  describe('AutocompleteStateService', () => {
    it('should create delete mode restriction', () => {
      const previousRestriction = { value: 'test', deleteMode: false };
      const result = stateService.createDeleteModeRestriction(previousRestriction);
      
      expect(result.deleteMode).toBe(true);
      expect(result.value).toBe('test');
    });

    it('should create normal mode restriction', () => {
      const dataRestriction = { value: 'test', deleteMode: true };
      const result = stateService.createNormalModeRestriction(dataRestriction);
      
      expect(result.deleteMode).toBe(false);
      expect(result.value).toBe('test');
    });
  });
});