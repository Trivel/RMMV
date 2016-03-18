//=============================================================================
// MrTS_OpenShops.js
//=============================================================================

/*:
* @plugindesc Buy what you see.
* @author Mr. Trivel
*
* @param Buy Text
* @desc Buy Text.
* Default: Buy
* @default Buy
*
* @param Leave Text
* @desc leave Text.
* Default: Leave
* @default Leave
*
* @param Possession Text
* @desc How many items player has text.
* Default: Possession
* @default Possession
*
* @param Image Size
* @desc If using images, how big are they? width height
* Default: 200 200
* @default 200 200
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
* OpenShops Normal [TYPE] [ID] [SHOW] - Opens shop with item to buy.
* OpenShops Single [TYPE] [ID] [SWITCH_ID] [SHOW] - Opens the shop and saves if 
*                                                   item was bought.
*
* [TYPE] - Item Type - a, w, i: armor, weapon, item
* [ID] - ID of item in database
* [SWITCH_ID] - ID of switch which will be TRUE if item was sold and FALSE if it
*               wasn't.
* [SHOW] - Show number of item party has? True/False. Can be omitted.
*
* Examples:
* OpenShops Normal w 5
* OpenShops Single i 133 19
* OpenShops Normal a 9 true
* OpenShops Single w 16 28 false
* --------------------------------------------------------------------------------
*
*
* --------------------------------------------------------------------------------
* Item, Weapon, Armor tags
* --------------------------------------------------------------------------------
* You can place <OpenShopImage:imageName> in item, weapon or armor note field
* to have it's bigger image show up in the middle of the screen.
* NOTE: There's no space after :
* 
* Images go into img\system folder.
*
* Example:
* <OpenShopImage:Staff>
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_OpenShops');
	var paramBuyText = String(parameters['Buy Text'] || "Buy");
	var paramLeaveText = String(parameters['Leave Text'] || "Leave");
	var paramPossessionText = String(parameters['Possession Text'] || "Possession");
	var paramImageSize = String(parameters['Image Size'] || "200 200").split(' ');

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "openshops") {

			var item = null
			switch (args[1])
			{
				case 'w':
				{
					item = $dataWeapons[Number(args[2])];
				} break;
				case 'a':
				{
					item = $dataArmors[Number(args[2])];
				} break;
				case 'i':
				{
					item = $dataItems[Number(args[2])];
				} break;
				
			}

			switch (args[0].toUpperCase())
			{
				case 'NORMAL':
				{
					if (item)
					{
						SceneManager.push(Scene_OpenShop);
						SceneManager.prepareNextScene(item, -1, args[3]);
					}
				} break;
				case 'SINGLE':
				{
					SceneManager.push(Scene_OpenShop);
					SceneManager.prepareNextScene(item, Number(args[2]), args[3]);
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
		this._openShopsShow = true;
	};

	Game_System.prototype.openShopsPossShow = function(value) {
		this._openShopsShow = value;
	};

	Game_System.prototype.getOpenShopsPossShow = function() {
		return this._openShopsShow;
	};

	//--------------------------------------------------------------------------
	// SceneManager
	// 

	var _SceneManager_snapForBackground = SceneManager.snapForBackground;
	SceneManager.snapForBackground = function() {
		if (this.isNextScene(Scene_OpenShop))
			this._backgroundBitmap = this.snap();
		else
			_SceneManager_snapForBackground.call(this);
	};

	//--------------------------------------------------------------------------
	// Scene_OpenShop
	//
	// Shop scene to buy items from overworld.
	
	function Scene_OpenShop() {
		this.initialize.apply(this, arguments);	
	};
	
	Scene_OpenShop.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_OpenShop.prototype.constructor = Scene_OpenShop;
	
	Scene_OpenShop.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	};

	Scene_OpenShop.prototype.prepare = function(item, switchId, show) {
		this._switch = switchId;
		this._item = item;
		this._showPossession = (!show || show.toLowerCase() === "true");
	};
	
	Scene_OpenShop.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createGoldWindow();
		this.createInfoWindow();
		this.createCommandWindow();
		this.createImageWindow();
		this.repositionWindows();
	};

	Scene_OpenShop.prototype.createGoldWindow = function() {
		this._goldWindow = new Window_Gold(0, 0);
		this.addWindow(this._goldWindow);
	};

	Scene_OpenShop.prototype.createInfoWindow = function() {
		this._infoWindow = new Window_OpenShopsItemInfo();
		this.addWindow(this._infoWindow);
	};

	Scene_OpenShop.prototype.createCommandWindow = function() {
		this._commandWindow = new Window_OpenShopsCommands();
		this._commandWindow.setHandler('buy', this.commandBuy.bind(this));
		this._commandWindow.setHandler('quit', this.commandLeave.bind(this));
		this._commandWindow.setHandler('cancel', this.commandLeave.bind(this));
		this.addWindow(this._commandWindow);
	};

	Scene_OpenShop.prototype.createImageWindow = function() {
		if (this._item.meta.OpenShopImage)
		{
			this._imageWindow = new Window_OpenShopsImage(this._item);
			this.addWindow(this._imageWindow);
		}
	};

	Scene_OpenShop.prototype.repositionWindows = function() {
		this._goldWindow.x = Graphics.boxWidth - this._goldWindow.width;

		this._infoWindow.y = Graphics.boxHeight - this._infoWindow.height;

		this._commandWindow.x = Graphics.boxWidth - this._commandWindow.width;
		this._commandWindow.y = Graphics.boxHeight - this._infoWindow.height - this._commandWindow.height;

		if (this._imageWindow)
		{
			var ww = Number(paramImageSize[0]) + this._imageWindow.standardPadding()*2;
			var wh = Number(paramImageSize[1]) + this._imageWindow.standardPadding()*2;
			var wx = Graphics.boxWidth/2 - ww/2 ;
			var wy = (Graphics.boxHeight-this._commandWindow.height)/2 - wh/2;
			this._imageWindow.x = wx;
			this._imageWindow.y = wy;
			this._imageWindow.width = ww;
			this._imageWindow.height = wh;
		}

		this._infoWindow.setItem(this._item, this._showPossession);
	};

	Scene_OpenShop.prototype.commandBuy = function() {
		if ($gameParty.gold() >= this._item.price)
		{
			$gameParty.gainItem(this._item, 1);
			$gameParty.loseGold(this._item.price);
			SoundManager.playShop();
			if (this._switch > 0)
				$gameSwitches.setValue(this._switch, true);
			this.popScene();
		}
		else
		{
			SoundManager.playBuzzer();
			this._commandWindow.activate();
		}
	};

	Scene_OpenShop.prototype.commandLeave = function() {
		SoundManager.playCancel();
		this.popScene();
	};

	//--------------------------------------------------------------------------
	// Window_OpenShopsItemInfo
	//
	// Shows item info of item.
	
	function Window_OpenShopsItemInfo() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_OpenShopsItemInfo.prototype = Object.create(Window_Base.prototype);
	Window_OpenShopsItemInfo.prototype.constructor = Window_OpenShopsItemInfo;
	
	Window_OpenShopsItemInfo.prototype.initialize = function() {
		var ww = Graphics.boxWidth;
		var wh = this.fittingHeight(3);
		Window_Base.prototype.initialize.call(this, 0, 0, ww, wh);
	};

	Window_OpenShopsItemInfo.prototype.setItem = function(item, show) {
		this._item = item;
		this._showPossession = show;
		this.refresh();
	};
	
	Window_OpenShopsItemInfo.prototype.refresh = function() {
		this.contents.clear();
		var item = this._item;
		this.drawIcon(item.iconIndex, 2, 2);
		this.drawText(item.name, Window_Base._iconWidth + 4, 0);
		this.drawTextEx(item.description, 0, this.lineHeight());
		var priceWidth = this.textWidth(item.price);
		var priceNameWidth = this.textWidth(this.currencyUnit());
		var ex = 0;
		if (this._showPossession)
		{
			var possessionTxtWidth = this.textWidth(paramPossessionText + ":")
			var possessionNumberWidth = this.textWidth($gameParty.maxItems(item));
			ex = this.contents.width - possessionNumberWidth;
		}
		else
		{
			ex = this.contents.width - priceNameWidth;
		}
		
		if (this._showPossession)
		{
			this.drawText(String($gameParty.numItems(item)), ex, 0);
			ex -= 20 + possessionTxtWidth;
			this.drawText(paramPossessionText + ":", ex, 0)
			ex -= 30 + priceNameWidth;
		}
		
    	this.changeTextColor(this.systemColor());
		this.drawText(this.currencyUnit(), ex, 0);
    	this.resetTextColor();
		ex -= 10 + priceWidth;
		this.drawText(item.price, ex, 0);
	};

	Window_OpenShopsItemInfo.prototype.textWidthEx = function(text) {
		return this.drawTextEx(text, 0, this.contents.height);
	};

	Window_OpenShopsItemInfo.prototype.currencyUnit = function() {
	    return TextManager.currencyUnit;
	};

	//--------------------------------------------------------------------------
	// Window_OpenShopsQuantityWindow
	//
	// Allows to pick quantity of an item.
	
	function Window_OpenShopsQuantityWindow() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_OpenShopsQuantityWindow.prototype = Object.create(Window_Base.prototype);
	Window_OpenShopsQuantityWindow.prototype.constructor = Window_OpenShopsQuantityWindow;
	
	Window_OpenShopsQuantityWindow.prototype.initialize = function() {
		Window_Base.prototype.initialize.call(this, 0, 0, 200, this.fittingHeight(1));
	};
	
	Window_OpenShopsQuantityWindow.prototype.refresh = function() {
		this.contents.clear();
	};

	Window_OpenShopsQuantityWindow.prototype.setItem = function(item) {
		this._item = item;
	};

	Window_OpenShopsQuantityWindow.prototype.setVariable = function(variable) {
		this._variable = variable;
	};

	//--------------------------------------------------------------------------
	// Window_OpenShopsCommands
	//
	// Buy or leave options in open shops.
	
	function Window_OpenShopsCommands() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_OpenShopsCommands.prototype = Object.create(Window_Command.prototype);
	Window_OpenShopsCommands.prototype.constructor = Window_OpenShopsCommands;
	
	Window_OpenShopsCommands.prototype.initialize = function() {
		Window_Command.prototype.initialize.call(this, 0, 0);
	};

	Window_OpenShopsCommands.prototype.makeCommandList = function() {
		this.addCommand(paramBuyText, "buy");
		this.addCommand(paramLeaveText, "quit");
	};

	Window_OpenShopsCommands.prototype.playOkSound = function() {
	};

	//--------------------------------------------------------------------------
	// Window_OpenShopsImage
	//
	// Show image of the item here.
	
	function Window_OpenShopsImage() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_OpenShopsImage.prototype = Object.create(Window_Base.prototype);
	Window_OpenShopsImage.prototype.constructor = Window_OpenShopsImage;
	
	Window_OpenShopsImage.prototype.initialize = function(item) {
		this._item = item;
		this._sprite = new Sprite();
		this._sprite.bitmap = ImageManager.loadSystem(item.meta.OpenShopImage);
		this._sprite.x = this.standardPadding();
		this._sprite.y = this.standardPadding();
		Window_Base.prototype.initialize.call(this, 0, 0, 200, 200);
		this.addChild(this._sprite);
	};
})();	
