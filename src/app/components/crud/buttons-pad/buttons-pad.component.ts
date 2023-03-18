import { Component, NgModule} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';

@Component({
  selector: 'eq-buttons-pad',
  templateUrl: './buttons-pad.component.html',
  styleUrls: ['./buttons-pad.component.css'],
  standalone: true,
  imports: [
    FontAwesomeModule,
    TooltipDirective
  ]
})
export class ButtonsPadComponent {

  icons = {
    new: faPlus,
    update: faPencil,
    delete: faTrash,
    search: faSearch
  }

}
