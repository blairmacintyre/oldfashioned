predisplay['#argon-passage-cleanup'] = function (task) {
		$('#passage-entities').empty();
};

function getComponentAttrFromArg(arg) {
	var eq = arg.indexOf("=");
	if (eq == -1) {
		return(arg);
	} else if (eq == 0 || eq == arg.length-1) {
		return "";
	} else {
		return arg.slice(0,eq) + ":" + arg.slice(eq+1) + ";";
	}
}

//var panoramaRealityURL = "http://argonjs.io/argon-aframe/resources/reality/panorama/index.html" 
Macro.add(['requestPanoramaReality'], {
	handler() {
		if (this.args.length < 2) {
			return this.error('required parameters are name and url');
		}
		console.log("new reality '" + this.args[0] + "', url: " + this.args[1]);
		$('#argon-aframe').attr("desiredreality", "name:'" + this.args[0] + "';src:url(" + this.args[1] + ");");
	}
});

Macro.add(['createPanorama'], {
	handler() {
		if (this.args.length < 3) {
				return this.error('required parameters are {name, dataset url, LLA}, plus other optional additional parameters');
		}
		console.log("new panorama '" + this.args[0] + "', url: " + this.args[1]);
		var argValue = "src:url(" + this.args[1] + ");lla:" + this.args[2] + ";";

		for (var i = 3; i<this.args.length; i++) {
			argValue += getComponentAttrFromArg(this.args[i]);
		}

		$('#argon-aframe').attr("panorama__" + this.args[0], argValue);
	}
});

Macro.add(['showPanorama'], {
	handler() {
		if (this.args.length < 1) {
			return this.error('parameter is panorama name');
		}
		console.log("show panorama '" + this.args[0]);
		$('#argon-aframe')[0].emit("showpanorama", { name: this.args[0] });
	}
});

Macro.add(['deletePanorama'], {
	handler() {
		if (this.args.length < 1) {
			return this.error('parameter is panorama name');
		}
		console.log("remove panorama '" + this.args[0]);
		$('#argon-aframe').removeAttr("panorama__" + this.args[0]);
	}
});

function setAttrFromArg(target, arg) {
	var eq = arg.indexOf("=");
	if (eq == -1) {
		target.attr(arg);
	} else if (eq == 0 || eq == arg.length-1) {
		return false;
	} else {
		target.attr(arg.slice(0,eq), arg.slice(eq+1));
	}
}

// <<deleteEntity name story|passage >>
Macro.add(['removeEntity'], {
		handler() {
			if (this.args.length < 2) {
				return this.error('must specify selector and story or passage');
			}

			var targetId = this.args[0];
			var $container;
			if (this.args.length === 1) {
				// default to passage for the type
				$container = $("#passage-entities");
			} else {
				if (this.args[1] === "story") {
					$container = $("#story-entities");
				} else if (this.args[1] === "passage") {
					$container = $("#passage-entities");
				} else {
					return this.error('3D content type must be "story" or "passage": "' + this.args[1] + '" invalid');
				}
			}
			var $targets = $container.find("#" + targetId);
			
			if ($targets.length > 0) {
	  			$container.remove($targets);
			} else {
				return this.error('passage "' + targetId + '" does not exist.');
			}
		}
});

// <<createGeolocatedEntity name story|passage "lla"  * >>
Macro.add(['createGeolocationEntity'], {
		handler() {
			if (this.args.length < 3) {
				return this.error('need selector, name and LLA');
			}

			var targetId = this.args[0];

			var $container;
			if (this.args[1] === "story") {
				$container = $("#story-entities");
			} else if (this.args[1] === "passage") {
				$container = $("#passage-entities");
			} else {
				return this.error('3D content type must be "story" or "passage": "' + this.args[1] + '" invalid');
			}
			
			var $targets = $container.find("#" + targetId);

			if ($targets.length > 0) {
				return this.error('passage "' + targetId + '" already exists.');
			} 

			$targets = jQuery(document.createElement('ar-geopose'));
			$targets.attr({
				"id": targetId,
				"lla": this.args[2]
			});


			for (var i = 3; i<this.args.length; i++) {
				setAttrFromArg($targets, this.args[i]);
			}

			$container.append($targets);	
		}
});

// <<createReferenceEntity name story|passage "parent frame" * >>
Macro.add(['createReferenceFrameEntity'], {
		handler() {
			if (this.args.length < 3) {
				return this.error('need selector, name and parent frame name');
			}

			var targetId = this.args[0];

			var $container;
			if (this.args[1] === "story") {
				$container = $("#story-entities");
			} else if (this.args[1] === "passage") {
				$container = $("#passage-entities");
			} else {
				return this.error('3D content type must be "story" or "passage": "' + this.args[1] + '" invalid');
			}

			var $targets = $container.find("#" + targetId);

			if ($targets.length > 0) {
				return this.error('passage "' + targetId + '" already exists.');
			} 

			$targets = jQuery(document.createElement('ar-frame'));
			$targets.attr({
				"id": targetId,
				"parent": this.args[2]
			});

			for (var i = 3; i<this.args.length; i++) {
				setAttrFromArg($targets, this.args[i]);
			}

			$container.append($targets);	
		}
});


// <<append3d name story|passage>> content <</append3d>>
Macro.add(['append3d', 'replace3d'], {
		tags : null,

		handler() {
			if (this.args.length < 2) {
				return this.error('must specify selector and story|passage');
			}
			
			var targetId = this.args[0];
			var $container;
			if (this.args[1] === "story") {
				$container = $("#story-entities");
			} else if (this.args[1] === "passage") {
				$container = $("#passage-entities");
			} else {
				return this.error('3D content type must be "story" or "passage": "' + this.args[1] + '" invalid');
			}
			
			var $targets = $container.find("#" + targetId);
			if ($targets.length === 0) {
				return this.error('passage "' + targetId + '" does not exist.');
			} 
			
			if (this.name === 'replace3d') {
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
