//=============================================================================
// MrTS_SalvageItems.js
//=============================================================================

var Imported = Imported || {};
Imported.MrTS_SalvageItems = true;

/*:
* @plugindesc Allows to salvage items to get their base resources.
* @author Mr. Trivel
*
* @param Command In Menu
* @desc Is the salvage command in menu? (True/False)
* True
* @default True
*
* @param Command Name
* @desc Command Name in the menu.
* Default: Salvage
* @default Salvage
*
* @param Enable Switch
* @desc Switch that enables/disables command in menu.
* 0 - always enabled.
* @default 0
*
* @param Rewards Text
* @desc Rewards text that's shown on the top of right window.
* @default Salvaged to:
*
* @param Fail Text
* @desc Text when obtaining no materials from salvaging.
* @default Salvaging Failure
*
* @param Rewards Timer
* @desc How long the rewards window stays open before closing?
* @default 150
*
* @param Background Image
* @desc Image for the Salvaging scene's background.
* Image to be found in img\system
* @default 
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
* Item tags
* --------------------------------------------------------------------------------
* To make salvaging possible, create salvage results for items by placing them in
* those items.
* Creating the rewards:
* <salvage>
* [TYPE] [ID] [QUANTITY] [CHANCE]
* </salvage>
*
* [TYPE] - Item type. w - weapon, a - armor, i - item
* [ID] - ID of the item
* [QUANTITY] - How many player gets from salvaging
* [CHANCE] - Chance of success - 1.0 - 100%, 0.5 - 50%, 0.04 - 4%
*
* Example:
* <Salvage>
* i 8 1 1
* i 8 1 0.75
* i 8 1 0.25
* </Salvage>
* 
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* SalvageScene - Calls Salvaging Scene.
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - Crash fix when trying to salvage null object.
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_SalvageItems');
	var paramCommandInMenu = Boolean(parameters['Command In Menu'] && parameters['Command In Menu'].toLowerCase() !== "false" || true);
	var paramCommandName = String(parameters['Command Name'] || "Salvage");
	var paramEnableSwitch = Number(parameters['Enable Switch'] || 0);
	var paramRewardsText = String(parameters['Rewards Text'] || "Salvaged to:");
	var paramFailText = String(parameters['Fail Text'] || "Salvaging Failure");
	var paramWindowTime = Number(parameters['Rewards Timer'] || 150);
	var paramBackground = String(parameters['Background Image'] || "");

	var regexStart = /<salvage>/i;
	var regexEnd = /<\/salvage>/i;
	var regexItem = /([iaw])[ ]+(\d+)[ ]+(\d+)[ ]*(\d+[.]*\d*)/i;

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 

	var _GameInterpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_GameInterpreter_pluginCommand.call(this, command, args);
		if (command === 'SalvageScene') {
			SceneManager.push(Scene_Salvage);
		}
	};

	//--------------------------------------------------------------------------
	// Scene_Salvage
	//
	// Scene for salvaging items.
	
	function Scene_Salvage() {
		this.initialize.apply(this, arguments);	
	};
	
	Scene_Salvage.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_Salvage.prototype.constructor = Scene_Salvage;
	
	Scene_Salvage.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	};
	
	Scene_Salvage.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createWindowLayer2();
		this.createHelpWindow();
		this.createCommandsWindow();
		this.createItemListWindow();
		this.createItemDescWindow();
		this.createResultWindow();
	};

	Scene_Salvage.prototype.createBackground = function() {
	    this._backgroundSprite = new Sprite();
	    if (paramBackground.length > 0)
	    	this._backgroundSprite.bitmap = ImageManager.loadSystem(paramBackground);
	    else
	    	this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
	    this.addChild(this._backgroundSprite);
	};

	Scene_Salvage.prototype.createWindowLayer2 = function() {
	    var width = Graphics.boxWidth;
	    var height = Graphics.boxHeight;
	    var x = (Graphics.width - width) / 2;
	    var y = (Graphics.height - height) / 2;
	    this._windowLayer2 = new WindowLayer();
	    this._windowLayer2.move(x, y, width, height);
	    this.addChild(this._windowLayer2);
	};

	Scene_Salvage.prototype.createHelpWindow = function() {
		this._helpWindow = new Window_Help();
		this.addWindow(this._helpWindow);
	};

	Scene_Salvage.prototype.createCommandsWindow = function() {
		this._commandsWindow = new Window_SalvageItemCategory();
		this._commandsWindow.y = this._helpWindow.y + this._helpWindow.height;
	    this._commandsWindow.setHandler('ok',     this.onCommandOk.bind(this));
	    this._commandsWindow.setHandler('cancel', this.popScene.bind(this));
		this.addWindow(this._commandsWindow);
	};

	Scene_Salvage.prototype.createItemListWindow = function() {
		var wx = 0;
		var wy = this._commandsWindow.y + this._commandsWindow.height;
		var ww = Graphics.boxWidth/2;
		var wh = Graphics.boxHeight - wy;		
		this._itemListWindow = new Window_SalvageItemList(wx, wy, ww, wh);
    	this._itemListWindow.setHelpWindow(this._helpWindow);
    	this._commandsWindow.setItemWindow(this._itemListWindow);
	    this._itemListWindow.setHandler('ok',     this.onItemOk.bind(this));
	    this._itemListWindow.setHandler('cancel', this.onItemCancel.bind(this));
		this.addWindow(this._itemListWindow);
	};

	Scene_Salvage.prototype.createItemDescWindow = function() {
		var wx = this._itemListWindow.x + this._itemListWindow.width;
		var wy = this._itemListWindow.y;
		var ww = Graphics.boxWidth - this._itemListWindow.width;
		var wh = this._itemListWindow.height;
		this._itemDescWindow = new Window_SalvageItemDescription(wx, wy, ww, wh);
		this._itemListWindow.setDescWindow(this._itemDescWindow);
		this.addWindow(this._itemDescWindow);
	};

	Scene_Salvage.prototype.createResultWindow = function() {
		var wx = Graphics.boxWidth/2 - 300/2;
		var wy = Graphics.boxHeight/2 - 120/2;
		var ww = 300;
		var wh = 120;
		this._itemResultWindow = new Window_SalvageItemResult(wx, wy, ww, wh);
		this._windowLayer2.addChild(this._itemResultWindow);
	};

	Scene_Salvage.prototype.onCommandOk = function() {
	    this._itemListWindow.activate();
	    this._itemListWindow.selectLast();		
	};

	Scene_Salvage.prototype.onItemOk = function() {
		var list = [];
		var startFound = false;
		var item = this._itemListWindow.item();
		if (item)
		{
			var note = item.note.split(/[\r\n]/);
			for (var i = 0; i < note.length; i++) {
				if (!startFound)
				{
					var regexMatch = regexStart.exec(note[i]);
					if (regexMatch)
						startFound = true;
				}
				else
				{
					var regexEndMatch = regexEnd.exec(note[i]);
					if (regexEndMatch)
						startFound = false;

					if (!startFound) continue;

					var regexItemMatch = regexItem.exec(note[i]);
					if (regexItemMatch)
					{
						var chance = Number(regexItemMatch[4]);					
						var roll = Math.random();
						if (roll > chance) continue;
						var id = Number(regexItemMatch[2]);
						var quantity = Number(regexItemMatch[3]);
						var itemTemp = null;
						switch (regexItemMatch[1])
						{
							case "i":
							{
								itemTemp = $dataItems[id];
							} break;
							case "a":
							{
								itemTemp = $dataArmors[id];
							} break;
							case "w":
							{
								itemTemp = $dataWeapons[id];
							} break;
						}
						for (var j = 0; j < quantity; j++) {
							list.push(itemTemp);
						};
					}
				}
			};

			$gameParty.loseItem(this._itemListWindow.item(), 1);
			this._itemResultWindow.setResult(list);
			for (var j = 0; j < list.length; j++) {
				$gameParty.gainItem(list[j], 1);
			};
			this._itemResultWindow.show();
			this._itemResultWindow.open();
			this._timer = paramWindowTime;
		}
		this._itemListWindow.refresh();
		this._itemListWindow.activate();
	};

	Scene_Salvage.prototype.onItemCancel = function() {
	    this._itemListWindow.deselect();
	    this._commandsWindow.activate();
	};

	Scene_Salvage.prototype.update = function() {
		Scene_MenuBase.prototype.update.call(this);
		this._timer--;
		if (this._timer <= 0 && this._itemResultWindow.isOpen())
			this._itemResultWindow.close();
	};

	//--------------------------------------------------------------------------
	// Window_SalvageItemResult
	//
	// Result window from salvaging iems for Scene_Salvage.
	
	function Window_SalvageItemResult() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_SalvageItemResult.prototype = Object.create(Window_Base.prototype);
	Window_SalvageItemResult.prototype.constructor = Window_SalvageItemResult;
	
	Window_SalvageItemResult.prototype.initialize = function(x, y, w, h) {
		Window_Base.prototype.initialize.call(this, x, y, w, h);
		this._result = [];
		this._unique = [];
		this._quantity = [];
		this._defaultWidth = w;
		this.hide();
		this.close();
	};
	
	Window_SalvageItemResult.prototype.refresh = function() {
		this.createContents();
		for (var i = 0; i < this._unique.length; i++) {
			this.drawItemName(this._unique[i], 0, this.lineHeight()*i);
			this.drawItemNumber(this._quantity[i], 0, this.lineHeight()*i, this.contentsWidth());
		};
		if (this._unique.length === 0)
		{
			this.drawText(paramFailText, 0, 0);
		}
	};

	Window_SalvageItemResult.prototype.setResult = function(result) {
		this._result = [];
		this._unique = [];
		this._quantity = [];
		var lw = 0;
		for (var i = 0; i < result.length; i++) {
			if (this._unique.indexOf(result[i]) === -1)
			{
				this._unique.push(result[i]);
				this._quantity.push(1);
				var w = this.textWidth(result[i].name) + 40 + this.numberWidth() + this.standardPadding()*2;
				if (w > lw) lw = w;
			}
			else
				this._quantity[this._unique.indexOf(result[i])]++;
		};
		if (lw === 0) lw = this.textWidth(paramFailText) + this.standardPadding()*2;
		this.height = this.fittingHeight(this._unique.length > 0 ? this._unique.length : 1);
		this.width = lw;
		this.x = Graphics.boxWidth/2 - this.width/2;
		this.y = Graphics.boxHeight/2 - this.height/2;
		this.refresh();
	};

	Window_SalvageItemResult.prototype.numberWidth = function() {
	    return this.textWidth('x00');
	};

	Window_SalvageItemResult.prototype.drawItemNumber = function(number, x, y, width) {
        this.drawText('x', x, y, width - this.textWidth('00'), 'right');
        this.drawText(number, x, y, width, 'right');
	};

	//--------------------------------------------------------------------------
	// Window_SalvageItemList
	//
	// 1 column item list for Scene_Salvage.
	
	function Window_SalvageItemList() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_SalvageItemList.prototype = Object.create(Window_ItemList.prototype);
	Window_SalvageItemList.prototype.constructor = Window_SalvageItemList;
	
	Window_SalvageItemList.prototype.initialize = function(x, y, w, h) {
		Window_ItemList.prototype.initialize.call(this, x, y, w, h);
	};
	
	Window_SalvageItemList.prototype.maxCols = function() {
	    return 1;
	};

	Window_SalvageItemList.prototype.includes = function(item) {
		if (!item || !item.meta.Salvage) return false;
		return Window_ItemList.prototype.includes.call(this, item);
	};

	Window_SalvageItemList.prototype.isEnabled = function(item) {
	    return true;
	};

	Window_SalvageItemList.prototype.updateHelp = function() {
		Window_ItemList.prototype.updateHelp.call(this);
	    this.setDescWindowItem(this.item());
	};

	Window_SalvageItemList.prototype.setDescWindowItem = function(item) {
	    if (this._descWindow) {
	        this._descWindow.setItem(item);
	    }
	};

	Window_SalvageItemList.prototype.setDescWindow = function(desc) {
		this._descWindow = desc;
	};

	//--------------------------------------------------------------------------
	// Window_SalvageItemCategory
	//
	// Item category window for Scene_Salvage.
	
	function Window_SalvageItemCategory() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_SalvageItemCategory.prototype = Object.create(Window_ItemCategory.prototype);
	Window_SalvageItemCategory.prototype.constructor = Window_SalvageItemCategory;
	
	Window_SalvageItemCategory.prototype.initialize = function() {
		Window_ItemCategory.prototype.initialize.call(this);
	};

	Window_SalvageItemCategory.prototype.maxCols = function() {
	    return 3;
	};

	Window_SalvageItemCategory.prototype.makeCommandList = function() {
	    this.addCommand(TextManager.item,    'item');
	    this.addCommand(TextManager.weapon,  'weapon');
	    this.addCommand(TextManager.armor,   'armor');
	};

	//--------------------------------------------------------------------------
	// Window_SalvageItemDescription
	//
	// Shows the costs and results of item salvaging.
	
	function Window_SalvageItemDescription() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_SalvageItemDescription.prototype = Object.create(Window_Base.prototype);
	Window_SalvageItemDescription.prototype.constructor = Window_SalvageItemDescription;
	
	Window_SalvageItemDescription.prototype.initialize = function(x, y, w, h) {
		Window_Base.prototype.initialize.call(this, x, y, w, h);
		this.item = null;
	};
	
	Window_SalvageItemDescription.prototype.refresh = function() {		
		this.contents.clear();
		if (!this.item) return;
		var list = this.getSalvageList();
		this.changeTextColor(this.systemColor());
		this.drawText(paramRewardsText, 0, 0);
		this.resetTextColor();
		for (var i = 0; i < list.length; i++) {
			this.drawItemName(list[i], 0, this.lineHeight()*(i+1), this.contentsWidth());
		};
		
	};

	Window_SalvageItemDescription.prototype.setItem = function(item) {
		this.item = item;
		this.refresh();
	};

	Window_SalvageItemDescription.prototype.getSalvageList = function() {
		var list = [];
		var startFound = false;
		if (!this.item) return list;

		var note = this.item.note.split(/[\r\n]/);
		for (var i = 0; i < note.length; i++) {
			if (!startFound)
			{
				var regexMatch = regexStart.exec(note[i]);
				if (regexMatch)
					startFound = true;
			}
			else
			{
				var regexEndMatch = regexEnd.exec(note[i]);
				if (regexEndMatch)
					startFound = false;

				if (!startFound) continue;

				var regexItemMatch = regexItem.exec(note[i]);
				if (regexItemMatch)
				{
					var id = Number(regexItemMatch[2]);
					var item = null;
					switch (regexItemMatch[1])
					{
						case "i":
						{
							item = $dataItems[id];
						} break;
						case "a":
						{
							item = $dataArmors[id];
						} break;
						case "w":
						{
							item = $dataWeapons[id];
						} break;
					}
					if (!list.contains(item)) list.push(item);
				}
			}
		};

		return list;
	};

	//--------------------------------------------------------------------------
	// Scene_Menu

	var _SceneMenu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
	Scene_Menu.prototype.createCommandWindow = function() {
		_SceneMenu_createCommandWindow.call(this);
		this._commandWindow.setHandler('salvage', 	this.commandSalvage.bind(this));
	};

	Scene_Menu.prototype.commandSalvage = function() {
		SceneManager.push(Scene_Salvage);
	};

	var _WindowMenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
	Window_MenuCommand.prototype.addOriginalCommands = function() {
		_WindowMenuCommand_addOriginalCommands.call(this);
		this.addCommand(paramCommandName, 'salvage', paramEnableSwitch !== 0 ? $gameSwitches.value(paramEnableSwitch) : true);
	};
})();
