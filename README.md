# VintaSoft ASP.NET Core Angular Camera Demo

This ASP.NET Core with Angular project uses <a href="https://www.vintasoft.com/vsimaging-dotnet-index.html">VintaSoft Imaging .NET SDK</a>.
The client-side of project is written on Angular (TypeScript+HTML+CSS). The server-side of project uses ASP.NET Core API controllers.

The project demonstrates how to capture images from DirectShow camera in ASP.NET Core with Angular:
* Capture images from DirectShow camera
* View captured images
* Process captured image
* Annotate captured image
* Recognize barcodes in captured image
* Export captured images
* The application can be used in any modern HTML5 web browser.


## Usage
1. Get the 30 day free evaluation license for <a href="https://www.vintasoft.com/vsimaging-dotnet-index.html" target="_blank">VintaSoft Imaging .NET SDK</a> as described here: <a href="https://www.vintasoft.com/docs/vsimaging-dotnet/Licensing-Evaluation.html" target="_blank">https://www.vintasoft.com/docs/vsimaging-dotnet/Licensing-Evaluation.html</a>

2. Update the evaluation license in "src\Program.cs" file:
   ```
   Vintasoft.Imaging.ImagingGlobalSettings.Register("REG_USER", "REG_EMAIL", "EXPIRATION_DATE", "REG_CODE");
   ```

3. Build the project ("AspNetCoreAngularCameraDemo.Net10.csproj" file) in Visual Studio or using .NET CLI:
   ```
   dotnet build AspNetCoreAngularCameraDemo.Net10.csproj
   ```

4. Run compiled application and try to capture images from DirectShow camera.


## Documentation
VintaSoft Imaging .NET SDK on-line User Guide and API Reference for Web developer is available here: https://www.vintasoft.com/docs/vsimaging-dotnet-web/


## Support
Please visit our <a href="https://myaccount.vintasoft.com/">online support center</a> if you have any question or problem.
