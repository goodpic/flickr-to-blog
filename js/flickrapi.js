function FlickrApi() {
	this.initialize.apply(this, arguments);
}
FlickrApi.prototype = {
	initialize: function() { 
		this.url = "http://www.flickr.com/services/rest/?";
		this.params = {
			api_key: "e87e482f5fdc62d84389b0555aeb3754",
			user_id: "",
			method: "flickr.photos.search",
			tags: "",
			tag_mode: "any",
			text: "",
			sort: "date-posted-desc",
			page: "",
			per_page: "100",
			format: "json",
			jsoncallback: "flickrCallback"
		};
	},
	request: function() {
		var list = [];
		for( var key in this.params ) {
			if (this.params[key]) {
				var k = encodeURIComponent(key);
				var v = encodeURIComponent(this.params[key]);
				list[list.length] = k+'='+v;
			}
		}
		var query = this.url +  list.join( '&' );
		var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = query;
        $('head').append(script);
	},
	
	showhtml: function(r) {

	}
};

function flickrCallback(data){
	console.debug(data);
	alert("Recieved !");
}
