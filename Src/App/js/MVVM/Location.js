$.extend(Codecamp.viewModels, {
	Location: function (data) {
		var viewModel = ko.mapping.fromJS(data);
		return $.extend(viewModel, {
		});
	}
});