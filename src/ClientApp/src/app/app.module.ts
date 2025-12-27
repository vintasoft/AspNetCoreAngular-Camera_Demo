import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { CameraDemoComponent } from './camera-demo/camera-demo';
import { BlockUiDialog, BlockUiDialogContent } from './dialogs/block-ui-dialog';
import { ErrorMessageDialog, ErrorMessageDialogContent } from './dialogs/error-message-dialog';
import { SimpleBarcodeReaderSettingsDialog, SimpleBarcodeReaderSettingsDialogContent } from './dialogs/simple-barcode-reader-settings-dialog';
import { WebcamDialog, WebcamDialogContent } from './dialogs/webcam-dialog';

@NgModule({
  declarations: [
    AppComponent,
    CameraDemoComponent,
    BlockUiDialog,
    BlockUiDialogContent,
    ErrorMessageDialog,
    ErrorMessageDialogContent,
    SimpleBarcodeReaderSettingsDialog,
    SimpleBarcodeReaderSettingsDialogContent,
    WebcamDialog,
    WebcamDialogContent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', component: CameraDemoComponent, pathMatch: 'full' },
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
