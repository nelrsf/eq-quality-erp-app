import { AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Input, Output } from "@angular/core";


@Directive({
    selector: '[ddOrder]',
    standalone: true
})
export class DnDOrderDirective implements AfterViewInit {

    @Input() ddOrder: number | undefined;
    @Output() ddOrderChange = new EventEmitter<number | undefined>();

    constructor(public elementRef: ElementRef) { }

    ngAfterViewInit(): void {
        // this.setupMutationObserver();
        setInterval(
            ()=>{
                this.calculateElementOrder();
            }
        , 100)
    }

    calculateElementOrder() {
        const parent = this.elementRef.nativeElement.parentNode;
        const childNodes = parent?.childNodes;
        if(!childNodes){
            return
        }
        childNodes.forEach(
            (node: any, ind: number) => {
                if (node === this.elementRef.nativeElement) {
                    this.ddOrder = ind;
                    this.ddOrderChange.emit(this.ddOrder);
                }
            }
        )
    }

    //setupMutationObserver(): void {
        // const parent = this.elementRef.nativeElement.parentNode;
    
        // const observer = new MutationObserver(() => {
        //     setTimeout(
        //         ()=>{
        //             this.calculateElementOrder();
        //         }
        //     , 1000)

        // });
    
        // observer.observe(parent, {
        //   childList: true, // Detect changes to the child nodes (sibling elements)
        //   subtree: true,   // Include all descendants of the parent
        // });
      //}
}