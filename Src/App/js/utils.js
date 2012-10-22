(function () {
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
	window.log = function (messages, optionalParams) {
		window.console && (console.log.apply && console.log.apply(console, arguments)
		|| arguments.length <= 1 && console.log(messages)
		|| arguments.length == 2 && console.log(messages, arguments[1])
		|| arguments.length == 3 && console.log(messages, arguments[1], arguments[2])
		|| arguments.length == 4 && console.log(messages, arguments[1], arguments[2], arguments[3])
		|| arguments.length == 5 && console.log(messages, arguments[1], arguments[2], arguments[3], arguments[4])
		|| arguments.length >= 6 && console.log(messages, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5])
		);
	}
	//cache the searched keywords regexes to avoid cpu waste
	var searchedKeywords = {};
	//specify a custom filterCallback when searching on lists
	$.mobile.listview.prototype.options.filterCallback = function (text, searchValue) {
		var r;
		if (searchValue.indexOf(' ') < 0)
		{
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
		'init': ko.bindingHandlers.template.init,
		'update': function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
			ko.bindingHandlers.template.update(element, valueAccessor,
					allBindingsAccessor, viewModel, context);
			//allow containerless-binding inside of the <UL
			element = ulRegex.exec(element.tagName) ? element : element.parentNode;
			element = $(element);
			try {
				$element.listview('refresh');
				log("jqmRefreshList1");
			} catch (e) {
				log("jqmRefreshList2");
				element.listview().listview('refresh');
			}
			element.find(".ui-li-has-count").each(function () {
				if ($(this).find(".ui-li-count").length > 1) {
					var first = $(this).find(".ui-li-count:first");
					var second = $(this).find(".ui-li-count:nth(1)");
					var shiftFirst = (second.position().left - first.outerWidth() - 5);
					first.css("left", shiftFirst).css("right", "auto");
				}
			});
		}
	};
	ko.virtualElements.allowedBindings['jqmRefreshList'] = true;
	ko.bindingHandlers['class'] = {
		'update': function (element, valueAccessor) {
			if (element['__ko__previousClassValue__']) {
				$(element).removeClass(element['__ko__previousClassValue__']);
			}
			var value = ko.utils.unwrapObservable(valueAccessor());
			$(element).addClass(value);
			element['__ko__previousClassValue__'] = value;
		}
	};

	var themes = [];
	$.each(["a", "b", "c", "d", "e", "f"], function (i, theme) {
		themes.push("ui-btn-up-"+theme,"ui-body-"+theme);
	});
	themes = themes.join(" ");
	ko.bindingHandlers['jqmTheme'] = {
		'update': function (element, valueAccessor) {
			var $element = $(element),
				value = ko.utils.unwrapObservable(valueAccessor());
			$element.attr("data-theme", value).removeClass(themes).addClass("ui-btn-up-" + value);
			element['__ko__previousClassValue__'] = value;
		}
	};
	ko.bindingHandlers['jqmTheme'].init = ko.bindingHandlers['jqmTheme'].update;


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
		var index = ko.computed(function () {
			var list = this() || [];    // the internal array
			var keys = {};              // a place for key/value
			ko.utils.arrayForEach(list, function (v) {
				var key = keyName ? ko.utils.unwrapObservable(v[keyName]) : v;// if there is a key, use it, otherwise the key is the object itself
				keys[key] = group ? (keys[key] || []) : v;    // use it
				if (group) //if it is a grouping just add it to the result
					keys[key].push(v);
			});
			return keys;
		}, this);

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

		return this;
	};
})();