$.extend(Codecamp.viewModels, {
	Sponsor: function (data) {
		var viewModel = ko.mapping.fromJS(data);
		return $.extend(viewModel, {
		});
	}
});