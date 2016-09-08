predisplay['#argon-passage-cleanup'] = function (task) {
		$('#passage-entities').empty();
};

Macro.add(['append3d', 'replace3d'], {
		tags : null,

		handler() {
			if (this.args.length === 0) {
				return this.error('no selector specified');
			}
			
			var targetId;
			var $container;
			if (this.args.length === 1) {
				targetId = this.args[0];
				// default to passage for the type
				$container = $("#passage-entities");
			} else {
				if (this.args[0] === "story") {
					$container = $("#story-entities");
				} else if (this.args[0] === "passage") {
					$container = $("#passage-entities");
				} else {
					return this.error('3D content type must be "story" or "passage": "' + this.args[0] + '" invalid');
				}
				targetId = this.args[1];
			}
			
			var $targets = $container.find("#" + targetId);
			
			if ($targets.length === 0) {
				$targets = jQuery(document.createElement('a-entity'));
				$targets.attr("id", targetId);
				console.log("creating new 3D element: " + targetId);
  			$container.append($targets);
			} else if (this.name === 'replace3d') {
				$targets.empty();
			}

			if (this.payload[0].contents !== '') {
				var frag = document.createDocumentFragment();
				new Wikifier(frag, this.payload[0].contents);
			  var div = document.createElement('div');
			  div.appendChild(frag);
				var text = div.innerText;

				console.log("storing content in 3D element: " + text);
  			$targets.append(text);
			}
		}
});

Macro.add(["initVuforia"], {
	handler () {
		if (this.args.length < 1) {
				return this.error('parameter missing: key file url');
		}

		var keyElem = document.createElement('a-asset-item');
		var $keyElem = jQuery(keyElem);
		$keyElem.attr({
		   "id" : "vuforiakey",
  		 "src" : this.args[0]
		});

		keyElem.addEventListener('loaded', function(evt) {
			$('#argon-aframe').attr("vuforiakey", "#vuforiakey");
		});
  	$('#argon-aframe').prepend($keyElem);
	}
});

Macro.add(["vuforiaDataset"], {	
	handler () {
		if (this.args.length < 2) {
				return this.error('parameters are {id, dataset url}');
		}
		console.log("dataset: " + this.args[1]);
		$('#argon-aframe').attr("vuforiadataset__" + this.args[0], "src:url(" + this.args[1] + ");");
	}
});
