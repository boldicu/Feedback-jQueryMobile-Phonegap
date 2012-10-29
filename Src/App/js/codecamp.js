﻿//initialize the Codecamp object
//this will be the object where we'll put all our properties and methods for this application, 
//not to poluate the golbal window namespace
window.Codecamp = {
	version: 1.0,
	logLevel: 1,//0 disables all the logs, 5 = most verbose
	languages: {},
	domain: "",//"http://codecamp.lau.dnw.ro",
	api: //"http://codecamp.lau.dnw.ro"+
		"/js/data.js?callback=Codecamp.updateData",
	themes: {
		a: {
			header: "c",
			page: "d",
			content: "c",
			footer: "c",
			list: "c",
			listHeader: "f",
			listDivider: "f",
			listFilter: "none",
		},
		b: {
			header: "f",
			page: "f",
			content: "f",
			footer: "f",
		}
	},
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
Codecamp.theme = Codecamp.themes.a;
$("head").append($("<base/>").attr("href", Codecamp.domain));