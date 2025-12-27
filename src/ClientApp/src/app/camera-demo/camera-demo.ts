import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { BlockUiDialog } from '../dialogs/block-ui-dialog';
import { ErrorMessageDialog } from '../dialogs/error-message-dialog';
import { WebcamDialog } from '../dialogs/webcam-dialog';
import { SimpleBarcodeReaderUiHelper } from './simple-barcode-reader-UI-helper';
import { SimpleImageProcessingHelper } from './simple-image-processing-helper';


let _cameraDemoComponent: CameraDemoComponent;


@Component({
  selector: 'camera-demo',
  templateUrl: './camera-demo.html',
})
export class CameraDemoComponent {

  // Document viewer.
  _docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS | null = null;

  // Dialog that allows to preview webcam video and capture images from webcam.
  _webcamDialog: WebcamDialog | null = null;

  // Dialog that allows to block UI.
  _blockUiDialog: BlockUiDialog | null = null;



  constructor(public modalService: NgbModal, private httpClient: HttpClient) {
    _cameraDemoComponent = this;

  }



  /**
   * Component is initializing.
   */
  ngOnInit() {
    // get identifier of current HTTP session
    this.httpClient.get<any>('api/Session/GetSessionId').subscribe(data => {
      // set the session identifier
      Vintasoft.Shared.WebImagingEnviromentJS.set_SessionId(data.sessionId);

      // specify web services, which should be used by Vintasoft Web Document Viewer
      Vintasoft.Shared.WebServiceJS.defaultFileService = new Vintasoft.Shared.WebServiceControllerJS("vintasoft/api/MyVintasoftFileApi");
      Vintasoft.Shared.WebServiceJS.defaultImageCollectionService = new Vintasoft.Shared.WebServiceControllerJS("vintasoft/api/MyVintasoftImageCollectionApi");
      Vintasoft.Shared.WebServiceJS.defaultImageService = new Vintasoft.Shared.WebServiceControllerJS("vintasoft/api/MyVintasoftImageApi");
      Vintasoft.Shared.WebServiceJS.defaultImageProcessingService = new Vintasoft.Shared.WebServiceControllerJS("vintasoft/api/MyVintasoftImageProcessingApi");
      Vintasoft.Shared.WebServiceJS.defaultAnnotationService = new Vintasoft.Shared.WebServiceControllerJS("vintasoft/api/MyVintasoftAnnotationCollectionApi");
      Vintasoft.Shared.WebServiceJS.defaultBarcodeService = new Vintasoft.Shared.WebServiceControllerJS("vintasoft/api/MyVintasoftBarcodeApi");

      // register new UI elements
      this.__registerNewUiElements();

      // create the document viewer settings
      let docViewerSettings: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerSettingsJS = new Vintasoft.Imaging.DocumentViewer.WebDocumentViewerSettingsJS("documentViewerContainer", "documentViewer", true);

      // initialize main menu of document viewer
      this.__initMenu(docViewerSettings);

      // initialize side panel of document viewer
      this.__initSidePanel(docViewerSettings);

      // create the document viewer
      this._docViewer = new Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS(docViewerSettings);

      // subscribe to the "warningOccured" event of document viewer
      Vintasoft.Shared.subscribeToEvent(this._docViewer, "warningOccured", this.__docViewer_warningOccured);
      // subscribe to the asyncOperationStarted event of document viewer
      Vintasoft.Shared.subscribeToEvent(this._docViewer, "asyncOperationStarted", this.__docViewer_asyncOperationStarted);
      // subscribe to the asyncOperationFinished event of document viewer
      Vintasoft.Shared.subscribeToEvent(this._docViewer, "asyncOperationFinished", this.__docViewer_asyncOperationFinished);
      // subscribe to the asyncOperationFailed event of document viewer
      Vintasoft.Shared.subscribeToEvent(this._docViewer, "asyncOperationFailed", this.__docViewer_asyncOperationFailed);

      // get the image viewer of document viewer
      let imageViewer1: Vintasoft.Imaging.UI.WebImageViewerJS = this._docViewer.get_ImageViewer();
      // specify that image viewer must show images in the single continuous column mode
      imageViewer1.set_DisplayMode(new Vintasoft.Imaging.WebImageViewerDisplayModeEnumJS("SingleContinuousColumn"));
      // specify that image viewer must show images in the fit width mode
      imageViewer1.set_ImageSizeMode(new Vintasoft.Imaging.WebImageSizeModeEnumJS("FitToWidth"));

      // create the progress image
      let progressImage: HTMLImageElement = new Image();
      progressImage.src = window.location + "Images/fileUploadProgress.gif";
      // specify that the image viewer must use the progress image for indicating the image loading progress
      imageViewer1.set_ProgressImage(progressImage);

      // names of visual tools in composite visual tool
      let visualToolNames: string = "AnnotationVisualTool,PanTool";
      // if touch device is used
      if (this.__isTouchDevice()) {
          // get zoom tool from document viewer
          let zoomTool: Vintasoft.Imaging.UI.VisualTools.WebVisualToolJS = this._docViewer.getVisualToolById('ZoomTool');
          // specify that zoom tool should not disable context menu
          zoomTool.set_DisableContextMenu(false);

          // add name of zoom tool to the names of visual tools of composite visual tool
          visualToolNames = visualToolNames + ",ZoomTool";
      }
      // get the visual tool
      let annotationNavigationTextSelectionTool: Vintasoft.Imaging.UI.VisualTools.WebVisualToolJS =
        this._docViewer.getVisualToolById(visualToolNames);
      this._docViewer.set_CurrentVisualTool(annotationNavigationTextSelectionTool);

      // subscribe to the focusedIndexChanged event of image viewer
      Vintasoft.Shared.subscribeToEvent(imageViewer1, "focusedIndexChanged", this.__imageViewer_focusedIndexChanged);
    });
  }



