import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[eqTooltip]',
  standalone: true
})
export class TooltipDirective implements AfterViewInit {

  @Input() eqTooltip!: string;
  tooltip: any;

  constructor(public elementRef: ElementRef, private renderer2: Renderer2) { 

   }


  ngAfterViewInit(): void {
    this.tooltip = this.createTooltip();
    this.tooltip.innerHTML = this.eqTooltip;
    this.elementRef.nativeElement.appendChild(this.tooltip);
  }


  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: any) {
    this.tooltip.innerHTML = this.eqTooltip;
    this.tooltip.style.display = "flex";
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: any) {
    this.tooltip.style.display = "none";
  }


  createTooltip() {
    const tooltip = this.renderer2.createElement("div");
    tooltip.classList.add("eq-tooltip")
    return tooltip;
  }

}
