$.extend(Codecamp.viewModels, {
	Track: function (data) {
		var viewModel = ko.mapping.fromJS($.extend({
			Name: null,
			Id: null,
			Notes: null
		}, data));
		return $.extend(viewModel, {});
	}
});
