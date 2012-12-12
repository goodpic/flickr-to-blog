// api_key = f28804be7a09c5845676349c7e47d636
// user_id = 52579289@N00

(function($) {
$.fn.flickr = function(o){
    var s = {
        api_url: null,
        callback: null,
        api_key: null,
        type: null,         // allowed values: 'photoset', 'search'
        photoset_id: null,
        user_id: null,
        group_id: null,
        tags: null,         // comma separated list
        tag_mode: null,     // allowed values: 'any' (OR), 'all' (AND)
        text: null,
        sort: null,         // date-posted-asc, date-posted-desc, date-taken-asc, date-taken-desc, interestingness-desc, interestingness-asc, relevance
        thumb_size: 's',    // allowed values: s (75x75), t (100x?), m (240x?)
        size: null,         // default: (500x?), allowed values: m (240x?),  o (original)
        per_page: null,     // default: 100, max: 500
        litebox: false      // boolean, if true requires jquery.litebox.js
        };
    if(o) $.extend(s, o);
    return this.each(function(){
        $('#flickr').remove();
        $(this).append('<ul id="flickr">');
        var url = $.flickr.format(s);
        $.flickr.request(url);
    });
};
$.flickr = {
    s: {},
    format: function(s){
        this.s = s;
        if (s.url) return s.url;
        if (!s.callback) s.callback = 'jQuery.flickr.response';
        var url = 'http://api.flickr.com/services/rest/?format=json&jsoncallback='+s.callback+'&api_key='+s.api_key;
        switch (s.type){
            case 'photoset':
                url += '&method=flickr.photosets.getPhotos&photoset_id=' + s.photoset_id;
                break;
            case 'search':
                url += '&method=flickr.photos.search';
                if (s.user_id) url += '&user_id=' + s.user_id;
                if (s.group_id) url += '&group_id=' + s.group_id;
                if (s.tags) url += '&tags=' + s.tags;
                if (s.tag_mode) url += '&tag_mode=' + s.tag_mode;
                if (s.text) url += '&text=' + s.text;
                if (s.sort) url += '&sort=' + s.sort;
                break;
            default:
                url += '&method=flickr.photos.getRecent';
        }
        if (s.per_page) url += '&per_page=' + s.per_page;
        if (s.size == 'o') url += '&extras=original_format';
        return url;
    },
    request: function(url){
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        $('head').append(script);
    },
    response: function(r){
        if (r.stat != "ok"){
            $('#flickr').append('<li>Flickr error</li>');
            for (i in r){
                $('#flickr').append('<li>'+i+': '+i[r]+'</li>');
            }
        } else {
            for (var i=0; i<r.photos.photo.length; i++){
                var photo = r.photos.photo[i];
                var t = 'http://farm'+photo['farm']+'.static.flickr.com/'+photo['server']+'/'+photo['id']+'_'+photo['secret']+'_'+this.s.thumb_size+'.jpg';
                var h = 'http://farm'+photo['farm']+'.static.flickr.com/'+photo['server']+'/'+photo['id']+'_';
                if (!this.s.size) h += photo['secret']+'.jpg';
                else if (this.s.size == 'o') h += photo['originalsecret']+'_o.'+photo['originalformat'];
                else h += photo['secret']+'_'+this.s.size+'.jpg';
                $('#flickr').append('<li><a href="'+h+'"><img src="'+t+'" /></a></li>');
            }
            if (this.s.litebox) $('#flickr').litebox();
        }
    }
};
})(jQuery);