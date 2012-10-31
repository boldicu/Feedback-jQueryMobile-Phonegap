$.extend(Codecamp.viewModels, {
	FeedbackEvent: function (data) {
		var viewModel = ko.mapping.fromJS({
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
		ko.mapping.fromJS(data, viewModel)
		$.extend(viewModel, {
			'vote': function (vote) {
				$.ajax({
					url: Codecamp.api.feedback + "VoteEvent?EventId=" + Codecamp.currentEventId,
					dataType: 'jsonp',
					contentType: "application/json;charset=UTF-8",
					method: 'get',
					data: { vote: vote },
					success: function (data) {
						$.mobile.loading('show', { theme: "a", text: Codecamp.translate(data.Message || "Thank you"), textVisible: true, textonly: true });
						window.setTimeout(Codecamp.hideLoadingMessage, 2000);
						viewModel.Rating(data.Rating);
					},
					error: function () {
						$.mobile.loading('show', { theme: "a", text: Codecamp.translate("Feedback data could not be saved. Are you connected to the internet?"), textVisible: true, textonly: true });
						window.setTimeout(Codecamp.hideLoadingMessage, 3000);
					}
				});
				return false;
			},
			'save': function () {
				var data = $.param(ko.mapping.toJS(viewModel)).replace(/(FeedbackUser)(\[|\%5B)(.+?)(\]|\%5D)/gi, "$1.$3");
				$.ajax({
					url: Codecamp.api.feedback + "Event?EventId="+Codecamp.currentEventId,
					dataType: 'jsonp',
					contentType: "application/json;charset=UTF-8",
					method: 'get',
					data: data,
					success: function (data) {
						$.mobile.loading('show', { theme: "a", text: Codecamp.translate(data.Message || "Thank you"), textVisible: true, textonly: true });
						window.setTimeout(Codecamp.hideLoadingMessage, 2000);
					},
					error: function () {
						$.mobile.loading('show', { theme: "a", text: Codecamp.translate("Feedback data could not be saved. Are you connected to the internet?"), textVisible: true, textonly: true });
						window.setTimeout(Codecamp.hideLoadingMessage, 3000);
					}
				});
				return false;
			}
		});
		return viewModel;
	}
});