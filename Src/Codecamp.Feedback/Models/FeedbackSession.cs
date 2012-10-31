using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Codecamp.Feedback.Models
{
	public class FeedbackSession
	{
		[JsonIgnore]
		public int Id { get; set; }
		public int SessionId { get; set; }
		[JsonIgnore]
		public Session Session { get; set; }
		[JsonIgnore]
		public Guid FeedbackUserId { get; set; }
		[JsonIgnore]
		public FeedbackUser FeedbackUser { get; set; }
		public int ContentRating { get; set; }
		public int PresentationRating { get; set; }
		[JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
		public string Notes { get; set; }
	}
}