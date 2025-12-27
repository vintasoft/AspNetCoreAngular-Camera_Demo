import { Component, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'simple-barcode-reader-settings-dialog-content',
  templateUrl: './simple-barcode-reader-settings-dialog.html'
})
export class SimpleBarcodeReaderSettingsDialogContent {

  public dialogClosed: EventEmitter<any> = new EventEmitter();


  constructor(public activeModal: NgbActiveModal) {
  }


  /**
   OnInit event occurs.
   */
  ngOnInit() {
  }

  /**
  "Read barcodes" button is clicked.
  */
  public readBarcodesButtonClicked() {
    let barcodeTypes: Vintasoft.Barcode.WebBarcodeTypeEnumJS = new Vintasoft.Barcode.WebBarcodeTypeEnumJS("None");

    let qrCheckboxObj: HTMLInputElement = document.getElementById("QR") as HTMLInputElement;
    if (qrCheckboxObj != null && qrCheckboxObj.checked)
      barcodeTypes = barcodeTypes.add("QR");

    let dataMatrixCheckboxObj: HTMLInputElement = document.getElementById("DataMatrix") as HTMLInputElement;
    if (dataMatrixCheckboxObj != null && dataMatrixCheckboxObj.checked)
      barcodeTypes = barcodeTypes.add("DataMatrix");

    let pdf417CheckboxObj: HTMLInputElement = document.getElementById("PDF417") as HTMLInputElement;
    if (pdf417CheckboxObj != null && pdf417CheckboxObj.checked)
      barcodeTypes = barcodeTypes.add("PDF417");

    let aztecCheckboxObj: HTMLInputElement = document.getElementById("Aztec") as HTMLInputElement;
    if (aztecCheckboxObj != null && aztecCheckboxObj.checked)
      barcodeTypes = barcodeTypes.add("Aztec");

    let code39CheckboxObj: HTMLInputElement = document.getElementById("Code39") as HTMLInputElement;
    if (code39CheckboxObj != null && code39CheckboxObj.checked)
      barcodeTypes = barcodeTypes.add("Code39");

    let code128CheckboxObj: HTMLInputElement = document.getElementById("Code128") as HTMLInputElement;
    if (code128CheckboxObj != null && code128CheckboxObj.checked)
      barcodeTypes = barcodeTypes.add("Code128");

    let ean8CheckboxObj: HTMLInputElement = document.getElementById("EAN8") as HTMLInputElement;
    if (ean8CheckboxObj != null && ean8CheckboxObj.checked)
      barcodeTypes = barcodeTypes.add("EAN8");

    if (barcodeTypes.toString() === "None") {
      alert("Please select barcode types for barcode recognition.");
      return;
    }
    else {
      this.dialogClosed.emit({ barcodeTypes: barcodeTypes });
    }

    this.closeDialog();
  }

  /**
   Closes the dialog.
  */
  public closeDialog() {
    this.activeModal.close();
  }

}


@Component({
  selector: 'simple-barcode-reader-settings-dialog',
  templateUrl: './simple-barcode-reader-settings-dialog.html'
})
export class SimpleBarcodeReaderSettingsDialog {

  public dialogClosed: EventEmitter<any> = new EventEmitter();
  private _modalReference: NgbModalRef | null = null;


  constructor(private modalService: NgbModal) {
  }


  public open() {
    this._modalReference = this.modalService.open(SimpleBarcodeReaderSettingsDialogContent);
    this._modalReference.componentInstance.dialogClosed.subscribe((received: any) => {
      this.dialogClosed.emit({ barcodeTypes: received.barcodeTypes });
    });
  }

  public readBarcodesButtonClicked() {
    if (this._modalReference == null)
      return;

    this._modalReference.componentInstance.readBarcodesButtonClicked();
  }

  public closeDialog() {
    if (this._modalReference == null)
      return;

    this._modalReference.componentInstance.closeDialog();
  }

}
