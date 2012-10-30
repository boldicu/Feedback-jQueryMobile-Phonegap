$.extend(Codecamp.viewModels, {
	Speaker: function (data, parent) {
		var viewModel = ko.mapping.fromJS(data, {}, {
			CompanyName: ""
		});
		$.extend(viewModel, {
			'nameAndCompany': ko.computed({
				read: function () {
					trace("nameAndCompany computed");
					return [viewModel.Name(), viewModel.CompanyName && viewModel.CompanyName()].filter(function (el) { return el; }).join(", ");
				},
				deferEvaluation: true
			}),
			'sessions': ko.computed({
				read: function () {
					var id = parseInt(viewModel.Id());
					var result = isNaN(id) ? [] : $.grep(parent.Sessions(), function (session) {
						return session.SpeakerRefIds().indexOf(id) >= 0;
					});
					trace("sessions computed", id, result);
					return result;
				},
				deferEvaluation: true
			})
		});
		return viewModel;
	}
});