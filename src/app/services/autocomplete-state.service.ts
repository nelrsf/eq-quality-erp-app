import { Injectable } from '@angular/core';
import { ICellRestriction } from '../Model/interfaces/ICellRestrictions';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteStateService {

  constructor() { }

  /**
   * Creates a restriction object for delete mode
   */
  createDeleteModeRestriction(previousRestriction: Partial<ICellRestriction>): Partial<ICellRestriction> {
    const restriction = previousRestriction ? { ...previousRestriction } : {};
    restriction.deleteMode = true;
    return restriction;
  }

  /**
   * Creates a restriction object for normal mode with the given data
   */
  createNormalModeRestriction(dataRestriction: Partial<ICellRestriction>): Partial<ICellRestriction> {
    const restriction = { ...dataRestriction };
    restriction.deleteMode = false;
    return restriction;
  }

  /**
   * Updates the previous restriction state
   */
  updatePreviousRestriction(currentRestriction: Partial<ICellRestriction>, newRestriction: Partial<ICellRestriction>): Partial<ICellRestriction> {
    return { ...newRestriction };
  }
}