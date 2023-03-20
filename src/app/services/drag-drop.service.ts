import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DragDropService {

  private _dragDropDataTransfer: any;

  constructor() { }

  public get dragDropDataTransfer(): any {
    return this._dragDropDataTransfer;
  }
  public set dragDropDataTransfer(value: any) {
    this._dragDropDataTransfer = value;
  }

  hasDragKey(element: any) {
    if (!element.attributes) {
      return;
    }
    const attr: Array<any> = Array.from(element.attributes);
    return attr.find(
      (at: any) => {
        return at.name === "eqdrag";
      }
    )?.value;
  }

  reOrderElements(parentElement: any, DnDModel: any) {
    const childs = parentElement.childNodes;
    let keys: Array<string> = []
    let elKey;
    childs.forEach(
      (child: any) => {
        elKey = this.getElementKey(child);
        if (elKey) {
          keys.push(elKey);
        }
      }
    );
    if (keys.length === 0) {
      return;
    }
    if(Array.isArray(DnDModel)){
      return keys;
    }
    let newModel: any = {};
    keys.forEach((k: string) => {
      newModel[k] = DnDModel[k];
    });
    return newModel;
  }

  getElementKey(element: any) {
    if (!element.attributes) {
      return;
    }
    const attr: Array<any> = Array.from(element.attributes);
    return attr.find(
      (at: any) => {
        return at.name === "eqdrag-key";
      }
    )?.value;
  }

  getTarget(childElement: any) {

    let currentElement = childElement;
    let attributes;
    let dragAttr;
    while (currentElement != null) {
      if (!currentElement.attributes) {
        return
      }
      attributes = Array.from(currentElement.attributes);
      dragAttr = attributes.find(
        (attr: any) => {
          return attr.name === "eqdrag";
        }
      );
      if (dragAttr) {
        return currentElement;
      }
      currentElement = currentElement.parentElement;
    }
  }
}
