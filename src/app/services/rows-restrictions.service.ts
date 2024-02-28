import { Injectable } from '@angular/core';
import { Observable, Subject, Subscriber, catchError, map, of, switchMap, throwError } from 'rxjs';
import { ICellRestriction, IColumnRestriction } from '../Model/interfaces/ICellRestrictions';
import { IColumn } from '../Model/interfaces/IColumn';
import { TablesService } from '../pages/tables/tables.service';

@Injectable({
  providedIn: 'root'
})
export class RowsRestrictionsService {

  onRestrictionsChange = new Subject<Partial<ICellRestriction>>();
  restrictionsDataSubject = new Subject<IColumnRestriction>();

  constructor(private tableService: TablesService) { }

  getColumnRestrictions(column: IColumn) {
    const restrictionsObserver = new Observable<Array<Partial<ICellRestriction>>>(
      (subscriber: Subscriber<Partial<ICellRestriction>[]>) => {
        let restrictions: Array<Partial<ICellRestriction>> = [];
        if (!column?.isRestricted) {
          return
        }
        const module = column?.moduleRestriction;
        if (!module) {
          return;
        }
        const table = column.tableRestriction;
        if (!table) {
          return;
        }
        const columnRes = column.columnRestriction;
        if (!columnRes) {
          return;
        }
        this.tableService.getAllRows(module, table)
          .subscribe(
            (rows: any) => {
              restrictions = rows.map(
                (m: any): Partial<ICellRestriction> => {
                  return {
                    rowIdRestriction: m._id,
                    column: column,
                    value: m[columnRes]
                  }
                })
              subscriber.next(restrictions);
            }
          )
      }
    )
    return restrictionsObserver;
  }

  setRowRestriction(data: Partial<ICellRestriction>, rowId: string, rows: any[], column: IColumn) {
    if (!data) {
      return;
    }
    if (data.deleteMode) {
      this.deleteRestriction(rowId, rows, column);
      return;
    }
    const newRestriction: ICellRestriction = {
      rowId: rowId,
      column: column,
      rowIdRestriction: data.rowIdRestriction,
      value: data.value
    }
    let restrictions = this.findRowsRestrictions(rows)
    if (!restrictions) {
      restrictions = {
        __rows_restrictions__data__: "rows_restrictions",
        data: []
      };
      rows.push(restrictions);
    } else {
      const cellRestriction = this.findRestrictionByRowAndColumn(restrictions.data, rowId, column._id);
      if (cellRestriction) {
        Object.assign(cellRestriction, newRestriction);
        return;
      }
    }
    restrictions.data.push(newRestriction);
  }

  findRowsRestrictions(rows: Array<any>) {
    return rows.find(r => {
      return Object.hasOwn(r, "__rows_restrictions__data__")
    });
  }

  deleteRestriction(rowId: string, rows: any[], column: IColumn) {
    let restrictions = this.findRowsRestrictions(rows);
    if (!restrictions) {
      return
    }
    const cellRestrictedIndex = restrictions.data.findIndex((r: ICellRestriction) => {
      return r.rowId === rowId && r.column.columnName === column.columnName;
    });
    if (cellRestrictedIndex === -1) {
      return
    }
    delete restrictions.data[cellRestrictedIndex].rowIdRestriction;
    delete restrictions.data[cellRestrictedIndex].deleteMode;
    restrictions.data[cellRestrictedIndex].value = '';
    let row = rows.find(
      (r: any) => {
        return r._id === rowId
      }
    );
    if (!row) {
      return
    }
    row[column._id] = "";
  }

  findRestrictionByRowAndColumn(restrictions: ICellRestriction[], rowId: string, columnId: string): ICellRestriction | undefined {
    const cellRestriction = restrictions.find((res: ICellRestriction) => {
      return res.column._id === columnId && res.rowId === rowId
    })
    return cellRestriction;
  }

  findRestrictionByRowAndColumnFromServer(module: string, table: string, rowId: string, columnId: string): Observable<any> {
    return this.tableService.getRestrictionByIdAndColumn(module, table, columnId, rowId);
  }

  checkRestriction(restriction: ICellRestriction) {
    const module = restriction.column.moduleRestriction;
    if (!module) {
      return
    }
    const table = restriction.column.tableRestriction;
    if (!table) {
      return;
    }
    const column = restriction.column.columnRestriction;
    if (!column) {
      return
    }
    const rowIdRestriction = restriction.rowIdRestriction;
    if (!rowIdRestriction) {
      return;
    }
    return this.tableService.getRowById(module, table, rowIdRestriction, column);
  }

  isColumnDisabled(column: IColumn) {
    const isUniqueObserver = new Observable<boolean>(
      (subscriber: Subscriber<boolean>) => {
        const module = column.moduleRestriction;
        if (!module) {
          return
        }
        const table = column.tableRestriction;
        if (!table) {
          return;
        }
        const colunn = column.columnRestriction;
        if (!colunn) {
          return
        }
        this.tableService.getColumnData(module, table, colunn)
          .subscribe((column: any) => {
            subscriber.next(!column?.unique)
          })
      }
    );
    return isUniqueObserver;
  }

  getColumnRestrictionData(column: IColumn) {
    const module = column.moduleRestriction;
    if (!module) {
      return;
    }
    const table = column.tableRestriction;
    if (!table) {
      return;
    }
    const colunnId = column.columnRestriction;
    if (!colunnId) {
      return;
    }
    return this.tableService.getColumnData(module, table, colunnId);
  }



}


