//=============================================================================
// MrTS_Pickboard.js
//=============================================================================

/*:
* @plugindesc Reward board that takes currency or items to pick from.
* @author Mr. Trivel
*
* @param Gold Icon Id
* @desc Icon ID for drawing gold on reward tiles.
* Default: 313
* @default 313
*
* @param Variable Icon Id
* @desc Default icon ID for drawing variables on reward tiles.
* Default: 222
* @default 222
*
* @param Cursor Offset X
* @desc By how many pixels is the cursor offset in X axis?
* Default: 0
* @default 0
*
* @param Cursor Offset Y
* @desc By how many pixels is the cursor offset in Y axis?
* Default: 0
* @default 0
*
* @param Display Board Window
* @desc Display Board Window's Background? True/False
* Default: True
* @default True 
*
* @param Display Cost Window
* @desc Display Cost Window's Background? True/False
* Default: True
* @default True
*
* @param Display Scene Background
* @desc If disabled will show usual map background unless specified.
* Default: True
* @default True
*
* @param Pick Get Sound
* @desc Sound name to play when picking.
* Default: Coin
* @default Coin
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
* Images
* -------------------------------------------------------------------------------- 
* *All images go into img\system folder!*
*
* pick_tileEmpty.png - Empty tile image, 48x48 pixels
* pick_tileUnknown.png - Unrevealed tile image, 48x48 pixels
* pick_Cursor.png - Cursor, 48 pixels height, (48 * Cursor Frames) pixels width
* pick_Background.png - default background, as big as the screen
* 
* --------------------------------------------------------------------------------
* Plugin Calls
* --------------------------------------------------------------------------------
* Pickboard Start [Board ID] [X] [Y] - creates empty board with X Y dimensions
* Pickboard Reset [Board ID] - resets board of ID to empty state
* Pickboard IsComplete [Board ID] [Switch ID] - Saves answer to a switch
* Pickboard AddReward [Board ID] [RewardType] [ID] [Amount] [Tiles] [IconID]
* Pickboard SetPrice [Board ID] [PriceType] [ID] [Amount] [IconID]
* Pickboard Enter [Board ID] - go the scene with pickboard of ID
* Pickboard SetBackground [Board ID] [ImageName] - Changes background of pickboard
* Pickboard OpenTiles [Board ID] [NumberOfTiles] - opens a number of tiles
* 
*
* [Board ID] - ID of the board you're changing
* [X] - Width of the board
* [Y] - Height of the board
* [Switch ID] - ID of the switch to save board's state
* [RewardType] - a, w, i, g, v - armor, weapon, item, gold, variable
* [PriceType] - a, w, i, g, v - armor, weapon, item, gold, variable
* [ID] - ID of item, if [Type] is gold -- then ID is irrelevant
* [Amount] - How much should be reward if adding it or taken if setting price
* [Tiles] - How many tiles on board has this reward
* *[IconID] - *OPTIONAL* changes any item, weapon, armor, variable id to a new one
*
* Example calls:
* Pickboard Start 3 5 5
* Pickboard Reset 3
* Pickboard IsComplete 3 173
* Pickboard AddReward 3 a 4 1 5
* Pickboard AddReward 3 g 0 1000 10
* Pickboard AddReward 3 i 1 5 7
* Pickboard SetPrice 3 i 5 1
* Pickboard Enter 3
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - Variables added as reward choice or price choice.
*     - Able to change any item, gold or variable displayed icon ID for any board.
*     - Added transparency option for reward window background.
*     - Added command to add different backgrounds to different pickboards.
*     - Added option to not have a background by default.
*     - Now the board is revealed if there's no more rewards to pick.
*     - Added a new command to reveal X random tiles on the board.
* 1.0 - Release
*/

