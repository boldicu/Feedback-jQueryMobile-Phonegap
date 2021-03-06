﻿(function () {
	if (!String.prototype.trim) {
		String.prototype.trim = function () {
			return this.replace(/^\s+|\s+$/g, '');
		}
	}
	var joinOriginal = Array.prototype.join;
	Array.prototype.join = function (join, excludeNonEmpty) {
		var result = excludeNonEmpty ? this.filter(function (el) { return el; }) : this;
		result = joinOriginal.call(result, arguments.length == 0 ? "" : join);
		return result;
	}
	Date.prototype.setISO8601 = function (string) {
		if (!string)
			return new Date(0, 0, 1);
		var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
			"(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
			"(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
		var d = string.match(new RegExp(regexp));

		var offset = 0;
		var date = new Date(d[1], 0, 1);

		if (d[3]) { date.setMonth(d[3] - 1); }
		if (d[5]) { date.setDate(d[5]); }
		if (d[7]) { date.setHours(d[7]); }
		if (d[8]) { date.setMinutes(d[8]); }
		if (d[10]) { date.setSeconds(d[10]); }
		if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
		if (d[14]) {
			offset = (Number(d[16]) * 60) + Number(d[17]);
			offset *= ((d[15] == '-') ? 1 : -1);
		}

		offset -= date.getTimezoneOffset();
		time = (Number(date) + (offset * 60 * 1000));
		this.setTime(Number(time));
		return this;
	}

	Date.parseISO = function (string) {
		var d = new Date().setISO8601(string);
		return d;
	}
	//returns an object from an array { 0: item0, 1: item1, ...}
	$.obj = function (array) {
		var rv = {}, i;
		for (i = array.length; i--;)
			rv[i] = array[i];
		return rv;
	}
	//logs a message with console.log if console is available on the browser
	window.warn = function () { }
	var console = window.console;
	function bind(func, level, logLevel) {
		window[func + (level ? level : "")] = !console || !logLevel || (level > logLevel) ? $.noop :
				(console[func] && $.isFunction(console[func].bind)
				? console[func].bind(console)
				: function (messages, optionalParams) {
					var args = arguments;
					window.console && (console.log.apply && (console.log.apply(console, args) || 1)
					|| args.length <= 1 && console[func](messages)
					|| args.length == 2 && console[func](messages, args[1])
					|| args.length == 3 && console[func](messages, args[1], args[2])
					|| args.length == 4 && console[func](messages, args[1], args[2], args[3])
					|| args.length == 5 && console[func](messages, args[1], args[2], args[3], args[4])
					|| args.length >= 6 && console[func](messages, args[1], args[2], args[3], args[4], args[5])
					);
				})
	}
	for (var i = 0; i < 6; i++) {
		bind("log", i, Codecamp.logLevel);
		bind("warn", i, Codecamp.logLevel);
		bind("trace", i, Codecamp.logLevel);
	}
	//cache the searched keywords regexes to avoid cpu waste
	var searchedKeywords = {};
	//specify a custom filterCallback when searching on lists
	$.mobile.listview.prototype.options.filterCallback = function (text, searchValue) {
		var r;
		if (searchValue.indexOf(' ') < 0) {
			r = (searchedKeywords[searchValue] || (searchedKeywords[searchValue] = i18N.noAccentRegex(searchValue))).exec(text);
		}
		else {
			//search by ALL keywords
			r = true;
			$.each(searchValue.split(' '), function (index, keyword) {
				if (!(searchedKeywords[keyword] || (searchedKeywords[keyword] = i18N.noAccentRegex(keyword))).exec(text)) {
					//if one keyword don't match reject the item
					r = false;
					return false;//stop any further processing
				}
			});

		}
		return !r;//returns true to include those not filtered-out
	};
	var ulRegex = new RegExp("^ul$", "gi");
	///<summary>a binding that can be applied on a &lt;ul&gt; element to refresh its &lt;li&gt; children</summmary>
	ko.bindingHandlers['jqmRefreshList'] = {
		'init': //function (element, valueAccessor) {
			//var bindOnULTag = element.tagName == "UL";

			//if (!bindOnULTag)
			//	element = element.parentNode;
			//$(element).listview();
			ko.bindingHandlers.template.init,//.apply(this, arguments);
		//},
		'update': function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
			trace4("jqmRefreshList updating...", ulRegex.test(element.tagName), element.tagName, element);

			ko.bindingHandlers.template.update.call(this, element, valueAccessor, allBindingsAccessor, viewModel, context);

			//allow containerless-binding inside of the <UL
			var bindOnULTag = element.tagName == "UL";
			if (!bindOnULTag)
				element = element.parentNode;



			element = $(element).trigger("create");//CREATE event will take care of any chlidren jqm markup enhancements

			if (element.attr("data-autodividers")) {
				trace2("Rebuilding autodividers");

				// read all list items (without list-dividers) into an array
				var lis = element.children("li").not('.ui-li-divider').get();
				// sort the list items in the array
				lis.sort(function (a, b) {
					var valA = $(a).text(),
						valB = $(b).text();
					if (valA < valB) { return -1; }
					if (valA > valB) { return 1; }
					return 0;
				});

				// clear the listview before rebuild
				element.empty();

				// adding the ordered items to the listview
				$.each(lis, function (i, li) {
					element.append(li);
				});
			}
			//window.setTimeout(function () {
			//try {
				element.listview('refresh');
				trace2("jqmRefreshList success", element[0]);
			//} catch (e) {
			//	trace2("jqmRefreshList building for the first time");
			//	element.listview().listview('refresh');
			//}
			element.find(".ui-li-has-count").each(function () {
				if ($(this).find(".ui-li-count").length > 1) {
					var first = $(this).find(".ui-li-count:first");
					var second = $(this).find(".ui-li-count:nth(1)");
					var shiftFirst = (second.position().left - first.outerWidth() - 5);
					first.css("left", shiftFirst).css("right", "auto");
				}
			});
			//}, 0);
		}
	};
	ko.bindingHandlers['translate'] = {
		'update': function (element, valueAccessor) {
			element.innerHTML = Codecamp.translate(element.innerText);
		}
	};

	ko.virtualElements.allowedBindings['jqmRefreshList'] = true;
	ko.bindingHandlers['class'] = {
		'update': function (element, valueAccessor) {
			if (element['__ko__previousClassValue__']) {
				$(element).removeClass(element['__ko__previousClassValue__']);
			}
			var value = ko.utils.unwrapObservable(valueAccessor());
			if (value) {
				$(element).addClass(value);
				element['__ko__previousClassValue__'] = value;
			}
		}
	};

	ko.bindingHandlers['jqmSliderValue'] = {
		'init': ko.bindingHandlers['value'].init,
		'update': function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
			ko.bindingHandlers['value'].update.apply(this, arguments);
			element = $(element);
			var value = ko.utils.unwrapObservable(valueAccessor());
			//window.setTimeout(function () {
			try {
				element.slider('refresh');
				trace2("jqmSliderValue success");
			} catch (e) {
				trace3("jqmSliderValue building for the first time");
				element.slider().slider('refresh');
			}
		}
	};

	var themes = [];
	$.each(["a", "b", "c", "d", "e", "f"], function (i, theme) {
		themes.push("ui-btn-up-" + theme, "ui-body-" + theme);
	});
	themes = themes.join(" ");
	function jqmTheme(element, valueAccessor) {
		var value = ko.utils.unwrapObservable(valueAccessor());
		if (value) {
			$(element).attr("data-theme", value).removeClass(themes).addClass("ui-btn-up-" + value);
			element['__ko__previousClassValue__'] = value;
		}
	}
	ko.bindingHandlers['jqmTheme'] = {
		'init': jqmTheme,
		'update': jqmTheme
	};

	// Here's a custom Knockout binding that makes elements shown/hidden via jQuery's fadeIn()/fadeOut() methods
	// Could be stored in a separate utility library
	ko.bindingHandlers['fadeVisible'] = {
		init: function (element, valueAccessor) {
			// Initially set the element to be instantly visible/hidden depending on the value
			var value = valueAccessor();
			$(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
		},
		update: function (element, valueAccessor) {
			// Whenever the value subsequently changes, slowly fade the element in or out
			var value = valueAccessor();
			ko.utils.unwrapObservable(value) ? $(element).fadeIn() : $(element).fadeOut();
		}
	};

	ko.bindingHandlers['slideVisible'] = {
		update: function (element, valueAccessor, allBindingsAccessor) {
			// First get the latest data that we're bound to
			var value = valueAccessor(), allBindings = allBindingsAccessor();

			// Next, whether or not the supplied model property is observable, get its current value
			var valueUnwrapped = ko.utils.unwrapObservable(value);

			// Grab some more data from another binding property
			var duration = allBindings.slideDuration || 400; // 400ms is default duration unless otherwise specified

			// Now manipulate the DOM element
			if (valueUnwrapped == true)
				$(element).slideDown(duration); // Make the element visible
			else
				$(element).slideUp(duration);   // Make the element invisible
		}
	};


	//parses the query string of a given url
	/*
	  jQuery deparam is an extraction of the deparam method from Ben Alman's jQuery BBQ
	  http://benalman.com/projects/jquery-bbq-plugin/
	*/
	(function ($) {
		$.deparam = function (params, coerce) {
			params = (params || "").indexOf("?") == 0 ? params.substr(1) : params || "";
			var obj = {},
				coerce_types = { 'true': !0, 'false': !1, 'null': null };
			// Iterate over all name=value pairs.
			$.each(params.replace(/\+/g, ' ').split('&'), function (j, v) {
				var param = v.split('='),
					key = decodeURIComponent(param[0]),
					val,
					cur = obj,
					i = 0,
					// If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
					// into its component parts.
					keys = key.split(']['),
					keys_last = keys.length - 1;

				// If the first keys part contains [ and the last ends with ], then []
				// are correctly balanced.
				if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
					// Remove the trailing ] from the last keys part.
					keys[keys_last] = keys[keys_last].replace(/\]$/, '');
					// Split first keys part into two parts on the [ and add them back onto
					// the beginning of the keys array.
					keys = keys.shift().split('[').concat(keys);
					keys_last = keys.length - 1;
				} else {
					// Basic 'foo' style key.
					keys_last = 0;
				}
				// Are we dealing with a name=value pair, or just a name?
				if (param.length === 2) {
					val = decodeURIComponent(param[1]);
					// Coerce values.
					if (coerce) {
						val = val && !isNaN(val) ? +val              // number
							: val === 'undefined' ? undefined         // undefined
							: coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
							: val;                                                // string
					}
					if (keys_last) {
						// Complex key, build deep object structure based on a few rules:
						// * The 'cur' pointer starts at the object top-level.
						// * [] = array push (n is set to array length), [n] = array if n is 
						//   numeric, otherwise object.
						// * If at the last keys part, set the value.
						// * For each keys part, if the current level is undefined create an
						//   object or array based on the type of the next keys part.
						// * Move the 'cur' pointer to the next level.
						// * Rinse & repeat.
						for (; i <= keys_last; i++) {
							key = keys[i] === '' ? cur.length : keys[i];
							cur = cur[key] = i < keys_last
							  ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : [])
							  : val;
						}
					} else {
						// Simple key, even simpler rules, since only scalars and shallow
						// arrays are allowed.
						if ($.isArray(obj[key])) {
							// val is already an array, so push on the next value.
							obj[key].push(val);
						} else if (obj[key] !== undefined) {
							// val isn't an array, but since a second value has been specified,
							// convert val into an array.
							obj[key] = [obj[key], val];
						} else {
							// val is a scalar.
							obj[key] = val;
						}
					}
				} else if (key) {
					// No value was defined, so set something meaningful.
					obj[key] = coerce ? undefined : '';
				}
			});

			return obj;
		};
	})(jQuery);

	//extends an obeservable array with key indexes
	ko.observableArray.fn.withIndex = function (keyName, useName, group) {
		/// keyName == the name of the property used as the index
		///            value.
		/// useName == when false, a function named findByKey 
		///            is added to the observableArray.
		///            when true, the function is named based
		///            on the name of the index property &
		///            capitalized (like id becomes findById)
		var index = ko.computed({
			read: function () {
				var list = this() || [];    // the internal array
				var keys = {};              // a place for key/value
				ko.utils.arrayForEach(list, function (v) {
					var key = keyName ? ko.utils.unwrapObservable(v[keyName]) : v;// if there is a key, use it, otherwise the key is the object itself
					keys[key] = group ? (keys[key] || []) : v;    // use it
					if (group) //if it is a grouping just add it to the result
						keys[key].push(v);
				});
				return keys;
			},
			deferEvaluation: true,//only compute observable on first access
			owner: this
		});

		var fnName = "";
		if (useName && keyName) {
			var cap = keyName.substr(0, 1).toUpperCase();
			if (keyName.length > 1) {
				fnName = cap + keyName.substring(1);
			} else {
				fnName = cap;
			}
		} else {
			fnName = "Key";
		}

		var fnName = "by" + fnName;
		this[fnName] = function (key) {
			return index()[key];
		};
		this[fnName].index = ko.computed({
			read: function () {
				var result = [], indexes = index(), i = 0;
				$.each(indexes, function (key, value) {
					result.push({ key: key, value: value, index: i++ });
				});
				return result;
			},
			deferEvaluation: true,//only compute observable on first access
			owner: this
		});

		return this;
	};
	$.mobile.listview.prototype.options.autodividersSelector = function (elt) {
		// look for the text in the given element
		var text = elt.text() || null;

		if (!text) {
			return null;
		}

		// create the text for the divider (first uppercased letter)
		text = text.trim().slice(0, 1).toUpperCase();

		return text;
	};

})();

