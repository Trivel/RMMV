//=============================================================================
// MrTS_EmptyMenu.js
//=============================================================================

/*:
* @plugindesc Removes actor data and moves command window.
* @author Mr. Trivel
*
* @param Show Gold Window
* @desc Show Gold Window? True/False
* Default: True
* @default True
*
* @param Command X
* @desc Comannd Window's X position. Is evaluated.
* Default: Graphics.boxWidth/2 - this._commandWindow.width/2
* @default Graphics.boxWidth/2 - this._commandWindow.width/2
*
* @param Command Y
* @desc Command Window's Y position. Is evaluated.
* Default: Graphics.boxHeight/2 - this._commandWindow.height/2
* @default Graphics.boxHeight/2 - this._commandWindow.height/2
*
* @param Gold X
* @desc Gold Window's X position. Is evaluated.
* Default: this._commandWindow.x
* @default this._commandWindow.x
*
* @param Gold Y
* @desc Gold Window's Y position. Is evaluated.
* Default: this._commandWindow.y + this._commandWindow.height
* @default this._commandWindow.y + this._commandWindow.height
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
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_EmptyMenu');
	var paramShowGold = (parameters['Show Gold Window'] || "True").toLowerCase() === "true";
	var paramCommandX = String(parameters['Command X'] || "Graphics.boxWidth/2 - this._commandWindow.width/2");
	var paramCommandY = String(parameters['Command Y'] || "Graphics.boxHeight/2 - this._commandWindow.height/2");
	var paramGoldX = String(parameters['Gold X'] || "this._commandWindow.x");
	var paramGoldY = String(parameters['Gold Y'] || "this._commandWindow.y + this._commandWindow.height");

	var _SceneMenu_createStatusWindow = Scene_Menu.prototype.createStatusWindow;
	Scene_Menu.prototype.createStatusWindow = function() {
		_SceneMenu_createStatusWindow.call(this);
		this._statusWindow.x = Graphics.boxWidth - this._statusWindow.width;
		this._statusWindow.visible = false;
	};

	var _SceneMenu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
	Scene_Menu.prototype.createCommandWindow = function() {
		_SceneMenu_createCommandWindow.call(this);
		this._commandWindow.x = eval(paramCommandX);
		this._commandWindow.y = eval(paramCommandY);
	};

	var _SceneMenu_createGoldWindow = Scene_Menu.prototype.createGoldWindow;
	Scene_Menu.prototype.createGoldWindow = function() {
		_SceneMenu_createGoldWindow.call(this);
		this._goldWindow.visible = paramShowGold;
		this._goldWindow.x = eval(paramGoldX);
		this._goldWindow.y = eval(paramGoldY);
	};

	var _SceneMenu_commandPersonal = Scene_Menu.prototype.commandPersonal;
	Scene_Menu.prototype.commandPersonal = function() {
		_SceneMenu_commandPersonal.call(this);
		this._statusWindow.visible = true;
	};

	var _SceneMenu_commandFormation = Scene_Menu.prototype.commandFormation;
	Scene_Menu.prototype.commandFormation = function() {
		_SceneMenu_commandFormation.call(this);
		this._statusWindow.visible = true;
	};

	var _SceneMenu_onPersonalCancel = Scene_Menu.prototype.onPersonalCancel;
	Scene_Menu.prototype.onPersonalCancel = function() {
		_SceneMenu_onPersonalCancel.call(this);
		this._statusWindow.visible = false;
	};

	var _SceneMenu_onFormationCancel = Scene_Menu.prototype.onFormationCancel;
	Scene_Menu.prototype.onFormationCancel = function() {
		_SceneMenu_onFormationCancel.call(this);
		this._statusWindow.visible = false;
	};
})();
