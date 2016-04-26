//=============================================================================
// MrTS_CommonEventOnMenuLeave.js
//=============================================================================

/*:
* @plugindesc Calls common event when user leaves menu.
* @author Mr. Trivel
*
* @param CE ID
* @desc Common Event ID to call.
* @default 8
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial non-commercial projects.
* --------------------------------------------------------------------------------
* Version 1.0
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_CommonEventOnMenuLeave');
	var paramCeId = Number(parameters['CE ID'] || 8);

	var _Scene_Menu_popScene = Scene_Menu.prototype.popScene
	Scene_Menu.prototype.popScene = function() {
		_Scene_Menu_popScene.call(this);
		$gameTemp.reserveCommonEvent(paramCeId);
	};
})();