///Diacritice
// Copyright (c) 2010 Cristian Adam <cristian.adam@gmail.com>
// License: MIT
//
// This script replaces s comma bellow and t comma bellow 
// on operating systems which do not support them with 
// s cedilla and t cedilla, which are more widespread but 
// incorrect in Romanian language.
//
// Partial substitution mode is used for Android where the
// s comma bellow character is present and t comma bellow
// is missing, but t cedilla is implemented as t comma bellow
// so we're replacing only t comma bellow
(function (window) {
	function DiacriticsCommaToCedilla(node, partialSubstitution) {
		if (node.nodeName == "#text") {
			if (!partialSubstitution) {
				node.nodeValue = node.nodeValue.replace(/ș/g, "ş");
				node.nodeValue = node.nodeValue.replace(/Ș/g, "Ş");
			}
			node.nodeValue = node.nodeValue.replace(/ț/g, "ţ");
			node.nodeValue = node.nodeValue.replace(/Ț/g, "Ţ");
			return;
		}

		var i;
		for (i = 0; i < node.childNodes.length; ++i) {
			DiacriticsCommaToCedilla(node.childNodes[i], partialSubstitution);
		}
	}

	function DiacriticsCommaToCedillaInTitle(partialSubstitution) {
		if (!partialSubstitution) {
			document.title = document.title.replace(/ș/g, "ş");
			document.title = document.title.replace(/Ș/g, "Ş");
		}
		document.title = document.title.replace(/ț/g, "ţ");
		document.title = document.title.replace(/Ț/g, "Ţ");
	}

	function DiacriticsConfigureTextElement(element, text) {
		element.innerHTML = text;
		element.style.width = "auto";
		element.style.visibility = "hidden";
		element.style.position = "absolute";
		element.style.fontSize = "96px";
	}

	// http://stackoverflow.com/questions/1955048
	function DiacriticsGetStyle(element, property) {
		var camelize = function (str) {
			return str.replace(/\-(\w)/g, function (str, letter) {
				return letter.toUpperCase();
			});
		};

		if (element.currentStyle) {
			return element.currentStyle[camelize(property)];
		} else if (document.defaultView && document.defaultView.getComputedStyle) {
			return document.defaultView.getComputedStyle(element, null)
                                   .getPropertyValue(property);
		} else {
			return element.style[camelize(property)];
		}
	}

	function DiacriticsOnOlderOperatingSystems() {
		var userAgent = navigator.userAgent.toLowerCase();

		if (userAgent.indexOf("bot") != -1 ||
        userAgent.indexOf("crawl") != -1 ||
        userAgent.indexOf("slurp") != -1 ||
        userAgent.indexOf("archive") != -1) {
			return;
		}

		var normalText = document.createElement("div");
		DiacriticsConfigureTextElement(normalText, "sStT");

		var diacriticsText = document.createElement("div");
		DiacriticsConfigureTextElement(diacriticsText, "șȘțȚ");

		var partialDiacriticsText = document.createElement("div");
		DiacriticsConfigureTextElement(partialDiacriticsText, "șȘţŢ");

		document.body.insertBefore(normalText, document.body.firstChild);
		document.body.insertBefore(diacriticsText, document.body.firstChild);
		document.body.insertBefore(partialDiacriticsText, document.body.firstChild);

		// Sometimes at various zoom settings there is a +1 difference
		var doChange = Math.abs(normalText.offsetWidth - diacriticsText.offsetWidth) > 1;
		var havePartialDiacritics = Math.abs(normalText.offsetWidth - partialDiacriticsText.offsetWidth) <= 1;

		// Pocket Internet Explorer on Windows Mobile 6.5 returns 0
		if (normalText.offsetWidth == 0 &&
        diacriticsText.offsetWidth == 0) {
			doChange = true;
			havePartialDiacritics = false;
		}


		document.body.removeChild(normalText);
		document.body.removeChild(diacriticsText);
		document.body.removeChild(partialDiacriticsText);

		if (doChange) {
			DiacriticsCommaToCedilla(document.body, havePartialDiacritics);
			DiacriticsCommaToCedillaInTitle(havePartialDiacritics);
		}
	}

	if (window.attachEvent) {
		window.attachEvent("onload", DiacriticsOnOlderOperatingSystems);
	}
	else if (window.addEventListener) {
		window.addEventListener("load", DiacriticsOnOlderOperatingSystems, false);
	}

})(window);

