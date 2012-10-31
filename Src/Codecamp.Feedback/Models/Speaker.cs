using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Codecamp.Feedback.Models
{
	public class Speaker
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public string PortraitImageUrl { get; set; }
		public string CompanyName { get; set; }
		public string CompanyUrl { get; set; }
		public string Bio { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }
	}
}