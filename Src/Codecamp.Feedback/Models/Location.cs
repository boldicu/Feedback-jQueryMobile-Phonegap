using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Codecamp.Feedback.Models
{
	public class Location
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public string Notes { get; set; }
		public decimal Latitude { get; set; }
		public decimal Longitude { get; set; }
		public string City { get; set; }
	}
}