import { Component, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ErrorMessageDialog } from './error-message-dialog';
import { VideoInputDeviceManager, VideoInputDevice } from '../camera-demo/videoInputDeviceManager';


let _webcamDialogContent: WebcamDialogContent;


@Component({
  selector: 'webcam-dialog-content',
  templateUrl: './webcam-dialog.html'
})
export class WebcamDialogContent {

  public viewer: Vintasoft.Imaging.UI.WebImageViewerJS | null = null;
  private modalService: NgbModal | null = null;
  public event: EventEmitter<any> = new EventEmitter();

  public message: object | null = null;
  private _deviceSelectList: HTMLSelectElement | null = null;
  private _videoElement: HTMLVideoElement | null = null;
  private _videoInputDeviceManager: VideoInputDeviceManager | null = null;
  private _frameUploading: boolean = false;
  private _selectedDevice: VideoInputDevice | null = null;


  constructor(public activeModal: NgbActiveModal) {
  }


  /**
   OnInit event occurs.
  */
  ngOnInit() {
    _webcamDialogContent = this;

    this._deviceSelectList = document.getElementById("videoSourceSelect") as HTMLSelectElement;
    this._videoElement = document.getElementById("webCamVideo") as HTMLVideoElement;
    this._videoElement.setAttribute("playsinline", "true");

    this._videoInputDeviceManager = new VideoInputDeviceManager();
    this._frameUploading = false;
    this._selectedDevice = null;


    let captureVideoFrameButtonElement: HTMLElement | null = document.getElementById("captureVideoFrameButton");
    if (captureVideoFrameButtonElement != null)
      captureVideoFrameButtonElement.onclick = _webcamDialogContent.captureVideoFrameButton_click;

    let videoSourceSelectElement: HTMLElement | null = document.getElementById("videoSourceSelect");
    if (videoSourceSelectElement != null)
      videoSourceSelectElement.onchange = _webcamDialogContent.videoSourceSelect_change;

    let refreshDevicesListButtonElement: HTMLElement | null = document.getElementById("refreshDevicesListButton");
    if (refreshDevicesListButtonElement != null)
      refreshDevicesListButtonElement.onclick = _webcamDialogContent.refreshDevicesListButton_click;

    if (navigator.mediaDevices && _webcamDialogContent._videoInputDeviceManager != null)
      _webcamDialogContent._videoInputDeviceManager.refreshDevices(_webcamDialogContent.__getVideoDevices_success, _webcamDialogContent.__handleError);
    else {
      let message = "Your browser doesn't support 'mediaDevices'.";
      _webcamDialogContent.__handleError(message);
    }
  }



  /**
   Sets a selected video device.
  */
  set_SelectedDevice(device: VideoInputDevice | null) {
    if (device != null && !(device instanceof VideoInputDevice))
      throw new Error("Argument type exception");
    // if previously selected device is defined
    if (_webcamDialogContent._selectedDevice != null) {
      // stop playing video
      _webcamDialogContent._selectedDevice.deactivate();
      Vintasoft.Shared.unsubscribeFromEvent(_webcamDialogContent._selectedDevice);

    }

    // block the "Capture" button
    _webcamDialogContent.__blockCaptureFrameButton();

    // set new device as selected
    _webcamDialogContent._selectedDevice = device;

    // if new selected device is defined
    if (_webcamDialogContent._selectedDevice != null && _webcamDialogContent._videoElement != null) {
      // start playing video
      _webcamDialogContent._selectedDevice.activate(_webcamDialogContent._videoElement, _webcamDialogContent.__unblockCaptureFrameButton, _webcamDialogContent.__handleError);
      Vintasoft.Shared.subscribeToEvent(_webcamDialogContent._selectedDevice, "closed", _webcamDialogContent.__selectedVideoDeviceClosed);
    }
  }

  /**
   Selected device is closed.
  */
  __selectedVideoDeviceClosed(event: object) {
    _webcamDialogContent.set_SelectedDevice(null);
  }

