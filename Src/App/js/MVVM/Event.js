(function (Codecamp, $) {
	function IdKey(item) {
		return ko.utils.unwrapObservable(item.Id);
	}
	$.extend(Codecamp.viewModels, {
		Event: function (data) {
			trace3("Parsing Event...", data);
			var viewModels = Codecamp.viewModels,
				viewModel = ko.mapping.fromJS(data, {
					//define custom key mappings for each collection
					//define custom create mappings to instantiate the children for each collection
					Locations: {
						'key': IdKey,
						'create': function (options) {
							return new viewModels.Location(options.data, options.parent)
						}
					},
					Speakers: {
						'key': IdKey,
						'create': function (options) {
							return new viewModels.Speaker(options.data, options.parent)
						}
					},
					Tracks: {
						'key': IdKey,
						'create': function (options) {
							return new viewModels.Track(options.data, options.parent)
						}
					},
					Sessions: {
						'key': IdKey,
						'create': function (options) {
							return new viewModels.Session(options.data, options.parent)
						}
					},
				});
			trace3("Parsed Event!");

			//build "byId" keys i.e. viewModel.Speakers.byId(29) -- will return the item with Id 29
			$.each(["Locations", "Sessions", "Tracks", "Speakers"], function (index, collection) {
				viewModel[collection].withIndex("Id", true);
			});

			//group the sessions by trackRefId (room)
			viewModel.Sessions.withIndex("TrackRefId", true, true);
			trace4("Indexed collections");

			//sort tracks' sessions by time
			$.each(viewModel.Tracks(), function (index, track) {
				track.sessions = viewModel.Sessions
					.byTrackRefId(track.Id())
					.sort(function (a, b) { return a.Start() - b.Start(); });
			});


			trace4("Indexed tracks' sessions, ordered by start date");
			//build nextSession for every session
			$.each(viewModel.Tracks(), function (tindex, track) {
				var sessions = track.sessions;
				$.each(sessions, function (sindex, session) {
					session.nextSession = sessions[sindex + 1];
				});
			});
			trace4("Indexed tracks' nextSessions");
			var empty = {
				session: new Codecamp.viewModels.Session()
			};

			$.extend(viewModel, {
				//keep the current date-time
				//used for colouring differently the feedback button
				'now': ko.observable(new Date())
			});
			//extend the viewModel with our UI methods
			$.extend(viewModel, {
				'sessionsByTrack': ko.computed({
					read: function () {
						var track = Codecamp.track(),
							sessions = viewModel.Sessions;
						log5('computing sessionsByTrack', track);
						if (!isNaN(track))
							return track || track === 0 ? viewModel.Sessions.byTrackRefId(track) : [];
						return [];
					},
					deferEvaluation: true
				}),
				'selectedSession': ko.computed({
					read: function () {
						log5('computing selectedSession', Codecamp.sessionId());
						return viewModel.Sessions.byId(Codecamp.sessionId()) || empty.session;
					},
					deferEvaluation: true
				}),
				'selectedSpeaker': ko.computed({
					read: function () {
						log5('computing selectedSpeaker', Codecamp.speakerId());
						return viewModel.Speakers.byId(Codecamp.speakerId())
					},
					deferEvaluation: true
				}),
				'feedbackTheme': ko.computed({
					read: function () {
						//when a presentation timeslot almost completes, make the feedback button yellow
						return viewModel.now().getMinutes() < 30 ? "e" : "c";
					},
					deferEvaluation: true
				}),
				'sessionsNow': ko.computed({
					read: function () {
						var now = viewModel.now();
						return $.grep(viewModel.Sessions(), function (session) {
							return session.Id && session.Start() <= now && session.End() >= now;
						});
					},
					deferEvaluation: true
				}),
			});
			window.viewModel = viewModel;
			$.extend(viewModel, {
				'sessionsNext': ko.computed({
					read: function () {
						var now = viewModel.sessionsNow();
						return $.grep($.map(now, function (session) {
							return session.nextSession;
						}), function (session) { return session; });
					},
					deferEvaluation: true
				}),
			});
			trace3('event initialized');
			window.setInterval(function () {
				log3('Refreshing every 30 seconds:', new Date());
				viewModel.now(new Date());
			}, 30000);

			return viewModel;
		}
	});
})(Codecamp, $);