$.extend(Codecamp.viewModels, {
	Speaker: function (data, parent) {
		var viewModel = ko.mapping.fromJS(data, {}, {
			CompanyName: ""
		});
		return $.extend(viewModel, {
			nameAndCompany: ko.computed(function () {
				return [viewModel.Name(), viewModel.CompanyName && viewModel.CompanyName()].filter(function (el) { return el; }).join(", ");
			}),
			sessions: ko.computed(function () {
				var id = parseInt(viewModel.Id());
				var result = isNaN(id) ? [] : $.grep(parent.Sessions(), function (session) {
					return session.SpeakerRefIds().indexOf(id) >= 0;
				});
				log("sessions computed", id, result);
				return result;
			})
		});
	}
});