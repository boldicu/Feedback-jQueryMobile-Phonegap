(function (Codecamp) {
	function displayLoadingTimeout(theme, options) {
		return function () {
			var args = arguments, length = args.length || 1;
			--length;
			args[length] = $.extend({
				theme: theme
			}, args[length], options);
			return Codecamp.displayLoadingTimeout.apply(this, args);
		}
	}
	var displaySuccess = displayLoadingTimeout(Codecamp.theme.successMessage),
		displayError = displayLoadingTimeout(Codecamp.theme.errorMessage),
		displayLoading = displayLoadingTimeout(Codecamp.theme.loadingMessage, {
			textVisible: false,
			textonly: false
		});
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
					displayLoading(Codecamp.loadingTimeout);
					var eventId = Codecamp.currentEventId;
					$.ajax({
						url: Codecamp.api.feedback + "VoteEvent?EventId=" + eventId,
						dataType: 'jsonp',
						contentType: "application/json;charset=UTF-8",
						method: 'get',
						data: { vote: vote },
						timeout: Codecamp.loadingTimeout,
						success: function (data) {
							displaySuccess(data.Message || "Thank you", Codecamp.successMessageTimeout);
							viewModel.Rating(data.Rating);
							$.cookie("event-" + eventId, data.Rating, { expires: new Date(2020, 1, 1) });
						},
						error: function () {
							displayError("Rating data could not be saved. Are you connected to the internet?", Codecamp.errorMessageTimeout);
						}
					});
					return false;
				},
				'save': function () {
					displayLoading(Codecamp.loadingTimeout);
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
						timeout: Codecamp.loadingTimeout,
						success: function (data) {
							displaySuccess(data.Message || "Thank you", Codecamp.successMessageTimeout);
							viewModel.saved(true);
							model.saved = true;
							saveToCookie(model);
						},
						error: function () {
							viewModel.saved(false);
							displayError("Feedback data could not be saved. Please try again later! Are you connected to the internet?", Codecamp.errorMessageTimeout);
						}
					});
					return false;
				}
			});
			return viewModel;
		}
	});
})(Codecamp);