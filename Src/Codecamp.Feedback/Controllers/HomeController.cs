using Codecamp.Feedback.Models;
using Codecamp.Feedback.Properties;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Transactions;
using System.Web;
using System.Web.Mvc;

namespace Codecamp.Feedback.Controllers
{
	public class HomeController : Controller
	{
	
		public ActionResult Index()
		{
			ViewBag.Message = "Modify this template to jump-start your ASP.NET MVC application.";
			//using (var ts = new TransactionScope())
			{
				using (var context = new FeedbackContext())
				{
					ViewBag.Message += context.Events.ToArray().Length;
					context.SaveChanges();
				}
			}
			return View();
		}
		
		public ActionResult About()
		{
			ViewBag.Message = "Your app description page.";

			return View();
		}

		public ActionResult Contact()
		{
			ViewBag.Message = "Your contact page.";

			return View();
		}
	}
}
