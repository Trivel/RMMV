//=============================================================================
// MrTS_SimpleItemTracking.js
//=============================================================================

/*:
* @plugindesc Show trackable items/variables in menu above gold window.
* @author Mr. Trivel
*
* @param [Colors]
* @default 
*
* @param Item Text
* @desc Color for item text.
* Default: #FFFFB0 
* @default #FFFFB0
*
* @param Amount Text
* @desc Color for item amount.
* Default: #FFFFFF
* @default #FFFFFF
*
* @param [Advanced]
* @default  
*
* @param Track Window X
* @desc X position for track window, or use 'default' setting.
* Default: default
* @default default
*
* @param Track Window Y
* @desc Y position for track window, or use 'default' setting.
* Default: default
* @default default
*
* @param Track Window Width
* @desc Width for track window, or use 'default' setting.
* Default: default
* @default default
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
* Plugin Commands
* --------------------------------------------------------------------------------
* To add tracking use the following plugin calls.
* For adding items to the tracker use this:
* AddTracking [TYPE] [ID]
* [TYPE] - item, armor, weapon
* [ID] - ID of the item/armor/weapon
*
* Example:
* AddTracking item 1
* AddTracking weapon 3
*
* For adding variables to the tracker use this:
* AddTracking Variable [VARIABLE_ID] [ICON_ID] [NAME]
* [VARIABLE_ID] - ID of the variable to track
* [ICON_ID] - Icon to show in the tracker
* [NAME] - Name to show in the tracker
*
* Example:
* AddTracking Variable 5 17 "Bosses"
*
* To remove items or variables from being tracked, use such plugin command:
* RemoveTracking [TYPE] [ID]
* [TYPE] - item, armor, weapon, variable
* [ID] - ID of item/armor/weapon/variable
*
* Example:
* RemoveTracking variable 5
* RemoveTracking armor 7
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_SimpleItemTracking');
	var paramTrackX = (parameters['Track Window X'] || "default");
	var paramTrackY = (parameters['Track Window Y'] || "default");
	var paramTrackWidth = (parameters['Track Window Width'] || "default");
	var paramTextColor = (parameters['Item Text'] || "#FFFFB0");
	var paramAmountColor = (parameters['Amount Text'] || "#FFFFFF");

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "addtracking") {
			switch (args[0].toUpperCase())
			{
				case 'VARIABLE':
				{
					console.log(args[0], args[1], args[2], args[3]);
					$gameSystem.createTrackingObject("variable", Number(args[1]), Number(args[2]), args[3]);
				} break;
				default :
				{
					$gameSystem.createTrackingObject(args[0].toLowerCase(), Number(args[1]));
				} break;
			}
		} else if (command.toLowerCase() === "removetracking") {
			$gameSystem.removeTrackingObject(args[0].toLowerCase(), Number(args[1]));
		}
	};

	//-----------------------------------------------------------------------------
	// Game_System
	//

	var _Game_System_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_Game_System_initialize.call(this);
		this._trackingObjects = [];
	};

	Game_System.prototype.createTrackingObject = function(type, id, icon, name) {
		var o = {};
		o.type = type;
		o.id = id;
		switch(type)
		{
			case 'item':
			{
				o.icon = $dataItems[id].iconIndex;
			} break;
			case 'weapon':
			{
				o.icon = $dataWeapons[id].iconIndex;
			} break;
			case 'armor':
			{
				o.icon = $dataArmors[id].iconIndex;
			} break;
			case 'variable':
			{
				o.icon = icon;
				o.name = name;
			} break;
		}
		this._trackingObjects.push(o);
	};

	Game_System.prototype.removeTrackingObject = function(type, id) {
		for (var i = 0; i < this._trackingObjects.length; i++) {
			var o = this._trackingObjects[i];
			if (o.type === type && o.id === id) {
				this._trackingObjects.splice(i, 1);
			}
		}
	};

	Game_System.prototype.getTrackedObjects = function() {
		return this._trackingObjects;
	};

	//-----------------------------------------------------------------------------
	// Scene_Menu
	//
	
	var _Scene_Menu_create = Scene_Menu.prototype.create;
	Scene_Menu.prototype.create = function() {
		_Scene_Menu_create.call(this);
		this.createTrackerWindow();
	};

	Scene_Menu.prototype.createTrackerWindow = function() {
		var il = $gameSystem.getTrackedObjects().length;
		if (il < 1) return;
		this._trackerWindow = new Window_MenuTracking();
		var wh = this._trackerWindow.fittingHeight(il);
		var wx = paramTrackX === "default" ? this._goldWindow.x : Number(paramTrackX);
		var wy = paramTrackY === "default" ? this._goldWindow.y - wh : Number(paramTrackY);
		var ww = paramTrackWidth === "default" ? this._goldWindow.width : Number(paramTrackWidth);
		this._trackerWindow.x = wx;
		this._trackerWindow.y = wy;
		this._trackerWindow.width = ww;
		this._trackerWindow.height = wh;
		this._trackerWindow.refresh();
		this.addWindow(this._trackerWindow);
	};

	//--------------------------------------------------------------------------
	// Window_MenuTracking
	//
	// Tracks items and variables.
	
	function Window_MenuTracking() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_MenuTracking.prototype = Object.create(Window_Base.prototype);
	Window_MenuTracking.prototype.constructor = Window_MenuTracking;
	
	Window_MenuTracking.prototype.initialize = function() {
		Window_Base.prototype.initialize.call(this, 0, 0, 100, 20);
	};
	
	Window_MenuTracking.prototype.refresh = function() {
		this.createContents();
		var objects = $gameSystem.getTrackedObjects();
		for (var i = 0; i < objects.length; i++) {
			var o = objects[i];
			var count = 0;
			var icon = o.icon;
			var name = "";
			switch(o.type)
			{
				case 'item':
				{
					var item = $dataItems[o.id];
					name = item.name;
					count = $gameParty.numItems(item);
				} break;
				case 'weapon':
				{
					var item = $dataWeapons[o.id];
					name = item.name;
					count = $gameParty.numItems(item);
				} break;
				case 'armor':
				{
					var item = $dataArmors[o.id];
					name = item.name;
					count = $gameParty.numItems(item);
				} break;
				case 'variable':
				{
					name = o.name;
					count = $gameVariables.value(o.id);
				} break;
			}
			this.drawIcon(icon, 2, 2 + this.lineHeight()*i);
			this.changeTextColor(paramTextColor);
			this.drawText(name, 4 + Window_Base._iconWidth, this.lineHeight()*i);
			this.changeTextColor(paramAmountColor);
			this.drawText(count, 0, this.lineHeight()*i, this.contentsWidth(), 'right');
			this.resetTextColor();
		}
	};
})();
