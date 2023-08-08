import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StringComponent } from './string/string.component';
import { FieldRendererComponent } from './field-renderer/field-renderer.component';
import { FieldRendererDirective } from './field-renderer.directive';
import { BooleanComponent } from './boolean/boolean.component';
import { DateComponent } from './date/date.component';
import { NumberComponent } from './number/number.component';
import { FileComponent } from './file/file.component';




@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    StringComponent,
    BooleanComponent,
    DateComponent,
    NumberComponent,
    FileComponent,
    FieldRendererComponent,
    FieldRendererDirective
  ],
  exports:[
    CommonModule,
    StringComponent,
    BooleanComponent,
    DateComponent,
    NumberComponent,
    FileComponent,
    FieldRendererComponent,
    FieldRendererDirective
  ]
})
export class FieldsModule { }
