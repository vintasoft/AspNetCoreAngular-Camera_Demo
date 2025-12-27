let _simpleBarcodeReaderHelper: SimpleBarcodeReaderHelper;

/**
 Represents the helper for simple barcode reader.
 */
export class SimpleBarcodeReaderHelper {
  _docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS;
  _unblockUiFunc: Function;
  _showErrorMessageFunc: Function;

  constructor(docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS, unblockUiFunc: Function, showErrorMessageFunc: Function) {
    _simpleBarcodeReaderHelper = this;

    this._docViewer = docViewer;
    this._unblockUiFunc = unblockUiFunc;
    this._showErrorMessageFunc = showErrorMessageFunc;
  }


  startBarcodeRecognition(image: Vintasoft.Shared.WebImageJS, barcodeTypes: Vintasoft.Barcode.WebBarcodeTypeEnumJS) {
    // create barcode reader
    let barcodeReader: Vintasoft.Barcode.WebBarcodeReaderJS
      = new Vintasoft.Barcode.WebBarcodeReaderJS(new Vintasoft.Shared.WebServiceControllerJS("vintasoft/api/MyVintasoftBarcodeApi"));
    // get barcode reader settings
    let barcodeReaderSettings: Vintasoft.Barcode.WebBarcodeReaderSettingsJS = barcodeReader.get_Settings();
    // set the barcode types, which should be recognized
    barcodeReaderSettings.set_BarcodeType(barcodeTypes);

    // send an asynchronous request for barcode recognition
    barcodeReader.readBarcodes(image, _simpleBarcodeReaderHelper.__readBarcodes__success, _simpleBarcodeReaderHelper._showErrorMessageFunc);
  }

  /**
   Barcode recognition process is finished successfully.
   @param {object} data
   */
  __readBarcodes__success(data: any) {
    _simpleBarcodeReaderHelper._unblockUiFunc();

    _simpleBarcodeReaderHelper.__showMessageAboutRecognitionResults(data.results);

    let imageViewer: Vintasoft.Imaging.UI.WebImageViewerJS = _simpleBarcodeReaderHelper._docViewer.get_ImageViewer();
    // create the objects, which will highlight the recognized barcodes on image
    let coloredObjects: Vintasoft.Imaging.UI.VisualTools.WebHighlightObjectsJS
      = _simpleBarcodeReaderHelper.__createHighlightingForBarcodes(data.results);
    if (coloredObjects.get_Count() > 0) {
      let tool: Vintasoft.Imaging.UI.VisualTools.WebVisualToolJS = imageViewer.get_VisualTool();
      if (tool == null || !(tool instanceof Vintasoft.Imaging.UI.VisualTools.WebHighlightToolJS)) {
        tool = new Vintasoft.Imaging.UI.VisualTools.WebHighlightToolJS();
        _simpleBarcodeReaderHelper._docViewer.set_CurrentVisualTool(tool);
      }
      (tool as Vintasoft.Imaging.UI.VisualTools.WebHighlightToolJS).clearItems();
      // add the objects in highlight tool
      (tool as Vintasoft.Imaging.UI.VisualTools.WebHighlightToolJS).addItems(coloredObjects);
    }
  }

  /**
   Shows information about recognized barcodes.
   @param {object} barcodes
   */
  __showMessageAboutRecognitionResults(barcodes: any) {
    let message: string = "Recognized barcodes: " + barcodes.length;
    for (let i = 0; i < barcodes.length; i++) {
      let item: any = barcodes[i];
      message += "\n";
      message += '[' + (i + 1) + ':' + item.barcodeType + ']\nValue: ' + item.value;
    }
    alert(message);
  }

  /**
   Creates the objects, which will highlight the recognized barcodes on an image.
   @param {object|array} barcodeInfoArray An array with information about recognized barcodes.
   @returns {object} The objects, which will highlight the recognized barcodes on an image.
   */
  __createHighlightingForBarcodes(barcodeInfoArray: any) {
    // an array with highlighting of barcodes
    let objects: Array<Vintasoft.Imaging.UI.VisualTools.WebHighlightObjectJS> = Array();
    // for each recognized barcode
    for (let i = 0; i < barcodeInfoArray.length; i++) {
      // get information about recognized barcode
      let item: any = barcodeInfoArray[i];
      // create an object, which will highlight the recognized barcode on an image
      let obj: Vintasoft.Imaging.UI.VisualTools.WebHighlightObjectJS
        = _simpleBarcodeReaderHelper.__createHighlightingForBarcode(item);

      // add highlighting to an array
      objects.push(obj);
    }
    // create the objects, which will highlight the recognized barcodes on an image
    return new Vintasoft.Imaging.UI.VisualTools.WebHighlightObjectsJS(objects, 'rgba(0,128,0,0.18)', 'rgba(0,128,0,0.75)');
  }

  /**
   Creates an object, which will highlight the recognized barcode on an image.
   @param {object} barcodeInfo Information about recognized barcode.
   @returns {oject} An object, which will highlight the recognized barcode on an image.
   */
  __createHighlightingForBarcode(barcodeInfo: any) {
    // create an array with points of barcode region
    let points: Array<{ x: number, y: number }> = Array();
    let region = barcodeInfo.region;
    points.push({ x: region.leftTop.x, y: region.leftTop.y });
    points.push({ x: region.rightTop.x, y: region.rightTop.y });
    points.push({ x: region.rightBottom.x, y: region.rightBottom.y });
    points.push({ x: region.leftBottom.x, y: region.leftBottom.y });

    // creates an object, which will highlight the recognized barcode on an image
    let obj: Vintasoft.Imaging.UI.VisualTools.WebHighlightObjectJS
      = Vintasoft.Imaging.UI.VisualTools.WebHighlightObjectJS.createObjectFromPolygon(points);
    // create the tooltip for highlighting
    obj.set_ToolTip(barcodeInfo.barcodeType + '\n' + barcodeInfo.value);
    // return the highlighting
    return obj;
  }

}
