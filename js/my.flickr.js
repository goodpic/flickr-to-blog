$.flickr = {
    s: {
        url: 'http://api.flickr.com/services/rest/?format=json&jsoncallback=?',
        api_key: 'e87e482f5fdc62d84389b0555aeb3754',
        method: 'flickr.photos.search',
        user_id: null,
        api_url: null,
        callback: null,
        photoset_id: null,
        group_id: null,
        tags: null,         // comma separated list
        tag_mode: null,     // allowed values: 'any' (OR), 'all' (AND)
        text: null,
        sort: null,   // date-posted-asc, date-posted-desc, date-taken-asc, date-taken-desc, interestingness-desc, interestingness-asc, relevance
        per_page: null   // default: 100, max: 500
	},
	order: [],
	images: {},
	target: {flickr: "#flickr", navi: "#tab-order ul#ordering",
			 image: "#tab-order div#preview", icon: "#tab-order div#preview-icon",
			 textarea: "#tab-html textarea#target"},
    
    getImage: function(id, img, href, title) {
        var suffix = {icon: "_s", thumb: "_t", small: "_m", medium: "", large: "_b"};
        if (title == "") title = id;
        if (href != "") {
            return ['<a href="', $.flickr.images[id].url, suffix[href], '.jpg" rel="lightbox" title="' + id  + '"><img alt="' + title  + '" src="', $.flickr.images[id].url, suffix[img], '.jpg" /></a>'].join('');
        } else {
            return ['<img src="', $.flickr.images[id].url, suffix[img], '.jpg" />'].join('');
        }
    },

	init: function() {

		$("#flickr_id").attr("value", function(){ return $.cookie('flickr_id') || "" ;});
		$("#flickr_reset").click( function (){ $.flickr.reset();});
		
		$("form#menu_size input").click( function (){ $.flickr.showImages();});
		$("form#menu_br input").click( function (){ $.flickr.addBr();});

		$("#loading").bind("ajaxSend", function(){ $(this).show();
			}).bind("ajaxComplete", function(){ $(this).hide();
				});
		$("form#flickr_form").submit( function () {
				$("#container").show("blind");
				$.flickr.s.user_id = $("#flickr_id").attr("value");
				$.flickr.s.tags = $("#flickr_tags").attr("value");
				$.flickr.s.per_page = $("form#flickr_form input[name=per_page]:radio:checked").attr("value");
				$.cookie('flickr_id', $.flickr.s.user_id, {expires: 1000});
                
				$.flickr.search();

				return false;
			});
	},

	reset: function() {

		$("input:checkbox:checked").attr('checked', false);
		this.order = [];
		this.showNavi();
		this.showIcons();		
		this.images = [];	
		$(this.target.flickr).html("");
	},
	
    search: function(){
		var url = this.s.url;
		for ( var id in this.s ) {
			if (this.s[id]) url += "&" + id + "=" + this.s[id];
		}
		$.getJSON(url, function(r) {
				$.flickr.loadImages(r, $.flickr.s);
				$("input[@type=checkbox].imagechoice").change(function(){ $.flickr.showOrder(this.value);});
				$("input[@type=checkbox].iconchoice").change(function(){ $.flickr.showIcons();});				
			});
	},

    loadImages: function(r,s) {
		var list = [];
		$(this.target.flickr).html("");
		
        if (r.stat != "ok"){
			list.push('Flickr error<br />');
            for (i in r) { list.push(''+i+': '+r[i]+'<br />');}
			
        } else {
			$.each(r.photos.photo, function() {
					var id = "flickr" + this.id; 
					$.flickr.images[id] = {
						title: this.title,
                        id: this.id,
						url: 'http://farm' + this.farm + '.static.flickr.com/' + this.server + '/' + this.id + '_' + this.secret
					}; 
					list.push('<div class="float" >', $.flickr.getImage(id, "icon", "medium", "") ,'<br /><input type="checkbox" class="imagechoice" value="' , id , '" />写真 <input type="checkbox" class="iconchoice" value="' , id , '" />小</div>');
				});
        }
		$(this.target.flickr).html(list.join(''));
        $('a[rel=lightbox]').lightBox();
    },
    
	showOrder: function(id) {
		// 並び替えの順番を配列に保持する。
		if (!$.flickr.order.length) {
			// まだ順番が指定されてない場合は、チェックボックスから配列作成
			$("input:checkbox:checked.imagechoice").each(function(){ $.flickr.order.push(this.value);});

		} else {
			// naviのリストから順番を取得して配列に保存
			$.flickr.order = [];
			$(this.target.navi).children().each( function (){ $.flickr.order.push(this.id);});

			// チェックボックスで選択された画像を追加、すでにあれば削除
			var hit = jQuery.inArray( id, $.flickr.order );
			( hit < 0 ) ? $.flickr.order.push(id) : $.flickr.order.splice(hit,1);
		}
		
 		this.showNavi();
	},

	// 「改行を追加」ボタンをクリックした際に呼ばれる
	addBr: function() {
		var today = new Date();
		this.order.unshift("li_br" + today.getTime());
		this.showNavi();
	},

	
	showNavi: function() {
		var list = [];

		$.each( $.flickr.order, function (){
				list.push("<li id=\"", this, "\">");
				this.match(/^li_br/) ? list.push("<img src=\"./images/li_br.png\" width=\"75\" height=\"20\"\"/>") : list.push($.flickr.getImage(this,"icon",0,""));
				list.push("</li>");
			});
		$(this.target.navi).html(list.join(''));
		$(this.target.navi).sortable({update: function (){ $.flickr.showImages();}});
		this.showImages();
	},

	showImages: function() {
		var list = [];
		var size = $("#menu_size_l").attr("checked") ?  "medium" : "small";
		this.order = [];
		
		$(this.target.navi).children().each( function(){
				this.id.match(/^li_br[0-9]./) ? list.push("<br />\n\n") : list.push($.flickr.getImage(this.id, size,"large", $.flickr.images[this.id].title));
				$.flickr.order.push(this.id);
			});
		$(this.target.image).html(list.join(''));
		this.refreshTextarea();
	},
	
	showIcons: function() {

		var list = [];
		if ($("input:checkbox:checked.iconchoice").length) {
			list.push("\n\n<div class=\"photoicons\">");
			$("input:checkbox:checked.iconchoice").each( function(){
					list.push($.flickr.getImage(this.value,"icon","large",""));
				});
			list.push("</div>");
		}
		$(this.target.icon).html(list.join(''));
		this.refreshTextarea();
	},

	refreshTextarea: function() {
		var output = $(this.target.image).html() + $(this.target.icon).html() || "";
		output = output.replace(/br/g,"br /");
		output = output.replace(/><\/a/g," /></a");
		output = output.toLowerCase();
		
		$(this.target.textarea).attr("value", output);
	}
};
