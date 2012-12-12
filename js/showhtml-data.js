$.stokeshot = {
	url: "",
	init: function(r){
		this.images = [];
		this.order = [];
		this.url = 'http://farm' + r.farm + '.static.flickr.com/'+r.server + '/' + r.id + '_' + r.secret;
		console.debug(this.url);
	},
	
	getUrl: function(size) {

		var h = 
		switch (this.s.type){
		case 'large':

		  break;
		case 'small':
		  
		  break;
		case 'icon':
		  
		  break;
		default:
		}

		// http://farm3.static.flickr.com/2166/2300707514_1cd9a7b2b4_s.jpg = 75x75
		// http://farm3.static.flickr.com/2166/2300707514_1cd9a7b2b4_t.jpg = 100x67
		// http://farm3.static.flickr.com/2166/2300707514_1cd9a7b2b4_m.jpg = 240x160
		// http://farm3.static.flickr.com/2166/2300707514_1cd9a7b2b4.jpg   = 500x333
		// http://farm3.static.flickr.com/2166/2300707514_1cd9a7b2b4_b.jpg = 1024x653
	},

    loadImages: function(r,s) {
        // 初期化
		console.debug("init");
		this.init();
        var target = "#flickr";
		$(target).html("");
			
        if (r.stat != "ok"){
            $(target).append('Flickr error<br />');
            for (i in r) { $(target).append(''+i+': '+i[r]+'<br />');}
			
        } else {
            if ( s.type == 'photoset' ) r.photos = r.photoset;

			var output = "";
			$.each(r.photos.photo, function() {

					var id = "img" + this.id; 
					var h = 'http://farm' + this.farm + '.static.flickr.com/'+this.server + '/' +this.id + '_' + this.secret;
					$.stokeshot.images[id] = {
						title: id,  
						large_url: h + '_b.jpg',
						medium_url: h + '.jpg',
						small_url: h + '_m.jpg', 
						icon_url: h + '_' + $.flickr.s.thumb_size + '.jpg', 
						width: "0", 
						height: "0"  
					}; 

					output += '<div class="float" ><img src="'+ $.stokeshot.images[id].icon_url  +'" /><br /><input type="checkbox" class="imagechoice" value="' + id + '" />写真 <input type="checkbox" class="iconchoice" value="' + id + '" />Icon</div>';
				}
                );
			$(target).html(output);
        }
        
    },
    
	showOrder: function(id) {
		var checkedboxes = $("input:checkbox:checked.imagechoice");

		// 順番が指定されていない場合は、チェックされたボックスをすべて挿入
		// すでに順番がある場合は、チェックされたIDがあるかどうかを判定して、追加or削除
		if (!$.stokeshot.order.length) {
			for (i = 0; i < checkedboxes.length; i++) {
				$.stokeshot.pushOrder(checkedboxes[i].value);
			}
		} else {

			var list = $("#tab-order ul#ordering li");
			$.stokeshot.order = [];
			for (var i = 0; i < list.length; i ++) {

				// 並び替えリストに改行（class="li_br"）が入っていた場合
				if (list[i].className == "li_br") {
					$.stokeshot.pushOrder("li_br");
				} else {
					$.stokeshot.pushOrder(list[i].id);
				}
			}
				
			var hit = jQuery.inArray( id, $.stokeshot.order );
			if ( hit < 0 ) {
				$.stokeshot.pushOrder(id);
				
			} else {
				$.stokeshot.order.splice(hit,1);
			}
		}
		
 		$.stokeshot.showNavi("#tab-order ul#ordering");

		$("#ordering").sortable({update: function (){
					$.stokeshot.showImages("#tab-order div#preview");
					$.stokeshot.refreshTextarea();
				}
		});
		
		if ($.stokeshot.order.length) $.stokeshot.showImages("#tab-order div#preview");
	},

	// 「改行を追加」ボタンをクリックした際に呼ばれる
	addBr: function() {

		$.stokeshot.pushOrder("li_br_new");
		$.stokeshot.showNavi("#tab-order ul#ordering");
		
		$("#ordering").sortable({update: function (){
					$.stokeshot.showImages("#tab-order div#preview");
					$.stokeshot.refreshTextarea();
				}
			});
		
		$.stokeshot.showImages("#tab-order div#preview");
		$.stokeshot.refreshTextarea();
	},

	// 並び順番を追加する。画像が改行かを判別
	pushOrder: function(id) {

		if (id.match(/^li_br/)) {
			var today = new Date();
			var li_id = "li_br" + today.getTime();

			// 新規に改行を追加する場合は、２番目に追加
			if (id.match(/^li_br_new/)) {
				$.stokeshot.order.unshift(li_id);
			} else {
				$.stokeshot.order.push(li_id);
			}
		} else {
			$.stokeshot.order.push(id);
		}
			// console.debug($.stokeshot.order);
	},
	
	showNavi: function(target) {
		var output = "";
		
		for (var i = 0; i < $.stokeshot.order.length; i++) {

			var id = $.stokeshot.order[i];
			if (id.match(/^li_br/)) {
				var today = new Date();
				output += "<li class=\"li_br\" id=\"li_br" + today.getTime()  +  "\"><img src=\"./images/li_br.png\" width=\"75\" height=\"20\" /></li>";

			} else {

				output += "<li id=\"" + id + "\">" + "<img title=\""
					+ id + "\" src=\"" + $.stokeshot.images[id].icon_url + "\" /></li>";
			}
		}

		$(target).html(output);
	},

	showImages: function(target) {
		var output = "";
		var order = $("#tab-order ul#ordering li");

		$.stokeshot.order = [];

 		for (var i = 0; i < order.length; i ++) {

			var id = order[i].id;
			if (id.match(/^li_br[0-9]./)) {

				output += "<br />\n\n";
				$.stokeshot.pushOrder(id);

			} else {

				output += "<a rel=\"lightbox[photo]\" href=\"" + $.stokeshot.images[id].large_url + "\">"
					+ "<img title=\"" + id + "\" src=\"";

				if ( $("#menu_size_l").attr("checked") )
					output += $.stokeshot.images[id].medium_url + "\" /></a>";
				else
					output += $.stokeshot.images[id].small_url + "\" /></a>";

				$.stokeshot.pushOrder(id);
			} 
			
 		}
		$(target).html(output);
	},
	
	showIcons: function(target) {

		var checkedicons = $("input:checkbox:checked.iconchoice");
		if (checkedicons.length) {
		
			var id = "";
			var output = "\n\n<div class=\"photoicons\">";
		
			for (var i = 0; i < checkedicons.length; i ++) {
				id = checkedicons[i].value;
				output += "<a rel=\"lightbox[photo]\" href=\"" + $.stokeshot.images[id].large_url + "\">"
					+ "<img title=\""
					+ id + "\" src=\"" + $.stokeshot.images[id].icon_url + "\" /></a>";
			}
			output += "</div>";
			$(target).html(output);
		}
	},

	refreshTextarea: function() {
		var output = $("#tab-order div#preview").html();
		output += "" + $("#tab-order div#preview-icon").html();
		output = output.replace(/br/g,"br /");
		output = output.replace(/><\/a/g," /></a");
		output = output.toLowerCase();
		
		$("#tab-html textarea#target").attr("value", output);
		
	},

	order: [],
	images: {}
}

	


