//=============================================================================
// MrTS_LimitedInventory.js
//=============================================================================

/*:
* @plugindesc Limits inventory space by weight or item numbers.
* @author Mr. Trivel
*
* @param Limit Mode
* @desc Which mode to use? weight/number
* Default: number
* @default number
*
* @param Default Limit
* @desc Inventory limit.
* Default: 30
* @default 30
*
* @param Default Weight
* @desc If using 'weight' mode, how much items weight by default?
* Default: 1
* @default 1
*
* @param Show Window
* @desc Show inventory limit window in item menu? true/false
* Default: True
* @default True
*
* @param Limit Text
* @desc How will limit be named in Window?
* Default: Limit:
* @default Limit:
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
* Item Tags
* --------------------------------------------------------------------------------
* <Weight: [AMOUNT]>
* If using 'weight' mode, use the following to determine the weight of item.
*
* Example:
* <Weight: 5>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Equipment Tags
* --------------------------------------------------------------------------------
* <InvLimitChange: [AMOUNT]>
* Changes inventory limit by AMOUNT while item is equipped. Works for both modes.
*
* <InvLimitChange: -5>
* <InvLimitChange: 10>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* InventoryLimit Add [AMOUNT] - Adds Amount to limit.
* InventoryLimit Sub [AMOUNT] - Removes Amount from limit.
* InventoryLimit Ignore - Ignores inventory limit when adding items
* InventoryLimit StopIgnore - Stops ignoring inventory limit when adding items
*
* Examples:
* InventoryLimit Add 10
* InventoryLimit Sub 5
* InventoryLimit Ignore
* InventoryLimit StopIgnore
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Script Calls
* --------------------------------------------------------------------------------
* $gameParty.getInventorySpaceLeft() - returns amount of space left
* $gameParty.getInventorySpaceTotal() - returns total amount of space
* $gameParty.getInventorySpaceUsed() - returns used amount of space
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_LimitedInventory');
	var paramLimitMode = String(parameters['Limit Mode'] || "number");
	var paramDefaultLimit = Number(parameters['Default Limit'] || 30);
	var paramDefaultWeight = Number(parameters['Default Weight'] || 1);
	var paramShowWindow = (parameters['Show Window'] || "true").toLowerCase() === "true";
	var paramLimitText = String(parameters['Limit Text'] || "Limit:");

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "inventorylimit") {
			switch (args[0].toUpperCase())
			{
				case 'ADD':
				{
					$gameParty.increaseInventorySpace(Number(args[1]));
				} break;
				case 'SUB':
				{
					$gameParty.decreaseInventorySpace(Number(args[1]));
				} break;
				case 'IGNORE':
				{
					$gameParty._ignoreInvLimit = true;
				} break;
				case 'STOPIGNORE':
				{
					$gameParty._ignoreInvLimit = false;
				} break;				
			}
		}
	};

	//--------------------------------------------------------------------------
	// Game_Party

	var _Game_Party_initialize = Game_Party.prototype.initialize;
	Game_Party.prototype.initialize = function() {
		_Game_Party_initialize.call(this);
		this._inventorySpace = paramDefaultLimit;
		this._modifiedInvSpace = 0;
		this._ignoreInvLimit = false;
	};

	Game_Party.prototype.increaseInventorySpace = function(amount) {
		this._modifiedInvSpace += amount;
	};

	Game_Party.prototype.decreaseInventorySpace = function(amount) {
		this.increaseInventorySpace(-amount);
	};

	Game_Party.prototype.getInventorySpaceTotal = function() {
		var base = this._inventorySpace;
		var mod = this._modifiedInvSpace;
		var equipment = 0;
		for (var i = 0; i < this.members().length; i++) {
			equipment += this.members()[i].getInventorySpaceBonus();
		}
		return Math.max(0, (base+mod+equipment));
	};

	Game_Party.prototype.getInventorySpaceUsed = function() {
		var used = 0;
		for (var i = 0; i < this.allItems().length; i++) {
			switch(paramLimitMode)
			{
				case 'number':
				{
					used += this.numItems(this.allItems()[i]);
				} break;
				case 'weight':
				{
					var weight = this.allItems()[i].meta.Weight ? Number(this.allItems()[i].meta.Weight) : paramDefaultWeight;
					used += this.numItems(this.allItems()[i]) * weight;
				} break;
				
			}
		}
		return used;
	};

	Game_Party.prototype.getInventorySpaceLeft = function() {
		return this.getInventorySpaceTotal() - this.getInventorySpaceUsed();
	};

	Game_Party.prototype.getItemWeight = function(item) {
		switch(paramLimitMode)
		{
			case 'number':
			{
				return 1;
			} break;
			case 'weight':
			{
				var weight = item.meta.Weight ? Number(item.meta.Weight) : paramDefaultWeight;
				return weight;
			} break;
			
		}
		return 1;
	};

	var _Game_Party_gainItem = Game_Party.prototype.gainItem;
	Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
		if (amount < 0 || this._ignoreInvLimit) _Game_Party_gainItem.call(this, item, amount, includeEquip);
		else
		{
			var weight = this.getItemWeight(item);
			var tWeight = weight * amount;
			var aWeight = this.getInventorySpaceLeft();
			if ((aWeight - tWeight) >= 0) _Game_Party_gainItem.call(this, item, amount, includeEquip);
			else
			{
				var newAmount = Math.floor(aWeight/weight);
				if (newAmount > 0)
					_Game_Party_gainItem.call(this, item, newAmount, includeEquip);
			}
		}
	};

	Game_Actor.prototype.getInventorySpaceBonus = function() {
		var bonus = 0;
		for (var i = 0; i < this.equips().length; i++) {
			if (!this.equips()[i]) continue;
			if (this.equips()[i].meta.InvLimitChange)
				bonus += Number(this.equips()[i].meta.InvLimitChange);
		}
		return bonus;
	};

	//--------------------------------------------------------------------------
	// Window_InventoryLimit
	//
	// Shows how much is left.
	
	function Window_InventoryLimit() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_InventoryLimit.prototype = Object.create(Window_Base.prototype);
	Window_InventoryLimit.prototype.constructor = Window_InventoryLimit;
	
	Window_InventoryLimit.prototype.initialize = function(x, y, w, h) {
		Window_Base.prototype.initialize.call(this, x, y, w, h);
		this.refresh();
	};
	
	Window_InventoryLimit.prototype.refresh = function() {
		this.contents.clear();
		var u = $gameParty.getInventorySpaceUsed();
		var t = $gameParty.getInventorySpaceTotal();
		this.drawText(paramLimitText + " " + u + "/" + t, 0, 0);
	};

	//--------------------------------------------------------------------------
	// Scene_Item
	// 

	var _Scene_Item_create = Scene_Item.prototype.create;
	Scene_Item.prototype.create = function() {
		_Scene_Item_create.call(this);
		if (paramShowWindow)
			this.createLimitWindow();
	};

	Scene_Item.prototype.createLimitWindow = function() {
		var wx = this._itemWindow.x;
		var ww = this._itemWindow.width;
		var wh = this._itemWindow.fittingHeight(1);
		this._itemWindow.height = this._itemWindow.height - wh;
		this._itemWindow.refresh();
		var wy = this._itemWindow.y + this._itemWindow.height;
		this._invLimitWindow = new Window_InventoryLimit(wx, wy, ww, wh);
		this.addWindow(this._invLimitWindow);
	};

	var _Scene_Item_useItem = Scene_Item.prototype.useItem;
	Scene_Item.prototype.useItem = function() {
		_Scene_Item_useItem.call(this);
		if (this._invLimitWindow) this._invLimitWindow.refresh();
	};
})();
