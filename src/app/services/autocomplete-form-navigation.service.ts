import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ICellRestriction } from '../Model/interfaces/ICellRestrictions';
import { TablesService } from '../pages/tables/tables.service';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteFormNavigationService {

  constructor(private modal: NgbModal, private tableService: TablesService) { }

  /**
   * Opens a form modal for the given restriction
   */
  async openForm(restriction: Partial<ICellRestriction>): Promise<void> {
    if (!restriction) {
      return;
    }

    try {
      const row = await this.tableService.getRowById(
        restriction.column?.moduleRestriction || '',
        restriction.column?.tableRestriction || '',
        restriction.rowIdRestriction || ''
      ).toPromise();

      const formComponentImport = await import('../components/crud/form/form.component');
      const formComponent = formComponentImport.FormComponent;
      
      const modalRef = this.modal.open(formComponent, {
        backdropClass: 'backdrop-infinite-form',
        size: 'lg',
        modalDialogClass: 'modal-infinite-form',
      });

      modalRef.componentInstance.closeButton = true;
      modalRef.componentInstance.onCloseButton.subscribe(() => modalRef.close());
      modalRef.componentInstance.module = restriction.column?.moduleRestriction;
      modalRef.componentInstance.table = restriction.column?.tableRestriction;
      modalRef.componentInstance.row = row;
      modalRef.componentInstance.padding = '2rem';
      modalRef.componentInstance.componentAccesMode = 'bySelector';
    } catch (error) {
      console.log(error);
    }
  }
}