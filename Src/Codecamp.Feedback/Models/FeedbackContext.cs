using Codecamp.Feedback.Properties;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace Codecamp.Feedback.Models
{
	public class FeedbackContext
		: DbContext
	{
		public DbSet<Event> Events { get; set; }
		public DbSet<Location> Locations { get; set; }
		public DbSet<Session> Sessions { get; set; }
		public DbSet<Speaker> Speakers { get; set; }
		public DbSet<Track> Tracks { get; set; }
		public DbSet<FeedbackEvent> FeedbackEvents { get; set; }
		public DbSet<FeedbackSession> FeedbackSessions { get; set; }
		public DbSet<FeedbackUser> FeedbackUsers { get; set; }
	}
	public class EntitiesContextInitializer
			: DropCreateDatabaseIfModelChanges<FeedbackContext>
	{
		protected override void Seed(FeedbackContext context)
		{
			var ev = JsonConvert.DeserializeObject<Event>(Resources.Data);
			ev.Active = true;
			context.Events.Add(ev);

			base.Seed(context);
		}
	}
}