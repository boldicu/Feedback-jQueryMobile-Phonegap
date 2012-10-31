using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Codecamp.Feedback.Controllers
{
	public class JsonNetActionInvoker : ControllerActionInvoker
	{
		protected override ActionResult InvokeActionMethod(ControllerContext controllerContext, ActionDescriptor actionDescriptor, IDictionary<string, object> parameters)
		{
			ActionResult invokeActionMethod = base.InvokeActionMethod(controllerContext, actionDescriptor, parameters);

			if (invokeActionMethod.GetType() == typeof(JsonResult))
			{
				return new JsonNetResult(invokeActionMethod as JsonResult);
			}

			return invokeActionMethod;
		}

		private class JsonNetResult : JsonResult
		{
			public JsonNetResult()
			{
				this.ContentType = "application/json";
			}

			public JsonNetResult(JsonResult existing)
			{
				this.ContentEncoding = existing.ContentEncoding;
				this.ContentType = !string.IsNullOrWhiteSpace(existing.ContentType) ? existing.ContentType : "application/json";
				this.Data = existing.Data;
				this.JsonRequestBehavior = existing.JsonRequestBehavior;
			}

			public override void ExecuteResult(ControllerContext context)
			{
				if (context == null)
				{
					throw new ArgumentNullException("context");
				}
				if ((this.JsonRequestBehavior == JsonRequestBehavior.DenyGet) && string.Equals(context.HttpContext.Request.HttpMethod, "GET", StringComparison.OrdinalIgnoreCase))
				{
					base.ExecuteResult(context);                            // Delegate back to allow the default exception to be thrown
				}

				HttpResponseBase response = context.HttpContext.Response;
				response.ContentType = this.ContentType;

				if (this.ContentEncoding != null)
				{
					response.ContentEncoding = this.ContentEncoding;
				}

				if (this.Data != null)
				{
					// Replace with your favourite serializer.  
					var callback = context.HttpContext.Request.QueryString["callback"];
					var jsonP = !string.IsNullOrWhiteSpace(callback);
					if (jsonP)
					{
						response.Output.Write(callback);
						response.Output.Write("(");
					}
					new Newtonsoft.Json.JsonSerializer().Serialize(response.Output, this.Data);
					if (jsonP)
					{
						response.Output.Write(");");
					}

				}
			}
		}
	}
}