using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Codecamp.Feedback.Models
{
	public class FeedbackEvent
	{
		public int Id { get; set; }
		[JsonIgnore]
		public Guid FeedbackUserId { get; set; }
		public FeedbackUser FeedbackUser { get; set; }
		[JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
		public string PrimaryTechnology { get; set; }
		public int EventId { get; set; }
		[JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
		public string Suggestions { get; set; }
		[JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
		public string WantedTechnologies { get; set; }
		[JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
		public string LikedMost { get; set; }

		public string PrimaryTechnologyOther { get; set; }
		public int Rating { get; set; }
	}
}