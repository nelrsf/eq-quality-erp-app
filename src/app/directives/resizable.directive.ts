import { AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';


@Directive({
    selector: '[eqResizable]',
    standalone: true
})
export class ResizableDirective implements AfterViewInit {

    @Input() width!: number | undefined;
    @Output() widthChange = new EventEmitter<number>();

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    ngAfterViewInit(): void {
        this.el.nativeElement.style.cursor = 'e-resize';
        if(this.width){
            this.el.nativeElement.style.width = this.width + 'px';
        }
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        event.preventDefault(); // Prevent text selection while dragging

        const initialX = event.clientX;
        const initialWidth = this.el.nativeElement.clientWidth;
        const rightBorder = initialWidth - 25; // Adjust the border width as needed

        const mouseMoveListener = (e: MouseEvent) => {
            const newWidth = initialWidth + e.clientX - initialX;
            this.renderer.setStyle(this.el.nativeElement, 'width', newWidth + 'px');
            this.width = newWidth;
            this.widthChange.emit(this.width);
        };

        const mouseUpListener = () => {
            window.removeEventListener('mousemove', mouseMoveListener);
            window.removeEventListener('mouseup', mouseUpListener);
            this.el.nativeElement.style.cursor = 'auto'; // Reset the cursor style
        };

        window.addEventListener('mousemove', (e: MouseEvent) => {
            // Check if the mouse is near the right border
            if (e.clientX >= rightBorder) {
                this.el.nativeElement.style.cursor = 'ew-resize'; // Change cursor style
            } else {
                this.el.nativeElement.style.cursor = 'auto'; // Reset the cursor style
            }
        });

        window.addEventListener('mousemove', mouseMoveListener);
        window.addEventListener('mouseup', mouseUpListener);
    }
}
