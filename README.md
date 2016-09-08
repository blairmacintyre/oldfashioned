# oldfashioned
### Story Format, Support Scripts and Examples of using Twine for 3D AR

The OldFashioned project is an experiment in using [Twine](http://twinery.org) as a 
authoring tool for 3D Augmented, Mixed and (eventually) Virtual Reality stories.

[OldFashioned](https://bitbucket.org/blairmacintyre/oldfashioned) is an extension of 
[SugarCube](http://www.motoslave.net/sugarcube/), a free (gratis and libre) story format for [Twine/Twee](http://twinery.org/ "http://twinery.org/"), based on [TiddlyWiki](http://tiddlywiki.com/ "http://tiddlywiki.com/").  

OldFashioned is a superset of SugarCube that adds augmented and virtual reality story capabilities, building on the integration of [argonjs.io](http://argonjs.io) and [aframe.io](http://aframe.io) provided by the [argon-aframe](http://argonjs.io/argon-aframe) library.

Downloads and documentation for SugarCube can be found at [SugarCube's website](http://www.motoslave.net/sugarcube/ "http://www.motoslave.net/sugarcube/").  
Currently, almost all of the changes needed to create OldFashioned are not visible
to the story author, so the programming language and metaphors of the 
SugarCube format are used.

OldFashion restructures the HTML document, moving the 2D story content into 
an Argon-AFrame `<ar-scene>`. The scene is a simple, bare-bones scene that 
can be added to by the story author:

```html
<ar-scene id="argon-aframe">
    <a-entity id="story-entities">
    </a-entity>
    <a-entity id="passage-entities">
    </a-entity>
</ar-scene>
```  

For the current version, we assume any of the macros and story functions need to manipulate the 3D scene will be added to the story Javascript and CSS.  We 
created two `<a-entity>` nodes under `<ar-scene>`, one to put 3D content 
that stays around longer than a passage (the `#story-entities`) 
and one for content that should be removed when a passage finishes (the 
`#passage-entities`).  To implement this removal, you should add a 
`predisplay` callback to your story javascript as follows:
```js
predisplay['#argon-passage-cleanup'] = task => {
    $('#passage-entities').empty();
};
```

The 3D content manipulations can be done with existing SugarCube 
functionality. For example, to add a some 3D conent to the story, 
use the `<<append>>` macro.
```html
<<append "#passage-entities">> 
        <a-sphere position="0 1.25 -1" radius="1.25" color="#EF2D5E" ></a-sphere>
        <a-box id="bluebox" position="-1 0.5 1" rotation="0 45 0" width="1" height="1" depth="1"  color="#4CC3D9" ></a-box>
<</append>>
```

Similar, you can run small scripts to change the properties of the 
3D elements, leveraging jquery if you prefer that to plain content element 
manipulation.
```html
<<script>>
  // make the blue box yellow
  $('#bluebox').attr("color", "#FFC65D");
<</script>>
```

Similarly, to set up Vuforia tracking, you assign properties to the 
`<ar-scene>` similarly.  So, to use a tracking dataset and give it the
name `stonesandchips`, you set the `vuforiadataset__stonesandchips` to a url
to were it is stored,  
```html
<<script>>
  // store the key somewhere
  let $keyElem = jQuery(document.createElement());
  $keyElem.id = "vuforiakey";
  $keyElem.append("TEXT FOR YOUR ENCYPTED KEY").insertBefore('#argon-aframe');

  // set up vuforia, using that key and the url to the dataset
  $('#argon-aframe').attr({
        "vuforiakey" : "#vuforiakey",
        "vuforiadataset__stonesandchips" : 
        "src:url(http://foo.com/mydatasets/StonesAndChips.xml);"
  });
```
