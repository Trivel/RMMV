//==============================================================================
// MrTS_MonsterBook.js
//==============================================================================

/*:
* @plugindesc Adds a Monster Book scene. Where player can check all
* information about enemies like resistances, description, drops.
* @author Mr. Trivel
*
* @param [General]
* @default 
* 
* @param Is In Menu
* @desc Can Monster Book be accessed from menu?
* 1 - Yes, 0 - No
* @default 1
*
* @param Show Data
* @desc When to reveal enemy entry in Monster Book.
* 0 - No Default Means, 1 - On Killing, 2 - On Encounter
* @default 1
*
* @param Show All Entries
* @desc Show entries up to highest discovered enemy or all?
* 1 - Highest discovered, 2 - all
* @default 1
*
* @param Command Name
* @desc Monster Book command name in the menu.
* @default Monster Book
* 
* @param Unknown Enemy
* @desc How unknown entry names should be displayed?
* @default ???????
*
* @param  
* @default 
* 
* @param [Layout - General]
* @default
*
* @param List Side
* @desc On which side should the list and picture be displayed?
* LEFT - left side, RIGHT - right side.
* @default RIGHT
*
* @param  
* @default
* 
* @param [Layout - Top]
* @default
* 
* @param Top Panel1 Data
* @desc Which data should be displayed in Panel 1 (left one)?
* PARAMETERS, RESISTANCES, SKILLS, NONE
* @default PARAMETERS
*
* @param Top Panel2 Data
* @desc Which data should be displayed in Panel 2 (middle one)?
* PARAMETERS, RESISTANCES, SKILLS, NONE
* @default RESISTANCES
*
* @param Top Panel3 Data
* @desc Which data should be displayed in Panel 3 (right one)?
* PARAMETERS, RESISTANCES, SKILLS, NONE
* @default SKILLS
*
* @param  
* @default
* 
* @param [Layout - Bottom]
* @default
* 
* @param Bottom Panel1 Data
* @desc Which data should be displayed in Panel 1 (left one)?
* REWARDS, DESCRIPTION, NONE
* @default REWARDS
*
* @param Bottom Panel2 Data
* @desc Which data should be displayed in Panel 2 (middle one)?
* REWARDS, DESCRIPTION, NONE
* @default DESCRIPTION
*
* @param Bottom Panel3 Data
* @desc Which data should be displayed in Panel 3 (right one)?
* REWARDS, DESCRIPTION, NONE
* @default NONE
*
* @param  
* @default
* 
* @param [Panel Configuration]
* @default 
*
* @param [Top - Parameters]
* @default
*
* @param Parameters Text
* @desc What name to use for Parameters in Monster Book?
* @default Stats
*
* @param Parameters Mode
* @desc SHOW only parameters listed below? Or HIDE only parameters
* listed below?
* @default HIDE
*
* @param Parameters List
* @desc Parameters to show or hide.
* E.g. 1 2 5 6 9
* @default 6 7
*
* @param  
* @default
* 
* @param [Top - Resistances]
* @default
*
* @param Resistances Text
* @desc What name to use for Resistances in Monster Book?
* @default Defences
*
* @param Element Mode
* @desc SHOW only elements listed below? Or HIDE only elements
* listed below?
* @default HIDE
*
* @param Element List
* @desc Elements to show or hide.
* E.g. 1 2 5 6 9
* @default 1 9
*
* @param  
* @default
*
* @param [Top - Attacks]
* @default 
*
* @param Attacks Text
* @desc What name to use for Attacks in Monster Book?
* @default Attacks
*
* @param
* @default 
* 
* @param [Bottom - Rewards]
* @default
*
* @param Rewards Text
* @desc What name to use for Rewards in Monster Book?
* @default Rewards
*
* @param Currency Text
* @desc What name to use for Currency in Monster Book?
* @default Gold
*
* @param Item Drops Text
* @desc What name to use for Item Drops in Monster Book?
* @default Drops
* 
* @param  
* @default
* 
* @param [Bottom - Description]
* @default
*
* @param Description Text
* @desc What name to use for Description in Monster Book?
* @default Description
*
* @param Description Font Size
* @desc Size of the font for description.
* @default 28
* 
* @help Version 1.1
* Free for non commercial use.
*
* Enemy note fields:
* <b_hidden> - not listed in Monster Book
* <attack: X> - skill ID enemy has
* <desc:TXT
* TXT2
* TXTn> - description of the enemy, any amount of lines
*
* Plugin Commands:
*   MonsterBook open		# Opens MonsterBook scene
*   MonsterBook clear  		# Empties Monster Book
*   MonsterBook fill		# Reveals all entries in Monster Book
*   MonsterBook discover ID # Discovers enemy who has ID
*   MonsterBook remove ID   # Undiscovers enemy who has ID
*
* Only if Monster Book can be accessed from Menu:
*   MonsterBook disable 	# Grey out Monster Book in Menu
*   MonsterBook enable 		# Allow Monster Book in Menu
* 
* Layout by Marnick de Grave.
*/

