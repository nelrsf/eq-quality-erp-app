import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[pageRenderer]'
})
export class PageRendererDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