  // === "File" toolbar ===

  /**
   * Creates UI button for capturing images from web camera.
   */
  __createCaptureImageButton() {
    let button = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
      cssClass: "captureFromCamera",
      title: "Capture from camera",
      localizationId: "captureImageButton",
      onClick: _cameraDemoComponent.__captureImageButton_clicked
    });
    Vintasoft.Shared.subscribeToEvent(button, "activated", _cameraDemoComponent.__captureImageButton_activated);
    return button;
  }

  /**
   * "Capture from camera" button is clicked.
   * @param event
   * @param uiElement
   */
  __captureImageButton_clicked(event: any, uiElement: any) {
    if (_cameraDemoComponent._webcamDialog == null)
      _cameraDemoComponent.__captureImageButton_activated();

    if (_cameraDemoComponent._webcamDialog != null)
      _cameraDemoComponent._webcamDialog.open();

  }

  /**
   * "Capture from camera" button is activated.
   */
  __captureImageButton_activated() {
    let docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS | null = _cameraDemoComponent._docViewer;
    if (docViewer != null) {
      let imageViewer: Vintasoft.Imaging.UI.WebImageViewerJS = docViewer.get_ImageViewer();
      _cameraDemoComponent._webcamDialog = new WebcamDialog(_cameraDemoComponent.modalService);
      _cameraDemoComponent._webcamDialog.viewer = imageViewer;

      Vintasoft.Shared.subscribeToEvent(_cameraDemoComponent._webcamDialog, "frameUploading", _cameraDemoComponent.__webcamDialog_frameUploading);
      Vintasoft.Shared.subscribeToEvent(_cameraDemoComponent._webcamDialog, "frameUploaded frameUploadingFailed", _cameraDemoComponent.__unblockUI);
    }
  }

  /**
   * Image, which is catured from webcam, is uploading.
   */
  __webcamDialog_frameUploading() {
    _cameraDemoComponent.__blockUI("Image uploading");
  }



  // === "Tools" toolbar ===

  /**
   * Creates UI button for activating the visual tool, which allows to annotate and pan images in image viewer.
   */
  __createAnnotationAndPanToolButton() {
    // if touch device is used
    if (_cameraDemoComponent.__isTouchDevice()) {
        return new Vintasoft.Imaging.UI.UIElements.WebUiVisualToolButtonJS({
            cssClass: "vsdv-tools-panButton",
            title: "Annotation, Pan, Zoom",
            localizationId: "panToolButton"
        }, "AnnotationVisualTool,PanTool,ZoomTool");
    }
    else {
        return new Vintasoft.Imaging.UI.UIElements.WebUiVisualToolButtonJS({
            cssClass: "vsdv-tools-panButton",
            title: "Annotation, Pan",
            localizationId: "panToolButton"
        }, "AnnotationVisualTool,PanTool");
    }
  }

  /**
   * Creates UI button for activating the visual tool, which allows to select the rectangular image region in image viewer and annotate image in images viewer.
   */
  __createRectangularSelectionAndAnnotationToolButton() {
    return new Vintasoft.Imaging.UI.UIElements.WebUiVisualToolButtonJS({
      cssClass: "vsdv-tools-rectSelectionButton",
      title: "Rectangular selection",
      localizationId: "rectangularSelectionToolButton"
    }, "RectangularSelectionTool,AnnotationVisualTool");
  }

  /**
   * Creates UI button for activating the visual tool, which allows to magnify and annotate images in image viewer.
   */
  __createMagnifierAndAnnotationToolButton() {
    return new Vintasoft.Imaging.UI.UIElements.WebUiVisualToolButtonJS({
      cssClass: "vsdv-tools-magnifierButton",
      title: "Magnifier",
      localizationId: "magnifierToolButton"
    }, "MagnifierTool,AnnotationVisualTool");
  }

  /**
   * Creates UI button for activating the visual tool, which allows to zoom and annotate images in image viewer.
   */
  __createZoomAndAnnotationToolButton() {
    return new Vintasoft.Imaging.UI.UIElements.WebUiVisualToolButtonJS({
      cssClass: "vsdv-tools-zoomButton",
      title: "Zoom",
      localizationId: "zoomToolButton"
    }, "ZoomTool,AnnotationVisualTool");
  }

  /**
   * Creates UI button for activating the visual tool, which allows to zoom image region and annotate images in image viewer.
   */
  __createZoomSelectionAndAnnotationToolButton() {
    return new Vintasoft.Imaging.UI.UIElements.WebUiVisualToolButtonJS({
      cssClass: "vsdv-tools-zoomSelectionButton",
      title: "Zoom selection",
      localizationId: "zoomSelectionToolButton"
    }, "ZoomSelectionTool,AnnotationVisualTool");
  }



  // === "Annotations" toolbar ===

  /**
   * Creates UI panel with annotating functionality.
   */
  __createSimpleAnnotationPanel() {
    return new Vintasoft.Imaging.UI.Panels.WebUiPanelJS(
      ["addRectangleAnnotationButton", "addTextAnnotationButton", "addLinesAnnotationButton",
        "vertDivider", "burnAnnotationsButton", "removeAnnotationButton"],
      { cssClass: "vsui-subMenu-contentPanel" }, "annotationsMenuItem");
  }



  // === Init UI ===

  /**
   * Registers custom UI elements in "WebUiElementsFactoryJS".
   */
  __registerNewUiElements() {
    var simpleBarcodeReaderUiHelper = new SimpleBarcodeReaderUiHelper(this.modalService, this.__blockUI, this.__unblockUI, this.__showErrorMessage);
    var simpleImageProcessingHelper = new SimpleImageProcessingHelper(this.__blockUI, this.__unblockUI, this.__showErrorMessage);

    // register the "Capture image" button in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement("captureImageButton", this.__createCaptureImageButton);

    // register the "Pan" button in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement("panToolButton", this.__createAnnotationAndPanToolButton);
    // register the "Rectangular selection" button in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement("rectangularSelectionToolButton", this.__createRectangularSelectionAndAnnotationToolButton);
    // register the "Magnifier" button in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement("magnifierToolButton", this.__createMagnifierAndAnnotationToolButton);
    // register the "Zoom" button in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement("zoomToolButton", this.__createZoomAndAnnotationToolButton);
    // register the "Zoom selection" button in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement("zoomSelectionToolButton", this.__createZoomSelectionAndAnnotationToolButton);
    // register the "Barcode recognition" button in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement("barcodeReadingButton", simpleBarcodeReaderUiHelper.createBarcodeReadingButton);

    // register the "Image processing" panel in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement("simpleProcessingMenuPanel", simpleImageProcessingHelper.createUiPanelWithSimpleImageProcessingCommands);

    // register the "Image annotating" panel in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement("simpleAnnotationMenuPanel", this.__createSimpleAnnotationPanel);
  }

  /**
   * Initializes main menu of document viewer.
   * @param docViewerSettings Settings of document viewer.
   */
  __initMenu(docViewerSettings: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerSettingsJS) {
    // get items of document viewer
    let items: Vintasoft.Imaging.UI.UIElements.WebUiElementCollectionJS = docViewerSettings.get_Items();

    // get the main menu of document viewer
    let mainMenu: Vintasoft.Imaging.UI.Panels.WebUiPanelContainerJS = items.getItemByRegisteredId("mainMenu") as Vintasoft.Imaging.UI.Panels.WebUiPanelContainerJS;
    // if main menu is found
    if (mainMenu != null) {
      // get items of main menu
      let mainMenuItems: Vintasoft.Imaging.UI.UIElements.WebUiElementCollectionJS = mainMenu.get_Items();

      // add new items to the main menu

      mainMenuItems.addItem("simpleProcessingMenuPanel");
      mainMenuItems.addItem("simpleAnnotationMenuPanel");
    }

    // get the "File" menu panel
    let fileMenuPanel: Vintasoft.Imaging.UI.Panels.WebUiFileToolbarPanelJS = items.getItemByRegisteredId("fileToolbarPanel") as Vintasoft.Imaging.UI.Panels.WebUiFileToolbarPanelJS;
    // if menu panel is found
    if (fileMenuPanel != null) {
      // get items of file menu panel
      let fileMenuPanelItems: Vintasoft.Imaging.UI.UIElements.WebUiElementCollectionJS = fileMenuPanel.get_Items();

      // remove the "Upload file" button from menu panel
      fileMenuPanelItems.removeItemAt(0);

      // add the "Capture image" button to the menu panel
      fileMenuPanelItems.insertItem(0, "captureImageButton");
      fileMenuPanelItems.addItem("exportAndDownloadFileButton");
      fileMenuPanelItems.addItem("clearSessionCacheButton");
    }

    // get the "Visual tools" menu panel
    let visualToolsToolbarPanel: Vintasoft.Imaging.UI.Panels.WebUiVisualToolsToolbarPanelJS = items.getItemByRegisteredId("visualToolsToolbarPanel") as Vintasoft.Imaging.UI.Panels.WebUiVisualToolsToolbarPanelJS;
    // if menu panel founded
    if (visualToolsToolbarPanel != null) {
      // get items of visual tool menu panel
      let visualToolsToolbarPanelItems: Vintasoft.Imaging.UI.UIElements.WebUiElementCollectionJS = visualToolsToolbarPanel.get_Items();

      // add "Barcode reading" button to the menu panel
      visualToolsToolbarPanelItems.addItem("barcodeReadingButton");
    }
  }

  /**
   * Initializes side panel of document viewer.
   * @param docViewerSettings Settings of document viewer.
   */
  __initSidePanel(docViewerSettings: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerSettingsJS) {
    // get items of document viewer
    let items: Vintasoft.Imaging.UI.UIElements.WebUiElementCollectionJS = docViewerSettings.get_Items();

    // get the thumbnail viewer panel of document viewer
    let thumbnailViewerPanel: Vintasoft.Imaging.UI.Panels.WebUiThumbnailViewerPanelJS = items.getItemByRegisteredId("thumbnailViewerPanel") as Vintasoft.Imaging.UI.Panels.WebUiThumbnailViewerPanelJS;
    // if panel is found
    if (thumbnailViewerPanel != null)
      // subscribe to the "actived" event of the thumbnail viewer panel of document viewer
      Vintasoft.Shared.subscribeToEvent(thumbnailViewerPanel, "activated", _cameraDemoComponent.__thumbnailsPanelActivated);
  }

  /**
   * Thumbnail viewer panel of document viewer is actived.
   */
  __thumbnailsPanelActivated(event: any, eventArgs: any) {
    let uiElement: Vintasoft.Imaging.UI.UIElements.WebUiElementJS = event.target;
    let docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS = uiElement.get_RootControl() as Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS;
    let thumbnailViewer: Vintasoft.Imaging.UI.WebThumbnailViewerJS = docViewer.get_ThumbnailViewer();
    if (thumbnailViewer != null) {
      // create the progress image
      let progressImage: HTMLImageElement = new Image();
      progressImage.src = window.location + "Images/fileUploadProgress.gif";
      // specify that the thumbnail viewer must use the progress image for indicating the thumbnail loading progress
      thumbnailViewer.set_ProgressImage(progressImage);

      // additional bottom space for text with page number under thumbnail
      let textCaptionHeight: number = 18;
      let padding: any = thumbnailViewer.get_ThumbnailPadding();
      padding[2] += textCaptionHeight
      thumbnailViewer.set_ThumbnailPadding(padding);
      thumbnailViewer.set_DisplayThumbnailCaption(true);
    }
  }



  // === Document viewer events ===

  /**
   * Warning is occured in document viewer.
   */
  __docViewer_warningOccured(event: any, eventArgs: any) {
    _cameraDemoComponent.__showErrorMessage(eventArgs.message);
  }

  /**
   * Asynchronous operation is started in document viewer.
   */
  __docViewer_asyncOperationStarted(event: any, data: any) {
    // get description of asynchronous operation
    let description: string = data.description;

    // if image is prepared for printing
    if (description === "Image prepared to print") {
      // do not block UI when images are preparing for printing
    }
    else {
      // block UI
      _cameraDemoComponent.__blockUI(data.description);
    }
  }

  /**
   * Asynchronous operation is finished in document viewer.
   */
  __docViewer_asyncOperationFinished(event: any, data: any) {
    // unblock UI
    _cameraDemoComponent.__unblockUI();
  }

  /**
   * Asynchronous operation is failed in document viewer.
   */
  __docViewer_asyncOperationFailed(event: any, data: any) {
    // unblock UI
    _cameraDemoComponent.__unblockUI();

    // get description of asynchronous operation
    let description: string = data.description;
    // get additional information about asynchronous operation
    let additionalInfo: string = data.data;
    // if additional information exists
    if (additionalInfo != null)
      _cameraDemoComponent.__showErrorMessage(additionalInfo);
    // if additional information does NOT exist
    else
      _cameraDemoComponent.__showErrorMessage(description + ": unknown error.");
  }



  // === Image viewer events ===

  __imageViewer_focusedIndexChanged() {
    if (_cameraDemoComponent._docViewer == null)
      return;

    // get visual tool of image viewer
    let visualTool: Vintasoft.Imaging.UI.VisualTools.WebVisualToolJS = _cameraDemoComponent._docViewer.get_ImageViewer().get_VisualTool();
    // if visual tool is WebHighlightToolJS and it highlights barcode recognition results
    if (visualTool != null && (visualTool instanceof Vintasoft.Imaging.UI.VisualTools.WebHighlightToolJS)) {
      // clear visual tool in image viewer
      _cameraDemoComponent._docViewer.clearCurrentVisualTool();
    }
  }



  // === Utils ===

  /**
   * Blocks the UI. 
   * @param text Message that describes why UI is blocked.
   */
  __blockUI(text: string) {
    _cameraDemoComponent._blockUiDialog = new BlockUiDialog(_cameraDemoComponent.modalService);
    _cameraDemoComponent._blockUiDialog.message = text;
    _cameraDemoComponent._blockUiDialog.open();
  }

  /**
   Unblocks the UI.
  */
  __unblockUI() {
    if (_cameraDemoComponent._blockUiDialog == null)
      return;

    if (_cameraDemoComponent._blockUiDialog !== undefined)
      _cameraDemoComponent._blockUiDialog.close();
  }

  /**
   * Shows an error message.
   * @param data Information about error.
   */
  __showErrorMessage(data: any) {
    _cameraDemoComponent.__unblockUI();

    let dlg: ErrorMessageDialog = new ErrorMessageDialog(_cameraDemoComponent.modalService);
    dlg.errorData = data;
    dlg.open();
  }

  /**
   Returns a value indicating whether touch device is used.
  */
  __isTouchDevice() {
      return navigator.maxTouchPoints > 0;
  }

}
