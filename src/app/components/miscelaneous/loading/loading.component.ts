import { Component, Input } from '@angular/core';

@Component({
  selector: 'eq-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
  standalone: true
})
export class LoadingComponent {

  @Input() position: 'absolute' | 'fixed' = 'fixed';
  @Input() size: string = '6rem'

}
