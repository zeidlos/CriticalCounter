import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CorkPage } from './cork';

@NgModule({
  declarations: [
    CorkPage,
  ],
  imports: [
    IonicPageModule.forChild(CorkPage),
  ],
})
export class CorkPageModule {}
