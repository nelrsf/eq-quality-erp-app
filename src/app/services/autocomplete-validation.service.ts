import { Injectable } from '@angular/core';
import { ICellRestriction } from '../Model/interfaces/ICellRestrictions';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteValidationService {

  constructor() { }

  /**
   * Validates if the current value matches the available restrictions
   */
  doesValueMatchRestrictions(data: Array<Partial<ICellRestriction>>, value: string): boolean {
    if (!data) {
      return true;
    }
    const findValue = data.find(
      (element) => {
        return element.value === value;
      }
    );
    return findValue !== undefined || !value;
  }

  /**
   * Finds a data restriction that matches the given value
   */
  findMatchingRestriction(data: Array<Partial<ICellRestriction>>, value: string): Partial<ICellRestriction> | undefined {
    if (!data) {
      return undefined;
    }
    return data.find(
      (cellRes: Partial<ICellRestriction>) => {
        return cellRes.value === value;
      }
    );
  }
}