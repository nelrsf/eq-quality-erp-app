import { AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';
import { DragDropService } from '../services/drag-drop.service';

@Directive({
  selector: '[eqDropTarget]',
  standalone: true
})
export class DropTargetDirective implements AfterViewInit {

  @Input() eqDropTarget: any;
  @Output() eqDropTargetChange = new EventEmitter();

  constructor(public elementRef: ElementRef, private renderer2: Renderer2, private dragDropServie: DragDropService, private cdf: ChangeDetectorRef) { }



  ngAfterViewInit(): void {
    // this.reOrderElements(this.elementRef.nativeElement.parentElement);
    // this.cdf.detectChanges();
  }

  @HostListener("dragover", ["$event"])
  onDragOver(event: DragEvent) {
    const x = event.clientX;
    const y = event.clientY;
    const rect: DOMRect = this.elementRef.nativeElement?.getBoundingClientRect();
    const threshold = 20;
    const movingElement = this.dragDropServie.dragDropDataTransfer;

    if (x < rect.x + threshold) {
      this.renderer2.insertBefore(this.elementRef.nativeElement.parentNode, movingElement.nativeElement, this.renderer2.nextSibling(this.elementRef.nativeElement))
    } else if (x > rect.x + rect.width - threshold) {
      this.renderer2.insertBefore(this.elementRef.nativeElement.parentNode, movingElement.nativeElement, this.elementRef.nativeElement)
    }

    if (y < rect.y + threshold) {
      this.renderer2.insertBefore(this.elementRef.nativeElement.parentNode, movingElement.nativeElement, this.renderer2.nextSibling(this.elementRef.nativeElement))
    } else if (y > rect.height + rect.y - threshold) {
      this.renderer2.insertBefore(this.elementRef.nativeElement.parentNode, movingElement.nativeElement, this.elementRef.nativeElement)
    }
    
    const newModel = this.dragDropServie.reOrderElements(this.elementRef.nativeElement.parentElement, this.eqDropTarget);
    this.eqDropTargetChange.emit(newModel);
  }

}
