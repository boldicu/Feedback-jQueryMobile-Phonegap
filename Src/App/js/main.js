(function (Codecamp, $) {
	$.extend(Codecamp, {
		displayLoadingTimeout: function () {
			$.mobile.loading('show', { theme: "a", text: Codecamp.translate("Timeout while loading data. Are you connected to the internet?"), textVisible: true, textonly: true });
			window.setTimeout(Codecamp.hideLoadingMessage, 5000);
		},
		hideLoadingMessage: function () {
			window.clearTimeout(Codecamp.loadingTimeout);
			Codecamp.loadingTimeout = 0;
			$.mobile.loading('hide');
		},
		loadingTimeout: 0,
		displayLoadingMessage: function (timeout, message, options) {
			Codecamp.hideLoadingMessage();
			$.mobile.loading('show', $.extend({ text: message, textVisible: true }, options));
			Codecamp.loadingTimeout = window.setTimeout(options && options.info ? Codecamp.hideLoadingMessage : Codecamp.displayLoadingTimeout, timeout);
		},
		changeLanguage: function (lang) {
			window.i18N.changeLanguage(lang, Codecamp.languages);
		},
		onlineChanged: function () {
			$("h1").removeClass("online offline").addClass(navigator.onLine ? "online" : "offline");
			if (!navigator.onLine && Codecamp.data)
				Codecamp.displayLoadingMessage(4000, "You have disconnected from the internet. You can continue using the application in offline mode.", { info: true, textonly: true, theme: "e" });
		},
		onDataUpdated: function (data) {
			var codecamp = window.Codecamp;
			if (data && $.mobile.activePage) {
				trace2("onDataUpdated", data, $.mobile.activePage);
				//make sure data is an array
				$.isArray(data) || (data = [data]);
				//reset the events
				codecamp.events = {};
				//build the new events as ViewModels
				$.each(data, function (index, event) {
					event.Id = event.Id || index;//default to index, if we don't get an Id
					codecamp.events[event.Id] = new codecamp.viewModels.Event(event);
				});
				//update the current event
				codecamp.currentEvent = codecamp.events[codecamp.currentEventId];

				//async apply bindings, so any errors will not be trapped by jQuery ajax load event
				window.setTimeout(function () {
					//apply bindings with the current event
					$.mobile.activePage[0].applyBindings = true;
					ko.applyBindings(codecamp.currentEvent, $.mobile.activePage[0]);
					trace2("applyBindings... done", $.mobile.activePage[0]);
					Codecamp.hideLoadingMessage();
				}, 0);
			}
		},
		onInit: function () {
			trace2("onInit");

			//display the loading data message
			Codecamp.displayLoadingMessage(2000, Codecamp.translate("Loading data..."));

			//try to load the data from the local storage cache first
			var localStorageCachedData = localStorage.getItem("data");
			if (true || !localStorageCachedData) {
				warn("Loading JSON from the network");
				//if not there yet, request it and cache it
				$.ajax({
					url: Codecamp.api,
					dataType: 'script',
					error: Codecamp.displayLoadingTimeout,
					success: function (data) {
						//trimming out any jsonP syntax
						//if (typeof data === "string") {
						//	var index = data.indexOf('{'), lastIndex = data.lastIndexOf('}');
						//	data = data.substring(index, lastIndex + 1);
						//}
						//else {
						//	data = JSON.stringify(data);
						//	alert(data);
						//}
						////store the json in the localStorage
						//localStorage.setItem("data", data);
					}
				});
			}
			else {
				//parse the JSON data from the local storage to avoid network reload
				Codecamp.data = $.parseJSON(localStorageCachedData);
			}

			//update the online offline flag
			Codecamp.onlineChanged();

			//bind the already loaded data
			Codecamp.onDataUpdated(Codecamp.data);
			trace2("onInit completed");
			var currentPage = location.pathname.substr(1);
			var prefetchPages = ["index.html", "tracks.html"].filter(function (p) { return p != currentPage });

			$.each(prefetchPages, function (index, page) {
				$.mobile.loadPage(Codecamp.domain + Codecamp.domain && "/" + page, { showLoadMsg: false });
			});
		}
	});

	//log1($.mobile.page.prototype.options);
	var theme = Codecamp.theme;
	//apply the jqm theme
	$.extend($.mobile.page.prototype.options, {
		theme: theme.page,
		headerTheme: theme.header,  // Page header only
		contentTheme: theme.content,
		footerTheme: theme.footer,
	});
	//log1($.mobile.listview.prototype.options);
	$.extend($.mobile.listview.prototype.options, {
		headerTheme: theme.listHeader,
		theme: theme.list,
		dividerTheme: theme.listDivider,
		filterTheme: theme.listFilter
	});

	function updateLocation(location) {
		var url = location.search;//the url of the current page is kept in the location's hash ?track=1#sessions
		url = url.substr(1);//get rid of '?'

		var currentPage = location.pathname.substr(1).replace(".html", "");
		log2("location changed", currentPage, location.href);
		if (url) {
			var queryParameters = $.deparam(url);
			$.each(["track", "speakerId", "sessionId"], function (i, key) {
				if (key in queryParameters)
					Codecamp[key](key in queryParameters ? queryParameters[key] : Codecamp[key]());
			});
		}
		ko.processAllDeferredBindingUpdates && ko.processAllDeferredBindingUpdates();
	}
	updateLocation(window.location);
	//default the header and footer themes to c (dark gray)
	$(document).delegate("[data-role='page']", {
		'pagebeforecreate': function (e, data) {
			//default language to romanian
			Codecamp.changeLanguage("ro");
			$(this).find("[data-role='header'],[data-role='footer']").attr('data-theme', Codecamp.theme.header);
			//trace('pagebeforecreate', e.target.className, data, location);
		},
		//'pagecreate': function (e, data) {
		//	trace('pagecreate', e.target.className, data);
		//},
		'pagebeforeshow': function (e, data) {
			//trace('pagebeforeshow', e.target.className, data);
			//},
			//'pageshow': function (e, data) {
			//	trace('pageshow', e.target.className, data);
			//},
			//'pageinit': function (e, data) {
			//	trace('pageinit', e.target.className, data);


			if (Codecamp.currentEvent) {

				var newPageLocation = $.mobile.path.parseUrl(location.hash.substr(1));
				trace(newPageLocation);
				//update the location of the new opened page
				updateLocation(newPageLocation);


				///setTimeout(function () {
				//var selectedSpeaker=Codecamp.currentEvent.selectedSpeaker();
				//selectedSpeaker = selectedSpeaker && selectedSpeaker.sessions()[0];
				//selectedSpeaker = selectedSpeaker && (selectedSpeaker.Id() + selectedSpeaker.Title());
				//var selectedSession = Codecamp.currentEvent.selectedSession();
				//selectedSession = selectedSession && selectedSession.speakers()[0];
				//selectedSession = selectedSession && (selectedSession.Id() + selectedSession.Name());
				//log("applying bindings...", location.href, "section's speaker:", selectedSession, "speaker's section:", selectedSpeaker, e, data);
				if (!e.target.applyBindings) {
					e.target.applyBindings = true;
					ko.applyBindings(Codecamp.currentEvent, e.target);
					log3("page created, applied bindings!", e.target);
				}
				else {
					log3("skipped bindings!");
				}
				///}, 0);
			}
		}
	});

	//automatically add the back button on any page
	$.mobile.page.prototype.options.addBackBtn = true;
	$.mobile.defaultPageTransition = "none";
	//subscribe to HTML5 onine / offline events
	$(window).bind("offline online", Codecamp.onlineChanged);
	//subscribe to mobileinit event, fallback to ready if used in a desktop browser
	$(document).bind('mobileinit ready', Codecamp.onInit);
})(Codecamp, jQuery);