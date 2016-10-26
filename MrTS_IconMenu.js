//=============================================================================
// MrTS_IconMenu.js
//=============================================================================

/*:
* @plugindesc Changes menu to window with icons and description only.
* @author Mr. Trivel
*
* @param Icon Window X
* @desc X position of Icon Window. Is evaluated.
* Default: Graphics.boxWidth/2 - this._commandWindow.width/2
* @default Graphics.boxWidth/2 - this._commandWindow.width/2
*
* @param Icon Window Y
* @desc Y position of Icon Window. Is evaluated.
* Default: 200
* @default 200
*
* @param Help Window X
* @desc X position of Help Window. Is evaluated.
* Default: Graphics.boxWidth/2 - this._helpWindow.width/2
* @default Graphics.boxWidth/2 - this._helpWindow.width/2
*
* @param Help Window Y
* @desc Y position of Help Window. Is evaluated.
* Default: 88
* @default 88
*
* @param Gold Window X
* @desc X position of Gold Window. Is evaluated.
* Default: 0
* @default 0
*
* @param Help Window Width
* @desc Width of Help Window. Is evaluated.
* Default: this._commandWindow.width + 150
* @default this._commandWindow.width + 150
*
* @param Gold Window Y
* @desc Y position of Gold Window. Is evaluated.
* default Graphics.boxHeight - this.height
* @default Graphics.boxHeight - this.height
*
* @param Icon Window Transparent
* @desc Is icon Window Background invisible? True/False
* Default: false
* @default false
*
* @param Help Window Transparent
* @desc Is Help Window Background invisible? True/False
* Default: false
* @default false
*
* @param Gold Window Transparent
* @desc Is Gold Window Background invisible? True/False
* Default: false
* @default false
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
* How to set up the icons and description
* --------------------------------------------------------------------------------
* Open up the MrTS_IconMenu.js plugin in your favorite text editor and scroll down
* to part where it says "SET ICONS HERE" - follow instructions there.
*
* Further down there will be "SET DESCRIPTION HERE" - you can set it there.
* You can use escape characters in there. E.g. \\c[12] or \\I[93]
* P.S. Need to use double backslash in the setup - \\ - not a single one
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	/* --------------------------------------------------------------------------------
	 * -------- SET ICONS HERE v
	 * -------------------------------------------------------------------------------- */
	var iconList = {
		// HANDLER: ICON_ID,
		'item': 210,
		'skill': 76,
		'equip': 153,
		'status': 193,
		'formation': 82,
		'options': 80,
		'save': 79,
		'gameEnd': 254 
	};
	/* --------------------------------------------------------------------------------
	 * -------- SET ICONS UP THERE ^
	 * -------------------------------------------------------------------------------- */

	 /* --------------------------------------------------------------------------------
	 * -------- SET DESCRIPTION HERE v
	 * -------------------------------------------------------------------------------- */
	var descriptionList = {
		// HANDLER: ["LINE 1", "LINE 2"],
		'item': ["", "\\I[210]Check items owned."],
		'skill': ["", "\\I[76]Check uber skills."],
		'equip': ["", "\\I[153]Check epic equipment."],
		'status': ["", "\\I[193]Check stats."],
		'formation': ["", "\\I[82]Reorder the party."],
		'options': ["", "\\I[80]Optionize things."],
		'save': ["", "\\I[79]SAFE."],
		'gameEnd': ["", "\\I[254]Bye bye."] 
	};
	/* --------------------------------------------------------------------------------
	 * -------- SET DESCRIPTION UP THERE ^
	 * -------------------------------------------------------------------------------- */

	var parameters = PluginManager.parameters('MrTS_IconMenu');
	var paramIconWndX = String(parameters['Icon Window X'] || "Graphics.boxWidth/2 - this._commandWindow.width/2");
	var paramIconWndY = String(parameters['Icon Window Y'] || "200");
	var paramHelpWndX = String(parameters['Help Window X'] || "Graphics.boxWidth/2 - this._helpWindow.width/2");
	var paramHelpWndY = String(parameters['Help Window Y'] || "88");
	var paramHelpWndW = String(parameters['Help Window Width'] || "this._commandWindow.width + 150");
	var paramGoldWndX = String(parameters['Gold Window X'] || "0");
	var paramGoldWndY = String(parameters['Gold Window Y'] || "Graphics.boxHeight - this._goldWindow.height");
	var paramIconTrans = String(parameters['Icon Window Transparent'] || "false").toLowerCase() === "true";
	var paramHelpTrans = String(parameters['Help Window Transparent'] || "false").toLowerCase() === "true";
	var paramGoldTrans = String(parameters['Gold Window Transparent'] || "false").toLowerCase() === "true";

	var _SceneMenu_create = Scene_Menu.prototype.create;
	Scene_Menu.prototype.create = function() {
		_SceneMenu_create.call(this);
		this.createHelpWindow();
	};

	Scene_Menu.prototype.createHelpWindow = function() {
		this._helpWindow = new Window_MenuHelp();
		this._helpWindow.width = eval(paramHelpWndW);
		this._helpWindow.x = eval(paramHelpWndX);
		this._helpWindow.y = eval(paramHelpWndY);
		if (paramHelpTrans) this._helpWindow.opacity = 0;
		this.addWindow(this._helpWindow);
		this._commandWindow.setHelpWindow(this._helpWindow);
	};

	var _SceneMenu_createStatusWindow = Scene_Menu.prototype.createStatusWindow;
	Scene_Menu.prototype.createStatusWindow = function() {
		_SceneMenu_createStatusWindow.call(this);
		this._statusWindow.x = Graphics.boxWidth - this._statusWindow.width;
		this._statusWindow.visible = false;
	};

	var _SceneMenu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
	Scene_Menu.prototype.createCommandWindow = function() {
		_SceneMenu_createCommandWindow.call(this);
		this._commandWindow.x = eval(paramIconWndX);
		this._commandWindow.y = eval(paramIconWndY);
		if (paramIconTrans) this._commandWindow.opacity = 0;
	};

	var _SceneMenu_createGoldWindow = Scene_Menu.prototype.createGoldWindow;
	Scene_Menu.prototype.createGoldWindow = function() {
		_SceneMenu_createGoldWindow.call(this);
		this._goldWindow.x = eval(paramGoldWndX);
		this._goldWindow.y = eval(paramGoldWndY);
		if (paramGoldTrans) this._goldWindow.opacity = 0;
	};

	var _SceneMenu_commandPersonal = Scene_Menu.prototype.commandPersonal;
	Scene_Menu.prototype.commandPersonal = function() {
		_SceneMenu_commandPersonal.call(this);
		this._helpWindow.visible = false;
		this._statusWindow.visible = true;
	};

	var _SceneMenu_commandFormation = Scene_Menu.prototype.commandFormation;
	Scene_Menu.prototype.commandFormation = function() {
		_SceneMenu_commandFormation.call(this);
		this._helpWindow.visible = false;
		this._statusWindow.visible = true;
	};

	var _SceneMenu_onPersonalCancel = Scene_Menu.prototype.onPersonalCancel;
	Scene_Menu.prototype.onPersonalCancel = function() {
		_SceneMenu_onPersonalCancel.call(this);
		this._helpWindow.visible = true;
		this._statusWindow.visible = false;
	};

	var _SceneMenu_onFormationCancel = Scene_Menu.prototype.onFormationCancel;
	Scene_Menu.prototype.onFormationCancel = function() {
		_SceneMenu_onFormationCancel.call(this);
		this._helpWindow.visible = true;
		this._statusWindow.visible = false;
	};

	Window_MenuCommand.prototype.windowWidth = function() {
	    return this._list.length * Window_Base._iconWidth + this.standardPadding() * 2;
	};

	Window_MenuCommand.prototype.windowHeight = function() {
	    return this.fittingHeight(1);
	};

	Window_MenuCommand.prototype.drawItem = function(index) {
	    var rect = this.itemRect(index);
	    var symbol = this.commandSymbol(index);
	    if (iconList[symbol])
	    	this.drawIcon(iconList[symbol], rect.x, rect.y);
	    else
		    this.drawIcon(91, rect.x, rect.y);
	};

	Window_MenuCommand.prototype.maxCols = function() {
	    return this._list.length;
	};

	Window_MenuCommand.prototype.updateHelp = function() {
		var symbol = this.commandSymbol(this.index());
		if (descriptionList[symbol])
		{
			this._helpWindow.setText(descriptionList[symbol][0], descriptionList[symbol][1]);
		}
	};

	//--------------------------------------------------------------------------
	// Window_MenuHelp
	//
	// Adds Help window that shows description for icons.
	
	function Window_MenuHelp() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_MenuHelp.prototype = Object.create(Window_Help.prototype);
	Window_MenuHelp.prototype.constructor = Window_MenuHelp;
	
	Window_MenuHelp.prototype.initialize = function() {
		Window_Help.prototype.initialize.call(this, 2);
	};

	Window_MenuHelp.prototype.setText = function(line1, line2) {
		if (line1 !== this._line1 || line2 !== this._line2 )
		{
			this._line1 = line1;
			this._line2 = line2;
			this.refresh();
		}
	};

	Window_MenuHelp.prototype.refresh = function() {
		this.contents.clear();
		this.drawTextEx(this._line1, 0, 0);
		this.drawTextEx(this._line2, 0, this.lineHeight());
	};
})();
