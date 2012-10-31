using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Codecamp.Feedback.Models
{
	public class Event
	{
		public int Id { get; set; }
		public string Description { get; set; }
		public string ShortName { get; set; }
		public DateTime? StartDate { get; set; }
		public DateTime? EndDate { get; set; }
		public List<Location> Locations { get; set; }
		public List<Track> Tracks { get; set; }
		public List<Speaker> Speakers { get; set; }
		public List<Session> Sessions { get; set; }
		public bool Active { get; set; }
	}
}