ko.bindingHandlers['jqmRadio'] = {
	init: function (element, valueAccessor) {
		if (!$(element).attr("data-jqmRadio")) {
			$(element).checkboxradio();
		}
	},
	update: function (element, valueAccessor) {
		//log(element);
		var value = valueAccessor();
		var valueUnwrapped = ko.utils.unwrapObservable(value);
		var $element = $(element);
		log(valueUnwrapped, $element.val());
		if (valueUnwrapped == $element.val())
			$element.prop("checked", "true");
		else
			$element.removeProp("checked");
		if (!$element.attr("data-jqmRadio")) {
			log(valueUnwrapped == $element.val());
			$element.checkboxradio("refresh");
		}
	}
};

ko.bindingHandlers['jqmControlGroup'] = {
	init: function (element, valueAccessor) {
	},
	update: function (element, valueAccessor) {
		//log(element.outerHTML);
		var jqmRadio = ko.bindingHandlers['jqmRadio'];
		$(element).trigger("create").controlgroup()
		.find("input[type=checkbox],input[type=radio]")
		.removeAttr("data-jqmRadio")
		.each(function (index, element) {
			$(element).checkboxradio("refresh");
		});
		//var value = valueAccessor();
		//var valueUnwrapped = ko.utils.unwrapObservable(value);
		//var $element = $(element);
		//var type = value > 400 ? "horizontal" : "vertical";
		//var currentType = $element.attr("data-type");
		//if (type != currentType)
		//	$element.jqmData("type", type)
		// .controlgroup()
		//	.trigger("create")
		//	.find("label, label .ui-btn-inner")
		//	  .removeClass("ui-btn-corner-all ui-corner-top ui-corner-bottom ui-corner-left ui-corner-right ui-controlgroup-last ui-shadow")
		//	.end()
		//	.find("label:first, label:first .ui-btn-inner")
		//	  .addClass("ui-corner-top ui-controlgroup-first ui-shadow")
		//	.end()
		//	.find("label:last, label:last .ui-btn-inner")
		//	  .addClass("ui-corner-bottom ui-controlgroup-last ui-shadow");


	}
};

