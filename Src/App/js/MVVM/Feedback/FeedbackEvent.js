(function (Codecamp) {
	function displaySuccess() {
		var args = arguments, length = args.length || 1;
		--length;
		args[length] = $.extend({
			theme: "e"
		}, args[length]);
		return Codecamp.displayLoadingTimeout.apply(this, args);
	}
	function displayError() {
		var args = arguments, length = args.length || 1;
		--length;
		args[length] = $.extend({
			theme: "b"
		}, args[length]);
		return Codecamp.displayLoadingTimeout.apply(this, args);
	}
	function displayLoading(timeout) {
		return displaySuccess(timeout, {
			textVisible: false,
			textonly: false
		});
	}
	$.extend(Codecamp.viewModels, {
		FeedbackEvent: function (data) {
			var viewModel = ko.mapping.fromJS({
				saved: true,
				PrimaryTechnology: null,
				PrimaryTechnologyOther: null,
				EventId: null,
				Suggestions: null,
				WantedTechnologies: null,
				LikedMost: null,
				Rating: 20,
				FeedbackUser: {
					Name: null,
					Email: null
				}
			});
			ko.mapping.fromJS(data, {}, viewModel)
			//log1("saved", data && data.saved, viewModel.saved());
			$.extend(viewModel, {
				'vote': function (vote) {
					displayLoading(10000);
					var eventId = Codecamp.currentEventId;
					$.ajax({
						url: Codecamp.api.feedback + "VoteEvent?EventId=" + eventId,
						dataType: 'jsonp',
						contentType: "application/json;charset=UTF-8",
						method: 'get',
						data: { vote: vote },
						timeout: 10000,
						success: function (data) {
							displaySuccess(data.Message || "Thank you", 2000);
							viewModel.Rating(data.Rating);
							$.cookie("event-" + eventId, data.Rating, { expires: new Date(2020, 1, 1) });
						},
						error: function () {
							displayError("Rating data could not be saved. Are you connected to the internet?", 3000, { theme: "b" });
						}
					});
					return false;
				},
				'save': function () {
					displayLoading(10000);
					var eventId = Codecamp.currentEventId;
					function saveToCookie(model) {
						$.cookie("eventFB-" + eventId, $.stringify(model), { expires: new Date(2020, 1, 1) });
					}
					var model = ko.mapping.toJS(viewModel);
					var data = $.param(model).replace(/(FeedbackUser)(\[|\%5B)(.+?)(\]|\%5D)/gi, "$1.$3");
					//save the cookie not to waste the data if the user is offline
					model.saved = false;
					saveToCookie(model);

					$.ajax({
						url: Codecamp.api.feedback + "Event?EventId=" + eventId,
						dataType: 'jsonp',
						contentType: "application/json;charset=UTF-8",
						method: 'get',
						data: data,
						timeout: 10000,
						success: function (data) {
							displaySuccess(data.Message || "Thank you", 2000);
							viewModel.saved(true);
							model.saved = true;
							saveToCookie(model);
						},
						error: function () {
							viewModel.saved(false);
							displayError("Feedback data could not be saved. Please try again later! Are you connected to the internet?", 3000, { theme: "b" });
						}
					});
					return false;
				}
			});
			return viewModel;
		}
	});
})(Codecamp);