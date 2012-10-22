$.extend(Codecamp.viewModels, {
	Track: function (data) {
		var viewModel = ko.mapping.fromJS(data);
		return $.extend(viewModel, {
		});
	}
});
