//=============================================================================
// MrTS_UnlockShopItems.js
//=============================================================================

/*:
* @plugindesc Unlock new items in shop by selling or plugin commands.
* @author Mr. Trivel
*
* @param Unlock Text
* @desc Unlock text that's shown when item is unlocked by selling.
* Default: Unlocked:
* @default Unlocked:
*
* @param Unlock Timer
* @desc How long the unlock window stays open before closing?
* Default: 150
* @default 150
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
* DynamicShop Enter [SHOP_ID] - Enters the shop of this plugin
* DynamicShop Unlock [SHOP_ID] [TYPE] [ID] - Unlocks item to be permanently 
*  available in the shop.
* [SHOP_ID] - ID of the shop
* [TYPE] - i, a, w - i: item, a: armor, w: weapon
* [ID] - ID of the item in database
*
* Examples:
* DynamicShop Enter 1
* DynamicShop Unlock 1 w 55
* DynamicShop Unlock 2 a 15
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Setting up Recipes
* --------------------------------------------------------------------------------
* Items tagged with any of these tags will be available in the shop. You can have
*  1 tag for 1 shop.
* <InShopByDefault: [SHOP_ID]> - Will always appear in shop.
* <InShopByCommand: [SHOP_ID]> - Will appear once unlocked with plugin command.
*
* And the last is little longer, it takes multiple lines:
* <InShopByRecipe>
* [TYPE] [ID] [QUANTITY]
* </InShopByRecipe: [SHOP_ID]>
*
* [SHOP_ID] - ID of the shop
* [TYPE] - Item type, i, a, w - i:item, a:armor, w:weapon
* [ID] - ID of the item in database
* [QUANTITY] - How many have to be sold in total
* There can be any number of lines with item requirements.
*
* Examples:
* <InShopByRecipe: 1>
* i 5 100
* i 2 50
* </InShopByRecipe>
*
* <InShopByRecipe: 3>
* a 12 1
* w 2 1
* i 15 10
* </InShopByRecipe>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - Multiple unlock shops added.
* 1.0 - Release
*/

