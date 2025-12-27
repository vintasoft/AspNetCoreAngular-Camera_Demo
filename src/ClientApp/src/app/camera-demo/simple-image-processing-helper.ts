let _simpleImageProcessingHelper: SimpleImageProcessingHelper;

/**
 * A helper that helps to apply simple image processing commands to an image.
 */
export class SimpleImageProcessingHelper {

  _blockUiFunc: Function;
  _unblockUiFunc: Function;
  _showErrorMessageFunc: Function;



  constructor(blockUiFunc: Function, unblockUiFunc: Function, showErrorMessageFunc: Function) {
    _simpleImageProcessingHelper = this;

    this._blockUiFunc = blockUiFunc;
    this._unblockUiFunc = unblockUiFunc;
    this._showErrorMessageFunc = showErrorMessageFunc;
  }



  /**
   * Creates UI panel with simple processing commands. 
   */
  createUiPanelWithSimpleImageProcessingCommands() {
    let label: Vintasoft.Imaging.UI.UIElements.WebUiLabelElementJS = new Vintasoft.Imaging.UI.UIElements.WebUiLabelElementJS({ "text": "Processing", localizationId: "processingLabel" });
    let button: Vintasoft.Imaging.UI.UIElements.WebUiElementContainerJS = new Vintasoft.Imaging.UI.UIElements.WebUiElementContainerJS([label], { cssClass: "vsui-subMenu-icon" });

    let invertCommandButton = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
      cssClass: "invertButton",
      title: "Invert",
      localizationId: "invertImageButton",
      onClick: _simpleImageProcessingHelper.__invertImageButton_clicked
    });

    let rotateCommandButton = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
      cssClass: "rotate90Button",
      title: "Rotate 90",
      localizationId: "rotateImageButton",
      onClick: _simpleImageProcessingHelper.__rotateImageButton_clicked
    });

    let flipXCommandButton = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
      cssClass: "flipXButton",
      title: "FlipX",
      localizationId: "flipXImageButton",
      onClick: _simpleImageProcessingHelper.__flipXImageButton_clicked
    });

    let flipYCommandButton = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
      cssClass: "flipYButton",
      title: "FlipY",
      localizationId: "flipYImageButton",
      onClick: _simpleImageProcessingHelper.__flipYImageButton_clicked
    });

    let cropCommandButton = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
      cssClass: "cropButton",
      title: "Crop",
      localizationId: "cropImageButton",
      onClick: _simpleImageProcessingHelper.__cropImageButton_clicked
    });

    return new Vintasoft.Imaging.UI.Panels.WebUiPanelJS(
      [invertCommandButton, rotateCommandButton, flipXCommandButton, flipYCommandButton, cropCommandButton,
        Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.createElementById("vertDivider"),
        Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.createElementById("rectangularSelectionToolButton")],
      { cssClass: "vsui-subMenu-contentPanel" }, button);
  }

  /**
   * "Invert image" button is clicked.
   * @param event
   * @param uiElement
   */
  __invertImageButton_clicked(event: any, uiElement: any) {
    let invertCommand: Vintasoft.Imaging.ImageProcessing.WebInvertCommandJS = new Vintasoft.Imaging.ImageProcessing.WebInvertCommandJS();
    let docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS = uiElement.get_RootControl() as Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS;
    _simpleImageProcessingHelper.__applyProccessingCommandToFocusedImage(docViewer, invertCommand);
  }

  /**
   * "Rotate image" button is clicked.
   * @param event
   * @param uiElement
   */
  __rotateImageButton_clicked(event: any, uiElement: any) {
    let rotateCommand: Vintasoft.Imaging.ImageProcessing.WebRotateCommandJS = new Vintasoft.Imaging.ImageProcessing.WebRotateCommandJS();
    rotateCommand.set_Angle(90);
    let docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS = uiElement.get_RootControl() as Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS;
    _simpleImageProcessingHelper.__applyProccessingCommandToFocusedImage(docViewer, rotateCommand);
  }

  /**
   * "Flip image horizontally" button is clicked.
   * @param event
   * @param uiElement
   */
  __flipXImageButton_clicked(event: any, uiElement: any) {
    let flipXCommand: Vintasoft.Imaging.ImageProcessing.WebFlipCommandJS = new Vintasoft.Imaging.ImageProcessing.WebFlipCommandJS();
    flipXCommand.set_RotateFlipType(new Vintasoft.Imaging.WebRotateFlipTypeEnumJS("RotateNoneFlipX"));
    let docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS = uiElement.get_RootControl() as Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS;
    _simpleImageProcessingHelper.__applyProccessingCommandToFocusedImage(docViewer, flipXCommand);
  }

  /**
   * "Flip image vertically" button is clicked.
   * @param event
   * @param uiElement
   */
  __flipYImageButton_clicked(event: any, uiElement: any) {
    let flipYCommand: Vintasoft.Imaging.ImageProcessing.WebFlipCommandJS = new Vintasoft.Imaging.ImageProcessing.WebFlipCommandJS();
    flipYCommand.set_RotateFlipType(new Vintasoft.Imaging.WebRotateFlipTypeEnumJS("RotateNoneFlipY"));
    let docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS = uiElement.get_RootControl() as Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS;
    _simpleImageProcessingHelper.__applyProccessingCommandToFocusedImage(docViewer, flipYCommand);
  }

  /**
   * "Crop image" button is clicked.
   * @param event
   * @param uiElement
   */
  __cropImageButton_clicked(event: any, uiElement: any) {
    let cropCommand: Vintasoft.Imaging.ImageProcessing.WebCropCommandJS = new Vintasoft.Imaging.ImageProcessing.WebCropCommandJS();
    let docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS = uiElement.get_RootControl() as Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS;
    _simpleImageProcessingHelper.__applyProccessingCommandToFocusedImage(docViewer, cropCommand);
  }

  /**
   * Applies specified command to the image, which is focused in image viewer.
   * @param docViewer The document viewer.
   * @param command Processing command.
  */
  __applyProccessingCommandToFocusedImage(docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS, command: Vintasoft.Imaging.ImageProcessing.WebImageProcessingCommandBaseJS) {
    if (docViewer != null) {
      let imageViewer: Vintasoft.Imaging.UI.WebImageViewerJS = docViewer.get_ImageViewer();

      let focusedImage: Vintasoft.Shared.WebImageJS = imageViewer.get_FocusedImage();
      if (focusedImage != null) {

        if ((command instanceof Vintasoft.Imaging.ImageProcessing.WebImageProcessingCommandWithRegionJS) ||
          (command instanceof Vintasoft.Imaging.ImageProcessing.WebImageProcessingCommandWithRegionAndSourceChangeJS)) {

          // get rectangular selection tool
          let rectangularSelectionTool: Vintasoft.Imaging.UI.VisualTools.WebRectangularSelectionToolJS = docViewer.getVisualToolById("RectangularSelectionTool") as Vintasoft.Imaging.UI.VisualTools.WebRectangularSelectionToolJS;
          // if tool is active
          if (rectangularSelectionTool.get_IsEnabled()) {
            // get region of interest from rectangular selection visual tool
            let rect: any = rectangularSelectionTool.get_Rectangle();
            // set region of interest in image processing command
            command.set_Region(rect);
          }
        }

        // apply command to the image
        let commandApplicable: boolean = command.execute(focusedImage, _simpleImageProcessingHelper._unblockUiFunc, _simpleImageProcessingHelper._showErrorMessageFunc);
        if (commandApplicable)
          // block the UI
          _simpleImageProcessingHelper._blockUiFunc("Image processing");
        else
          alert("Select region on image.");
      }
      else
        alert("No images to process.");
    }
  }

}
