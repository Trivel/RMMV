//=============================================================================
// MrTS_SimpleMapDestination.js
//=============================================================================

/*:
* @plugindesc Changes map destination graphic and can disable it's effect.
* @author Mr. Trivel
*
* @param Disable Effect
* @desc Should effect be disabled? (true/false)
* Default: True
* @default True
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial and non-commercial projects.
* --------------------------------------------------------------------------------
* Version 1.0
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Image Data
* --------------------------------------------------------------------------------
* All images go to img\system.
*
* img\system\mapDestination.png - image to replace the destination square
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_SimpleMapDestination');
	var paramDisableEff = (parameters['Disable Effect'] || "true").toLowerCase() === "true";

	Sprite_Destination.prototype.createBitmap = function() {
	    this.bitmap = ImageManager.loadSystem('mapDestination');
	    this.anchor.x = 0.5;
	    this.anchor.y = 0.5;
	};

	var _SpriteDestination_updateAnimation = Sprite_Destination.prototype.updateAnimation;
	Sprite_Destination.prototype.updateAnimation = function() {
		if (paramDisableEff) return;
		_SpriteDestination_updateAnimation.call(this);
	};
})();
