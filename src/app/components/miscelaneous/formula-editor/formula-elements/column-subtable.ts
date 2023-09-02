import { Completion } from "@codemirror/autocomplete";
import { EditorView } from "codemirror";
import { ColumnTypes, IColumn } from "src/app/Model/interfaces/IColumn";
import { FormulaElement } from "./element-formula";
import { WidgetType } from "@codemirror/view";
import { findColumnById } from "src/app/functions/findColumnById";
import { IValueFurmulaChange } from "src/app/components/crud/data-table/fields/number/number-field.service";

export class SubtablePlaceholderWidget extends WidgetType {

  constructor(private subtableId: string, private columnId: string, private columns: IColumn[]) {
    super();
  }

  toDOM() {
    const placeholderElement = document.createElement('span');
    placeholderElement.className = 'placeholder-widget';
    placeholderElement.setAttribute('subtableId', this.subtableId);
    const subtable = this.findColumn(this.subtableId, this.columns);
    const subcolumns = subtable?.linkedTable?.columnsOverrideData.map(m => m.virtualColumnData);
    const subcolumn = this.findColumn(this.columnId, subcolumns ? subcolumns : []);
    placeholderElement.setAttribute('columnId', this.columnId);
    placeholderElement.textContent = subtable?.columnName && subcolumn ? subtable?.columnName + '/' + subcolumn.columnName : '';
    return placeholderElement;
  }

  findColumn(id: string, columns: IColumn[]) {
    return columns.find(
      (col: IColumn) => col._id === id
    )
  }

  override updateDOM(dom: HTMLElement) {
    // Update the widget's content if needed
    return true
  }
}


export class ColumnSubtable extends FormulaElement {

  constructor(private column: IColumn) {
    super()
  }

  private filterNumericColumns(columns: IColumn[]) {
    return columns.filter(c => c.type === ColumnTypes.number && c.hasFooter)
  }

  getCompletionElement() {
    const subtableColumns = this.column.linkedTable?.columnsOverrideData.map(m => m.virtualColumnData);
    const numericColumns = this.filterNumericColumns(subtableColumns ? subtableColumns : []);
    return numericColumns.map(
      (nc: IColumn) => {
        return {
          label: this.column._id + 'subtableDiv' + nc._id,
          displayLabel: this.column.columnName + '/' + nc.columnName,
          type: "formula",
          apply: this.appyCompletionFunction
        }
      }
    )
  }

  appyCompletionFunction = (view: EditorView, completion: Completion, from: number, to: number) => {
    // `completion` contains the information about the suggestion selected
    const selectedColumnId = completion.label;
    const selectedColumnLabel = completion.displayLabel;

    // Replace the matched text with the spanString
    const transaction = view.state.update({
      changes: {
        from: from,
        to: to,
        insert: `[[${selectedColumnId}]]`
      }
    });

    view.dispatch(transaction);

    // Calculate the new position (end of the inserted text)
    const newPos = from + `[[${selectedColumnId}]]`.length;

    // Set the caret position to the new position
    view.dispatch(view.state.update({ selection: { anchor: newPos } }));

  }


  initializeFormula(childNode: any, columns: IColumn[]) {
    const colId = childNode.getAttribute('columnId')
    const subtableId = childNode.getAttribute('subtableId');
    if (!colId || !subtableId) {
      return;
    }
    const subtableColumn = findColumnById(subtableId, columns);
    const subtableColumns = subtableColumn?.linkedTable?.columnsOverrideData;
    if (!subtableColumns) {
      return;
    }
    const column = findColumnById(colId, subtableColumns.map(m => m.virtualColumnData));
    childNode.innerText = subtableColumn?.columnName + '/' + column?.columnName;
  }

  formattVariable(variable: string) {
    return 'subtable_' + variable.replaceAll('-', '_');
  }

  updateScope(data: IValueFurmulaChange, scope: any) {
    const variableFormatted = this.formattVariable(data.subtableId+'subtableDiv'+data.columnId);
    Object.assign(scope, { [variableFormatted]: data.value });
  }

}

