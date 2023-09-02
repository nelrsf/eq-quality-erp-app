import { Completion } from "@codemirror/autocomplete";
import { EditorView } from "codemirror";
import { IColumn } from "src/app/Model/interfaces/IColumn";
import { FormulaElement } from "./element-formula";
import { WidgetType } from "@codemirror/view";
import { findColumnById } from "src/app/functions/findColumnById";
import { IValueFurmulaChange } from "src/app/components/crud/data-table/fields/number/number-field.service";


export class SingleColumnPlaceholderWidget extends WidgetType {

  constructor(private word: string, private columns: IColumn[]) {
    super();
  }

  toDOM() {
    const placeholderElement = document.createElement('span');
    placeholderElement.className = 'placeholder-widget';
    placeholderElement.setAttribute('columnId', this.word);
    const column = this.findColumn(this.word);
    placeholderElement.textContent = column?.columnName ? column?.columnName : '';
    return placeholderElement;
  }

  findColumn(id: string) {
    return this.columns.find(
      (col: IColumn) => col._id === id
    )
  }

  override updateDOM(dom: HTMLElement) {
    // Update the widget's content if needed
    return true
  }
}


export class ColumnNumber extends FormulaElement {

  constructor(private column: IColumn) {
    super()
  }



  getCompletionElement() {
    return {
      label: this.column._id,
      displayLabel: this.column.columnName,
      type: "constant",
      apply: this.appyCompletionFunction
    }
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
    const column = findColumnById(colId, columns);
    childNode.innerText = column?.columnName;
  }

  formattVariable(variable: string) {
    return 'col_' + variable.replaceAll('-', '_');
  }

  updateScope(data: IValueFurmulaChange, scope: any) {
    const variableFormatted = this.formattVariable(data.columnId);
    Object.assign(scope, { [variableFormatted]: data.value });
  }

}