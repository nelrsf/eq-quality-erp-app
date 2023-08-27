import * as math from "mathjs";
import { MathNode } from "mathjs";

export interface IFormula {
    expression: string,
    plainFormula: string,
    variables: Array<string>
}