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
import { FormulaElementsService } from './formula-elements/formula-elements.service';
import { ColumnNumber, SingleColumnPlaceholderWidget } from './formula-elements/column-number';
import { ColumnSubtable, SubtablePlaceholderWidget } from './formula-elements/column-subtable';


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
  allowedColumnTypes: Array<ColumnTypes> = [ColumnTypes.number, ColumnTypes.table];
  icons = {
    valid: faCheckCircle,
    invalid: faCircleXmark
  }

  constructor(private modulesService: ModulesService, private tablesService: TablesService, private formulaElementService: FormulaElementsService) { }


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
          const subtableId = childNode.getAttribute('subtableId');
          if (subtableId && colId) {
            const columnSubtable = new ColumnSubtable(this.columnData);
            columnSubtable.initializeFormula(childNode, this.columns);
          } else if (colId) {
            const columnNumber = new ColumnNumber(this.columnData);
            columnNumber.initializeFormula(childNode, this.columns);
          }
        }
      }
    );

  }



  getSingleColumnPlaceholders() {
    const placeholderMatcher = new MatchDecorator({
      regexp: /\[\[([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\]\]/g,
      decoration: match => Decoration.replace({
        widget: new SingleColumnPlaceholderWidget(match[1], this.columns),
      })
    })

    return ViewPlugin.fromClass(class {
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
  }

  getSubtablePlaceholders() {
    const placeholderMatcher = new MatchDecorator({
      regexp: /\[\[([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})subtableDiv([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\]\]/g,
      decoration: match => Decoration.replace({
        widget: new SubtablePlaceholderWidget(match[1], match[2], this.columns),
      })
    })

    return ViewPlugin.fromClass(class {
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
  }

  getEditorExtensions() {
    const theme = localStorage.getItem('theme');
    const languageConf = new Compartment;
    const extensions = [
      minimalSetup,
      autocompletion({ override: [this.getCompletionsContext] }),
      languageConf.of(spreadsheet()),
      this.getSingleColumnPlaceholders(),
      this.getSubtablePlaceholders()
    ]
    if (theme === 'dark') {
      extensions.push(oneDarkTheme);
    }
    return extensions;
  }

  getCompletionsByColumns() {
    this.completions = this.columns
      .filter(col => this.allowedColumnTypes.includes(col.type) && col._id !== this.columnData._id)
      .map(
        (col: IColumn): any => {
          const formulaElement = this.formulaElementService.getElemnt(col);
          return formulaElement?.getCompletionElement()
        });
    this.completions = this.completions.flat();
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

  appendVariable(variableName: string) {
    if (!this.variables.includes(variableName)) {
      this.variables.push(variableName);
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
          const colId = childNode.getAttribute('columnId');
          const subtableId = childNode.getAttribute('subtableId');
          if (colId && subtableId) {
            const variableName = `subtable_${subtableId.replaceAll('-', '_')}subtableDiv${colId.replaceAll('-', '_')}`;
            formattedFormula += variableName;
            this.plainFormula += `[[${subtableId}subtableDiv${colId}]]`;
            this.appendVariable(variableName);
          } else if (colId) {
            const variableName = 'col_' + colId.replaceAll('-', '_');
            formattedFormula += variableName;
            this.plainFormula += `[[${colId}]]`;
            this.appendVariable(variableName);
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
