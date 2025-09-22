import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ICellRestriction } from '../Model/interfaces/ICellRestrictions';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteFilterService {

  constructor() { }

  /**
   * Filters data based on the search term
   */
  filterData(data: Array<Partial<ICellRestriction>>, searchTerm: string): Array<Partial<ICellRestriction>> {
    if (!data) {
      return [];
    }
    return data.filter(d => {
      if (d.value === undefined || d.value === null) {
        return false;
      }
      return d.value?.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
    });
  }

  /**
   * Creates an observable search function for typeahead functionality
   */
  createSearch(filteredData: Array<Partial<ICellRestriction>>): (text$: Observable<string>) => Observable<Array<Partial<ICellRestriction>>> {
    return (text$: Observable<string>) =>
      text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => term === '' ? []
          : filteredData.filter(v => v.value?.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
      );
  }
}