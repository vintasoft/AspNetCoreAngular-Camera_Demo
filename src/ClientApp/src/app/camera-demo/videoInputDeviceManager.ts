/**
 * Manager of video devices.
 */
let _videoInputDeviceManager: VideoInputDeviceManager;
export class VideoInputDeviceManager {

  private _devices: Array<VideoInputDevice>;



  constructor() {
    _videoInputDeviceManager = this;
    this._devices = [];
  }



  /**
   * Gets the video devices.
   */
  get_Devices() {
    return this._devices;
  }



  /**
   * Refreshes the devices. Later devices can be accessed using the get_Devices function.
   */
  refreshDevices(successFunc: Function, errorFunc: any) {
    let that = this;

    function __getUserMedia_success(stream: any) {
      // enumerate media devices
      let promise = navigator.mediaDevices.enumerateDevices();
      promise.then(__enumerateDevices_success).catch(errorFunc);
    }

    function __enumerateDevices_success(mediaDevices: any) {
      // get available video devices from available media devices
      let currentVideoDevices = _videoInputDeviceManager.__getVideoDevicesFromMediaDevices(mediaDevices);
      // get the previous list with video devices
      let previousVideoDevices = that.get_Devices();

      let i = 0;
      // for each video device in previous list
      while (i < previousVideoDevices.length) {
        // get video device from previous list
        let previousDevice = previousVideoDevices[i];
        let j = 0;
        // determines that device presents in previous and current list
        let isDevicePresentInPreviousAndCurrentList = false;
        // for each video device in current list
        while (j < currentVideoDevices.length) {
          // get video device in current list
          let currentDevice = currentVideoDevices[j];
          // if device in previous list and device in current list have the same device identifier
          if (currentDevice.get_Id() === previousDevice.get_Id()) {
            // remove device from the current list
            currentVideoDevices.splice(j, 1);
            // specify that device presents in previous and current list
            isDevicePresentInPreviousAndCurrentList = true;
            // break the loop
            break;
          }
          else
            j++;
        }
        // if device presents in previous and current list
        if (isDevicePresentInPreviousAndCurrentList)
          // go to the next device
          i++;
        // if device presents in previous list but not presents in current list
        else {
          // close the device
          previousDevice.close();
          // remove the device from the previous list
          previousVideoDevices.splice(i, 1);
        }
      }

      // for each device in current list (current list now contains only newly connected devices)
      for (i = 0; i < currentVideoDevices.length; i++)
        // add newly connected devices to the device list
        that._devices.push(currentVideoDevices[i]);

      if (successFunc != null)
        successFunc(that);
    }

    // try get access to video devices
    let promise = navigator.mediaDevices.getUserMedia({ video: true });
    promise.then(__getUserMedia_success).catch(errorFunc);
  }

  /**
   * Finds a video device with the specified ID.
   */
  findDeviceById(deviceId: any) {
    for (let i = 0; i < this._devices.length; i++) {
      if (this._devices[i].get_Id() == deviceId)
        return this._devices[i];
    }
    return null;
  }

  /**
   * Returns available video devices from available media devices.
   */
  __getVideoDevicesFromMediaDevices(mediaDevices: any) {
    let videoDevices: Array<VideoInputDevice> = []
    // for each device info
    for (let i = 0; i < mediaDevices.length; i++) {
      // current device info
      let deviceInfo = mediaDevices[i];
      // if device type is videoinput
      if (deviceInfo.kind === 'videoinput') {
        // get device name
        let deviceName = deviceInfo.label || 'camera #' + (videoDevices.length + 1);
        // create the VideoInputDeviceJS object
        let videoDevice = new VideoInputDevice(deviceInfo.deviceId, deviceName);
        // save information about device
        videoDevices.push(videoDevice);
      }
    }
    return videoDevices;
  }

};



/**
 * Video device.
 */
export class VideoInputDevice {

  private _id: string;
  private _name: string;
  private _stream: any;
  private _videoElement: any;



  constructor(id: string, name: string) {
    this._id = id;
    this._name = name;
    this._stream = null;
    this._videoElement = null;
  }



  /**
   * Gets the device name.
   */
  get_Name() {
    return this._name;
  }

  /**
   * Gets the device ID.
   */
  get_Id() {
    return this._id;
  }



  /**
   * Starts playing video.
   */
  play() {
    if (this._videoElement != null) {
      this._videoElement.play();
    }
  }

  /**
   Stops playing video.
  */
  pause() {
    if (this._videoElement != null) {
      this._videoElement.pause();
    }
  }

  /**
   * Activates the media stream of device.
   */
  activate(videoElement: HTMLVideoElement, successFunc: Function, errorFunc: any) {
    // create media stream constraints
    let constraints: object = {
      video: {
        deviceId: this._id ? { exact: this._id } : null
      }
    };
    let that = this;
    // try get media stream
    let promise = navigator.mediaDevices.getUserMedia(constraints);
    // if the media stream is received
    promise.then(function (stream: any) {
      // save reference to the media stream
      that._stream = stream;
      // save reference to the video element
      that._videoElement = videoElement;

      // get video track
      let videoTrack = stream.getVideoTracks()[0];
      // get settings of video track
      let settings = videoTrack.getSettings();

      // change size of video element
      that._videoElement.width = settings.width as number;
      that._videoElement.height = settings.height as number;

      Vintasoft.Shared.unsubscribeFromEvent(that._videoElement);
      Vintasoft.Shared.subscribeToEvent(that._videoElement, "loadedmetadata", function (event: object) {
        // if success callback is defined
        if (successFunc != null)
          // call the success callback
          successFunc();
      });


      // older browsers may not have srcObject
      if ("srcObject" in that._videoElement)
        that._videoElement.srcObject = stream;
      else if ("src" in that._videoElement) {
        that._videoElement.src = window.URL.createObjectURL(stream);
      }
    }).catch(errorFunc);
  }

  /**
   * Returns a value indicating whether the device is activated.
   */
  isActived() {
    if (this._stream != null)
      return this._stream.activate;
    return false;
  }

  /**
   * Deactivates the media stream of device.
   */
  deactivate() {
    this.pause();
    // if media stream exists
    if (this._stream) {
      // get all tracks
      let tracks = this._stream.getTracks();
      // stop each track
      for (let i = 0; i < tracks.length; i++)
        tracks[i].stop();
      this._stream = null;
    }
    // if video element exists
    if (this._videoElement) {
      // clear information about srcObject
      this._videoElement.srcObject = null;
      // clear information about video element
      this._videoElement = null;
    }
  }

  /**
   * Closes video device.
   */
  close() {
    (this as any).dispatchEvent(new Event("closed"));//fixme ?
  }

  /**
   * Captures video frame.
   */
  captureFrameAsBase64String(canvas: any) {
    // check that we have active video element
    if (this._videoElement == null)
      throw new Error("Device is not active.");
    // get canvas
    if (canvas == null)
      canvas = document.createElement("canvas");
    canvas.width = this._videoElement.width;
    canvas.height = this._videoElement.height;
    // get context
    let context = canvas.getContext("2d");
    // draw video frame
    context.drawImage(this._videoElement, 0, 0, this._videoElement.width, this._videoElement.height);
    // get canvas as base 64 data
    return canvas.toDataURL('image/png');
  }

}