/*!
 * jQuery Cookie Plugin v1.3
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function ($, document, undefined) {

	var pluses = /\+/g;

	function raw(s) {
		return s;
	}

	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	var config = $.cookie = function (key, value, options) {

		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);

			if (value === null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = config.json ? JSON.stringify(value) : String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path ? '; path=' + options.path : '',
				options.domain ? '; domain=' + options.domain : '',
				options.secure ? '; secure' : ''
			].join(''));
		}

		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			if (decode(parts.shift()) === key) {
				var cookie = decode(parts.join('='));
				return config.json ? JSON.parse(cookie) : cookie;
			}
		}

		return null;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) !== null) {
			$.cookie(key, null, options);
			return true;
		}
		return false;
	};

})(jQuery, document);

jQuery.extend({
	stringify: function stringify(obj) {
		if ("JSON" in window && $.isFunction(JSON.stringify)) {
			return JSON.stringify(obj);
		}

		var t = typeof (obj);
		if (t != "object" || obj === null) {
			// simple data type
			if (t == "string") obj = '"' + obj + '"';

			return String(obj);
		} else {
			// recurse array or object
			var n, v, json = [], arr = (obj && obj.constructor == Array);

			for (n in obj) {
				v = obj[n];
				t = typeof (v);
				if (obj.hasOwnProperty(n)) {
					if (t == "string") {
						v = '"' + v + '"';
					} else if (t == "object" && v !== null) {
						v = jQuery.stringify(v);
					}

					json.push((arr ? "" : '"' + n + '":') + String(v));
				}
			}

			return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
		}
	}
});