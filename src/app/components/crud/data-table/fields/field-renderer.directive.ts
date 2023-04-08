import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[eqFieldRenderer]',
  standalone: true
})
export class FieldRendererDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