(function() {

	var parameters = PluginManager.parameters('MrTS_UnlockShopItems');
	var paramUnlockText = String(parameters['Unlock Text'] || "Unlocked:");
	var paramUnlockTimer = Number(parameters['Unlock Timer'] || 150);

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "dynamicshop") {
			switch (args[0].toUpperCase())
			{
				case 'ENTER':
				{
					$gameSystem._unlockShopId = Number(args[1]);
					SceneManager.push(Scene_DynamicShop);
					SceneManager.prepareNextScene($gameSystem.getUnlockedItems(), false);
				} break;
				case 'UNLOCK':
				{
					$gameSystem._unlockShopId = Number(args[1]);
					$gameSystem.unlockItemRecipe(args[2], Number(args[3]));
				} break;
				
			}
		}
	};
	var _GameSystem_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_GameSystem_initialize.call(this);
		this.setupItemRecipes();
	};

	Game_System.prototype.setupItemRecipes = function() {
		this._unlockShops = {};
		this._unlockShopId = 1;
		this.parseUnlockReqs("i", $dataItems);
		this.parseUnlockReqs("w", $dataWeapons);
		this.parseUnlockReqs("a", $dataArmors);
	};

	Game_System.prototype.createNewUnlockShop = function() {
		var o = {};
		o._allItemRecipes = [];
		o._allWeaponRecipes = [];
		o._allArmorRecipes = [];
		o._soldItems = [];
		o._soldWeapons = [];
		o._soldArmors = [];
		return o;
	};

	Game_System.prototype.parseUnlockReqs = function(type, data) {
		var regexStart = /<InShopByRecipe:[ ]*(\d+)>/i;
		var regexEnd = /<\/InShopByRecipe>/i;
		var regexReq = /([awi]){1}[ ]+(\d+)[ ]+(\d+)/i;
		var o = this._unlockShops;

		for (var i = 0; i < data.length; i++) {
			var item = data[i];
			if (!item) continue;
			if (item.meta.InShopByDefault)
			{
				var id = Number(item.meta.InShopByDefault);
				if (!o[id]) o[id] = this.createNewUnlockShop();
				if (type === "i")
					var array = o[id]._allItemRecipes;
				else if (type === "w")
					var array = o[id]._allWeaponRecipes;
				else if (type === "a")
					var array = o[id]._allArmorRecipes;
				array[i] = [true, []];
			} else if (item.meta.InShopByCommand)
			{
				var id = Number(item.meta.InShopByCommand);
				if (!o[id]) o[id] = this.createNewUnlockShop();
				if (type === "i")
					var array = o[id]._allItemRecipes;
				else if (type === "w")
					var array = o[id]._allWeaponRecipes;
				else if (type === "a")
					var array = o[id]._allArmorRecipes;
				array[i] = [false, []];
			} else if (item.meta.InShopByRecipe)
			{
				var id = Number(item.meta.InShopByRecipe);
				if (!o[id]) o[id] = this.createNewUnlockShop();
				if (type === "i")
					var array = o[id]._allItemRecipes;
				else if (type === "w")
					var array = o[id]._allWeaponRecipes;
				else if (type === "a")
					var array = o[id]._allArmorRecipes;
				array[i] = [false, []];
				var lines = item.note.split(/[\r\n]/);
				var started = false;
				for (var j = 0; j < lines.length; j++) {
					if (!started)
						started = regexStart.exec(lines[j]);
					else
					{
						var regexEndMatch = regexEnd.exec(lines[j]);
						if (regexEndMatch)
						{
							started = false;
							continue;	
						} 

						var regexReqMatch = regexReq.exec(lines[j]);
						if (regexReqMatch)
						{
							var matchType = regexReqMatch[1];
							var matchId = Number(regexReqMatch[2]);
							var matchQuantity = Number(regexReqMatch[3]);
							array[i][1].push([matchType, matchId, matchQuantity]);
						}
					}
				}
			}
		}
	};

	Game_System.prototype.unlockItemRecipe = function(type, id) {
		var o = this._unlockShops[this._unlockShopId];
		switch(type)
		{
			case 'w':
			{
				o._allWeaponRecipes[id][0] = true;
			} break;
			case 'a':
			{
				o._allArmorRecipes[id][0] = true;
			} break;
			case 'i':
			{
				o._allItemRecipes[id][0] = true;
			} break;
			
		}
	};

	Game_System.prototype.getUnlockedItems = function() {
		var o = this._unlockShops[this._unlockShopId];
		var items = [];
		for (var i = 0; i < o._allItemRecipes.length; i++) {
			if (o._allItemRecipes[i] && o._allItemRecipes[i][0])
				items.push([0, i, 0, 0]);
		}
		for (var i = 0; i < o._allWeaponRecipes.length; i++) {
			if (o._allWeaponRecipes[i] && o._allWeaponRecipes[i][0])
				items.push([1, i, 0, 0]);
		}
		for (var i = 0; i < o._allArmorRecipes.length; i++) {
			if (o._allArmorRecipes[i] && o._allArmorRecipes[i][0])
				items.push([2, i, 0, 0]);
		}
		return items;
	};

	Game_System.prototype.addSoldItems = function(item, number) {
		var o = this._unlockShops[this._unlockShopId];
		var type = null
		if (DataManager.isItem(item))
		{
			if (!o._soldItems[item.id]) o._soldItems[item.id] = 0;
			o._soldItems[item.id] += number;
		}
		else if (DataManager.isWeapon(item))
		{
			if (!o._soldWeapons[item.id]) o._soldWeapons[item.id] = 0;
			o._soldWeapons[item.id] += number;
		}
		else if (DataManager.isArmor(item))
		{
			if (!o._soldArmors[item.id]) o._soldArmors[item.id] = 0;
			o._soldArmors[item.id] += number;
		}

		var items = [];
		var unlocked = [];
		unlocked = this.tryToUnlockRecipes(o._allItemRecipes);
		for (var i = 0; i < unlocked.length; i++) {
			items.push($dataItems[unlocked[i]]);
		}
		unlocked = this.tryToUnlockRecipes(o._allArmorRecipes);
		for (var i = 0; i < unlocked.length; i++) {
			items.push($dataArmors[unlocked[i]]);
		}
		unlocked = this.tryToUnlockRecipes(o._allWeaponRecipes);
		for (var i = 0; i < unlocked.length; i++) {
			items.push($dataWeapons[unlocked[i]]);
		}
		return items;
	};

	Game_System.prototype.tryToUnlockRecipes = function(array) {
		var o = this._unlockShops[this._unlockShopId];
		var unlocked = [];
		for (var i = 0; i < array.length; i++) {
			if (!array[i]) continue;
			if (array[i][0]) continue;
			if (array[i][1].length === 0) continue;
			var canUnlock = true;
			for (var j = 0; j < array[i][1].length; j++) {
				var type = array[i][1][j][0];
				var id = array[i][1][j][1];
				var quantity = array[i][1][j][2];
				switch (type)
				{
					case 'i':
					{
						if (!o._soldItems[id] || o._soldItems[id] < quantity)
							canUnlock = false
					} break;
					case 'w':
					{
						if (!o._soldWeapons[id] || o._soldWeapons[id] < quantity)
							canUnlock = false
					} break;
					case 'a':
					{
						if (!o._soldArmors[id] || o._soldArmors[id] < quantity)
							canUnlock = false
					} break;
				}
			}
			if (canUnlock)
			{
				array[i][0] = true;
				unlocked.push(i);
			}
		}
		return unlocked;
	};

	//--------------------------------------------------------------------------
	// Scene_DynamicShop
	//
	// Where selling and new item unlocking happens.
	
	function Scene_DynamicShop() {
		this.initialize.apply(this, arguments);	
	};
	
	Scene_DynamicShop.prototype = Object.create(Scene_Shop.prototype);
	Scene_DynamicShop.prototype.constructor = Scene_DynamicShop;
	
	Scene_DynamicShop.prototype.create = function() {
		Scene_Shop.prototype.create.call(this);
		this.createWindowLayer2();
		this.createUnlockedWindow();
	};

	Scene_DynamicShop.prototype.createWindowLayer2 = function() {
	    var width = Graphics.boxWidth;
	    var height = Graphics.boxHeight;
	    var x = (Graphics.width - width) / 2;
	    var y = (Graphics.height - height) / 2;
	    this._windowLayer2 = new WindowLayer();
	    this._windowLayer2.move(x, y, width, height);
	    this.addChild(this._windowLayer2);
	};

	Scene_DynamicShop.prototype.createUnlockedWindow = function() {
		var wx = Graphics.boxWidth/2 - 250/2;
		var wy = Graphics.boxHeight/2 - 120/2;
		var ww = 250;
		var wh = 120;
		this._unlockedWindow = new Window_DynamicShopUnlocked(wx, wy, ww, wh);
		this._windowLayer2.addChild(this._unlockedWindow);
	};

	Scene_DynamicShop.prototype.doSell = function(number) {
		Scene_Shop.prototype.doSell.call(this, number);
		var unlocked = $gameSystem.addSoldItems(this._item, number);
		if (unlocked.length > 0)
		{
			this._unlockedWindow.setResult(unlocked);
			this._unlockedWindow.show();
			this._unlockedWindow.open();
			this._timer = paramUnlockTimer;
			this._goods = $gameSystem.getUnlockedItems();
			this._buyWindow._shopGoods = this._goods;
			this._buyWindow.refresh();
		}
	};

	Scene_DynamicShop.prototype.update = function() {
		Scene_Shop.prototype.update.call(this);
		this._timer--;
		if (this._timer <= 0 && this._unlockedWindow.isOpen())
			this._unlockedWindow.close();
	};

	//--------------------------------------------------------------------------
	// Window_DynamicShopUnlocked
	//
	// Result window from salvaging iems for Scene_Salvage.
	
	function Window_DynamicShopUnlocked() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_DynamicShopUnlocked.prototype = Object.create(Window_Base.prototype);
	Window_DynamicShopUnlocked.prototype.constructor = Window_DynamicShopUnlocked;
	
	Window_DynamicShopUnlocked.prototype.initialize = function(x, y, w, h) {
		Window_Base.prototype.initialize.call(this, x, y, w, h);
		this._result = [];
		this._unique = [];
		this._quantity = [];
		this._defaultWidth = w;
		this.hide();
		this.close();
	};
	
	Window_DynamicShopUnlocked.prototype.refresh = function() {
		this.createContents();
		this.drawText(paramUnlockText, 0, 0);
		for (var i = 0; i < this._unique.length; i++) {
			this.drawItemName(this._unique[i], 0, this.lineHeight()*(i+1));
		};
	};

	Window_DynamicShopUnlocked.prototype.setResult = function(result) {
		this._result = [];
		this._unique = [];
		var lw = 0;
		for (var i = 0; i < result.length; i++) {
			if (this._unique.indexOf(result[i]) === -1)
			{
				this._unique.push(result[i]);
				var w = this.textWidth(result[i].name) + this.standardPadding()*2 + 40;
				var w2 = this.textWidth(paramUnlockText) + this.standardPadding()*2;
				if (w2 > lw) lw = w2;
				if (w > lw) lw = w;

			}
		};
		this.height = this.fittingHeight(this._unique.length+1);
		this.width = lw;
		this.x = Graphics.boxWidth/2 - this.width/2;
		this.y = Graphics.boxHeight/2 - this.height/2;
		this.refresh();
	};
})();
