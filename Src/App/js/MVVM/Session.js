﻿$.extend(Codecamp.viewModels, {
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
		var id = viewModel.Id();
		$.extend(viewModel, {
			'track': ko.computed({
				read: function () {
					trace5("computing session.track", id);
					var track = viewModel.TrackRefId(),
						result = track && parent.Tracks.byId(track);
					return result;
				},
				deferEvaluation: true
			}),
			'speakers': ko.computed({
				read: function () {
					trace5("computing session.speakers", id);
					var result = [];
					$.each(viewModel.SpeakerRefIds(), function (index, id) {
						result.push(parent.Speakers.byId(id));
					});
					return result;
				},
				deferEvaluation: true
			}),
			'duration': ko.computed({
				read: function () {
					trace5("computing session.duration", id);
					return [viewModel.Start().format("HH:MM"), viewModel.End().format("HH:MM")].join(" -> ", true);
				},
				deferEvaluation: true
			})
		});
		$.extend(viewModel, {
			'speakersNames': ko.computed({
				read: function () {
					trace5("computing session.speakersNames", id);
					speakers = $.map(viewModel.speakers(), function (speaker) {
						return speaker.Name()
					});
					return speakers.join(", ", true);
				},
				deferEvaluation: true
			}), 'durationAndTitle': ko.computed({
				read: function () {
					trace5("computing session.durationAndTitle", id);
					var track = viewModel.track && viewModel.track();
					return [viewModel.duration(), track && track.Name && track.Name()].join(", ", true);
				},
				deferEvaluation: true
			})
		});
		$.extend(viewModel, {
			'trackAndTitle': ko.computed({
				read: function () {
					trace5("computing session.trackAndTitle", id);
					var track = viewModel.track && viewModel.track();
					var result = [track && track.Name && track.Name(), viewModel.Title()].join(": ", true);
					return result;
				},
				deferEvaluation: true
			}), 'timeAndTitle': ko.computed({
				read: function () {
					trace5("computing session.timeAndTitle", id);
					var result = [viewModel.Title()].join(" ", true);
					return result;
				},
				deferEvaluation: true
			})
		});
		return viewModel;
	}
});