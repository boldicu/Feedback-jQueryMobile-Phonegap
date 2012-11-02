(function (Codecamp, $) {
	function IdKey(item) {
		return ko.utils.unwrapObservable(item.Id);
	}
	$.extend(Codecamp.viewModels, {
		Event: function (data) {
			trace3("Parsing Event...");
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

			//add an empty track with Id null which will hold all the common presentations
			viewModel.Tracks.push(new viewModels.Track({ Id: null, Name: "N/A" }));

			//build "byId" keys i.e. viewModel.Speakers.byId(29) -- will return the item with Id 29
			$.each(["Locations", "Sessions", "Tracks", "Speakers"], function (index, collection) {
				viewModel[collection].withIndex("Id", true);
			});

			//group the sessions by trackRefId (room)
			viewModel.Sessions.withIndex("TrackRefId", true, true);
			trace4("Indexed collections");

			//sort tracks' sessions by time
			viewModel.Sessions().sort(function (a, b) { return a.Start() - b.Start(); });
			$.each(viewModel.Tracks(), function (index, track) {
				track.sessions = viewModel.Sessions
					.byTrackRefId(track.Id())
					.sort(function (a, b) { return a.Start() - b.Start(); });
			});

			viewModel.Sessions.withIndex("Start", true, true);

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
				'now': ko.observable(new Date()),
				//keep the current slider session
				'sessionSliderIndex': ko.observable($.cookie("home-slider") || 0),
				'screenSize': ko.observable(document.body.offsetWidth),
				'feedbackReviewMode': ko.computed(function () {// a shortcut for shortage usage in the views
					return Codecamp.feedbackReviewMode();
				}),
			});
			$(window).on("resize", function (e) {
				//log("resize", document.body.offsetWidth);
				viewModel.screenSize(document.body.offsetWidth);
			});
			//when no feedback exists, create an empty feedback view-model, so the binding methods will exist and no errors will be thrown
			var emptyFeedbackEvent = new viewModels.FeedbackEvent();
			//extend the viewModel with our UI methods
			$.extend(viewModel, {
				'cacheSessionSliderIndexInCookie': ko.computed(function () {
					//home slider, force the computing now - not delayed
					$.cookie("home-slider", viewModel.sessionSliderIndex());
				}),
				'sessionsByTrack': ko.computed({
					read: function () {
						var track = Codecamp.track(),
							sessions = viewModel.Sessions;
						trace5('computing sessionsByTrack', track);
						if (!isNaN(track))
							return track || track === 0 ? viewModel.Sessions.byTrackRefId(track) : [];
						return [];
					},
					deferEvaluation: true
				}),
				'selectedSession': ko.computed({
					read: function () {
						trace5('computing selectedSession', Codecamp.sessionId());
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
				//'feedbackTheme': ko.computed({
				//	read: function () {
				//		//when a presentation timeslot almost completes, make the feedback button yellow
				//		return viewModel.now().getMinutes() < 30 ? "e" : "c";
				//	},
				//	deferEvaluation: true
				//}),
				'sessionsNow': ko.computed({
					read: function () {
						var now = viewModel.now();
						return $.grep(viewModel.Sessions(), function (session) {
							return session.Id && session.Start() <= now
								&& (!session.End || session.End() > now);
						});
					},
					deferEvaluation: true
				})
			});
			function theme(alias) {
				return ko.computed({
					read: function () {
						return Codecamp.theme[alias] || Codecamp.theme['footerButton'];
					},
					deferEvaluation: true
				});
			}
			$.extend(viewModel, {
				'homeTheme': theme("home"),
				'settingsTheme': theme("settings"),
				'speakersTheme': theme("speakers"),
				'tracksTheme': theme("tracks"),
				'sessionsTheme': theme("sessions"),
				'favsTheme': theme("favs"),
				'feedbackTheme': theme("feedback"),
				'sessionsNext': ko.computed({
					read: function () {
						var startTime = new Date(1900, 1, 1);
						$.each(viewModel.sessionsNow(), function (index, session) {
							index = session.Start();
							startTime = startTime > index ? startTime : index;
						});
						var timeIndexedSessions = viewModel.Sessions.byStart.index();
						var currentStartTime = $.grep(timeIndexedSessions, function (item, index) {
							return item.key == startTime;
						});
						currentStartTime = currentStartTime && currentStartTime[0];
						currentStartTime = currentStartTime ? currentStartTime.index : -2;
						var next = timeIndexedSessions[currentStartTime + 1];
						var result = next && next.value || [];
						return result;
						//log("now", now);
						//return $.grep($.map(now, function (session) {
						//	return session.nextSession;
						//}), function (session) { return session; });
					},
					deferEvaluation: true
				}),
				'sliderMaxRange': ko.computed({
					read: function () {
						var result = viewModel.Sessions.byStart.index().length - 1;
						return result;
					},
					deferEvaluation: true
				}),
				'sliderText': ko.computed({
					read: function () {
						var index = viewModel.Sessions.byStart.index(),
							result = index[viewModel.sessionSliderIndex()];
						result = result && result.value[0];
						//log3("sliderText", result.Start());
						if (result && result.Start)
							viewModel.now(result.Start());
						result = result && result.duration();
						return result;
					},
					deferEvaluation: true
				}),
				'sessionsForSlider': ko.computed({
					read: function () {
						var index = viewModel.Sessions.byStart.index(),
							sessionSliderIndex = viewModel.sessionSliderIndex(),
							result = index[sessionSliderIndex];
						//log3("sessionsForSlider", sessionSliderIndex);
						result = result && result.value;
						return result;
					},
					deferEvaluation: true
				}),
				'feedbackEvent': ko.computed({
					read: function () {
						var fb = Codecamp.feedback();
						var result = ko.utils.unwrapObservable(fb && fb.Event || emptyFeedbackEvent);
						log5("Computed feedbackEvent");
						return result;
					},
					deferEvaluation: true
				}),
				'feedbackReviewEvents': ko.computed({
					read: function () {
						var fb = Codecamp.feedback();
						return ko.utils.unwrapObservable(fb && fb.Events || []);
					},
					deferEvaluation: true
				}),
			});
			trace3('event initialized');
			//window.setInterval(function () {
			//	log3('Refreshing every 30 seconds:', new Date());
			//	viewModel.now(new Date());
			//}, 10000);

			return viewModel;
		}
	});
})(Codecamp, $);