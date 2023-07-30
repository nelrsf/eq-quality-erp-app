import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[eqTooltip]',
  standalone: true
})
export class TooltipDirective implements AfterViewInit {

  @Input() eqTooltip!: string;
  @Input() eqTooltipWidth!: string;
  @Input() urlImage: boolean = false;
  tooltip: any;

  constructor(public elementRef: ElementRef, private renderer2: Renderer2) {

  }


  ngAfterViewInit(): void {
    this.tooltip = this.createTooltip();
    this.elementRef.nativeElement.style.position = "relative";
    this.elementRef.nativeElement.appendChild(this.tooltip);
  }


  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: any) {
    this.showTooltip(event);
  }

  showTooltip(event: any) {
    this.tooltip.style.position = 'fixed';
    const offsetx = 10;
    const offsety = 10;
    this.tooltip.style.left = event.x + offsetx + 'px';
    this.tooltip.style.top = event.y + offsety + 'px';
    if (!this.urlImage) {
      this.tooltip.innerHTML = this.eqTooltip;
    } else {
      this.tooltip.innerHTML = `<img src='${this.eqTooltip}' width='200rem'/>`;
    }
    this.tooltip.style.display = "block";
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: any) {
    this.tooltip.style.display = "none";
  }


  createTooltip() {
    const tooltip = this.renderer2.createElement("div");
    tooltip.style.width = this.eqTooltipWidth ? this.eqTooltipWidth : "";
    tooltip.classList.add("eq-tooltip")
    return tooltip;
  }

}
