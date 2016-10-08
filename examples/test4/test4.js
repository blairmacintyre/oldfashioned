Config.ui.stowBarInitially = true; 
Config.saves.autoload = false;
Config.saves.autosave = false;

var storyEvents = [];
var passageEvents = [];

predisplay['#argon-passage-cleanup'] = function (task) {
		for (var i=0; i<passageEvents.length; i++) { 
			var e = passageEvents[i];
			e.target.removeEventListener(e.eventName, e.callback);
		}
		passageEvents = [];
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

// <<deleteEntity name >>
// <<showEntity name >>
// <<hideEntity name >>
Macro.add(['removeEntity','showEntity','hideEntity'], {
		handler() {
			if (this.args.length < 1) {
				return this.error('must specify entity name');
			}

			var targetId = this.args[0];

			// want to search both story and passage entities for the entity to manipulate
			var $container = $("#story-entities").add("#passage-entities");

			var $targets = $container.find("#" + targetId);
			
			if ($targets.length > 0) {
				switch (this.name) {
				case "removeEntity":
					$container.remove($targets);
					break;
					
				case "showEntity":
					$targets.attr("visible", "true");
					break;
				
				case "hideEntity":
					$targets.attr("visible", "false");
					break;
				}
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


// <<append3d name>> content <</append3d>>
Macro.add(['append3d', 'replace3d'], {
		tags : null,

		handler() {
			if (this.args.length < 1) {
				return this.error('must specify entity name');
			}
			
			var targetId = this.args[0];

			// want to search both story and passage entities for the entity to manipulate
			var $container = $("#story-entities").add("#passage-entities");
			
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

// <<addAsset>> content <</addAsset>>
Macro.add(['addAsset'], {
		tags: null,

		handler () {
			var $assets = $("a-assets");
			if ($assets.length === 0) {
				$assets = jQuery(document.createElement('a-assets'));
				$("#argon-aframe").prepend($assets);
			}
			if (this.payload[0].contents !== '') {
				var frag = document.createDocumentFragment();
				new Wikifier(frag, this.payload[0].contents);
			    var div = document.createElement('div');
			    div.appendChild(frag);
				var text = div.innerText;

  	            $assets.append(text);
			}			
		}
});

// <<onEvent name story|passage target event [eventVar]>> twine code to run <</onEvent>>
Macro.add(['onEvent'], {
	tags: null,

	handler () {
			if (this.args.length < 4) {
				return this.error('must specify a name for the event, story or passage, a jquery selector, event name (optional variable name for event data)');
			}

			var thisName = this.args[0];
			var targetId = this.args[2];
			var eventList;

			// want to search the entire 3D scene for possible targets
			var $container = $("#argon-aframe");
			var $targets = targetId === "#argon-aframe" ? $container :  $container.find(targetId);
			if ($targets.length === 0) {
				return this.error('passage "' + targetId + '" does not exist.');
			} 


			if (this.args[1] === "story") {
				eventList = storyEvents;
			} else if (this.args[1] === "passage") {
				eventList = passageEvents;
			} else {
				return this.error('3D content type must be "story" or "passage": "' + this.args[1] + '" invalid');
			}
			
			var tempVar = false;
			var varName = undefined;
			if (this.args.length > 4) {
				//	return this.error('variable name must start with $ or _: ' + this.args[1] + " " + this.args[2] + " " + this.args[3]);
				
				varName = this.args[4];
				if (varName[0] === '_') {
					tempVar = true;
					varName = varName.slice(1);
				} else if (varName[0] === '$') {
					varName = varName.slice(1);
				} else {
					return this.error('variable name must start with $ or _');
				}
			}
			var contents = this.payload[0].contents;
			if (contents === '') {
				return; /// do nothing
			}

			var eventName = this.args[3];
			var name = this.payload[0].name;
			var source = this.payload[0].source;

			// if the target matched multiple targets, attach the event to each one
			for (var i = 0; i < $targets.length; i++) {
				// create somewhere to store the output if an error
				var eventOutput = jQuery(document.createElement('span'))
					.addClass(`macro-${this.name}`)
					.appendTo(this.output);

				// if (Config.debug && curItem.name === 'next') {
				// 	eventOutput = jQuery((new DebugView( // eslint-disable-line no-param-reassign
				// 		eventOutput[0],
				// 		'macro',			
				// 		name,
				// 		source
				// 	)).output);
				// }

				var cbFunc = function (evt) {
					if (varName) {
						if (tempVar) {
							TempVariables[varName] = evt;
						} else {
							State.variables[varName] = evt;
						}
					}
					// empty the contents, so we can update them
					eventOutput.empty();
					var frag = document.createDocumentFragment();
					new Wikifier(frag, contents);
					eventOutput.append(frag);
				}
				$targets[i].addEventListener(eventName, cbFunc);
				var newEvent = {
					name: thisName,
					targetId: targetId,
					target: $targets[i],
					eventName: eventName,
					callback: cbFunc
				}
				eventList.push(newEvent);
			}
		
	}
});

// <<removeEvent name>>
Macro.add(["removeEvent"], {
		handler () {
			if (this.args.length < 1) {
				return this.error('must specify onEvent name');
			}

			var eventName = this.args[0];

			var filterFunc = function(e) {
				if (e.name == eventName) {
					e.target.removeEventListener(e.eventName, e.callback);
					return false;
				} 
				return true;
			};
			storyEvents = storyEvents.filter(filterFunc);
			passageEvents = passageEvents.filter(filterFunc);
		}
});

//
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

// <<createHUD name [name-2]>>
Macro.add(["createHUD"], {	
	handler () {
		if (this.args.length < 1) {
				return this.error('parameters is one or two names for left (and right) hud elements');
		}

		var hudElem1 = document.createElement('div');
		var $hudElem1 = jQuery(hudElem1).attr("id", this.args[0]);

		var hudElem2 = document.createElement('div');
		var $hudElem2 = jQuery(hudElem2).attr("id", this.args.length < 2 ? this.args[0] + "-2": this.args[1]);

		var arScene = document.querySelector('ar-scene');
		arScene.hud.appendChild(hudElem1, hudElem2);
	}
});

// <<deleteHUD name [name-2]>>
// <<showHUD name [name-2]>>
// <<hideHUD name [name-2]>>
Macro.add(['removeHUD','showHUD','hideHUD'], {
		handler() {
			if (this.args.length < 1) {
				return this.error('must specify HUD element name');
			}

			var targetId1 = this.args[0];
			var targetId2 = this.args.length < 2 ? this.args[0] + "-2": this.args[1];

			// want to search both story and passage entities for the entity to manipulate
			var $container = $("#hud");
			var $targets = $container.find("#" + targetId1).add($container.find("#" + targetId2));
			
			if ($targets.length > 0) {
				switch (this.name) {
				case "removeHUD":
					$targets.remove();
					break;
					
				case "showHUD":
					targets.attr("visible", "true");
					break;
				
				case "hideHUD":
					targets.attr("visible", "false");
					break;
				}
			} else {
				return this.error('passage "' + targetId + '" does not exist.');
			}
		}
});

///
/// actual story javascript
///

var $scratch = jQuery(document.createElement('div'));
$scratch.attr("id", "scratch");
$scratch.hide();
$scratch.insertAfter("#argon-aframe");

$scratch.append("<div id='Page_01-video-webpage' class='webPage'><h1><center>Welcome To GVU 2015</center></h1><iframe id='Page_01-video-iframe' width='500' height='400' src='https://www.youtube-nocookie.com/embed/hMWgb6LVyRE?rel=0&autoplay=1&playsinline=1&enablejsapi=true' frameborder='0' allowfullscreen></iframe></div>");

var tag = document.createElement('script');
tag.id = "Page_01-youtubescript";
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

State.variables.page1VideoPlayer = null;
State.variables.page1VideoPlaying = false;

var onPlayerReady = function(event) {
    document.getElementById('Page_01-video-webpage').style.borderColor = '#FF6D00';
};
var onPlayerStateChange = function(event) {
    var playerStatus = event.data;
	  var color;
    if (playerStatus == -1) {
      color = "#37474F"; // unstarted = gray
    } else if (playerStatus == 0) {
	  	State.variables.page1VideoPlaying = false;
      color = "#FFFF00"; // ended = yellow
    } else if (playerStatus == 1) {
  		State.variables.page1VideoPlaying = true;
      color = "#33691E"; // playing = green
    } else if (playerStatus == 2) {
      color = "#DD2C00"; // paused = red
    } else if (playerStatus == 3) {
      color = "#AA00FF"; // buffering = purple
    } else if (playerStatus == 5) {
      color = "#FF6DOO"; // video cued = orange
    }
    if (color) {
      document.getElementById('Page_01-video-webpage').style.borderColor = color;
    }
};
  
function onYouTubeIframeAPIReady() {
     State.variables.page1VideoPlayer = new YT.Player('Page_01-video-iframe', {
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
    });
}

