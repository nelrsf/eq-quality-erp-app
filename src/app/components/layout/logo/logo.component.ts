import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'eq-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.css']
})
export class LogoComponent {
  @Input() width: number = 50;
  @Input() fontWeight: string = '400';
  @Input() fontSize: string = '1.35em';

}
