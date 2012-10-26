//initialize the Codecamp object
//this will be the object where we'll put all our properties and methods for this application, 
//not to poluate the golbal window namespace
window.Codecamp = {
	version: 1.0,
	logLevel: 0,//0 disables all the logs, 5 = most verbose
	languages: {},
	api: //"http://codecamp.lau.dnw.ro"+
		"/js/data.js?callback=Codecamp.updateData",
	currentEventId: 1,
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