(function() {

	//--------------------------------------------------------------------------
	// Parameters
	
	var parameters = PluginManager.parameters('MrTS_MonsterBook');

	// General
	var isInMenu = Number(parameters['Is In Menu'] || 1);
	var revealOnKill = Number(parameters['Show Data'] || 1);
	var showEntriesMode = Number(parameters['Show All Entries'] || 1);
	var monsterBookCommandText = String(parameters['Command Name'] || "Monster Book");
	var unknownText = String(parameters['Unknown Enemy'] || "???????");

	// Layout configuration
	var monsterBookSide = String(parameters['List Side'] || "RIGHT");

	var topPanel1 = String(parameters['Top Panel1 Data'] || "PARAMETERS");
	var topPanel2 = String(parameters['Top Panel2 Data'] || "RESISTANCES");
	var topPanel3 = String(parameters['Top Panel3 Data'] || "SKILLS");

	var bottomPanel1 = String(parameters['Bottom Panel1 Data'] || "REWARDS");
	var bottomPanel2 = String(parameters['Bottom Panel2 Data'] || "DESCRIPTION");
	var bottomPanel3 = String(parameters['Bottom Panel3 Data'] || "NONE");

	// Panel Configuration
	// 
	// Parameters
	var paramsText = String(parameters['Parameters Text'] || "Stats");
	var paramsMode = String(parameters['Parameters Mode'] || "HIDE");
	var paramsList = String(parameters['Parameters List'] || "6 7");
	
	// Resistances
	var resistancesText = String(parameters['Resistances Text'] || "Resistances");
	var elementMode = String(parameters['Element Mode'] || "HIDE");
	var elementList = String(parameters['Element List'] || "1 9");
	
	// Attacks
	var attacksText = String(parameters['Attacks Text'] || "Attacks");
	
	// Drops
	var rewardsText = String(parameters['Rewards Text'] || "Rewards");
	var itemDropsText = String(parameters['Item Drops Text'] || "Drops");
	var currencyText = String(parameters['Currency Text'] || "Gold");
	
	// Desription
	var descriptionText = String(parameters['Description Text'] || "Description");
	var descFontSize = Number(parameters['Description Font Size'] || 28);	

	//--------------------------------------------------------------------------
	// Game_Interpreter
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command === 'MonsterBook') {
			switch(args[0])
			{
				case 'open':
					SceneManager.push(Scene_MonsterBook);
					break;
				case 'clear':
					$gameSystem.monsterBookClear();
					break;
				case 'fill':
					$gameSystem.monsterBookFill();
					break;
				case 'discover':
					$gameSystem.monsterBookDiscover(Number(args[1]), true);
					break;
				case 'remove':
					$gameSystem.monsterBookHide(Number(args[1]));
					break;
				case 'disable':
					$gameSystem.monsterBookEnable(false);
					break;
				case 'enable':
					$gameSystem.monsterBookEnable(true);
					break;
			}
		}
	};

	//--------------------------------------------------------------------------
	// Scene_MonsterBook
	//
	// Scene for Monster Book scene where all eneny entries are stored.
	
	function Scene_MonsterBook() {
		this.initialize.apply(this, arguments);	
	};
	
	Scene_MonsterBook.prototype = Object.create(Scene_Base.prototype);
	Scene_MonsterBook.prototype.constructor = Scene_MonsterBook;
	
	Scene_MonsterBook.prototype.initialize = function() {
		Scene_Base.prototype.initialize.call(this);
	};
	
	Scene_MonsterBook.prototype.create = function() {
		Scene_Base.prototype.create.call(this);
    	this.createBackground();
		this.createWindowLayer();
		this.createWindows();
	};

	Scene_MonsterBook.prototype.createBackground = function() {
	    this._backgroundSprite = new Sprite();
	    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
	    this.addChild(this._backgroundSprite);
	};

	Scene_MonsterBook.prototype.createWindows = function() {
		this.createDescriptionWindow();
		this.createSelectionWindow();
		this.createInfoWindow();
		this._selectionWindow.descWindow = this._descriptionWindow;
		this._selectionWindow.dataWindow = this._infoWindow;
		this._selectionWindow.activate();
	};

	Scene_MonsterBook.prototype.createInfoWindow = function() {
		var ww = Graphics.boxWidth-this._selectionWindow.width;
		var wx = monsterBookSide === 'LEFT' ? Graphics.boxWidth-ww : 0;
		this._infoWindow = new Window_MonsterInfo(	wx, 0, 
													ww,	Graphics.boxHeight);
		this.addWindow(this._infoWindow);
	};

	Scene_MonsterBook.prototype.createDescriptionWindow = function() {
		var ww = Graphics.boxHeight/1.8;
		var wh = Graphics.boxHeight/2;
		var wx = monsterBookSide === 'LEFT' ? 0 : Graphics.boxWidth - ww;
		var wy = 0;
		this._descriptionWindow = new Window_MonsterDescription(wx, wy, ww, wh);
		this.addWindow(this._descriptionWindow);
	};

	Scene_MonsterBook.prototype.createSelectionWindow = function() {
		this._selectionWindow = new Window_MonsterList( this._descriptionWindow.x, Graphics.boxHeight/2, 
														this._descriptionWindow.width, Graphics.boxHeight/2);
		this._selectionWindow.setHandler('cancel', this.popScene.bind(this));
		this.addWindow(this._selectionWindow);
	};

	//--------------------------------------------------------------------------
	// Window_MonsterInfo
	//
	// Main window that shows all info about the monster.
	
	function Window_MonsterInfo() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_MonsterInfo.prototype = Object.create(Window_Selectable.prototype);
	Window_MonsterInfo.prototype.constructor = Window_MonsterInfo;
	
	Window_MonsterInfo.prototype.initialize = function(x, y, w, h) {
		Window_Selectable.prototype.initialize.call(this, x, y, w, h);
		this.refresh();
	};
	
	Window_MonsterInfo.prototype.refresh = function() {
		this.contents.clear();
    	this.createContents();

    	if (!this._enemyId || !$gameSystem.isEnemyRevealed(this._enemyId))
			return;

		var topPanels = [];
		if (topPanel1 != 'NONE') topPanels.push(topPanel1);
		if (topPanel2 != 'NONE') topPanels.push(topPanel2);
		if (topPanel3 != 'NONE') topPanels.push(topPanel3);

		var bottomPanels = [];
		if (bottomPanel1 != 'NONE') bottomPanels.push(bottomPanel1);
		if (bottomPanel2 != 'NONE') bottomPanels.push(bottomPanel2);
		if (bottomPanel3 != 'NONE') bottomPanels.push(bottomPanel3);

		var h = 0;

		for (var i = 0; i < topPanels.length; i++)
		{
			var rect = this.createPanelRect(topPanels.length, i, true);
			this.drawVertLine(rect.x-3, rect.y + 10, rect.height - 20);
			h = rect.height;
			switch(topPanels[i])
			{
				case "PARAMETERS":
					this.drawParametersTopPanel(rect);
				break;
				case "RESISTANCES":
					this.drawResistancesTopPanel(rect);
				break;
				case "SKILLS":
					this.drawSkillsTopPanel(rect);
				break;
			}
		}		

		this.drawHorzLine(10, h+2, this.contents.width-10);

		for (var i = 0; i < bottomPanels.length; i++)
		{
			var rect = this.createPanelRect(bottomPanels.length, i, false);
			this.drawVertLine(rect.x-3, rect.y + 10, rect.height - 10);
			switch (bottomPanels[i])
			{
				case "REWARDS":
					this.drawRewardsBottomPanel(rect);
				break;
				case "DESCRIPTION":
					this.drawDescriptionBottomPanel(rect);
				break;
			}
		}
	};

	Window_MonsterInfo.prototype.drawRewardsBottomPanel = function(rect)
	{
		var enemy = $dataEnemies[this._enemyId];

		this.makeFontBigger();
		this.drawText(rewardsText, rect.x+5, rect.y+10, rect.width);
		this.makeFontSmaller();

		var x = rect.x + 30;
		var h = rect.y+65;
		var w = rect.width - 30;
		this.changeTextColor(this.systemColor());
		this.drawText(TextManager.exp, x, h, w, 'left');
		this.resetTextColor();
		this.drawText(enemy.exp, x, h, w, 'right');

		h += this.lineHeight();
		this.changeTextColor(this.systemColor());
		this.drawText(currencyText, x, h, w, 'left');
		this.resetTextColor();
		this.drawText(enemy.gold, x, h, w, 'right');

		h += this.lineHeight();
		this.changeTextColor(this.systemColor());
		this.drawText(itemDropsText, x, h, w, 'left');
		this.resetTextColor();
		for (var i = 0; i < enemy.dropItems.length; i++)
		{
			if (enemy.dropItems[i].dataId === 0 || enemy.dropItems[i].kind === 0) continue;
			var item;
			switch (enemy.dropItems[i].kind)
			{
				case 1:
					item = $dataItems[enemy.dropItems[i].dataId];
				break;
				case 2:
					item = $dataWeapons[enemy.dropItems[i].dataId];
				break;
				case 3:
					item = $dataArmors[enemy.dropItems[i].dataId];
				break;
			}
			if ($gameSystem.isEnemyItemRevealed(item, enemy.id))
				this.drawItemName(item, x+this.textWidth(itemDropsText)+10, h+i*this.lineHeight(), w);
			else
				this.drawText(unknownText, x+this.textWidth(itemDropsText)+10, h+i*this.lineHeight(), w);
		}
		

	};

	Window_MonsterInfo.prototype.drawDescriptionBottomPanel = function(rect)
	{
		var enemy = $dataEnemies[this._enemyId];

		this.makeFontBigger();
		this.drawText(descriptionText, rect.x+5, rect.y+10, rect.width);
		
		var df = this.contents.fontSize;
		this.contents.fontSize = descFontSize;

		var desc;

		if (enemy.meta.desc)
		{
			var tdesc = enemy.meta.desc;
			desc = tdesc.split(/[\r\n]+/);
		}
		else
			desc = "";

		for (var i = 0; i < desc.length; i++)
		{
			var x = rect.x + 30;
			var h = rect.y+60+descFontSize*i;
			var w = rect.width;
			this.drawText(desc[i], x, h, w, 'left');
		}

		this.contents.fontSize = df;
	};

	Window_MonsterInfo.prototype.drawParametersTopPanel = function(rect)
	{
		var enemy = $dataEnemies[this._enemyId];

		this.makeFontBigger();
		this.drawText(paramsText, rect.x+5, rect.y+5, rect.width);
		this.makeFontSmaller();

		var list = paramsList.split(" ");
		var x = rect.x + 30;
		var h = rect.y+60;
		var w = rect.width;

		for (var i = 0; i < enemy.params.length; i++)
		{
			if (elementMode == "HIDE" && list.contains(String(i))) continue;
			if (elementMode == "SHOW" && !list.contains(String(i))) continue;

			this.changeTextColor(this.systemColor());
			this.drawText(TextManager.param(i), x, h, w, 'left');
			this.resetTextColor();
			this.drawText(enemy.params[i], x, h, w, 'right');

			h += this.lineHeight();
		}
	};

	Window_MonsterInfo.prototype.drawResistancesTopPanel = function(rect)
	{
		var enemy = $dataEnemies[this._enemyId];

		this.makeFontBigger();
		this.drawText(resistancesText, rect.x+5, rect.y+5, rect.width);
		this.makeFontSmaller();

		var resArray = [];

		for (var i = 0; i < enemy.traits.length; i++)
		{
			if (enemy.traits[i].code === 11)
				resArray[enemy.traits[i].dataId] = enemy.traits[i].value;
		}

		var list = elementList.split(" ");
		var x = rect.x + 30;
		var h = rect.y+60;
		var w = rect.width;

		for (var i = 1; i < $dataSystem.elements.length; i++)
		{
			if (elementMode == "HIDE" && list.contains(String(i))) continue;
			if (elementMode == "SHOW" && !list.contains(String(i))) continue;

			this.changeTextColor(this.systemColor());
			this.drawText($dataSystem.elements[i], x, h, w, 'left');
			this.resetTextColor();
			if (resArray[i])
			{
				var r = (resArray[i]*100).toFixed(0);
				if (r > 100)
					this.changeTextColor(this.crisisColor());
				else if (r < 100)
					this.changeTextColor(this.powerUpColor());

				this.drawText(r + "%", x, h, w, 'right');
			}
			else
				this.drawText("100%", x, h, w, 'right');
			h += this.lineHeight();
		}
	};

	Window_MonsterInfo.prototype.drawSkillsTopPanel = function(rect)
	{
		var enemy = $dataEnemies[this._enemyId];

		var attacks = [];
		var note = enemy.note.split(/[\r\n]+/);

		for (var i = 0; i < note.length; i++)
		{
			var regex = /<attack:[ ]*(\d+)>/i;
			var match = regex.exec(note[i]);
			if (!match) continue;
			attacks.push(Number(match[1]));
		}

		this.makeFontBigger();
		this.drawText(attacksText, rect.x+5, rect.y+5, rect.width);
		this.makeFontSmaller();

		for (var i = 0; i < attacks.length; i++)
		{
			attack = $dataSkills[attacks[i]];
			var x = rect.x + 26;
			var h = rect.y+60+this.lineHeight()*i;
			var w = rect.width;
			this.drawIcon(attack.iconIndex, x, h);
			this.drawText(attack.name, x + 38, h, w, 'left');
		}
	};

	Window_MonsterInfo.prototype.drawVertLine = function(x, y, l) {
		this.contents.paintOpacity = 48;
		this.contents.fillRect(x, y, 2, l, this.normalColor());
		this.contents.paintOpacity = 255;
	};

	Window_MonsterInfo.prototype.drawHorzLine = function(x, y, l) {
		this.contents.paintOpacity = 48;
		this.contents.fillRect(x, y, l, 2, this.normalColor());
		this.contents.paintOpacity = 255;
	};

	Window_MonsterInfo.prototype.createPanelRect = function(panelsCount, id, top)
	{
		var rect = new Rectangle();
		rect.width = this.contents.width/panelsCount;
		rect.height = this.contents.height/4*(top?2.5:1.5);
		rect.x = rect.width*id;
		rect.width -= 60;
		rect.y = top?0:this.contents.height-rect.height;
		return rect;
	};

	Window_MonsterInfo.prototype.setMonster = function(id) {
		if (id != this._enemyId && $gameSystem.isEnemyRevealed(id))
		{
			this._enemyId = id;
			this.refresh();
		}
	};

	//--------------------------------------------------------------------------
	// Window_MonsterDescription
	//
	// Shows monster picture with it's background.
	
	function Window_MonsterDescription() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_MonsterDescription.prototype = Object.create(Window_Base.prototype);
	Window_MonsterDescription.prototype.constructor = Window_MonsterDescription;
	
	Window_MonsterDescription.prototype.initialize = function(x, y, w, h) {
		Window_Base.prototype.initialize.call(this, x, y, w, h);
		this._enemyId = 1;
		this.refresh();
	};
	
	Window_MonsterDescription.prototype.refresh = function() {
		this.contents.clear();
    	this.createContents();
    	
		if (!$gameSystem.isEnemyRevealed(this._enemyId))
			return;
		var bitmap;
		if ($gameSystem.isSideView()) {
			bitmap = ImageManager.loadSvEnemy($dataEnemies[this._enemyId].battlerName, $dataEnemies[this._enemyId].battlerHue);
		} else {
			bitmap = ImageManager.loadEnemy($dataEnemies[this._enemyId].battlerName, $dataEnemies[this._enemyId].battlerHue);
		}
		var c = this.contents;
		bitmap.addLoadListener(function() {
			var bw = bitmap.width;
			var bh = bitmap.height;
			if (bw > c.width)
			{
				var r = c.width / bw;
				bw *= r;
				bh *= r;
			}

			if (bh > c.height)
			{
				var r = c.height / bh;
				bw *= r;
				bh *= r;
			}
			var dx = c.width / 2 - bw / 2;
			var dy = c.height / 2 - bh / 2;
			c.blt(bitmap, 0, 0, bitmap.width, bitmap.height, dx, dy, bw, bh);
		});
	};

	Window_MonsterDescription.prototype.setMonster = function(id) {
		if (id != this._enemyId && $gameSystem.isEnemyRevealed(id))
		{
			this._enemyId = id;
			this.refresh();
		}
	};

	//--------------------------------------------------------------------------
	// Window_MonsterList
	//
	// Window that shows a list of monsters that player can inspect.
	
	function Window_MonsterList() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_MonsterList.prototype = Object.create(Window_Selectable.prototype);
	Window_MonsterList.prototype.constructor = Window_MonsterList;
	
	Window_MonsterList.prototype.initialize = function(x, y, w, h) {
		this.hiddenEnemies = [];
		Window_Selectable.prototype.initialize.call(this, x, y, w, h);
        this.select(0);
		this.refresh();
		for (var i = 1; i < $dataEnemies.length-1; i++)
		{
			if ($dataEnemies[i].meta.b_hidden) this.hiddenEnemies.push(i);
		}
	};

	Window_MonsterList.prototype.indexPlus = function(index) {
		var t = 0;
		for (var i = 0; i < this.hiddenEnemies.length; i++)
		{
			if (index+t >= this.hiddenEnemies[i]) t++;
		}
		return t;
	};

	Window_MonsterList.prototype.update = function() {
		Window_Selectable.prototype.update.call(this);
		this.updateStatus();
	};

	Window_MonsterList.prototype.updateStatus = function() {
		if (this.descWindow) {
			this.descWindow.setMonster(this.index()+1+this.indexPlus(this.index()+1));
		}
		if (this.dataWindow) {
			this.dataWindow.setMonster(this.index()+1+this.indexPlus(this.index()+1));
		}
	};
	
	Window_MonsterList.prototype.refresh = function() {
		this.contents.clear();
		this.drawAllItems();
	};

	Window_MonsterList.prototype.maxItems = function() {
		switch (showEntriesMode)
		{
			case 1:
				return $gameSystem.highestId()-this.indexPlus($gameSystem.highestId());
			case 2:
				return $dataEnemies.length-1-this.hiddenEnemies.length;
		}
	};

	Window_MonsterList.prototype.drawItem = function(index) {
		var rect = this.itemRectForText(index);
		var txt = "";
		var l = String(this.maxItems()).length;
		txt += ('0' + (index+1)).slice(-l) + ". ";
		var id = index+1+this.indexPlus(index+1);
		if ($gameSystem.isEnemyRevealed(id))
			txt += $dataEnemies[id].name;
		else
			txt += unknownText;

		this.drawText(txt, rect.x, rect.y, rect.width);
	};

	//--------------------------------------------------------------------------
	// Add Monster Book command to menu
	
	if (isInMenu === 1)
	{
		var _SceneMenu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
		Scene_Menu.prototype.createCommandWindow = function() {
			_SceneMenu_createCommandWindow.call(this);
			this._commandWindow.setHandler('monsterBook', this.commandMonsterBook.bind(this));
		};

		Scene_Menu.prototype.commandMonsterBook = function() {
			SceneManager.push(Scene_MonsterBook);
		};

		var _WindowMenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
		Window_MenuCommand.prototype.addOriginalCommands = function() {
			_WindowMenuCommand_addOriginalCommands.call(this);
			this.addCommand(monsterBookCommandText, 'monsterBook', $gameSystem.isMonsterBookEnabled());
		};
	}

	//--------------------------------------------------------------------------
	// Adding Monster Book data to Game_System
	
	var _GameSystem_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_GameSystem_initialize.call(this);
		this._monsterBookEnabled = true;
		this._highestKnownEnemy = 1;
	};

	Game_System.prototype.highestId = function() {
		return this._highestKnownEnemy;
	};

	Game_System.prototype.isMonsterBookEnabled = function() {
		return this._monsterBookEnabled;
	};

	Game_System.prototype.isEnemyItemRevealed = function(item, id) {		
		var match = false;
		for (var i = 0; i < this._monsterBookItems[id].length; i++)
		{
			var mItem = this._monsterBookItems[id][i];
			if (item.id == mItem.id && 
				((DataManager.isItem(item) && mItem.kind == 1) ||
				 (DataManager.isWeapon(item) && mItem.kind == 2) ||
				 (DataManager.isArmor(item) && mItem.kind == 3))) 
				match = true;
		}

		return match;
	};

	Game_System.prototype.isEnemyRevealed = function(id) {
		if (this._monsterBook && this._monsterBook[id])
			return true;
		else
			return false;
	};

	Game_System.prototype.monsterBookClear = function() {
		this._monsterBook = [];
		this._monsterBookItems = {};
		this._highestKnownEnemy = 1;
	};

	Game_System.prototype.monsterBookFill = function() {
		this.monsterBookClear();
		for (var i = 1; i < $dataEnemies.length; i++)
			$gameSystem.monsterBookDiscover(i, true);
	};

	Game_System.prototype.monsterBookDiscover = function(_id, itemsToo) {
		if (!this._monsterBook) this.monsterBookClear();
		if (!this._monsterBookItems[_id]) this._monsterBookItems[_id] = [];
		this._monsterBook[_id] = true;
		if (_id > this._highestKnownEnemy) this._highestKnownEnemy = _id;

		if (!itemsToo) return;
		for (var j = 0; j < $dataEnemies[_id].dropItems.length; j++)
		{
			var item = $dataEnemies[_id].dropItems[j];
			this._monsterBookItems[_id].push({id: item.dataId, kind: item.kind});
		}
	};

	Game_System.prototype.monsterBookDiscoverItem = function(_id, item) {
		if (!this._monsterBookItems[_id]) this._monsterBookItems[_id] = [];

		if (DataManager.isItem(item)) {
			this._monsterBookItems[_id].push({id: item.id, kind: 1});
		}
		else if (DataManager.isWeapon(item)) {
			this._monsterBookItems[_id].push({id: item.id, kind: 2});
		}
		else if (DataManager.isArmor(item)) {
			this._monsterBookItems[_id].push({id: item.id, kind: 3});
		}
	}

	Game_System.prototype.monsterBookHide = function(id) {
		if (this._monsterBook) {
			this._monsterBook[id] = false;
			this._monsterBookItems[id] = [];
		}
	};

	Game_System.prototype.monsterBookEnable = function(bool) {
		this._monsterBookEnabled = bool;
	};

	//--------------------------------------------------------------------------
	// Revealing enemies
	
	var _Game_Enemy_makeDropItems = Game_Enemy.prototype.makeDropItems;
	Game_Enemy.prototype.makeDropItems = function() {
		var rewards = _Game_Enemy_makeDropItems.call(this);
			
		if (revealOnKill === 1)
		{
			var eid = this._enemyId;
			$gameSystem.monsterBookDiscover(eid, false);
			rewards.forEach(function(item) {
				$gameSystem.monsterBookDiscoverItem(eid, item);
			});
		}

		return rewards;
	};

	var _Game_Enemy_setup = Game_Enemy.prototype.setup;
	Game_Enemy.prototype.setup = function(enemyId, x, y) {
		_Game_Enemy_setup.call(this, enemyId, x, y);

		if (revealOnKill === 2)
		{
			$gameSystem.monsterBookDiscover(enemyId, false);
			var a = this.enemy().dropItems.reduce(function(r, di) {
				if (di.kind > 0)
					return r.concat(this.itemObject(di.kind, di.dataId));
				else
					return r;
			}.bind(this), []);
			a.forEach(function(item) {
				$gameSystem.monsterBookDiscoverItem(enemyId, item);
			});
		}
	};
})();
