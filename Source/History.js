/*
---

name: History

description: History Management via popstate or hashchange.

authors:
	- Christoph Pojer (@cpojer)
	- Harald Kirschner (@digitarald)

license: MIT-style license.

requires: [Core/Events, Core/Element.Event]

provides: History

...
*/

(function(){

var events = Element.NativeEvents,
	location = window.location,
	base = location.pathname,
	history = window.history,
	hasPushState = Browser.Features.pushState = ('pushState' in history),
	hasHashChange = Browser.Features.hashChange = ('onhashchange' in window),
	event = hasPushState ? 'popstate' : 'hashchange';

this.History = new new Class({

	Implements: Events,

	initialize: function(){
		if (hasPushState) {
			events[event] = 2;
			window.addEvent(event, this.pop.bind(this));
		} else {
			events[event] = 1;

			this.hash = location.hash.substr(1);
			if (!hasHashChange) this.timer = this.periodical.periodical(200, this);
		}

		window.addEvent(event, this.pop.bind(this));
	},

	push: function(url, title, state){
		if (hasPushState) {
			history.pushState(state || null, title || null, url);
			this.onChange(url, state);
		} else {
			location.hash = url;
		}
	},

	replace: function(url, title, state){
		if (hasPushState){
			history.replaceState(state || null, title || null, url);
		} else {
			this.hash = '#' + url;
			this.push(url);
		}
	},

	pop: function(event){
		if (hasPushState){
			var url = location.pathname;
			if (url == base){
				base = null;
				return;
			}
			this.onChange(url, event.event.state);
		} else {
			var hash = this.getPath();
			if (this.hash == this.getPath()) return;

			this.hash = hash;
			this.onChange(hash);
		}
	},

	onChange: function(url, state){
		this.fireEvent('change', [url, state || {}]);
	},

	back: function(){
		history.back();
	},

	forward: function(){
		history.forward();
	},

	getPath: function(){
		return hasPushState ? location.pathname : location.hash.substr(1);
	},

	adaptPath: function(){
		var path = location.hash.substr(1);
		if (path.substr(0, 1) == '/') {
			if (path != location.pathname) {
				if (hasPushState) {
					this.replace(path);
				} else {
					window.stop();
					location.pathname = path;
				}
			} else {
				location.hash = '#';
			}

		}
	},

	periodical: function(){
		if (this.hash != location.hash.substr(1)) this.pop();
	}

});

})();
