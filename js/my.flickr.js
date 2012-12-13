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
  activeImage: null,


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

  getImageUrl: function(id, size) {
    if (size.match(/s|q|t|m|n|z|c|b/i)) {
      size = '_' + size;
    } else {
      size = '';
    }
    return $.flickr.images[id].url + size + '.jpg';
  },

  getImage: function(id, size, href, title, classname) {
    if (href == "none") return ['<img src="', $.flickr.getImageUrl(id,size), '" />'].join('');
    return ['<a href="', $.flickr.getImageUrl(id,href),'" rel="lightbox" title="',id,'"><img alt="',title,'" src="', $.flickr.getImageUrl(id,size),'" class="',classname,'" /></a>'].join('');
  },

  getImageInfo: function (id) {
    if (!$.flickr.images[id].date) {
		  var url = this.s.url + "&api_key=" + this.s.api_key + "&method=flickr.photos.getInfo&photo_id=" + $.flickr.images[id].id;

		  $.getJSON(url, function(r) {
        // console.debug(r);
        id = 'flickr' + r.photo.id;
        $.flickr.images[id].date = r.photo.dates.taken;
        $.flickr.images[id].farm = r.photo.dates.farm;
        $.flickr.images[id].description = r.photo.description._content;
        $.flickr.showImageInfo(id);
		  });
    } else {
      $.flickr.showImageInfo(id);
    }
  },

  showImageInfo: function(id) {

    // if ($("input:radio[name='size']:checked")) $("#radio-size-default").attr('checked','checked');
    var size = $("input:radio[name='size']:checked").val();
    var classname = $("#lightbox-image-class").attr("value");
    var result = '<h5>画像のみ</h5><textarea class="flickr_textarea">'
          + $.flickr.getImage(id,size,'b',$.flickr.images[id].title,classname)
          + '</textarea>'
          + '<h5>タイトルとテキストを表示</h5><textarea class="flickr_textarea"><div class="flickr-section clearfix">'
          + $.flickr.getImage(id,size,'b',$.flickr.images[id].title,classname)
          + '<h4 class="flickr-title">' + $.flickr.images[id].title + '</h4><p class="flickr-time">' + $.flickr.images[id].date + '</p>';
    if ($.flickr.images[id].description) result += '<p class="flickr-description">' + $.flickr.images[id].description + '</p>';
    result += '</div></textarea>';
    $('#lightbox-image-html').html(result);
  },

  showImageTitle: function(id) {
    // Get Data from Flickr Objects
    $.flickr.activeImage = id;
    var title = $.flickr.images[id].title;

		$('#lightbox-flickr').html('<ul class="flickr_list"><li id="flickr_title">' + title + ' <a target="htmltoflickr" href="http://www.flickr.com/photos/' + $.flickr.s.user_id  + '/' + $.flickr.images[id].id  + '"><img src="./images/flickr.png"></a> <a href="" id="twitter-' + id + '"><img src="./images/twitter.png"></a> ' +  '<a target="amazon" href="http://www.amazon.co.jp/gp/search?ie=UTF8&keywords=' +  encodeURIComponent(title)  + '&tag=goodpic-22&index=blended&linkCode=ur2&camp=247&creative=1211"><img src="./images/amazon.gif"></a><img src="http://www.assoc-amazon.jp/e/ir?t=goodpic-22&l=ur2&o=9" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" /></li>'
      + '<div id="lightbox-image-info"></div>'
      + '<ul class="flickr_list"><li>画像サイズ ' 
      + '<input type="radio" class="radio-size" name="size" value="s">75px '
      + '<input type="radio" class="radio-size" name="size" value="t">100px '
      + '<input type="radio" class="radio-size" name="size" value="q">150px '
      + '<input type="radio" class="radio-size" name="size" value="m">240px '
      + '<input type="radio" class="radio-size" name="size" value="n" checked="checked">320px '
      + '<input type="radio" class="radio-size" name="size" value="">500px '
      + '<input type="radio" class="radio-size" name="size" value="z">640px '
      + '<input type="radio" class="radio-size" name="size" value="c">800px '
      + '<input type="radio" class="radio-size" name="size" value="b">1024px '
      + '</li><li>class: <input type="text" id="lightbox-image-class" value="alignleft" />'
      + '</ul><div id="lightbox-image-html"></div>');

    $('#twitter-' + id).attr("href", "javascript:var%20d=document,w=window,l=location,e=encodeURIComponent,f='http://twitter.com/home/?status=" + encodeURIComponent(title) + "%20" + "http://www.flickr.com/photos/" + $.flickr.s.user_id  + "/" + $.flickr.images[id].id + "';if(!w.open(f,'flickrtotwitter'))l.href=f;void(0);");
    $("input:radio[name='size']").change(function() {
      $.flickr.getImageInfo($.flickr.activeImage);
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
          farm: this.farm,
					url: 'http://farm' + this.farm + '.static.flickr.com/' + this.server + '/' + this.id + '_' + this.secret
				}; 
				list.push('<div class="float" >', $.flickr.getImage(id, "s", "z", "",'') ,'<br /><input type="checkbox" class="imagechoice" value="' , id , '" />写真 <input type="checkbox" class="iconchoice" value="' , id , '" />小</div>');
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
			this.match(/^li_br/) ? list.push("<img src=\"./images/li_br.png\" width=\"75\" height=\"20\"\"/>") : list.push($.flickr.getImage(this,"s","none","",''));
			list.push("</li>");
		});
		$(this.target.navi).html(list.join(''));
		$(this.target.navi).sortable({update: function (){ $.flickr.showImages();}});
		this.showImages();
	},

	showImages: function() {
		var list = [];
		var size = $("#menu_size_l").attr("checked") ?  "" : "n";
		this.order = [];
		
		$(this.target.navi).children().each( function(){
			this.id.match(/^li_br[0-9]./) ? list.push("<br />\n\n") : list.push($.flickr.getImage(this.id, size,"b", $.flickr.images[this.id].title,''));
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
				list.push($.flickr.getImage(this.value,"s","b","",''));
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
