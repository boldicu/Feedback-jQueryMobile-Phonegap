$.extend(Codecamp.viewModels, {
	FeedbackSession: function (data) {
		var viewModel = ko.mapping.fromJS({
			ContentRating: null,
			PresentationRating: null,
			Notes: null
		});
		ko.mapping.fromJS(data, viewModel)
		return $.extend(viewModel, {
		});
	}
});