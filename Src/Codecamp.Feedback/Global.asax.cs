using Codecamp.Feedback.Controllers;
using Codecamp.Feedback.Models;
using Codecamp.Feedback.Properties;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace Codecamp.Feedback
{
	// Note: For instructions on enabling IIS6 or IIS7 classic mode, 
	// visit http://go.microsoft.com/?LinkId=9394801

	public class MvcApplication : System.Web.HttpApplication
	{
		protected void Application_Start()
		{
			AreaRegistration.RegisterAllAreas();

			WebApiConfig.Register(GlobalConfiguration.Configuration);
			FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
			RouteConfig.RegisterRoutes(RouteTable.Routes);
			BundleConfig.RegisterBundles(BundleTable.Bundles);

			Database.SetInitializer(new EntitiesContextInitializer());

		}

		protected virtual void Application_AuthenticateRequest(object sender, EventArgs e)
		{
			var userCookie = Request.Cookies["user"];
			Guid userId;
			if (userCookie == null || !Guid.TryParse(userCookie.Value, out userId))
			{
				userCookie = new HttpCookie("user", Guid.NewGuid().ToString());
				Response.Cookies.Add(userCookie);
			}
			HttpContext.Current.User = new GenericPrincipal(new GenericIdentity(userCookie.Value), new string[] { "Codecamper" });
		}
	}
	public static class UserExtensions
	{
		public static Guid Id(this IIdentity identity)
		{
			Guid userId;
			Guid.TryParse(identity.Name, out userId);
			return userId;
		}
		public static Guid Id(this IPrincipal principal)
		{
			return principal == null ? Guid.Empty : principal.Identity.Id();
		}
		public static Dictionary<string, string[]> ToJson(this ModelStateDictionary modelState)
		{
			return modelState.ToDictionary(kvp => kvp.Key,
				kvp => kvp.Value.Errors.Select(e => e.Exception != null && string.IsNullOrEmpty(e.ErrorMessage) 
					? e.Exception.ToLogString()
					
					: e.ErrorMessage ).ToArray());
		}
		/// <summary>
		/// <para>Creates a log-string from the Exception.</para>
		/// <para>The result includes the stacktrace, innerexception et cetera, separated by <seealso cref="Environment.NewLine"/>.</para>
		/// </summary>
		/// <param name="ex">The exception to create the string from.</param>
		/// <param name="additionalMessage">Additional message to place at the top of the string, maybe be empty or null.</param>
		/// <returns></returns>
		public static string ToLogString(this Exception ex, bool printTrace = true, string additionalMessage = "")
		{
			var msg = new StringBuilder();

			if (!string.IsNullOrEmpty(additionalMessage))
			{
				msg.Append(additionalMessage);
				msg.Append(Environment.NewLine);
			}

			if (ex != null)
			{
				try
				{
					Exception orgEx = ex;

					msg.Append("Ex: ");
					msg.Append(Environment.NewLine);
					while (orgEx != null)
					{
						msg.Append(orgEx.Message);
						msg.Append(Environment.NewLine);
						orgEx = orgEx.InnerException;
					}

					if (ex.Data != null)
					{
						foreach (object i in ex.Data)
						{
							msg.Append("Data :");
							msg.Append(i.ToString());
							msg.Append(Environment.NewLine);
						}
					}

					if (printTrace && ex.StackTrace != null)
					{
						msg.Append("StackTrace:");
						msg.Append(Environment.NewLine);
						msg.Append(ex.StackTrace.ToString());
						msg.Append(Environment.NewLine);
					}

					//if (ex.Source != null)
					//{
					//	msg.Append("Source:");
					//	msg.Append(Environment.NewLine);
					//	msg.Append(ex.Source);
					//	msg.Append(Environment.NewLine);
					//}

					//if (ex.TargetSite != null)
					//{
					//	msg.Append("TargetSite:");
					//	msg.Append(Environment.NewLine);
					//	msg.Append(ex.TargetSite.ToString());
					//	msg.Append(Environment.NewLine);
					//}

					if (ex.InnerException != null)
					{
						msg.Append("Inner:");
						msg.Append(Environment.NewLine);
						msg.Append(ex.InnerException.ToLogString(false));
					}
				}
				finally
				{
				}
			}
			return msg.ToString();
		}

	}
}