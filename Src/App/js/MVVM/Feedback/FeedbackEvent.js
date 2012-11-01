(function (Codecamp) {
	function displayLoadingTimeout(theme, opts) {
		return function (message, timeout, options) {
			var args = arguments, length = args.length || 1;
			--length;
			args[length] = $.extend({
				theme: theme
			}, args[length], opts, options);
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
				Rating: 0,
				FeedbackUser: {
					Name: null,
					Email: null
				}
			});
			ko.mapping.fromJS(data, {}, viewModel)
			//log1("saved", data && data.saved, viewModel.saved());
			$.extend(viewModel, {
				'technologies': ko.computed({
					read: function () {
						return [
							{ name: ".NET", id: "dotnet" },
							{ name: "JAVA", id: "java" },
							{ name: "PHP", id: "php" },
							{ name: "Mobile", id: "mobile" },
							{ name: "Javascript", id: "js" },
							{ name: "Others", id: "others" },
						];
					},
					deferEvaluation: true
				}),
				'saveToCookie': function (model) {
					$.cookie("eventFB-" + Codecamp.currentEventId, $.stringify(model), { expires: new Date(2020, 1, 1) });
				},
				'vote': function (vote) {
					displayLoading(Codecamp.loadingTimeout);
					var eventId = Codecamp.currentEventId;
					//save the rating locally
					viewModel.Rating(vote * 20);
					var model = ko.mapping.toJS(viewModel);
					model.saved = false;
					viewModel.saveToCookie(model);

					$.ajax({
						url: Codecamp.api.feedback + "VoteEvent?EventId=" + eventId,
						dataType: 'jsonp',
						contentType: "application/json;charset=UTF-8",
						method: 'get',
						data: { vote: vote },
						timeout: Codecamp.loadingTimeout,
						success: function (data) {
							displaySuccess(data.Message || "Thank you", Codecamp.successMessageTimeout);
							viewModel.Rating(data.Rating); //update the rating from whatever the server says
							//mark the model as saved
							viewModel.saved(true);
							//save the model to cookie
							//deserialize it again, as it might have been changed in between
							model = ko.mapping.toJS(viewModel)
							viewModel.saveToCookie(model);
						},
						error: function () {
							//mark the model as dirty (not saved)
							viewModel.saved(false);//trigger the UI as the model could not be saved
							displayError("Rating data could not be saved. Are you connected to the internet?", Codecamp.errorMessageTimeout);
						}
					});
					return false;
				},
				'saveClick': function () {
					return viewModel.save();
				},
				'save': function (doNotSaveCokie, successMessage, options) {
					displayLoading(Codecamp.loadingTimeout);
					var eventId = Codecamp.currentEventId;

					var model = ko.mapping.toJS(viewModel);
					var data = $.param(model).replace(/(FeedbackUser)(\[|\%5B)(.+?)(\]|\%5D)/gi, "$1.$3");
					//save the cookie not to waste the data if the user is offline
					model.saved = false;
					!doNotSaveCokie && viewModel.saveToCookie(model);

					$.ajax({
						url: Codecamp.api.feedback + "Event?EventId=" + eventId,
						dataType: 'jsonp',
						contentType: "application/json;charset=UTF-8",
						method: 'get',
						data: data,
						timeout: Codecamp.loadingTimeout,
						success: function (data) {
							displaySuccess(successMessage || data.Message || "Thank you", options && options.timeout || Codecamp.successMessageTimeout, options);
							//mark the model as saved
							viewModel.saved(true);
							if (!doNotSaveCokie) {
								//save the model to cookie
								//deserialize it again, as it might have been changed in between
								model = ko.mapping.toJS(viewModel)
								viewModel.saveToCookie(model);
							}
						},
						error: function () {
							//mark the model as not saved
							viewModel.saved(false);//trigger the UI as the model could not be saved
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