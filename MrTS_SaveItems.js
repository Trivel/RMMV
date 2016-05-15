//=============================================================================
// MrTS_SaveItems.js
//=============================================================================

/*:
* @plugindesc Save party items and reclaim them later with plugin calls.
* @author Mr. Trivel
*
* @param Keep Items
* @desc Which items to keep. Write IDs separated by space.
* Default: 1 2
* @default 1 2
*
* @param Keep Weapons
* @desc Which weapons to keep. Write IDs separated by space.
* Default: 3
* @default 3
*
* @param Keep Armors
* @desc Which armors to keep. Write IDs separated by space.
* Default 1 4
* @default 1 4
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
* About the Plugin
* --------------------------------------------------------------------------------
* Maybe you wanted to have different groups of actors going through story,
* or maybe the party split up for the next encounter and moving on their own.
* And that requires the party to remove currently held items, so another party
* moves on with their story. In that case, this plugin does just that.
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* Save items by using following plugin commands that suits items you have:
* SaveItems All
* SaveItems Items
* SaveItems Armors
* SaveItems Weapons
* SaveItems KeyItems
*
* Reclaim saved items by using the following plugin commands:
* ReclaimItems All
* ReclaimItems Items
* ReclaimItems Armors
* ReclaimItems Weapons
* ReclaimItems KeyItems
*
* Keep some items in your inventory before sending all of them away:
* KeepItems Items [IDs separated by space]
* KeepItems Armors [IDs separated by space]
* KeepItems Weapons [IDs spearated by space]
* 
* Example:
* KeepItems Armor 1 2 3 6 7
*
* Clear item to be saved list with the following commands:
* KeepItems Clear All
* KeepItems Clear Items
* KeepItems Clear Armors
* KeepItems Clear Weapons
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_SaveItems');
	var paramKeepItems = (parameters['Keep Items'] || "1 2");
	var arrKeepItems = paramKeepItems.split(' ');
	var paramKeepWeapons = (parameters['Keep Weapons'] || "3");
	var arrKeepWeapons = paramKeepWeapons.split(' ');
	var paramKeepArmors = (parameters['Keep Armors'] || "1 4");
	var arrKeepArmors = paramKeepArmors.split(' ');

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "saveitems") {
			switch (args[0].toUpperCase())
			{
				case 'ALL':
				{
					$gameParty.saveItems('all');
				} break;
				case 'ITEMS':
				{
					$gameParty.saveItems('items');
				} break;
				case 'ARMORS':
				{
					$gameParty.saveItems('armors');
				} break;
				case 'WEAPONS':
				{
					$gameParty.saveItems('weapons');
				} break;
				case 'KEYITEMS':
				{
					$gameParty.saveItems('keyItems');
				} break;
			}
		} else if (command.toLowerCase() === "reclaimitems") {
			switch (args[0].toUpperCase())
			{
				case 'ALL':
				{
					$gameParty.reclaimItems('all');
				} break;
				case 'ITEMS':
				{
					$gameParty.reclaimItems('items');
				} break;
				case 'ARMORS':
				{
					$gameParty.reclaimItems('armors');
				} break;
				case 'WEAPONS':
				{
					$gameParty.reclaimItems('weapons');
				} break;
				case 'KEYITEMS':
				{
					$gameParty.reclaimItems('keyItems');
				} break;
			}
		} else if (command.toLowerCase() === "keepitems") {
			if (args[0].toLowerCase() === "clear")
			{
				switch (args[1].toUpperCase())
				{
					case 'ALL':
					{
						$gameParty.clearKeptItems('all');
					} break;
					case 'ITEMS':
					{
						$gameParty.clearKeptItems('items');
					} break;
					case 'ARMORS':
					{
						$gameParty.clearKeptItems('armors');
					} break;
					case 'WEAPONS':
					{
						$gameParty.clearKeptItems('weapons');
					} break;
				}
			}
			else
			{
				$gameParty.addKeptItems(args);
			}
			
		}
	};

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 

	var _Game_Party_initialize = Game_Party.prototype.initialize;
	Game_Party.prototype.initialize = function() {
		_Game_Party_initialize.call(this);
		this._savedItems = [];
		this._savedKeyItems = [];
		this._savedArmor = [];
		this._savedWeapons = [];
		this._keptItems = [];
		this._keptArmor = [];
		this._keptWeapons = [];
	};

	Game_Party.prototype.addKeptItems = function(args) {
		var type = args[0].toLowerCase();
		switch (type)
		{
			case 'items':
			{
				for (var i = 1; i < args.length; i++) {
					this._keptItems.push(Number(args[i]));
				}
			} break;
			case 'armors':
			{
				for (var i = 1; i < args.length; i++) {
					this._keptArmor.push(Number(args[i]));
				}
			} break;
			case 'weapons':
			{
				for (var i = 1; i < args.length; i++) {
					this._keptWeapons.push(Number(args[i]));
				}
			} break;
		}
	};

	Game_Party.prototype.clearKeptItems = function(type) {
		var all = (type === 'all');
		if (all || type === 'items') {
			this._keptItems = [];
		}
		if (all || type === 'armors') {
			this._keptArmor = [];
		}
		if (all || type === 'weapons') {
			this._keptWeapons = [];
		}
	};

	Game_Party.prototype.saveItems = function(type) {
		var all = (type === 'all');
		if (all || type === 'items' || type === 'keyItems') {
			for (var id in this._items) {
				if (this._items.hasOwnProperty(id)) {
					if (arrKeepItems.contains(id) || this._keptItems.contains(Number(id))) continue;
					
					var item = $dataItems[id];
					var amount = this._items[id];
					if ((type === 'items' || all) && item.itypeId === 1) {
						this._savedItems.push([id, amount]);
						delete this._items[id];
					}
					if ((type === 'keyItems' || all) && item.itypeId === 2) {
						this._savedKeyItems.push([id, amount]);
						delete this._items[id];
					}
				}
			}
		}
		if (all || type === 'armors') {
			for (var id in this._armors) {
				if (this._armors.hasOwnProperty(id)) {
					if (arrKeepArmors.contains(id) || this._keptArmor.contains(Number(id))) continue;

					var amount = this._armors[id];
					this._savedArmor.push([id, amount]);
					delete this._armors[id];
				}
			}
		}
		if (all || type === 'weapons') {
			for (var id in this._weapons) {
				if (this._weapons.hasOwnProperty(id)) {
					if (arrKeepWeapons.contains(id) || this._keptWeapons.contains(Number(id))) continue;

					var amount = this._weapons[id];
					this._savedWeapons.push([id, amount]);
					delete this._weapons[id];
				}
			}
		}
	};

	Game_Party.prototype.reclaimItems = function(type) {
		var all = (type === 'all');
		if (all || type === 'items') {
			for (var i = 0; i < this._savedItems.length; i++) {
				this._items[this._savedItems[i][0]] = this._savedItems[i][1];
			}
			this._savedItems = [];
		}
		if (all || type === 'keyItems') {
			for (var i = 0; i < this._savedKeyItems.length; i++) {
				this._items[this._savedKeyItems[i][0]] = this._savedKeyItems[i][1];
			}
			this._savedKeyItems = [];
		}
		if (all || type === 'armors') {
			for (var i = 0; i < this._savedArmor.length; i++) {
				this._armors[this._savedArmor[i][0]] = this._savedArmor[i][1];
			}
			this._savedArmor = [];
		}
		if (all || type === 'weapons') {
			for (var i = 0; i < this._savedWeapons.length; i++) {
				this._weapons[this._savedWeapons[i][0]] = this._savedWeapons[i][1];
			}
			this._savedWeapons = [];
		}
	};
})();
