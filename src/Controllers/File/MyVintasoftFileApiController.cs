using Vintasoft.Imaging.AspNetCore.ApiControllers;

namespace AspNetCoreAngularCameraDemo.Controllers
{
    /// <summary>
    /// A Web API controller that handles HTTP requests from clients and
    /// allows to manipulate files on server.
    /// </summary>
    public class MyVintasoftFileApiController : VintasoftFileApiController
    {

        #region Constructors

        /// <summary>
        /// Initializes a new instance of the <see cref="MyVintasoftFileApiController"/> class.
        /// </summary>
        /// <param name="hostingEnvironment">Information about the web hosting environment an application is running in.</param>
        public MyVintasoftFileApiController(IWebHostEnvironment hostingEnvironment)
            : base(hostingEnvironment)
        {
        }

        #endregion

    }
}