(function() {
	//----------------------------------------------------------------------------
	// Parameters
	// 

	var parameters = PluginManager.parameters('MrTS_Pickboard');
	var paramGoldIconId = Number(parameters['Gold Icon Id'] || 313);
	var paramVariableIconId = Number(parameters['Variable Icon Id'] || 222);
	var paramCursorOffsetX = Number(parameters['Cursor Offset X'] || 0);
	var paramCursorOffsetY = Number(parameters['Cursor Offset Y'] || 0);
	var paramDisplayBoardWindow = (parameters['Display Board Window'] || "true").toLowerCase() === "true";
	var paramDisplayCostWindow = (parameters['Display Cost Window'] || "true").toLowerCase() === "true";
	var paramDisplaySceneBackground = (parameters['Display Scene Background'] || "true").toLowerCase() === "true";
	var paramPickSound = String(parameters['Pick Get Sound'] || "Coin");

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "pickboard") {
			switch (args[0].toLowerCase())
			{
				case 'start':
				{
					$gameSystem.pickboardStart(Number(args[1]), Number(args[2]), Number(args[3]));
				} break;
				case 'reset':
				{
					$gameSystem.resetPickboard(Number(args[1]));
				} break;
				case 'iscomplete':
				{
					$gameSystem.isPickboardComplete(Number(args[1]), Number(args[2]));
				} break;
				case 'addreward':
				{
					$gameSystem.addPickboardReward(Number(args[1]), String(args[2]), Number(args[3]),
												   Number(args[4]), Number(args[5]), Number(args[6]));
				} break;
				case 'setprice':
				{
					$gameSystem.setPickboardPrice(Number(args[1]), String(args[2]), Number(args[3]),
												   Number(args[4]), Number(args[5]));
				} break;
				case 'enter':
				{
					$gameSystem.enterPickboardScene(Number(args[1]));
				} break;
				case 'setbackground':
				{
					$gameSystem.setPickboardBackground(Number(args[1]), String(args[2]));
				} break;
				case 'opentiles':
				{
					$gameSystem.reserveSomeOpenTiles(Number(args[1]), Number(args[2]));
				} break;
				
				
			}
		}
	};

	//--------------------------------------------------------------------------
	// Game_System
	// 

	var _GameSystem_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_GameSystem_initialize.call(this);
		this._pickboardData = {};
		this._targetPickboardBoard = 0;
	};

	Game_System.prototype.createEmptyPickboardObject = function() {
		var pickboard = {};
		pickboard.board = [];
		pickboard.emptyIndexes = [];
		pickboard.width = 0;
		pickboard.height = 0;
		pickboard.price = {};
		pickboard.price.type = 'empty';
		pickboard.price.id = 0;
		pickboard.price.amount = 0;
		pickboard.price.iconId = 0;
		pickboard.background = null;
		pickboard.reserved = 0;
		return pickboard;
	};

	Game_System.prototype.createEmptyPickboardRewardObject = function() {
		var reward = {};
		reward.type = 'empty';
		reward.id = 0;
		reward.amount = 0;
		reward.open = false;
		reward.iconId = 0;
		return reward;
	};

	Game_System.prototype.pickboardStart = function(boardId, width, height) {
		var emptyPickboard = this.createEmptyPickboardObject();

		emptyPickboard.width = width;
		emptyPickboard.height = height;

		for (var i = 0; i < width*height; i++) {
			emptyPickboard.board.push(this.createEmptyPickboardRewardObject());
			emptyPickboard.emptyIndexes.push(i);
		}

		this._pickboardData[boardId] = emptyPickboard;
	};

	Game_System.prototype.resetPickboard = function(boardId) {
		for (var i = 0; i < this._pickboardData[boardId].board.length; i++) {
			this._pickboardData[boardId].board[i].open = false;
		}
		for (var i = this._pickboardData[boardId].board.length - 1; i > 0; i--) {
			var j = Math.randomInt(i+1);
			var tmp = this._pickboardData[boardId].board[i];
			this._pickboardData[boardId].board[i] = this._pickboardData[boardId].board[j];
			this._pickboardData[boardId].board[j] = tmp;
		}
	};

	Game_System.prototype.revealPickboard = function(boardId) {
		for (var i = 0; i < this._pickboardData[boardId].board.length; i++) {
			this._pickboardData[boardId].board[i].open = true;
		}
	};

	Game_System.prototype.isPickboardComplete = function(boardId, switchId) {
		for (var i = 0; i < this._pickboardData[boardId].board.length; i++) {
			if (!this._pickboardData[boardId].board[i].open)
			{
				$gameSwitches.setValue(switchId, false);
				return false;
			}
		}
		$gameSwitches.setValue(switchId, true);
		return true;
	};

	Game_System.prototype.allRewardsPicked = function(boardId) {
		for (var i = 0; i < this._pickboardData[boardId].board.length; i++) {
			if (this._pickboardData[boardId].board[i].type !== 'empty' && !this._pickboardData[boardId].board[i].open)
			{
				return false;
			}
		}
		return true;
	};

	Game_System.prototype.addPickboardReward = function(boardId, type, id, amount, tiles, iconId) {
		iconId = iconId || 0;
		var pickboard = this._pickboardData[boardId];
		for (var i = 0; i < tiles; i++) {
			if (pickboard.emptyIndexes.length === 0) continue;
			var emptyIndex = Math.randomInt(pickboard.emptyIndexes.length);
			var index = pickboard.emptyIndexes[emptyIndex];
			pickboard.board[index].type = type;
			pickboard.board[index].id = id;
			pickboard.board[index].amount = amount;
			pickboard.board[index].iconId = iconId;
			pickboard.emptyIndexes.splice(emptyIndex, 1);
		}
	};

	Game_System.prototype.setPickboardPrice = function(boardId, type, id, amount, iconId) {
		iconId = iconId || 0;
		var price = this._pickboardData[boardId].price;
		price.type = type;
		price.id = id;
		price.amount = amount;
		price.iconId = iconId;
	};

	Game_System.prototype.setPickboardBackground = function(boardId, imageName) {
		this._pickboardData[boardId].background = imageName;
	};

	Game_System.prototype.enterPickboardScene = function(boardId) {
		this._targetPickboardBoard = boardId;
		SceneManager.push(Scene_Pickboard);
	};

	Game_System.prototype.openSomeTiles = function(boardId) {
		var number = this._pickboardData[boardId].reserved;
		if (number === 0) return;
		var closedTileIndexes = [];
		for (var i = 0; i < this._pickboardData[boardId].board.length; i++) {
			if (!this._pickboardData[boardId].board[i].open) closedTileIndexes.push(i);
		}
		for (var i = 0; i < number; i++) {
			var r = Math.randomInt(closedTileIndexes.length);
			this.revealTile(boardId, closedTileIndexes[r]);
			closedTileIndexes.splice(r, 1);
		}
		this._pickboardData[boardId].reserved = 0;
	};

	Game_System.prototype.reserveSomeOpenTiles = function(boardId, number) {
		this._pickboardData[boardId].reserved += number;
	};

	Game_System.prototype.revealTile = function(boardId, index) {
		var reward = this._pickboardData[boardId].board[index];
		reward.open = true;
		if (this.allRewardsPicked(boardId)) this.revealPickboard(boardId);
		if (reward.type === 'empty') return;

		var item = null;

		switch (reward.type)
		{
			case 'g':
			{
				if (reward.iconId === 0) reward.iconId = paramGoldIconId;
				$gameParty.gainGold(reward.amount);
				return;
			} break;
			case 'w':
			{
				item = $dataWeapons[reward.id];
			} break;
			case 'a':
			{
				item = $dataArmors[reward.id];
			} break;
			case 'i':
			{
				item = $dataItems[reward.id];
			} break;
			case 'v':
			{
				if (reward.iconId === 0) reward.iconId = paramVariableIconId;
				var oldValue = $gameVariables.value(reward.id);
				$gameVariables.setValue(reward.id, oldValue + reward.amount);
			} break;
			
		}

		if (item)
		{
			$gameParty.gainItem(item, reward.amount);
			if (reward.iconId === 0) reward.iconId = item.iconIndex;
		}
	};

	Game_System.prototype.getActivePickboardId = function() {
		return this._targetPickboardBoard;
	};

	Game_System.prototype.getPickboardData = function(boardId) {
		return this._pickboardData[boardId];
	};

	//--------------------------------------------------------------------------
	// Scene_Pickboard
	//
	// Pickboard Scene where picking happens!
	
	function Scene_Pickboard() {
		this.initialize.apply(this, arguments);	
	};
	
	Scene_Pickboard.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_Pickboard.prototype.constructor = Scene_Pickboard;
	
	Scene_Pickboard.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	};

	Scene_Pickboard.prototype.createBackground = function() {
		var boardId = $gameSystem.getActivePickboardId();
		var boardData = $gameSystem.getPickboardData(boardId);
		if (paramDisplaySceneBackground || boardData['background'])
		{
		    this._backgroundSprite = new Sprite();
		    var image = boardData['background'] ? boardData['background'] : "pick_Background";
		    this._backgroundSprite.bitmap = ImageManager.loadSystem(image);
		    this.addChild(this._backgroundSprite);
		}
		else
		{
			Scene_MenuBase.prototype.createBackground.call(this);
		}
	};
	
	Scene_Pickboard.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createWindowLayer();
		this.createBoardWindow();
		this.createPriceWindow();
	};

	Scene_Pickboard.prototype.createBoardWindow = function() {
		this._pickboardWindow = new Window_PickboardSelect();
		this._pickboardWindow.setHandler('ok', this.refreshPrice.bind(this));
		this._pickboardWindow.setHandler('cancel', this.popScene.bind(this));
		this.addWindow(this._pickboardWindow);
		this._pickboardWindow.activate();
		this._pickboardWindow.select(0);
	};

	Scene_Pickboard.prototype.createPriceWindow = function() {
		this._priceWindow = new Window_PickboardPrice(this._pickboardWindow);
		this._pickboardWindow.y = Graphics.boxHeight / 2 - 
								  (this._pickboardWindow.height+this._priceWindow.height)/2;
		this._priceWindow.reposition();
		this.addWindow(this._priceWindow);
	};

	Scene_Pickboard.prototype.refreshPrice = function() {
		this._priceWindow.refresh();
	};

	//--------------------------------------------------------------------------
	// Window_PickboardSelect
	//
	// Window that will draw tiles and cursor.
	
	function Window_PickboardSelect() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_PickboardSelect.prototype = Object.create(Window_Selectable.prototype);
	Window_PickboardSelect.prototype.constructor = Window_PickboardSelect;
	
	Window_PickboardSelect.prototype.initialize = function() {
		this._boardId = $gameSystem.getActivePickboardId();
		this._pickboard = $gameSystem.getPickboardData(this._boardId);
		this._board = this._pickboard.board;
		this._pickSound = AudioManager.makeEmptyAudioObject();
		this._pickSound.name = paramPickSound;
		this._pickSound.volume = 100;
		this._pickSound.pitch = 100;
		AudioManager.loadStaticSe(this._pickSound);
		var ww = this._pickboard.width * 48 + this.standardPadding() * 2;
		var wh = this._pickboard.height * 48 + this.standardPadding() * 2;
		var wx = Graphics.boxWidth / 2 - ww/2;
		var wy = Graphics.boxHeight / 2 - wh/2;
		Window_Selectable.prototype.initialize.call(this, wx, wy, ww, wh);
		if (!paramDisplayBoardWindow) this.opacity = 0;

		this._emptyTileBitmap = ImageManager.loadSystem("pick_tileEmpty");
		this._unknownTileBitmap = ImageManager.loadSystem("pick_tileUnknown");
		this._tileArray = [];
		for (var i = 0; i < this._pickboard.width * this._pickboard.height; i++) {
			var spr = new Sprite(this._unknownTileBitmap);
			spr.x = 48 * (i % this._pickboard.width) + this.standardPadding();
			spr.y = 48 * Math.floor(i / this._pickboard.height) + this.standardPadding();
			this.addChild(spr);
			this._tileArray.push(spr);
		}

		this._cursorSprite = new Sprite(ImageManager.loadSystem("pick_Cursor"));
		this.addChild(this._cursorSprite);

		if (this._pickboard.reserved > 0)
		{
			$gameSystem.openSomeTiles(this._boardId);
		}
		this.updateAllTiles();
	};

	Window_PickboardSelect.prototype.updateTile = function(index) {
		if (!this._tileArray[index]) return;

		if (this._board[index].open)
		{
			this._tileArray[index].bitmap = this._emptyTileBitmap;
			if (this._board[index].iconId !== 0)
			{
			    var pw = Window_Base._iconWidth;
			    var ph = Window_Base._iconHeight;
				var spr = new Sprite(new Bitmap(pw, ph));
				var bitmap = ImageManager.loadSystem('IconSet');
			    var sx = this._board[index].iconId % 16 * pw;
			    var sy = Math.floor(this._board[index].iconId / 16) * ph;
			    spr.bitmap.blt(bitmap, sx, sy, pw, ph, 0, 0);
			    this._tileArray[index].addChild(spr);
			    spr.x = 48/2-pw/2;
			    spr.y = 48/2-ph/2;
			}
		}
		else
			this._tileArray[index].bitmap = this._unknownTileBitmap;
	};

	Window_PickboardSelect.prototype.maxItems = function() {
	    return this._pickboard ? this._pickboard.width * this._pickboard.height : 0;
	};

	Window_PickboardSelect.prototype.maxCols = function() {
	    return this._pickboard ? this._pickboard.width : 0;
	};

	Window_PickboardSelect.prototype.itemWidth = function() {
	    return 48;
	};

	Window_PickboardSelect.prototype.itemHeight = function() {
	    return 48;
	};

	Window_Selectable.prototype.spacing = function() {
	    return 0;
	};

	Window_PickboardSelect.prototype.paidPrice = function() {
		var item = null;
		var price = this._pickboard.price;
		switch (price.type)
		{
			case 'g':
			{
				if ($gameParty.gold() >= price.amount)
				{
					$gameParty.loseGold(price.amount);
					return true;
				}
				else return false;
			} break;
			case 'w':
			{
				item = $dataWeapons[price.id];
			} break;
			case 'a':
			{
				item = $dataArmors[price.id];
			} break;
			case 'i':
			{
				item = $dataItems[price.id];
			} break;
			case 'v':
			{
				if ($gameVariables.value(price.id) >= price.amount)
				{
					var oldValue = $gameVariables.value(price.id);
					$gameVariables.setValue(price.id, oldValue - price.amount);
					return true;
				}
				else return false;
			} break;
			
			case 'empty':
			{
				return true;
			} break;
			
		}

		if (item)
		{
			if ($gameParty.numItems(item) >= price.amount)
			{
				$gameParty.loseItem(item, price.amount);
				return true;
			}
			else return false;
		}
		return false;
	};

	Window_PickboardSelect.prototype.updateAllTiles = function() {
		for (var i = 0; i < this._tileArray.length; i++) {
    		this.updateTile(i);
    	}
	};

	Window_PickboardSelect.prototype.processOk = function() {
	    if (!this._board[this.index()].open && this.paidPrice()) {
	        AudioManager.playStaticSe(this._pickSound);
	        $gameSystem.revealTile(this._boardId, this.index())
	        
	        if ($gameSystem.allRewardsPicked(this._boardId))
	        	this.updateAllTiles();
	        else
	        	this.updateTile(this.index());

	        this.updateInputData();
	        this.callOkHandler();
	    } else {
	        this.playBuzzerSound();
	    }
	};

	Window_PickboardSelect.prototype.isOkEnabled = function() {
	    return true;
	};

	Window_PickboardSelect.prototype.updateCursor = function() {
        this.setCursorRect(0, 0, 0, 0);
        var rect = this.itemRect(this.index());
        if (this._cursorSprite)
        {
	        this._cursorSprite.x = rect.x + paramCursorOffsetX + this.standardPadding();
	        this._cursorSprite.y = rect.y + paramCursorOffsetY + this.standardPadding();
	    }
	};

	//--------------------------------------------------------------------------
	// Window_PickboardPrice
	//
	// Shows the price of pickboard and how many picks are left.
	
	function Window_PickboardPrice() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_PickboardPrice.prototype = Object.create(Window_Base.prototype);
	Window_PickboardPrice.prototype.constructor = Window_PickboardPrice;
	
	Window_PickboardPrice.prototype.initialize = function(windowPickboard) {
		this._boardId = $gameSystem.getActivePickboardId();
		this._pickboard = $gameSystem.getPickboardData(this._boardId);
		this._price = this._pickboard.price;
		this._priceIconIndex = this._price.iconId;
		this._item = this.saveItemPrice();
		var wx = windowPickboard.x;
		var wy = windowPickboard.y + windowPickboard.height;
		var wh = this.fittingHeight(1);
		var ww = windowPickboard.width;
		this._windowPickboard = windowPickboard;
		Window_Base.prototype.initialize.call(this, wx, wy, ww, wh);
		if (!paramDisplayCostWindow) this.opacity = 0;
		this.refresh();
	};

	Window_PickboardPrice.prototype.saveItemPrice = function() {
		var item = null;

		switch (this._price.type)
		{
			case 'w':
			{
				item = $dataWeapons[this._price.id];
				if (this._priceIconIndex === 0) this._priceIconIndex = item.iconIndex;
			} break;
			case 'a':
			{
				item = $dataArmors[this._price.id];
				if (this._priceIconIndex === 0) this._priceIconIndex = item.iconIndex;
			} break;
			case 'i':
			{
				item = $dataItems[this._price.id];
				if (this._priceIconIndex === 0) this._priceIconIndex = item.iconIndex;
			} break;			
		}
		if (item) return item;

		return null;
	};

	Window_PickboardPrice.prototype.reposition = function() {
		this.x = this._windowPickboard.x;
		this.y = this._windowPickboard.y + this._windowPickboard.height;
		this.height = this.fittingHeight(1);
		this.width = this._windowPickboard.width;
	};
	
	Window_PickboardPrice.prototype.refresh = function() {
		this.contents.clear();
		var iconIndex = this._priceIconIndex
		if (this._price.type === 'empty')
		{
			this.drawText("Free", 0, 0, this.contentsWidth(), 'center');
		}
		else 
		{
			var have = 0;
			if (this._price.type === 'g')
			{
				if (this._priceIconIndex === 0) iconIndex = paramGoldIconId;
				have = $gameParty.gold();
			} 
			else if (this._price.type === 'v')
			{
				if (this._priceIconIndex === 0) iconIndex = paramVariableIconId;
				have = $gameVariables.value(this._price.id);
			} 
			else
			{
				have = $gameParty.numItems(this._item);
			}
			var picksLeft = "Picks:";
			var picksWidth = this.textWidth(picksLeft);
			var amount = (Math.floor(have/this._price.amount));
			var picks = amount > 99 ? "99+" : String(amount);
			var x = this.contentsWidth()/2 - (picksWidth + this.textWidth(picks) + 24 + 8)/2;
			this.drawText(picksLeft, x, 0);
			this.drawIcon(iconIndex, x + picksWidth, 2);
			this.drawText(picks, x + picksWidth + 24 + 8, 0);
		}
	};
})();
