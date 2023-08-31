import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Completion, CompletionContext, autocompletion } from '@codemirror/autocomplete';
import { oneDarkTheme } from '@codemirror/theme-one-dark';
import { Decoration, DecorationSet, EditorView, MatchDecorator, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { minimalSetup } from 'codemirror';
import { spreadsheet } from 'codemirror-lang-spreadsheet';
import { ColumnTypes, IColumn } from 'src/app/Model/interfaces/IColumn';
import { ModulesService } from 'src/app/pages/modules/modules.service';
import { TablesService } from 'src/app/pages/tables/tables.service';
import { Compartment } from "@codemirror/state";
import { IModule } from 'src/app/Model/interfaces/IModule';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { MathNode, parse } from 'mathjs';

export class PlaceholderWidget extends WidgetType {

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

@Component({
  selector: 'eq-formula-editor',
  templateUrl: './formula-editor.component.html',
  styleUrls: ['./formula-editor.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule
  ]
})
export class FormulaEditorComponent implements AfterViewInit, OnInit {

  @ViewChild('inputFormula') inputFormula!: ElementRef;
  @Input() columnData!: IColumn;
  @Input() validFormula!: boolean;
  @Input() columns: IColumn[] = [];
  @Output() validFormulaChange = new EventEmitter<boolean>();

  completions: { label: string, type?: string, info?: string }[] = [];
  modules: IModule[] = [];
  editor!: EditorView;
  parsedExpr!: MathNode;
  variables: Array<string> = [];
  plainFormula: string = '';
  formulaStr: string = '';
  icons = {
    valid: faCheckCircle,
    invalid: faCircleXmark
  }

  constructor(private modulesService: ModulesService, private tablesService: TablesService) { }


  ngAfterViewInit(): void {
    this.plainFormula = this.columnData.formula?.plainFormula ? this.columnData.formula?.plainFormula : '';
    this.editor = new EditorView({
      doc: this.plainFormula,
      extensions: this.getEditorExtensions(),
      parent: this.inputFormula.nativeElement
    });
  }

  ngOnInit(): void {
    this.getModules();
    if (this.columns.length === 0) {
      this.getColumns();
    } else {
      this.getCompletionsByColumns();
      if (this.plainFormula) {
        this.initializeFormula();
      }
    }

  }

  initializeFormula() {
    const lines = this.editor.contentDOM.childNodes;
    const nodes = lines[0];
    nodes.childNodes.forEach(
      (childNode: any) => {
        if (childNode.nodeType === Node.ELEMENT_NODE) {
          const colId = childNode.getAttribute('columnId')
          if (colId) {
            const column = this.findColumn(colId);
            childNode.innerText = column?.columnName;

          }
        }
      }
    );

  }

  findColumn(id: string) {
    return this.columns.find(
      (col: IColumn) => col._id === id
    )
  }

  getEditorExtensions() {
    const placeholderMatcher = new MatchDecorator({
      regexp: /\[\[([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\]\]/g,
      decoration: match => Decoration.replace({
        widget: new PlaceholderWidget(match[1], this.columns),
      })
    })

    const placeholders = ViewPlugin.fromClass(class {
      placeholders: DecorationSet
      constructor(view: EditorView) {
        this.placeholders = placeholderMatcher.createDeco(view)
      }
      update(update: ViewUpdate) {
        this.placeholders = placeholderMatcher.updateDeco(update, this.placeholders)
      }
    }, {
      decorations: instance => instance.placeholders,
      provide: plugin => EditorView.atomicRanges.of(view => {
        return view.plugin(plugin)?.placeholders || Decoration.none
      })
    })

    const theme = localStorage.getItem('theme');
    const languageConf = new Compartment;
    const extensions = [
      minimalSetup,
      autocompletion({ override: [this.getCompletionsContext] }),
      languageConf.of(spreadsheet()),
      placeholders
    ]
    if (theme === 'dark') {
      extensions.push(oneDarkTheme);
    }
    return extensions;
  }

  getCompletionsByColumns(){
    this.completions = this.columns
    .filter(col => col.type === ColumnTypes.number && col._id !== this.columnData._id)
    .map(
      (col: IColumn): any => {
        return {
          label: col._id,
          displayLabel: col.columnName,
          type: "constant",
          apply: this.appyCompletionFunction
        }
      });
  }

  getColumns() {
    this.tablesService.getAllColumns(this.columnData.module, this.columnData.table)
      .subscribe(
        {
          next: (columns: any) => {
            this.columns = Object.keys(columns).map(c => columns[c]);
            this.getCompletionsByColumns();
            if (this.plainFormula) {
              this.initializeFormula();
            }
          }
        }
      )
  }


  getCompletionsContext = (context: CompletionContext) => {
    let before = context.matchBefore(/\w+/);
    // If completion wasn't explicitly started and there
    // is no word before the cursor, don't open completions.
    //if (!context.explicit && !before) return null
    return {
      from: before ? before.from : context.pos,
      options: this.completions,
      validFor: /\w+/
    }
  }

  filterModules(term: string) {
    return this.modules.filter(
      (module: IModule) => {
        return module.label.startsWith(term);
      }
    )
  }

  filterColumns(term: string) {
    return this.columns.filter(
      (columns: IColumn) => {
        const columnName = columns.columnName.replaceAll(/\s+/g, ' ');
        const encodedTermn = term.replaceAll(/\s+/g, ' ');
        return columnName.indexOf(encodedTermn) !== -1
      }
    )
  }

  getModules() {
    this.modulesService.getAllModules()
      .subscribe(
        {
          next: (modules: any) => {
            this.modules = modules;
          }
        }
      )
  }

  appyCompletionFunction = (view: EditorView, completion: Completion, from: number, to: number) => {
    {
      // `completion` contains the information about the suggestion selected
      const selectedColumnId = completion.label;
      const selectedColumnLabel = completion.displayLabel;

      // Construct the span element using DOM methods
      const spanElement = document.createElement('span');
      spanElement.id = selectedColumnId;
      spanElement.textContent = selectedColumnLabel ? selectedColumnLabel : null;

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
  }

  formattFormula() {
    const lines = this.editor.contentDOM.childNodes;
    const nodes = lines[0];
    this.variables = [];
    let formattedFormula = '';
    this.plainFormula = '';
    nodes.childNodes.forEach(
      (childNode: any) => {
        if (childNode.nodeType === Node.ELEMENT_NODE) {
          const colId = childNode.getAttribute('columnId')
          if (colId) {
            const variableName = 'col_' + colId.replaceAll('-', '_');
            formattedFormula += variableName;
            this.plainFormula += `[[${colId}]]`;
            if (!this.variables.includes(variableName)) { this.variables.push(variableName); }
          } else {
            formattedFormula += childNode.innerText;
            this.plainFormula += childNode.innerText;
          }
        } else {
          formattedFormula += childNode.data;
          this.plainFormula += childNode.data;
        }
      }
    );
    return formattedFormula;
  }

  checkFormula() {
    this.formulaStr = '';
    this.formulaStr = this.formattFormula();
    if (!this.formulaStr) {
      this.validFormula = false;
      this.validFormulaChange.emit(this.validFormula);
      return;
    }
    try {
      this.parsedExpr = parse(this.formulaStr);
      this.evalFormula();
      this.validFormula = true;
      this.validFormulaChange.emit(this.validFormula);
      this.setFormula();
    } catch (e) {
      this.validFormula = false;
      this.validFormulaChange.emit(this.validFormula);
    }
  }

  evalFormula() {
    const compiler = this.parsedExpr.compile();
    let scope: any = {};
    this.variables.forEach(
      (variableName: string) => {
        scope[variableName.replaceAll('-', '_')] = 0;
      }
    );
    compiler.evaluate(scope);
  }

  setFormula() {
    this.columnData.formula = {
      expression: this.formulaStr,
      plainFormula: this.plainFormula,
      variables: this.variables
    }
  }


}
