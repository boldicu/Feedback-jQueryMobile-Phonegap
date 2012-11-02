//initialize the Codecamp object
//this will be the object where we'll put all our properties and methods for this application, 
//not to poluate the golbal window namespace
window.Codecamp = {
	version: 1.0,
	logLevel: 2,//0 disables all the logs, 5 = most verbose
	loadingTimeout: 10000,//how much to wait for ajax calls (ms)
	successMessageTimeout: 2000,//how much to display a success message
	errorMessageTimeout: 4000,//how much to dipslay an error message
	languages: {},
	domain: "",//"http://codecamp.lau.dnw.ro",
	api: {
		json://"http://codecamp.lau.dnw.ro/"+
		"js/data.js?callback=Codecamp.updateData",
		feedback: "http://feedback.boldicu.dnw.ro/Feedback/"
	},
	themes: {
		a: {
			header: "c",
			page: "d",
			content: "c",
			footer: "a",
			list: "c",
			listHeader: "f",
			listDivider: "f",
			listFilter: "none",
			successMessage: "e",
			errorMessage: "b",
			loadingMessage: "e",
			//footer buttons
			//footerButton: "a",
			//home: "d",
			//feedback: "d",
			//favs: "d",
			//speakers: "c",
			//settings: "c",
			//presentations: "c",
		},
		b: {
			header: "f",
			page: "f",
			content: "f",
			footer: "f",
		}
	},
	currentEventId: 1,
	feedback: ko.observable(),
	feedbackReviewMode: ko.observable(0),//1 = allows the user to review all of the ratings - OR - 0 allows the user to review the event or sessions. It will be saved in a cookie
	viewModels: {},
	events: {},
	currentEvent: null,
	//current displayed page's query string parameters
		//current displayed page
	'track': ko.observable(''),
	'sessionId': ko.observable(''),
	'speakerId': ko.observable(''),
	translate: function (text) {
		var dictionary = Codecamp.languages[i18N.lang || "en"];
		return dictionary && text in dictionary && dictionary[text] || text;
	},
	updateData: function (data) {
		//if main.js was loaded, trigger onDataUpdated method
		this.onDataUpdated && this.onDataUpdated(data, this.data);
		this.data = data;
	}
};
Codecamp.theme = Codecamp.themes.a;
$("head").append($("<base/>").attr("href", Codecamp.domain));