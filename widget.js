/*
 * Is it up? Widget
 * ================
 *
 *   Author: Sam Parkinson (@r3morse)
 * jsFiddle: http://jsfiddle.net/sparkinson/tspPU/
 *   GitHub: https://github.com/r3morse/isitup-widget
 *
 */
(function(doc) {
    var isitup = {
        // Our api host
        server: "http://isitup.org/",

        // The main function:
        // - Parses each widget parameters
        // - Inserts the empty widget html
        // - Makes the api requests
        exec: function() {
            // Shorten the most used variables
            var node = document.getElementsByClassName("isitup-widget"),
                server = this.server,
                requested = [];

            // Load all our images.
            this.preload_images();

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
                }
                else // If the domain is invalid
                {
                    // Run update() with an invalid domain response locally
                    this.update({
                        "domain": domain,
                        "status_code": 3
                    });
                }
            }

            return true;
        },

        // Function to inject our jsonp into the <head>
        // @input domain              domain of the site to be checked
        get_json: function(domain) {
            var t = "script";

            var j = doc.createElement(t),
                p = doc.getElementsByTagName(t)[0],
                r = Math.random().toString(32).substr(2, 8);

            j.type = "text/javascript";

            j.src = this.server + domain + ".json?callback=isitup.update&nocache=" + r;

            p.parentNode.insertBefore(j, p);
        },

        // Our callback function when the JSON response is downloaded
        // - Finds the widget to update
        // - Updates the widgets image & link
        // @input result (json)       JSON object from the api response
        update: function(result) {
            // Update widget with the latest widget nodes
            var node = document.getElementsByClassName("isitup-widget");

            // Go through the widgets and find the one we're updating
            var i, len;

            for (i = 0, len = node.length; i < len; i++) {
                if (node[i].getAttribute("data-domain") == result.domain && !node[i].getAttribute("data-checked")) {
                    // Look at the status code from the response
                    switch (result.status_code) {
                        // If the site is online
                    case 1:
                        // Change the icon to green
                        this.set_image("online", node[i]);

                        // If an uplink has been set
                        if (node[i].hasAttribute("data-uplink")) {
                            // Change the link to the user defined uplink
                            this.set_link(node[i].getAttribute("data-uplink"), node[i]);
                        }

                        break;

                        // If it's offline
                    case 2:
                        // Change the icon to red
                        this.set_image("offline", node[i]);

                        // If a downlink has been set
                        if (node[i].hasAttribute("data-downlink")) {
                            // Change the link to the user defined downlink
                            this.set_link(node[i].getAttribute("data-downlink"), node[i]);
                        }

                        break;

                        // If the domain is invalid
                    case 3:
                        // Set the image to yellow
                        this.set_image("error", node[i]);

                        // Set the link to http://isitup.org/d/<data-domain>
                        this.set_link(this.server + "d/" + node[i].getAttribute("data-domain"), node[i]);

                        break;
                    }

                    // Update it with the checked parameter
                    node[i].setAttribute("data-checked", true);
                }
            }
        },

        // Function to set the src parameter of a given <img> tag
        // @input image               name of the image to insert
        // @input node                <img> node to insert the image into
        set_image: function(image, node) {
            node.getElementsByClassName("isitup-icon")[0].firstChild.setAttribute("src", this.server + "widget/img/" + image + ".png");
        },

        // Function to set the href parameter of a given <a> tag
        // @input link                url to insert
        // @input node                <a> node to insert the url into
        set_link: function(link, node) {
            node.getElementsByClassName("isitup-domain")[0].firstChild.setAttribute("href", link);
        },

        // A simple regex test for a domain
        // @input domain              domain to test
        // @output boolean            true if domain is valid, otherwise false
        is_domain: function(domain) {
            re = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;

            return (re.test(domain)) ? true : false;
        },

        // Checks if a value is in a list
        // @input value               value to check for
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
        },

        // Preloads the list of images used by the widget.
        preload_images: function() {
            var images = ["online", "offline", "error"];

            var i, len;

            var img = new Image(16,16);

            for (i = 0, len = images.length; i < len; i++) {
                img.src = this.server + "widget/img/" + images[i] + ".png";
            }
        }
    };

    // Run the widget.
    window.addEventListener('load', function() {
        isitup.exec();
    }, false);

    // Add the object as a window child so it can be used if required.
    window.isitup = isitup;
}(document));