import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChangesTrackerService {

  constructor() { }

  trackChanges(previousData: any, currentData: any) {
    const previousDataCopy = JSON.parse(JSON.stringify(previousData));
    const currentDataCopy = JSON.parse(JSON.stringify(currentData));
    previousDataCopy.forEach(
      (pd: any) => {
        const id = pd._id;
        const cd = currentDataCopy.find(
          (currentObj: any) => {
            return currentObj._id === id;
          }
        );
        Object.keys(pd).forEach(
          (fieldName) => {
            if (cd[fieldName] === pd[fieldName] && fieldName !== "_id") {
              delete cd[fieldName];
            } else if (Array.isArray(cd[fieldName])) {
              const strArrayCurrent = JSON.stringify(cd[fieldName]);
              const strArrayPrevious = JSON.stringify(pd[fieldName]);
              if (strArrayCurrent === strArrayPrevious) {
                delete cd[fieldName];
              }
            }
          }
        )
      }
    )
    return this.deleteEmptyRows(currentDataCopy)
  }

  deleteEmptyRows(rows: any) {
    const notEmptyRows: any[] = [];
    rows.forEach((row: any) => {
      if(!this.hasOnlyIdField(row)){
        notEmptyRows.push(row);
      }
    })
    return notEmptyRows;
  }

  hasOnlyIdField(json: any) {
    const keys = Object.keys(json);
    return keys.length === 1 && keys[0] === '_id';
  }
}
