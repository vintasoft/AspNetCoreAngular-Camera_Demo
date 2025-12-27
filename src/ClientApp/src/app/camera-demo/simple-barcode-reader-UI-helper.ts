import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SimpleBarcodeReaderSettingsDialog } from '../dialogs/simple-barcode-reader-settings-dialog';
import { SimpleBarcodeReaderHelper } from './simple-barcode-reader-helper';

let _simpleBarcodeReaderUiHelper: SimpleBarcodeReaderUiHelper;

/**
 * A helper that helps to create simple UI for barcode reading.
 */
export class SimpleBarcodeReaderUiHelper {

  _blockUiFunc: Function;
  _unblockUiFunc: Function;
  _showErrorMessageFunc: Function;

  // Button for barcode reading.
  _readBarcodesButton: Vintasoft.Imaging.UI.UIElements.WebUiElementJS | null = null;
  // Helper-class for barcode reading.
  _simpleBarcodeReaderHelper: SimpleBarcodeReaderHelper | null = null;



  constructor(private modalService: NgbModal, blockUiFunc: Function, unblockUiFunc: Function, showErrorMessageFunc: Function) {
    _simpleBarcodeReaderUiHelper = this;

    this._blockUiFunc = blockUiFunc;
    this._unblockUiFunc = unblockUiFunc;
    this._showErrorMessageFunc = showErrorMessageFunc;
  }



  /**
   * Creates UI button for recognition of barcodes.
   */
  createBarcodeReadingButton() {
    // create the button that allows to start the asynchronous barcode recognition process
    _simpleBarcodeReaderUiHelper._readBarcodesButton = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
      cssClass: "barcodeReader",
      title: "Read barcodes",
      localizationId: "readBarcodesButton",
      onClick: _simpleBarcodeReaderUiHelper.__readBarcodesButton_clicked
    });

    // subscribe to the "activated" event of "Read barcodes" button
    Vintasoft.Shared.subscribeToEvent(_simpleBarcodeReaderUiHelper._readBarcodesButton, 'activated', _simpleBarcodeReaderUiHelper.__readBarcodesButton_activated);

    return _simpleBarcodeReaderUiHelper._readBarcodesButton;
  }

  /**
   * "Read barcodes" button is clicked.
   * @param event
   * @param uiElement
   */
  __readBarcodesButton_clicked(event: any, uiElement: Vintasoft.Imaging.UI.UIElements.WebUiElementJS) {
    let docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS = uiElement.get_RootControl() as Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS;
    if (docViewer != null) {
      let viewer: Vintasoft.Imaging.UI.WebImageViewerJS = docViewer.get_ImageViewer();
      let focusedImage: Vintasoft.Shared.WebImageJS = viewer.get_FocusedImage();
      if (focusedImage != null) {
        let dlg: SimpleBarcodeReaderSettingsDialog = new SimpleBarcodeReaderSettingsDialog(_simpleBarcodeReaderUiHelper.modalService);
        dlg.dialogClosed.subscribe(received => {
          // block UI
          _simpleBarcodeReaderUiHelper._blockUiFunc('Read barcodes...');

          if (_simpleBarcodeReaderUiHelper._simpleBarcodeReaderHelper == null) {
            _simpleBarcodeReaderUiHelper._simpleBarcodeReaderHelper = new SimpleBarcodeReaderHelper(docViewer, _simpleBarcodeReaderUiHelper._unblockUiFunc, _simpleBarcodeReaderUiHelper._showErrorMessageFunc);
          }
          _simpleBarcodeReaderUiHelper._simpleBarcodeReaderHelper.startBarcodeRecognition(focusedImage, received.barcodeTypes);
        });
        dlg.open();
      }
      else
        alert("No images to process.");
    }
  }

  /**
   * "Read barcodes" button is activated.
   * @param event
   * @param eventArgs
   */
  __readBarcodesButton_activated(event: any, eventArgs: any) {
    let uiElement: Vintasoft.Imaging.UI.UIElements.WebUiElementJS = event.target;
    let docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS = uiElement.get_RootControl() as Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS;
    let imageViewer: Vintasoft.Imaging.UI.WebImageViewerJS = docViewer.get_ImageViewer();
    let images: Vintasoft.Shared.WebImageCollectionJS = imageViewer.get_Images();

    // subscribe to the "changed" event of image collection of image viewer
    Vintasoft.Shared.subscribeToEvent(images, 'changed', _simpleBarcodeReaderUiHelper.__images_changed);

    // clear information about recognized barcodes
    _simpleBarcodeReaderUiHelper.__updateReadBarcodeButtonState(images);
  }

  /**
   * Images are changed in document viewer.
   */
  __images_changed() {
    // clear information about recognized barcodes
    _simpleBarcodeReaderUiHelper.__updateReadBarcodeButtonState(this);
  }

  /**
   * Changes read barcode button state.
   * @param images Image collection.
   */
  __updateReadBarcodeButtonState(images: any) {
    if (_simpleBarcodeReaderUiHelper._readBarcodesButton == null)
      return;

    let isEnabled = images.get_Count() > 0;
    _simpleBarcodeReaderUiHelper._readBarcodesButton.set_IsEnabled(isEnabled);
  }

}
