﻿using Codecamp.Feedback.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Codecamp.Feedback.Controllers
{
	public class FeedbackController
		: Controller
	{
		protected override void Initialize(System.Web.Routing.RequestContext requestContext)
		{
			ActionInvoker = new JsonNetActionInvoker();
			base.Initialize(requestContext);
		}
		protected int FixRating(int rating)
		{
			return Math.Min(5, Math.Max(1, rating));
		}
		protected decimal Rating(IEnumerable<FeedbackEvent> events)
		{
			var rating = events.Where(e => e.Rating != 0).Average(e => (decimal?)(e.Rating < 1m ? 1m : e.Rating > 5m ? 5m : e.Rating));
			return rating ?? 0;
		}
		public JsonResult Mine(int id)
		{
			using (var context = new FeedbackContext())
			{
				context.Configuration.LazyLoadingEnabled = false;
				var userId = User.Id();
				var ev = context.FeedbackEvents.Include("FeedbackUser").FirstOrDefault(e => e.FeedbackUserId == userId && e.EventId == id);
				ev.Rating = FixRating(ev.Rating);
				return Json(new
				{
					Event = ev,
					Sessions = context.FeedbackSessions.Where(e => e.FeedbackUserId == userId && e.Session.EventId == id).ToArray(),
				}, JsonRequestBehavior.AllowGet);

			}
		}
		[HttpGet, ActionName("Results")]
		public JsonResult FeedbackResults(int id)
		{
			using (var context = new FeedbackContext())
			{
				context.Configuration.LazyLoadingEnabled = false;
				var events = context.FeedbackEvents.Where(e => e.EventId == id).ToArray();
				return Json(new
				{
					Rating = Rating(events),
					Events = context.FeedbackEvents.Where(e => e.EventId == id).ToArray(),
					Sessions = context.FeedbackSessions.Where(e => e.Session.EventId == id).ToArray(),
				}, JsonRequestBehavior.AllowGet);

			}
		}
		[HttpGet, ActionName("Event")]
		public JsonResult EventFeedback(FeedbackEvent model)
		{
			try
			{
				if (model != null && ModelState.IsValid)
				{
					using (var context = new FeedbackContext())
					{
						context.Configuration.LazyLoadingEnabled = true;
						var userId = User.Id();
						var ev = context.Events.FirstOrDefault(e => e.Id == model.EventId);

						if (ev == null)
							ModelState.AddModelError("Validation", "Invalid event!");
						else if (!ev.Active)
							ModelState.AddModelError("Validation", "Event has been closed! Feedback is no more allowed!");
						if (ModelState.IsValid)
						{
							var data = context.FeedbackEvents.FirstOrDefault(f => f.EventId == model.EventId && f.FeedbackUserId == userId);
							if (data == null)
							{
								data = new FeedbackEvent { FeedbackUserId = userId, EventId = model.EventId };
								context.FeedbackEvents.Add(data);
							}
							var user = context.FeedbackUsers.FirstOrDefault(u => u.Id == userId);
							if (user == null)
							{
								user = new FeedbackUser { Id = userId };
								context.FeedbackUsers.Add(user);
							}
							if (model.FeedbackUser != null)
							{
								user.Name = model.FeedbackUser.Name ?? user.Name;
								user.Email = model.FeedbackUser.Email ?? user.Email;
							}
							data.FeedbackUser = user;
							data.LikedMost = model.LikedMost ?? data.LikedMost;
							data.PrimaryTechnology = model.PrimaryTechnology ?? data.PrimaryTechnology;
							data.PrimaryTechnologyOther = model.PrimaryTechnologyOther ?? data.PrimaryTechnologyOther;
							data.Suggestions = model.Suggestions ?? data.Suggestions;
							data.WantedTechnologies = model.WantedTechnologies ?? data.WantedTechnologies;
							context.SaveChanges();
						}
					}
				}
			}
			catch (Exception ex)
			{
				ModelState.AddModelError("Exception", ex);
			}
			if (!ModelState.IsValid)
				return Json(new { Success = false, Message = "There was an error while posting your feedback!", Errors = ModelState.ToJson() }, JsonRequestBehavior.AllowGet);
			else return Json(new { Success = true, Message = "Thanks for your feedback!" }, JsonRequestBehavior.AllowGet);
		}
		public JsonResult VoteEvent(int eventId, int vote)
		{
			int? rating = null;
			try
			{
				if (ModelState.IsValid)
				{
					using (var context = new FeedbackContext())
					{
						context.Configuration.LazyLoadingEnabled = true;
						var userId = User.Id();
						var ev = context.Events.FirstOrDefault(e => e.Id == eventId);

						if (ev == null)
							ModelState.AddModelError("Validation", "Invalid event!");
						else if (!ev.Active)
							ModelState.AddModelError("Validation", "Event has been closed! Rating is no more allowed!");
						if (ModelState.IsValid)
						{
							var data = context.FeedbackEvents.FirstOrDefault(f => f.EventId == eventId && f.FeedbackUserId == userId);
							if (data == null)
							{
								data = new FeedbackEvent { FeedbackUserId = userId, EventId = eventId };
								context.FeedbackEvents.Add(data);
							}
							var user = context.FeedbackUsers.FirstOrDefault(u => u.Id == userId);
							if (user == null)
							{
								user = new FeedbackUser { Id = userId };
								context.FeedbackUsers.Add(user);
							}

							data.FeedbackUser = user;
							data.Rating = vote;
							context.SaveChanges();
							rating = vote;  
						} 
					} 
				}
			} 
			catch (Exception ex)
			{
				ModelState.AddModelError("Exception", ex);
			}
			if (!ModelState.IsValid)
				return Json(new { Success = false, Message = "There was an error while posting your vote!", Errors = ModelState.ToJson() }, JsonRequestBehavior.AllowGet);
			else return Json(new { Success = true, Message = "Thanks for your vote!", Rating = rating }, JsonRequestBehavior.AllowGet);
		}
		[HttpGet, ActionName("Session")]
		public JsonResult SessionFeedback(FeedbackSession model)
		{
			try
			{
				if (model != null && ModelState.IsValid)
				{
					using (var context = new FeedbackContext())
					{
						context.Configuration.LazyLoadingEnabled = true;
						var userId = User.Id();
						var session = context.Sessions.Include("Event").FirstOrDefault(s => s.Id == model.SessionId);

						if (session == null || session.Event == null)
							ModelState.AddModelError("Validation", "Invalid session!");
						else if (!session.Event.Active)
							ModelState.AddModelError("Validation", "Event has been closed! Feedback is no more allowed!");
						if (ModelState.IsValid)
						{
							var data = context.FeedbackSessions.FirstOrDefault(f => f.SessionId == model.SessionId && f.FeedbackUserId == userId);
							if (data == null)
							{
								data = new FeedbackSession { FeedbackUserId = userId, SessionId = model.SessionId };
								context.FeedbackSessions.Add(data);
							}
							var user = context.FeedbackUsers.FirstOrDefault(u => u.Id == userId);
							if (user == null)
							{
								user = new FeedbackUser { Id = userId };
								context.FeedbackUsers.Add(user);
							}
							data.FeedbackUser = user;
							data.Notes = model.Notes;
							data.PresentationRating = model.PresentationRating;
							data.ContentRating = model.ContentRating;
							context.SaveChanges();
						}
					}
				}
			}
			catch (Exception ex)
			{
				ModelState.AddModelError("Exception", ex);
			}
			if (!ModelState.IsValid)
				return Json(new { Success = false, Message = "There was an error while posting your feedback!", Errors = ModelState.ToJson() }, JsonRequestBehavior.AllowGet);
			else return Json(new { Success = true, Message = "Thanks for your feedback!" }, JsonRequestBehavior.AllowGet);
		}
	}

}