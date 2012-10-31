using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Codecamp.Feedback.Models
{
	public class Session
	{
		public int Id { get; set; }
		public string Description { get; set; }
		public string Title { get; set; }
		public string Logo { get; set; }
		public DateTime? Start { get; set; }
		public DateTime? End { get; set; }
		public bool OverrideTracks { get; set; }
		public List<int> SpeakerRefIds { get; set; }
		public int? TrackRefId { get; set; }
		[JsonIgnore]
		public int EventId { get; set; }
		[JsonIgnore]
		public Event Event { get; set; }
	}
}