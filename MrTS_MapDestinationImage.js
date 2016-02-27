//=============================================================================
// MrTS_MapDestinationImage.js
//=============================================================================

/*:
* @plugindesc Changes map destination graphic and can disable it's effect. Can be animated.
* @author Mr. Trivel
*
* @param Disable Effect
* @desc Should default effect be disabled? (true/false)
* Default: True
* @default True
*
* @param Animated Destination
* @desc Do you want destination image animated? (true/false)
* Default: False
* @default False
*
* @param Frames
* @desc If animated. How many frames in the image?
* Default: 4
* @default 4
*
* @param Speed
* @desc If animated. How fast is the animation? Every.. frames
* Default: 10
* @default 10
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial and non-commercial projects.
* --------------------------------------------------------------------------------
* Version 1.1
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
* 1.1 - Destination image can be animated.
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_MapDestinationImage');
	var paramDisableEff = (parameters['Disable Effect'] || "true").toLowerCase() === "true";
	var paramAnimated = (parameters['Animated Destination'] || "False").toLowerCase() === "true";
	var paramAnimFrames = Number(parameters['Frames'] || 4);
	var paramAnimSpeed = Number(parameters['Speed'] || 10);

	var _SpriteDestination_initialize = Sprite_Destination.prototype.initialize;
	Sprite_Destination.prototype.initialize = function() {
		_SpriteDestination_initialize.call(this);
		this._frameNumber = 0;
		this._frameWidth = 48;
		this._loadedImage = false;
	};

	Sprite_Destination.prototype.createBitmap = function() {
	    this.bitmap = ImageManager.loadSystem('mapDestination');
	    this.anchor.x = 0.5;
	    this.anchor.y = 0.5;
	};

	var _SpriteDestination_updateAnimation = Sprite_Destination.prototype.updateAnimation;
	Sprite_Destination.prototype.updateAnimation = function() {
		if (!this._loadedImage && paramAnimated && this.bitmap.isReady())
		{
			this._frameWidth = this.bitmap.width/paramAnimFrames;
			this.setFrame(this._frameWidth*this._frameNumber, 0, this._frameWidth, this.bitmap.height);
			this._loadedImage = true;
		}

		if (paramAnimated && this._loadedImage)
		{
			this._frameCount++;
			if (this._frameCount >= paramAnimSpeed)
			{
				this._frameCount = 0;
				this._frameNumber++;
				if (this._frameNumber >= paramAnimFrames) this._frameNumber = 0;
				this.setFrame(this._frameWidth*this._frameNumber, 0, this._frameWidth, this.bitmap.height);
			}
		}

		if (!paramDisableEff) _SpriteDestination_updateAnimation.call(this);
	};
})();