  /**
   Selected video input is changed.
  */
  videoSourceSelect_change() {
    if (_webcamDialogContent._deviceSelectList == null || _webcamDialogContent._videoInputDeviceManager == null)
      return;

    // get new selected device id
    let newDeviceId: string = _webcamDialogContent._deviceSelectList.value;
    // if selected device exist and have same id
    if (_webcamDialogContent._selectedDevice != null && _webcamDialogContent._selectedDevice.get_Id() === newDeviceId)
      // exit
      return;

    let newDevice = _webcamDialogContent._videoInputDeviceManager.findDeviceById(newDeviceId);
    _webcamDialogContent.set_SelectedDevice(newDevice);
  }

  /**
   Refreshes list of available devices.
  */
  refreshDevicesListButton_click() {
    // block capture button
    _webcamDialogContent.__blockCaptureFrameButton();

    if (_webcamDialogContent._videoInputDeviceManager != null) {
      // refresh the list of available video devices
      _webcamDialogContent._videoInputDeviceManager.refreshDevices(_webcamDialogContent.__getVideoDevices_success, _webcamDialogContent.__handleError);
    }
  }

  /**
   Captures video frame.
  */
  captureVideoFrameButton_click() {
    if (!_webcamDialogContent._frameUploading) {
      if (_webcamDialogContent._selectedDevice != null) {
        // get image as a Base64 string
        let frameAsBase64String = _webcamDialogContent._selectedDevice.captureFrameAsBase64String(document.getElementById("capturedFrameCanvas"));

        // upload video frame to the server
        _webcamDialogContent.__uploadVideoFrame(frameAsBase64String);
      }
    }
  }

  /**
   Uploads video frame to the server.
  */
  __uploadVideoFrame(frameAsBase64String: string) {
    // start the asynchronous frame uploading process
    Vintasoft.Imaging.VintasoftFileAPI.uploadBase64Image(frameAsBase64String, "camera.png", _webcamDialogContent.__uploadVideoFrame_success, _webcamDialogContent.__uploadVideoFrame_error);

    // specify that frame uploading is started
    _webcamDialogContent._frameUploading = true;
  }

  /**
   Video frame is uploaded successfully.
  */
  __uploadVideoFrame_success(data: any) {
    // add the uploaded frame image to the image viewer
    _webcamDialogContent.__addImageToImageViewer(data.imageInfo);

    // specify that frame uploading is finished
    _webcamDialogContent._frameUploading = false;
  }

  /**
   Video frame is NOT uploaded.
  */
  __uploadVideoFrame_error(data: any) {
    _webcamDialogContent.__handleError(data);
    _webcamDialogContent._frameUploading = false;
  }

  /**
   Adds the image to the image viewer.
  */
  __addImageToImageViewer(imageInfo: any) {
    if (this.viewer == null)
      return;

    let viewer = this.viewer;
    let images = viewer.get_Images();

    let source = new Vintasoft.Shared.WebImageSourceJS(imageInfo.fileInfo.id);
    let image = new Vintasoft.Shared.WebImageJS(source, imageInfo.pageIndex);

    images.add(image);
    let imageCount = images.get_Count();
    viewer.set_FocusedIndex(imageCount - 1);
  }

  /**
   Information about video devices is received successfully.
  */
  __getVideoDevices_success(videoInputDeviceManager: any) {
    let devices = videoInputDeviceManager.get_Devices();

    if (devices.length > 0) {
      // update information about available devices
      _webcamDialogContent.__updateDevicesList(devices);

      // if active device is NOT defined
      if (_webcamDialogContent._selectedDevice == null)
        // use the first video device as active device
        _webcamDialogContent.set_SelectedDevice(devices[0]);
      else
        _webcamDialogContent.__unblockCaptureFrameButton();

    }
    else {
      _webcamDialogContent.__handleError("Video devices are not found.");
    }
  }

