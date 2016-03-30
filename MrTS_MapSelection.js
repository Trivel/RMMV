//=============================================================================
// MrTS_MapSelection.js
//=============================================================================

/*:
* @plugindesc Allows to travel to different maps from a single scene.
* @author Mr. Trivel
*
* @param Map Select Text
* @desc Map Select Text
* Default: Map Select
* @default Map Select
*
* @param Help Text
* @desc Text at the bottom window.
* @default Select a challenge for your fated heroes to struggle in.
* 
* @param Max Items
* @desc Max items in a list before having to scroll.
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
* Plugin Commands
* --------------------------------------------------------------------------------
* MapSelection Start - Enters Map Selection Scene
* MapSelection Add [ID] - Adds selection to the menu
* MapSelection Remove [ID] - Removes selection from the menu
*
* Examples:
* MapSelection Start
* MapSelection Add 4
* MapSelection Remove 5
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Map List Structure
* --------------------------------------------------------------------------------
*  mapList in an array of objects.
*  Each object start with { and ends with }
*  Each object has ID and Name properties.
*  {
*     ID: 1,
*     Name: "Some Name"
*  }
*  ID is used for plugin commands listed above.
*  Name is what will be seen on the command window ingame.
*  Now, the object may have one of three groups of other properties.
*  Group 1 - Sublist properties:
*  Sublist: [],
*  Background: "BackgroundName"
*
*  Group 2 - Map teleport properties:
*  MapID: 3,
*  X: 5,
*  Y: 20
*
*  Group 3 - Execute common event properties:
*  CE_ID: 2
*
*  So if Object is Group 1 type, when you click on it, you'll get it's list,
*  meanwhile if Object is Group 2 type, when you click on it, you'll be teleported
*  to it's map, if Object is Group 3 type, when you click on it, you'll get Common
*  Event executed defined by CE_ID.
*
*  To edit the map list, open up this plugin in your favorite text editor and
*  scroll down to "EDIT MAP LIST HERE". Make sure to check the example there, too.
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Image Info
* --------------------------------------------------------------------------------
* All backgrounds go into img\system folder.
*
* Default Background file: img\system\mapSelect.png
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - List allows excuting Common Events.
* 1.0 - Release
*/

