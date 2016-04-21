//=============================================================================
// MrTS_DisableItemsToSell.js
//=============================================================================

/*:
* @plugindesc Disables specific items from being allowed to be sold in shops.
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
* Version 1.0
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* To disallow specific items from being sold use the following commands group:
* ItemLock Disable Item ID (ID) 
* ItemLock Disable Weapon ID (ID)
* ItemLock Disable Armor ID (ID)
* For plugin commands above, if you specify 2nd ID, it'll disable all items in
* that range. 2nd ID is optional.
* E.g.: ItemLock Disable Item 10 13 will disable items with IDs 10, 11, 12, 13.
*
* To allow specifically disabled items to be sold again use this commands group:
* ItemLock Enable Item ID (ID)
* ItemLock Enable Weapon ID (ID)
* ItemLock Enable Armor ID (ID)
* For plugin commands above, if you specify 2nd ID, it'll enable all items in
* that range. 2nd ID is optional.
* E.g.: ItemLock Enable Armor 5 9 will disable armors with IDs 5, 6, 7, 8, 9.
*
* To quickly clear all specifically disabled items, use the following group:
* ItemLock Clear Items
* ItemLock Clear Weapons
* ItemLock Clear Armors
* ItemLock Clear All
* 
* To disable/enable whole groups of items to be sold use the following groups:
* ItemLock Disable All Items
* ItemLock Disable All Weapons
* ItemLock Disable All Armors
*
* ItemLock Enable All Items
* ItemLock Enable All Weapons
* ItemLock Enable All Armors
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "itemlock") {
			switch (args[0].toUpperCase())
			{
				case 'DISABLE':
				{
					switch (args[1].toUpperCase())
					{
						case 'ALL':
						{
							$gameSystem.itemLockSetAllTo("disable", args[2].toLowerCase());
						} break;
						default:
						{
							var id = Number(args[2]);
							var id2 = args[3] ? Number(args[3]) : null;
							$gameSystem.itemLockChangeSpecific("disable", args[1].toLowerCase(), id, id2);
						} break;
					}
				} break;
				case 'ENABLE':
				{
					switch (args[1].toUpperCase())
					{
						case 'ALL':
						{
							$gameSystem.itemLockSetAllTo("enable", args[2].toLowerCase());
						} break;
						default:
						{
							var id = Number(args[2]);
							var id2 = args[3] ? Number(args[3]) : null;
							$gameSystem.itemLockChangeSpecific("enable", args[1].toLowerCase(), id, id2);
						} break;
					}
				} break;
				case 'CLEAR':
				{
					$gameSystem.itemLockClearSpecific(args[1].toLowerCase());
				} break;
				default:
				{
					console.warn("ItemLock " + args[0] + " command does not exist!");
				} break;
			}
		}
	};


	//--------------------------------------------------------------------------
	// Game_System
	// 

	var _Game_System_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_Game_System_initialize.call(this);
		this._itemLockItems = [];
		this._itemLockWeapons = [];
		this._itemLockArmors = [];
		this._itemLockAllItems = false;
		this._itemLockAllWeapons = false;
		this._itemLockAllArmors = false;
	};

	Game_System.prototype.itemLockCanSell = function(item) {
		var type = null;
		if (DataManager.isItem(item))
			type = "item";
		else if (DataManager.isWeapon(item))
			type = "weapon";
		else if (DataManager.isArmor(item))
			type = "armor";
		else
			return true;

		switch (type)
		{
			case 'item':
			{
				if (this._itemLockAllItems || this._itemLockItems.contains(item.id))
					return false;
			} break;
			case 'weapon':
			{
				if (this._itemLockAllWeapons || this._itemLockWeapons.contains(item.id))
					return false;
			} break;
			case 'armor':
			{
				if (this._itemLockAllArmors || this._itemLockArmors.contains(item.id))
					return false;
			} break;
		}
		return true;
	};

	Game_System.prototype.itemLockChangeSpecific = function(to, type, id, id2) {
		var range = id2 ? id2 - id + 1 : 1;
		for (var i = id; i < id+range; i++) {
			switch (type)
			{
				case 'item':
				{
					if (to === "disable") {
						if (!this._itemLockItems.contains(i)) this._itemLockItems.push(i);
					}
					else if (to === "enable") {
						this._itemLockItems.splice(this._itemLockItems.indexOf(i), 1);
					}
					else {
						console.warn("ItemLock " + to + " " + type + " command does not exist!");
					}

				} break;
				case 'weapon':
				{
					if (to === "disable") {
						if (!this._itemLockWeapons.contains(i)) this._itemLockWeapons.push(i);
					}
					else if (to === "enable") {
						this._itemLockWeapons.splice(this._itemLockWeapons.indexOf(i), 1);
					}
					else {
						console.warn("ItemLock " + to + " " + type + " command does not exist!");
					}
				} break;
				case 'armor':
				{
					if (to === "disable") {
						if (!this._itemLockArmors.contains(i)) this._itemLockArmors.push(i);
					}
					else if (to === "enable"){
						this._itemLockArmors.splice(this._itemLockArmors.indexOf(i), 1);
					}
					else {
						console.warn("ItemLock " + to + " " + type + " command does not exist!");
					}
				} break;
			}
		}
	};

	Game_System.prototype.itemLockClearSpecific = function(type) {
		switch (type)
		{
			case 'items':
			{
				this._itemLockItems = [];
			} break;
			case 'weapons':
			{
				this._itemLockWeapons = [];
			} break;
			case 'armors':
			{
				this._itemLockArmors = [];
			} break;
			case 'all':
			{
				this._itemLockItems = [];
				this._itemLockWeapons = [];
				this._itemLockArmors = [];
			} break;
			default:
			{
				console.warn("ItemLock Clear " + type + " command does not exist!");
			} break;
		}
	};

	Game_System.prototype.itemLockSetAllTo = function(to, type) {
		switch (type)
		{
			case 'items':
			{
				if (to === "disable") {
					this._itemLockAllItems = true;
				}
				else if (to === "enable"){
					this._itemLockAllItems = false;
				}
				else {
					console.warn("ItemLock " + to + " All " + type + " command does not exist!");
				}
			} break;
			case 'weapons':
			{
				if (to === "disable") {
					this._itemLockAllWeapons = true;
				}
				else if (to === "enable"){
					this._itemLockAllWeapons = false;
				}
				else {
					console.warn("ItemLock " + to + " All " + type + " command does not exist!");
				}
			} break;
			case 'armors':
			{
				if (to === "disable") {
					this._itemLockAllArmors = true;
				}
				else if (to === "enable"){
					this._itemLockAllArmors = false;
				}
				else {
					console.warn("ItemLock " + to + " All " + type + " command does not exist!");
				}
			} break;
			default:
			{
				console.warn("ItemLock " + to + " " + " All " + type + " command does not exist!");
			}
		}
	};

	//--------------------------------------------------------------------------
	// Window_ShopSell
	// 

	var _Window_ShopSell_isEnabled = Window_ShopSell.prototype.isEnabled;
	Window_ShopSell.prototype.isEnabled = function(item) {
	    return _Window_ShopSell_isEnabled.call(this, item) && $gameSystem.itemLockCanSell(item);
	};
})();
