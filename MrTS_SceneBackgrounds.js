//=============================================================================
// MrTS_SceneBackgrounds.js
//=============================================================================

/*:
* @plugindesc Allows to set specific backgrounds to each scene instead of using map screenshot.
* @author Mr. Trivel
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
* How to use
* --------------------------------------------------------------------------------
* Open this plugin in your favorite text editor and scroll down to EDIT LIST HERE.
* Then edit it as follows:
* SceneName: "BackgroundName",
* All images go to img\system
*
* NOTE: Only works for scenes based on Scene_MenuBase.
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - Compatibility with Yanfly
* 1.0 - Release
*/

(function() {
	sceneBackgroundList = {
		// --------------------------------------------------------------------------------
		// EDIT LIST HERE v
		// --------------------------------------------------------------------------------
		Scene_Shop: "pick_Background",
		Scene_Menu: "pick_Background2",
		Scene_Item: "Meadow"
		// --------------------------------------------------------------------------------
		// EDIT LIST THERE ^
		// --------------------------------------------------------------------------------
	}

	var _Scene_MenuBase_createBackground = Scene_MenuBase.prototype.createBackground;
	Scene_MenuBase.prototype.createBackground = function() {
		_Scene_MenuBase_createBackground.call(this);
		if (this._backgroundSprite)
		{
			for (var key in sceneBackgroundList) {
				if (sceneBackgroundList.hasOwnProperty(key)) {
					if (this.constructor === eval(key)) 
					{
						this._backgroundSprite.bitmap = ImageManager.loadSystem(sceneBackgroundList[key]);
						break;
					}
				}
			}
		}
	};
})();
