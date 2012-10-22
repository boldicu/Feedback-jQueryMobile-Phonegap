(function (Codecamp, $) {
	$.extend(Codecamp.viewModels, {
		Event: function (data) {
			var viewModels = Codecamp.viewModels,
				viewModel = ko.mapping.fromJS(data, {
					//define custom key mappings for each collection
					//define custom create mappings to instantiate the children for each collection
					Locations: {
						'key': function (location) {
							return ko.utils.unwrapObservable(location.Id);
						},
						'create': function (options) {
							return new viewModels.Location(options.data, options.parent)
						}
					},
					Speakers: {
						'key': function (speaker) {
							return ko.utils.unwrapObservable(speaker.Id);
						},
						'create': function (options) {
							return new viewModels.Speaker(options.data, options.parent)
						}
					},
					Tracks: {
						'key': function (track) {
							return ko.utils.unwrapObservable(track.Id);
						},
						'create': function (options) {
							return new viewModels.Track(options.data, options.parent)
						}
					},
					Sessions: {
						'key': function (session) {
							return ko.utils.unwrapObservable(session.Id);
						},
						'create': function (options) {
							return new viewModels.Session(options.data, options.parent)
						}
					},
				});

			//build findById keys i.e. viewModel.Speakers.byId(29) -- will return the item with Id 29
			$.each(["Locations", "Sessions", "Tracks", "Speakers"], function (index, collection) {
				viewModel[collection].withIndex("Id", true);
			});

			//group the sessions by trackRefId (room)
			viewModel.Sessions.withIndex("TrackRefId", true, true);

			//sort tracks' sessions by time
			$.each(viewModel.Tracks(), function (index, track) {
				track.sessions = viewModel.Sessions
					.byTrackRefId(track.Id())
					.sort(function (a, b) { return a.Start() - b.Start(); });
			});

			//build nextSession for every session
			$.each(viewModel.Tracks(), function (tindex, track) {
				var sessions = track.sessions;
				$.each(sessions, function (sindex, session) {
					session.nextSession = sessions[sindex + 1];
				});
			});

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
				'sessionsByTrack': ko.computed(function () {
					var track = Codecamp.track(),
						sessions = viewModel.Sessions;
					log('computing sessionsByTrack', track);
					if (!isNaN(track))
						return track || track === 0 ? viewModel.Sessions.byTrackRefId(track) : [];
					return [];
				}),
				'selectedSession': ko.computed(function () {
					log('computing selectedSession', Codecamp.sessionId());
					return viewModel.Sessions.byId(Codecamp.sessionId()) || empty.session;
				}),
				'selectedSpeaker': ko.computed(function () {
					log('computing selectedSpeaker', Codecamp.speakerId());
					return viewModel.Speakers.byId(Codecamp.speakerId())
				}),
				'feedbackTheme': ko.computed(function () {
					//when a presentation timeslot almost completes, make the feedback button yellow
					return viewModel.now().getMinutes() < 30 ? "e" : "c";
				}),
				'sessionsNow': ko.computed(function () {
					var now = viewModel.now();
					return $.grep(viewModel.Sessions(), function (session) {
						return session.Id && session.Start() <= now && session.End() >= now;
					});
				})
			});
			window.viewModel = viewModel;
			$.extend(viewModel, {
				'sessionsNext': ko.computed(function () {
					var now = viewModel.sessionsNow();
					return $.grep($.map(now, function (session) {
						return session.nextSession;
					}), function(session) { return session; });
				})

			});
			trace('event initialized');
			window.setInterval(function () {
				console.log('tick', new Date());
				viewModel.now(new Date());
			}, 30000);

			return viewModel;
		}
	});
})(Codecamp, $);