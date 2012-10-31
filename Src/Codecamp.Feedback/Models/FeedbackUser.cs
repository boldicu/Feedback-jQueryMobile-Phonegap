using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Codecamp.Feedback.Models
{
	public class FeedbackUser
	{
		[JsonIgnore]
		public Guid Id { get; set; }
		[JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
		public string Name { get; set; }
		[JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
		public string Email { get; set; }
	}
}