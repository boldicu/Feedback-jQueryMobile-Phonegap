$.extend(Codecamp.viewModels, {
	Session: function (data, parent) {
		var debug = 1;
		var debugToday = new Date(), debugHour = 16;
		var dateMapping = {
			'update': function (options) {
				var date = Date.parseISO(options.data);
				if ((debug && 'setDate' in date)) {
					date.setDate(debugToday.getDate());
					date.setMonth(debugToday.getMonth());
					date.setHours(date.getHours() - 2/*gmt*/ - 9 + debugHour, date.getMinutes(), date.getSeconds(), date.getMilliseconds());
				}
				return date;
			}
		},
		mappings = {
			Start: dateMapping,
			End: dateMapping,
		},
		viewModel = data && {} || ko.mapping.fromJS({
			Title: "Session not found", Description: "Session not found", TrackRefId: 0, SpeakerRefIds: [], Start: null,
			End: null,
			Id: 0,
			OverrideTracks: true
		}, mappings);
		ko.mapping.fromJS(data, mappings, viewModel);
		$.extend(viewModel, {
			'track': ko.computed(function () {
				var track = viewModel.TrackRefId(),
					result = track && parent.Tracks.byId(track);
				return result;
			}),
			'speakers': ko.computed(function () {
				var result = [];
				$.each(viewModel.SpeakerRefIds(), function (index, id) {
					result.push(parent.Speakers.byId(id));
				});
				return result;
			}),
			'duration': ko.computed(function () {
				return [viewModel.Start().format("HH:MM"), viewModel.End().format("HH:MM")].join(" -> ", true);
			})
		});
		$.extend(viewModel, {
			'speakersNames': ko.computed(function () {
				speakers = $.map(viewModel.speakers(), function (speaker) {
					return speaker.Name()
				});
				return speakers
			}),
			'durationAndTitle': ko.computed(function () {
				var track = viewModel.track && viewModel.track();
				return [viewModel.duration(), track && track.Name && track.Name()].join(", ", true);
			})
		});
		$.extend(viewModel, {
			'trackAndTitle': ko.computed(function () {
				var track = viewModel.track && viewModel.track();
				var result = [track && track.Name && track.Name(), viewModel.Title()].join(": ", true);
				return result;
			}),
			'timeAndTitle': ko.computed(function () {
				var result = [viewModel.Title()].join(" ", true);
				return result;
			})
		});
		return viewModel;
	}
});