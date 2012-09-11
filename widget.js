/*
* Is it up? Widget
* ================
* 
* Version: 1.0 beta
* Author: Sam Parkinson (@r3morse)
* jsFiddle: http://jsfiddle.net/sparkinson/tspPU/
* GitHub: https://github.com/r3morse/isitup-widget
*
* To-Do:
* - make custom getelementsbyclassname()
*
*/
(function() {
	isitup = {
		// Our api host
		server: "http://isitup.org/",

		// Node list of our widgets
		nodes: document.getElementsByClassName("isitup-widget"),

		// The main function:
		// - Parses each widget parameters
		// - Inserts the empty widget html
		// - Makes the api requests
		exec: function() {
			// Shorten the most used variables
			var doc = document,
				node = this.nodes,
				server = this.server,
				requested = [];

			var i, len;
			for (i = 0, len = node.length; i < len; i++) {

				// Initalise our html vaiable
				var HTML = "";

				// Domain name from the widget
				var domain = node[i].getAttribute("data-domain");

				// No option-domain set...
				if (!domain) {
					// So set it to the hostname
					domain = window.location.hostname;
					node[i].setAttribute("data-domain", domain);
				}

				// Icon div
				HTML += '<div class="isitup-icon">';
				HTML += '<img src="' + server + 'widget/img/loader.gif" width="16px" height="16px" style="vertical-align: middle;" />';
				HTML += '</div>';

				// Domain div
				HTML += '<div class="isitup-domain">';
				HTML += '<a href="' + server + domain + '">' + domain + '</a>';
				HTML += '</div>';

				// Insert our widget html into its parent div
				node[i].innerHTML = HTML;

				// Check the domain is valid
				if (this.is_domain(domain)) {
					// And the json hasn't already been requested
					if (!this.in_list(domain, requested)) {
						// Insert our JSON request into the <head>
						this.get_json(domain);
						requested.push(domain);
					}
					// If the domain is invalid
				} else {
					// Run update() with an invalid domain response locally
					this.update({
						"domain": domain,
						"status_code": 3
					});
				}

			}
		},

		// Function to inject our jsonp into the <head>
		// @input domain (str)        domain of the site to be checked
		get_json: function(domain) {
			var t = "script",
				d = document;
			var j = d.createElement(t),
				p = d.getElementsByTagName(t)[0];
			j.type = "text/javascript";
			j.src = this.server + domain + ".json?callback=isitup.update";
			p.parentNode.insertBefore(j, p);
		},

		// Our callback function when the JSON response is downloaded
		// - Finds the widget to update
		// - Updates the widgets image & link
		// @input result (json)       JSON object from the api response
		update: function(result) {
			// Update widget with the latest widget nodes
			var node = document.getElementsByClassName("isitup-widget"),
				widget = [];

			// Go through the widgets and find the one we're updating
			var i, len;
			for (i = 0, len = node.length; i < len; i++) {
				if (node[i].getAttribute("data-domain") == result.domain && !node[i].getAttribute("data-checked")) {
					// Select the widget
					widget.push(node[i]);
					// Update it with the checked parameter
					node[i].setAttribute("data-checked", true);
				}
			}

			// Loop incase a domain is used in more than one widget
			var j;
			for (j = 0, len = widget.length; j < len; j++) {

				// Look at the status code from the response
				switch (result.status_code) {
					// If the site is online
				case 1:
					// Change the icon to green
					this.set_image("online", widget[j]);

					// If an uplink has been set
					if (widget[j].hasAttribute("data-uplink")) {
						// Change the link to the user defined uplink
						this.set_link(widget[j].getAttribute("data-uplink"), widget[j]);
					}
					break;

					// If it's offline
				case 2:
					// Change the icon to red
					this.set_image("offline", widget[j]);

					// If a downlink has been set
					if (widget[j].hasAttribute("data-downlink")) {
						// Change the link to the user defined downlink
						this.set_link(widget[j].getAttribute("data-downlink"), widget[j]);
					}
					break;

					// If the domain is invalid
				case 3:
					// Set the image to yellow
					this.set_image("error", widget[j]);

					// Set the link to http://isitup.org/d/<data-domain>
					this.set_link(this.server + "d/" + widget[j].getAttribute("data-domain"), widget[j]);
					break;
				}
			}
		},

		// Function to set the src parameter of a given <img> tag
		// @input image (str)        name of the image to insert
		// @input node                <img> node to insert the image into
		set_image: function(image, node) {
			node.getElementsByClassName("isitup-icon")[0].firstChild.setAttribute("src", this.server + "widget/img/" + image + ".png");
		},

		// Function to set the href parameter of a given <a> tag
		// @input link (str)        url to insert
		// @input node                <a> node to insert the url into
		set_link: function(link, node) {
			node.getElementsByClassName("isitup-domain")[0].firstChild.setAttribute("href", link);
		},

		// A simple regex test for a domain
		// @input domain (str)        domain to test
		// @output boolean            true if domain is valid, otherwise false
		is_domain: function(domain) {
			re = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;
			return (re.test(domain)) ? true : false;
		},

		// Checks if a value is in a list
		// @input value                value to check for
		// @input list                list to go through
		// @output boolean
		in_list: function(value, list) {
			var i, len;
			for (i = 0, len = list.length; i < len; i++) {
				if (list[i] == value) {
					return true;
				}
			}
			return false;
		}
	};

	// Run the widget.
	if (window.addEventListener) {
		window.addEventListener('DOMContentLoaded', function() {
			isitup.exec();
		}, false);
	}
	else {
		window.attachEvent('onload', function() {
			isitup.exec();
		});
	}
}());​