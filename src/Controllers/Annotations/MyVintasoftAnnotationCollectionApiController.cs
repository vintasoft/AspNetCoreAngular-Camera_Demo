using Vintasoft.Imaging.Annotation.AspNetCore.ApiControllers;

namespace AspNetCoreAngularCameraDemo.Controllers
{
    /// <summary>
    /// A Web API controller that handles HTTP requests from clients and
    /// allows to manipulate annotations on server.
    /// </summary>
    public class MyVintasoftAnnotationCollectionApiController : VintasoftAnnotationCollectionApiController
    {

        /// <summary>
        /// Initializes a new instance of the <see cref="MyVintasoftAnnotationCollectionApiController"/> class.
        /// <param name="hostingEnvironment">Information about the web hosting environment an application is running in.</param>
        public MyVintasoftAnnotationCollectionApiController(IWebHostEnvironment hostingEnvironment)
           : base(hostingEnvironment)
        {
        }

    }
}