  /**
   Updates information about available video devices in select element.
  */
  __updateDevicesList(devices: any) {
    // id of selected device
    let selectedDeviceId;
    // if selected device exists
    if (_webcamDialogContent._selectedDevice != null)
      // get id
      selectedDeviceId = _webcamDialogContent._selectedDevice.get_Id();

    _webcamDialogContent.__clearDeviceSelectList();

    _webcamDialogContent._fillDeviceSelectList(devices);

    _webcamDialogContent.__selectDeviceInDeviceSelectList(selectedDeviceId);
  }

  /**
   Clears list with information about available video devices.
  */
  __clearDeviceSelectList() {
    if (_webcamDialogContent._deviceSelectList == null)
      return;

    _webcamDialogContent._deviceSelectList.options.length = 0;
  }

  /**
   Writes information about available video devices in select element.
  */
  _fillDeviceSelectList(devices: any) {
    if (_webcamDialogContent._deviceSelectList == null)
      return;

    // for each device info
    for (let i = 0; i < devices.length; i++) {
      // create option for device select list
      let opt = _webcamDialogContent.__createOptionElementForDeviceSelectList(devices[i]);

      // add option to the device select list
      _webcamDialogContent._deviceSelectList.appendChild(opt);
    }
  }

  /**
   Creates option element for the specified video device.
  */
  __createOptionElementForDeviceSelectList(device: any) {
    let deviceId = device.get_Id();

    // create option element
    let opt = document.createElement("option");
    // save information about device id
    opt.value = deviceId;
    // use device name as option text
    opt.text = device.get_Name();

    return opt;
  }

  /**
   Selects option element for the specified video device.
  */
  __selectDeviceInDeviceSelectList(selectedDeviceId: any) {
    if (_webcamDialogContent._deviceSelectList == null)
      return;

    // for each device info
    for (let i = 0; i < _webcamDialogContent._deviceSelectList.options.length; i++) {
      // create option for device select list
      let opt = _webcamDialogContent._deviceSelectList.options[i];

      // if current device is selected
      if (selectedDeviceId === opt.value) {
        // specify that option is selected
        opt.selected = true;
        break;
      }
    }
  }

  /**
   Disables the "Capture frame" button.
  */
  __blockCaptureFrameButton() {
    let captureVideoFrameButtonElement: HTMLElement | null = document.getElementById("captureVideoFrameButton");
    if (captureVideoFrameButtonElement != null)
      captureVideoFrameButtonElement.setAttribute("disabled", "disabled");
  }

  /**
   Enables the "Capture frame" button.
  */
  __unblockCaptureFrameButton() {
    let captureVideoFrameButtonElement: HTMLElement | null = document.getElementById("captureVideoFrameButton");
    if (captureVideoFrameButtonElement != null)
      captureVideoFrameButtonElement.removeAttribute("disabled");
  }

  /** 
   Handles the error.
  */
  __handleError(errorData: any) {
    if (_webcamDialogContent.modalService == null)
      return;

    let dlg: ErrorMessageDialog = new ErrorMessageDialog(_webcamDialogContent.modalService);
    dlg.errorData = errorData;
    dlg.open();

    _webcamDialogContent.close();
  }



  /**
   Closes the dialog.
  */
  close() {
    _webcamDialogContent.activeModal.close();
  }
}



@Component({
  selector: 'webcam-dialog',
  templateUrl: './webcam-dialog.html'
})
export class WebcamDialog {

  public viewer: Vintasoft.Imaging.UI.WebImageViewerJS | null = null;
  public event: EventEmitter<any> = new EventEmitter();
  private _modalReference: NgbModalRef | null = null;


  constructor(private modalService: NgbModal) {
  }


  open() {
    this._modalReference = this.modalService.open(WebcamDialogContent);
    this._modalReference.componentInstance.event.subscribe((receivedEntry: any) => {
      this.event.emit(receivedEntry);
    });
    this._modalReference.componentInstance.viewer = this.viewer;
    this._modalReference.componentInstance.modalService = this.modalService;
  }

  close() {
    if (this._modalReference == null)
      return;

    this._modalReference.close();
  }

}
