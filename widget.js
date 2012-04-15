/*
* Is it up? Widget
* ================
* 
* Version: 1.0 beta
* Author: Sam Parkinson (@r3morse)
* jsFiddle: http://jsfiddle.net/sparkinson/tspPU/
*
* To-Do:
* - make custom getelementsbyclassname()
*
*/
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
			nodes = this.nodes,
			server = this.server;

		var i, len;
		for (i = 0, len = nodes.length; i < len; i++) {

			// Initalise our html vaiable
			var HTML = "";

			// List of parameters from the widget: [domain, uplink, downlink]
			var option = [
				nodes[i].getAttribute("data-domain"),
				nodes[i].getAttribute("data-uplink"),
				nodes[i].getAttribute("data-downlink")
				];

			// No option-domain set...
			if (!option[0]) {
				// So set it to isitup.org
				option[0] = "isitup.org";
				nodes[i].setAttribute("data-domain", option[0]);
			}

			// Change any null links to default links
			var j;
			for (j = 1; j <= 2; j++) {
				if (!option[j]) {
					option[j] = server + option[0];
				}
			}

			// Icon div
			HTML += '<div class="isitup-icon">';
			HTML += '<img src="' + server + 'widget/img/loader.gif" width="16px" height="16px" style="vertical-align: middle;" />';
			HTML += '</div>';

			// Domain div
			HTML += '<div class="isitup-domain">';
			HTML += '<a href="' + server + option[0] + '">' + option[0] + '</a>';
			HTML += '</div>';

			// Insert our widget html into its parent div
			nodes[i].innerHTML = HTML;

			// Check the domain is valid
			if (this.is_domain(option[0])) {
				// Inset our JSON request into the <head>
				this.get_json(option[0]);
			} else {
				// Run update() with an invalid domain response locally
				this.update({
					"domain": option[0],
					"status_code": 3
				});
			}

		}
	},

	// Function to inject our jsonp into the <head>
	// @input domain (str)    domain of the site to be checked
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
	// @input result (json)   JSON object from the api response
	update: function(result) {
		// Update widget with the latest widget nodes
		var node = document.getElementsByClassName("isitup-widget"),
			widget = [];

		// Go through the widgets and find the one we're updating
		var i, len;
		for (i = 0, len = node.length; i < len; i++) {
			if (node[i].getAttribute("data-domain") == result.domain && !node[i].hasAttribute("data-checked")) {
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
				if (widget[j].hasAttribute("option-downlink")) {
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
	// @input image (str)    name of the image to insert
	// @input node            <img> node to insert the image into
	set_image: function(image, node) {
		node.getElementsByClassName("isitup-icon")[0].firstChild.setAttribute("src", this.server + "widget/img/" + image + ".png");
	},

	// Function to set the href parameter of a given <a> tag
	// @input link (str)    url to insert
	// @input node            <a> node to insert the url into
	set_link: function(link, node) {
		node.getElementsByClassName("isitup-domain")[0].firstChild.setAttribute("href", link);
	},

	// A simple regex test for a domain
	// @input domain (str)    domain to test
	// @output boolean        true if domain is valid, otherwise false
	is_domain: function(domain) {
		re = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;
		return (re.test(domain)) ? true : false;
	}
};

// Save the current onload method
_onload = window.onload;

// Set onload to a new function calling exec()
window.onload = function() {
	isitup.exec();

	// If there was something in the old onload, run it
	if (_onload) {
		_onload();
	}
};?