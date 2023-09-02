import { Completion } from "@codemirror/autocomplete";
import { EditorView } from "codemirror";

export abstract class FormulaElement {
    
    abstract getCompletionElement(): Completion | Completion[]

    abstract appyCompletionFunction(view: EditorView, completion: Completion, from: number, to: number): void

}