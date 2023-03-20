import { AfterViewInit, Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { DragDropService } from '../services/drag-drop.service';

@Directive({
  selector: '[eqDrag]',
  standalone: true
})
export class DragDirective implements AfterViewInit {

  @Input() eqDragKey: any;

  constructor(public elementRef: ElementRef, private renderer2: Renderer2, private dragDropService: DragDropService) { }

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.setAttribute("eqDrag-key", this.eqDragKey);
    this.elementRef.nativeElement.setAttribute("draggable", "true");
  }

  @HostListener("dragstart", ["$event"])
  onDragStart(event: DragEvent) {
    this.dragDropService.dragDropDataTransfer = this.elementRef;
  }

}