(function() {

	//--------------------------------------------------------------------------------
	// EDIT MAP LIST HERE v
	//--------------------------------------------------------------------------------
	var mapList = [
		{
			ID: 1,
			Name: "Black Moon Guild",
			Background: "blackness",
			Sublist: [
			{
				ID: 2,
				Name: "Floor 1",
				MapID: 5,
				X: 10,
				Y: 17
			},
			{
				ID: 3,
				Name: "Floor 2",
				MapID: 5,
				X: 5,
				Y: 8
			}
			]
		},
		{
			ID: 4,
			Name: "Forest of Graves",
			Background: "Meadow",
			Sublist: [
			{
				ID: 5,
				Name: "Entrance",
				MapID: 2,
				X: 18,
				Y: 38
			},
			{
				ID: 6,
				Name: "Heart of the Forest",
				MapID: 2,
				X: 25,
				Y: 18
			}
			]
		},
		{
			ID: 7,
			Name: "Call the Events!",
			CE_ID: 1
		}
	];
	//--------------------------------------------------------------------------------
	// EDIT MAP LIST THERE ^
	//--------------------------------------------------------------------------------
	
	var parameters = PluginManager.parameters('MrTS_MapSelection');
	var paramMapSelectText = String(parameters['Map Select Text'] || "Choose Destination");
	var paramHelpText = String(parameters['Help Text'] || "Select a challenge for your fated heroes to struggle in.");
	var paramMaxItems = Number(parameters['Max Items'] || 10);

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "mapselection") {
			switch (args[0].toUpperCase())
			{
				case 'START':
				{
					SceneManager.push(Scene_MapSelect);
				} break;				
				case 'ADD':
				{
					$gameSystem.addMapSelection(Number(args[1]));
				} break;
				case 'REMOVE':
				{
					$gameSystem.removeMapSelection(Number(args[1]));
				} break;
			}
		}
	};


	//--------------------------------------------------------------------------
	// Game_System

	Game_System.prototype.addMapSelection = function(id) {
		if (!this._mapSelections) this._mapSelections = [];
		this._mapSelections.push(id);
	};

	Game_System.prototype.removeMapSelection = function(id) {
		if (!this._mapSelections) this._mapSelections = [];
		this._mapSelections.splice(this._mapSelections.indexOf(id), 1);
	};

	Game_System.prototype.getMapSelections = function() {
		if (!this._mapSelections) this._mapSelections = [];
		return this._mapSelections;
	};

	//--------------------------------------------------------------------------
	// Scene_MapSelect
	//
	// Map selection scene.
	
	function Scene_MapSelect() {
		this.initialize.apply(this, arguments);	
	};
	
	Scene_MapSelect.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_MapSelect.prototype.constructor = Scene_MapSelect;
	
	Scene_MapSelect.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	};
	
	Scene_MapSelect.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createTopWindow();
		this.createListWindow();
		this.createBottomWindow();
		this._stack = [];
	};

	Scene_MapSelect.prototype.createBackground = function() {
	    this._backgroundSprite = new Sprite();
	    this._backgroundSprite.bitmap = ImageManager.loadSystem('mapSelect');
	    this.addChild(this._backgroundSprite);
	};

	Scene_MapSelect.prototype.createTopWindow = function() {
		this._topWindow = new Window_MapSelect_Message(paramMapSelectText, 40);
		this.addWindow(this._topWindow);
	};

	Scene_MapSelect.prototype.createListWindow = function() {
		this._listWindow = new Window_MapSelect_List();
		this._listWindow.setHandler('ok', this.listOkay.bind(this));
		this._listWindow.setHandler('cancel', this.listCancel.bind(this));
		this.addWindow(this._listWindow);
		this._listWindow.setObject(mapList);
		this._listWindow.select(0);
		this._listWindow.activate();
	};

	Scene_MapSelect.prototype.createBottomWindow = function() {
		this._bottomWindow = new Window_MapSelect_Message(paramHelpText, Graphics.boxHeight - 100);
		this.addWindow(this._bottomWindow);
	};

	Scene_MapSelect.prototype.listOkay = function() {
		var item = this._listWindow.item(this._listWindow.index());
		if (item.Sublist)
		{
			this._stack.push([this._listWindow._object, this._listWindow.index()]);
			this._backgroundSprite.bitmap = ImageManager.loadSystem(item.Background);
			this._listWindow.select(0);
			this._listWindow.setObject(item);
			this._listWindow.refresh();
			this._listWindow.activate()
		}
		else if (item.CE_ID)
		{
			this.popScene();
			$gameTemp.reserveCommonEvent(item.CE_ID);
		}
		else
		{
			this.popScene();
			$gamePlayer.reserveTransfer(item.MapID, item.X, item.Y, 2, 0);
		}
	};

	Scene_MapSelect.prototype.listCancel = function() {
		if (this._stack.length > 0)
		{
			this._listWindow.setObject(this._stack[this._stack.length-1][0]);
			if (this._stack[this._stack.length-1][0].Bitmap)
				this._backgroundSprite.bitmap = ImageManager.loadSystem(this._stack[this._stack.length-1][0].Background);
			else
	    		this._backgroundSprite.bitmap = ImageManager.loadSystem('mapSelect');
			this._listWindow.refresh();
			this._listWindow.select(this._stack[this._stack.length-1][1]);
			this._listWindow.activate();
			this._stack.splice(this._stack.length-1, 1);
		}
		else
		{
			this.popScene();
		}
	};

	//--------------------------------------------------------------------------
	// Window_MapSelect_Message
	//
	// Window with top text.
	
	function Window_MapSelect_Message() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_MapSelect_Message.prototype = Object.create(Window_Base.prototype);
	Window_MapSelect_Message.prototype.constructor = Window_MapSelect_Message;
	
	Window_MapSelect_Message.prototype.initialize = function(message, y) {
		this._message = message;
		Window_Base.prototype.initialize.call(this, 0, y, 200, 40);
		var ww = this.textWidth(message) + this.standardPadding()*2;
		var wh = this.fittingHeight(1);
		var wx = Graphics.boxWidth/2 - ww/2;
		this.x = wx;
		this.width = ww;
		this.height = wh;
		this.refresh();
	};
	
	Window_MapSelect_Message.prototype.refresh = function() {
		this.createContents();
		this.drawText(this._message, 0, 0, this.contentsWidth(), 'center');
	};

	//--------------------------------------------------------------------------
	// Window_MapSelect_List
	//
	// Let's player to choose a map.
	
	function Window_MapSelect_List() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_MapSelect_List.prototype = Object.create(Window_Selectable.prototype);
	Window_MapSelect_List.prototype.constructor = Window_MapSelect_List;
	
	Window_MapSelect_List.prototype.initialize = function() {
		Window_Selectable.prototype.initialize.call(this, 60, 120, 350, 200);
	};

	Window_MapSelect_List.prototype.setObject = function(obj) {
		this._object = obj;
		this.resize();
		this.refresh();
	};

	Window_MapSelect_List.prototype.resize = function() {
		var length = 0;
		var array = this._object.Sublist ? this._object.Sublist : this._object;
		for (var i = 0; i < array.length; i++) {
			if ($gameSystem.getMapSelections().contains(array[i].ID)) length++;
		}
		this.height = this.fittingHeight(Math.min(length, paramMaxItems));
		this.createContents();
	};

	Window_MapSelect_List.prototype.maxItems = function() {
		if (!this._object) return 0;
		var length = 0;
		var array = this._object.Sublist ? this._object.Sublist : this._object;
		for (var i = 0; i < array.length; i++) {
			if ($gameSystem.getMapSelections().contains(array[i].ID)) length++;
		}
		return length;
	};

	Window_MapSelect_List.prototype.item = function(index) {
		var pos = -1;
		var array = this._object.Sublist ? this._object.Sublist : this._object;
		for (var i = 0; i < array.length; i++) {
			if ($gameSystem.getMapSelections().contains(array[i].ID))
			{
				pos++;
				if (pos === index) return array[i];
			}
		}
		return null;
	};

	Window_MapSelect_List.prototype.drawItem = function(index) {
		var item = this.item(index);
		if (item)
		{
			var rect = this.itemRectForText(index);
			this.drawText(item.Name, rect.x, rect.y);
		}
	};
})();
