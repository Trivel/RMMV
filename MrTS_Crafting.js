//=============================================================================
// MrTS_Crafting.js
//=============================================================================

/*:
* @plugindesc Allows crafting of items.
* @author Mr. Trivel
*
* @param Required Levels
* @desc Show recipe required levels to craft it? True/False
* Default: True
* @default True
*
* @param Gauge Color 1
* @desc Color 1 of discipline exp gauge - in hex.
* Default: #23b94d
* @default #23b94d
*
* @param Gauge Color 2
* @desc Color 2 of discipline exp gauge - in hex.
* Default: #60e021
* @default #60e021
*
* @param Category Color
* @desc Color of Categories.
* Default: #FFD700
* @default #FFD700
*
* @param Has Items Color
* @desc Color of item number when party has enough for recipe.
* Default: #4CC417
* @default #4CC417
*
* @param Not Has Items Color
* @desc Color of item number when party doesn't have enough for recipe.
* Default: #C24641
* @default #C24641
*
* @param Closed Category Symbol
* @desc Symbol to mark closed category.
* Default: +
* @default +
*
* @param Open Category Symbol
* @desc Symbol to mark open category.
* Default: -
* @default -
*
* @param Required Level Text
* @desc Required recipe level text.
* Default: Required Lv.:
* @default Required Lv.:
*
* @param Result Text
* @desc Recipe result text.
* Default: Product:
* @default Product:
*
* @param Required Items Text
* @desc Text for required items.
* Default: Required Items:
* @default Required Items:
*
* @param Craft Text
* @desc Craft button text.
* Default: Craft
* @default Craft
*
* @param Discipline Level Text
* @desc Discipline Level Text
* Default: Level:
* @default Level:
*
* @param Possession Text
* @desc How many items party has text.
* Default: Owned:
* @default Owned:
*
* @param Craft Sound
* @desc Which sound to play on successful craft?
* Default: Parry
* @default Parry
*
* @param Show Buttons
* @desc Show quantity buttons for mouse? True/False
* Default: True
* @default True
*
* @param Stretch
* @desc Stretch Windows if resolution is bigger than default? True/False
* @default False
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
* Setting Everything Up
* --------------------------------------------------------------------------------
* First, you'll need 2 new files in data folder:
* Recipes.json
* Disciplines.json
*
* Recipes file will hold all recipe data and Disciplines file will hold data about
* disciplines. I *highly* recommend checking sample files that are located in the
* demo of this plugin.
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Disciplines.json
* --------------------------------------------------------------------------------
* Discipline object looks like this:
* {
*    "ID": 999,
*    "Name": "NAME",
*    "IconID": 1337,
*    "ExpFormula": "10000*level",
*    "MaxLevel": 2,
*    "Categories": ["1", "2", "3", ... , "n"],
*    "Background": "FileName"
* }
*
* And file structure looks like this:
* [
* null,
* object,
* object,
* ...,
* object
* ]
*
* "ID" - to identify which disciplice is which and for plugin calls. ID > 0
* "Name" - how discipline is called
* "IconID" - icon for discipline
* "ExpFormula" - leveling formula for discipline, level stands for current
*                discipline level
* "MaxLevel" - max possible discipline level
* "Categories" - Categories to organize items when crafting
* "Background" - Give a background to crafting. Leave it empty - "" to use default
*              - background. Images go into img\System
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Recipes.json
* --------------------------------------------------------------------------------
* Recipe object looks like this:
* {
*    "ID": 192312,
*    "Name": "Ultimate Sword of Ascension",
*    "IconIndex": 122,
*    "Result": [
*    {
*        "Type": "weapon",
*        "ID": 99999,
*        "Amount": 1
*    }
*    ],
*    "Requires": [
*    {
*        "Type": "item",
*        "ID": 1337,
*        "Amount": 99
*    }
*    ],
*    "Discipline": ID,
*    "Category": ["Swords", "Weapons"],
*    "XP": 999999999,
*    "LevelReq": 150,
*    "Learned": "command"
*    
* }
*
* And file structure looks like this:
* [
* null,
* object,
* object,
* ...,
* object
* ]
*
* "ID" - To know which recipe is which. ID > 0
* "Name" - How it appears in crafting window
* "IconIndex" - Icon for recipe
* "Result" - What items and how many of them result by crafting it, can be more
*            than one item.
* "Requires" - What items and how many of them are required to craft it.
* {
* "Type" - item type - "weapon", "item", "armor"
* "ID" - item ID
* "Amount" - how much of the item
* }
* "Discipline" - which disicipline's recipe is this
* "Category" - under which categories will item be shown, can be multiple
* "XP" - XP given for the discipline
* "LevelReq" - Discipline level requirement to craft it
* "Learned" - how is the recipe learned - "start" - from the start, "command" - 
*           - by plugin command - "levelhit" - unlocks automatically when hits -
*           - required level
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* Crafting Start [DISCIPLINE_ID] - opens scene to craft with discipline
* Crafting GainExp [DISCIPLINE_ID] [EXP] - give exp to certain discipline
* Crafting Learn [RECIPE_ID] - learn a specific recipe
*
* Examples:
* Crafting Start 3
* Crafting GainExp 1 100
* Crafting Learn 5
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Script Calls
* --------------------------------------------------------------------------------
* $gameSystem.getDisciplineExp(DISCIPLINE_ID) - returns EXP of a discipline
* $gameSystem.getDisciplineLevel(DISCIPLINE_ID) - returns LEVEL of a discipline
* $gameSystem.isRecipeKnown(RECIPE_ID) - returns if recipe is learned
* $gameSystem.knownRecipesNumber(DISCIPLINE_ID) - returns amount of recipes known
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

var $dataDisciplines = null;
var $dataRecipes = null;

DataManager._databaseFiles.push({name: '$dataDisciplines', src: 'Disciplines.json'});
DataManager._databaseFiles.push({name: '$dataRecipes', src: 'Recipes.json'});

(function() {
	var parameters = PluginManager.parameters('MrTS_Crafting');
	var paramReqLevels = (parameters['Required Levels'] || "True").toLowerCase() === "true";
	var paramShowButtons = (parameters['Show Buttons'] || "True").toLowerCase() === "true";
	var paramGaugeColor1 = String(parameters['Gauge Color 1'] || "#23b94d");
	var paramGaugeColor2 = String(parameters['Gauge Color 2'] || "#60e021");
	var paramCategoryColor = String(parameters['Category Color'] || "#FFD700");
	var paramHasItemsColor = String(parameters['Has Items Color'] || "#4CC417");
	var paramHasNotItemsColor = String(parameters['Not Has Items Color'] || "#C24641");
	var paramClosedSymbol = String(parameters['Closed Category Symbol'] || "+");
	var paramOpenSymbol = String(parameters['Open Category Symbol'] || "-");
	var paramReqLvlTxt = String(parameters['Required Level Text'] || "Required Lv.: ");
	var paramResultTxt = String(parameters['Result Text'] || "Product:");
	var paramReqItemTxt = String(parameters['Required Items Text'] || "Required Items:");
	var paramCraftTxt = String(parameters['Craft Text'] || "Craft");
	var paramDisciplineLevelTxt = String(parameters['Discipline Level Text'] || "Level:");
	var paramOwnedTxt = String(parameters['Possession Text'] || "Owned:");
	var paramSound = String(parameters['Craft Sound'] || "Parry");
	var paramStretch = (parameters['Stretch'] || "True").toLowerCase() === "true";
	var paramLeftSide = 1.65;
	var paramRightSide = 1.35;

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "crafting") {
			switch (args[0].toUpperCase())
			{
				case 'START':
				{
					SceneManager.push(Scene_Crafting);
					SceneManager.prepareNextScene(Number(args[1]));
				} break;
				case 'GAINEXP':
				{
					$gameSystem.gainCraftingExp(Number(args[1]), Number(args[2]));
				} break;
				case 'LEARN':
				{
					$gameSystem.learnCraftingRecipe(Number(args[1]));
				} break;				
			}
		}
	};

	//--------------------------------------------------------------------------
	// Game_System
	// 

	var _Game_System_Initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_Game_System_Initialize.call(this);
		this.initializeCrafting();
	};

	Game_System.prototype.initializeCrafting = function() {
		this._craftingDisciplines = {};
		this._craftingRecipes = {};
		this._craftingRecipeDiscoveredQueue = [];

		this.initializeDisciplines();
		this.initializeRecipes();
	};

	Game_System.prototype.initializeDisciplines = function() {
		for (var i = 0; i < $dataDisciplines.length; i++) {
			if (!$dataDisciplines[i]) continue;

			var data = $dataDisciplines[i];
			var id = data["ID"];
			var name = data["Name"];
			var iconId = data["IconID"];
			var formula = data["ExpFormula"];
			var maxLevel = data["MaxLevel"];
			var categories = data["Categories"];
			var bckg = data["Background"];

			this.addCraftingDiscipline(id, name, iconId, formula, maxLevel, categories, bckg);
		}
	};

	Game_System.prototype.initializeRecipes = function() {
		for (var i = 0; i < $dataRecipes.length; i++) {
			if (!$dataRecipes[i]) continue;

			var recipe = $dataRecipes[i];
			var id = recipe["ID"];
			var name = recipe["Name"];
			var iconIndex = recipe["IconIndex"];
			var result = recipe["Result"];
			var reqs = recipe["Requires"];
			var discipline = recipe["Discipline"];
			var categories = recipe["Category"];
			var xp = recipe["XP"];
			var levelreq = recipe["LevelReq"];
			var learned = recipe["Learned"];

			this.addCraftingRecipe(id, name, iconIndex, result, reqs, categories, discipline, 
								   xp, levelreq, learned);
		}
	};

	Game_System.prototype.addCraftingDiscipline = function(id, name, iconId, expFormula,
														   maxlevel, categories, background) {
		var newDisicipline = {};
		newDisicipline.Id = id;
		newDisicipline.Name = name;
		newDisicipline.IconId = iconId;
		newDisicipline.ExpFormula = expFormula;
		newDisicipline.MaxLevel = maxlevel;
		newDisicipline.Categories = categories;
		newDisicipline.Background = background;
		newDisicipline.Recipes = [];
		newDisicipline.Xp = 0;
		newDisicipline.Level = 1;

		this._craftingDisciplines[id] = newDisicipline;


	};

	Game_System.prototype.addCraftingRecipe = function(id, name, iconIndex, result, requires, 
													   category, discipline, exp, 
													   levelreq, learningtype) {
		var newRecipe = {};
		newRecipe.Id = id;
		newRecipe.Name = name;
		newRecipe.IconIndex = iconIndex;
		newRecipe.Result = result;
		newRecipe.Requires = requires;
		newRecipe.Category = category;
		newRecipe.Xp = exp;
		newRecipe.LevelReq = levelreq;
		newRecipe.LearnType = learningtype;
		newRecipe.Learned = learningtype === "start" ? true : false;
		
		this._craftingRecipes[id] = newRecipe;
		this.getDiscipline(discipline).Recipes.push(id);
	};

	Game_System.prototype.gainCraftingExp = function(id, exp) {
		var discipline = this.getDiscipline(id);
		discipline.Xp += exp;

		this.checkForDisciplineLevelUp(id);
	};

	Game_System.prototype.checkForDisciplineLevelUp = function(id) {
		var discipline = this.getDiscipline(id);
		var levelExpReq = this.getDisciplineExpRequired(id);
		if (discipline.Xp >= levelExpReq && discipline.Level < discipline.MaxLevel)
		{
			discipline.Xp -= levelExpReq;
			discipline.Level++;
			this.checkForDisciplineLevelUp(id);
			this.checkForLevelHitRecipes(id);
		}
	};

	Game_System.prototype.checkForLevelHitRecipes = function(id) {
		var discipline = this.getDiscipline(id);
		for (var i = 0; i < discipline.Recipes.length; i++) {
			var recipe = this.getRecipe(discipline.Recipes[i]);
			if (recipe.Learned === false && recipe.LearnType === "levelhit" && recipe.LevelReq <= discipline.Level)
			{
				this._craftingRecipeDiscoveredQueue.push(recipe.Id);
				recipe.Learned = true;
			}
		}
	};

	Game_System.prototype.getDiscipline = function(id) {
		return this._craftingDisciplines[id];
	};

	Game_System.prototype.getDisciplineLevel = function(id) {
		return this.getDiscipline(id).Level;
	};

	Game_System.prototype.getDisciplineLevel = function(id) {
		this.getDiscipline(id).Xp;
	};

	Game_System.prototype.getDisciplineExpRequired = function(id) {
		var discipline = this.getDiscipline(id);
		var formula = discipline.ExpFormula;
		var level = discipline.Level;
		return eval(formula);
	};

	Game_System.prototype.getRecipe = function(id) {
		return this._craftingRecipes[id];
	};

	Game_System.prototype.isRecipeKnown = function(id) {
		return this.getRecipe(id).Learned;
	};

	Game_System.prototype.knownRecipesNumber = function(id) {
		var recipes = this.getDiscipline(id).Recipes;
		var learned = 0;
		for (var i = 0; i < recipes.length; i++) {
			learned += recipes[i].Learned ? 1 : 0;
		}
		return learned;
	};

	Game_System.prototype.learnCraftingRecipe = function(id) {
		this.getRecipe(id).Learned = true;
	};

	//--------------------------------------------------------------------------
	// Scene_Crafting
	//
	// Crafting scene where magic.. or tech happens.
	
	function Scene_Crafting() {
		this.initialize.apply(this, arguments);	
	};
	
	Scene_Crafting.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_Crafting.prototype.constructor = Scene_Crafting;
	
	Scene_Crafting.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	};

	Scene_Crafting.prototype.prepare = function(discipline) {
		this._disciplineId = discipline;
		this._discipline = $gameSystem.getDiscipline(this._disciplineId);
	};
	
	Scene_Crafting.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this._craftSound = AudioManager.makeEmptyAudioObject();
		this._craftSound.name = paramSound;
		this._craftSound.volume = 100;
		this._craftSound.pitch = 100;
		AudioManager.loadStaticSe(this._craftSound);
		this.createTopWindow();
		this.createListWindow();
		this.createInfoWindow();
		this.createCraftWindow();
	};

	Scene_Crafting.prototype.createBackground = function() {
	    this._backgroundSprite = new Sprite();
	    if (this._discipline.Background)
	    	this._backgroundSprite.bitmap = ImageManager.loadSystem(this._discipline.Background);
	    else
	    	this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
	    this.addChild(this._backgroundSprite);
	};

	Scene_Crafting.prototype.createTopWindow = function() {
		var ww = paramStretch ? Graphics.boxWidth : 816;
		var wx = paramStretch ? 0 : Graphics.boxWidth/2 - ww/2;
		var wy = paramStretch ? 0 : Graphics.boxHeight/2 - 624/2;
		this._topWindow = new Window_CraftingTop(wx, wy, ww, this._discipline);
		this.addWindow(this._topWindow);
	};

	Scene_Crafting.prototype.createListWindow = function() {
		var ww = paramStretch ? Math.floor(Graphics.boxWidth/3*paramLeftSide) : Math.ceil(816/3*paramLeftSide);
		var wh = paramStretch ? Graphics.boxHeight - this._topWindow.height : 624 - this._topWindow.height;
		var wx = paramStretch ? 0 : Graphics.boxWidth/2 - 816/2;
		var wy = this._topWindow.y + this._topWindow.height;
		this._listWindow = new Window_CraftingRecipes(wx, wy, ww, wh, this._discipline);
		this._listWindow.setHandler('ok', this.listWindowOk.bind(this));
    	this._listWindow.setHandler('cancel', this.popScene.bind(this));
		this.addWindow(this._listWindow);
		this._listWindow.select(0);
		this._listWindow.activate();
	};

	Scene_Crafting.prototype.createInfoWindow = function() {
		var ww = paramStretch ? Math.floor(Graphics.boxWidth/3*paramRightSide) : Math.ceil(816/3*paramRightSide);
		var wh = paramStretch ? Graphics.boxHeight - this._topWindow.height : 624 - this._topWindow.height;
		var wx = this._listWindow.x + this._listWindow.width;
		var wy = this._topWindow.y + this._topWindow.height;
		this._infoWindow = new Window_CraftingInfo(wx, wy, ww, wh);
		this.addWindow(this._infoWindow);
		this._listWindow.setHelpWindow(this._infoWindow);
	};

	Scene_Crafting.prototype.createCraftWindow = function() {
		var ww = this._topWindow.width/3*paramRightSide;
		var wh = this._topWindow.height;
		var wx = this._topWindow.x + this._topWindow.width - ww;
		var wy = this._topWindow.y + this._topWindow.height - wh;
		this._craftWindow = new Window_CraftingCraft(wx, wy, ww, wh);
		this._craftWindow.setHandler('ok', this.craftWindowOk.bind(this));
    	this._craftWindow.setHandler('cancel', this.craftWindowCancel.bind(this));
		this.addChild(this._craftWindow);
		this._craftWindow._infoWindow = this._infoWindow;
	};

	Scene_Crafting.prototype.listWindowOk = function() {
		this._listWindow.deactivate();
		this._craftWindow.activate();
		this._craftWindow.showButtons();
		this._craftWindow.select(0);
	};

	Scene_Crafting.prototype.craftWindowOk = function() {
		var item = this._listWindow.item(this._listWindow.index());
		var reqLevel = item.LevelReq;
		var multiplier = this._craftWindow._multiplier;
		var craftSuccess = true;
		if (this._discipline.Level < reqLevel) craftSuccess = false;
		var items = [];
		for (var i = 0; i < item.Requires.length; i++) {
			var tmpItem = null;
			switch (item.Requires[i].Type)
			{
				case 'weapon':
				{
					tmpItem = $dataWeapons[item.Requires[i].ID];
				} break;
				case 'armor':
				{
					tmpItem = $dataArmors[item.Requires[i].ID];
				} break;
				case 'item':
				{
					tmpItem = $dataItems[item.Requires[i].ID];
				} break;
			}
			items.push(tmpItem);
			var amount = item.Requires[i].Amount * multiplier;
			if ($gameParty.numItems(tmpItem) < amount) craftSuccess = false;
		}
		if (craftSuccess)
		{
			AudioManager.playStaticSe(this._craftSound);
			this._craftWindow.activate();
			this._craftWindow.select(0);
			for (var i = 0; i < items.length; i++) {
				$gameParty.gainItem(items[i], -item.Requires[i].Amount * multiplier);
			}
			for (var i = 0; i < item.Result.length; i++) {
				var tmpItem = null;
				switch (item.Result[i].Type)
				{
					case 'weapon':
					{
						tmpItem = $dataWeapons[item.Result[i].ID];
					} break;
					case 'armor':
					{
						tmpItem = $dataArmors[item.Result[i].ID];
					} break;
					case 'item':
					{
						tmpItem = $dataItems[item.Result[i].ID];
					} break;
				}
				$gameParty.gainItem(tmpItem, item.Result[i].Amount * multiplier);
			}
			$gameSystem.gainCraftingExp(this._disciplineId, item.Xp * multiplier);
			this._listWindow.calculateCategories();
			this._topWindow.refresh();
			this._infoWindow.refresh();
			this._listWindow.refresh();
		}
		else
		{
			this._craftWindow.playBuzzerSound();
			this._craftWindow.activate();
			this._craftWindow.select(0);
		}
	};

	Scene_Crafting.prototype.craftWindowCancel = function() {
		this._craftWindow.deselect();
		this._craftWindow.deactivate();
		this._craftWindow._multiplier = 1;
		this._craftWindow.hideButtons();
		this._craftWindow.refresh();
		this._infoWindow.refresh();
		this._listWindow.activate();
	};

	//--------------------------------------------------------------------------
	// Window_CraftingTop
	//
	// Shows discipline gauge for exp and required level for item.
	
	function Window_CraftingTop() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_CraftingTop.prototype = Object.create(Window_Base.prototype);
	Window_CraftingTop.prototype.constructor = Window_CraftingTop;
	
	Window_CraftingTop.prototype.initialize = function(x, y, w, discipline) {
		var wh = this.fittingHeight(2);
		this._discipline = discipline;
		Window_Base.prototype.initialize.call(this, x, y, w, wh);
		this.refresh();
	};
	
	Window_CraftingTop.prototype.refresh = function() {
		this.contents.clear();
		var name = this._discipline.Name;
		var exp = this._discipline.Xp;
		var nExp = $gameSystem.getDisciplineExpRequired(this._discipline.Id);
		var txtWdth = this.textWidth(name) + Window_Base._iconWidth+4;
		var space = this.width/3*paramLeftSide-this.standardPadding();
		this.drawIcon(this._discipline.IconId, space/2 - txtWdth/2, 2);
		this.drawText(name, space/2 - txtWdth/2 + Window_Base._iconWidth + 4, 0);
		this.drawGauge(0, this.lineHeight(), space, exp/nExp,
					   paramGaugeColor1, paramGaugeColor2);
		var txtExp = String(exp) + "/" + String(nExp);
		var txtExpWidth = this.textWidth(txtExp);
		this.drawText(paramDisciplineLevelTxt + " " + String(this._discipline.Level), 0, this.lineHeight()+2);
		this.drawText(txtExp, space/2 - txtExpWidth/2, this.lineHeight()+2);
	};

	//--------------------------------------------------------------------------
	// Window_CraftingRecipes
	//
	// Shows a list of available recipes and categories.
	
	function Window_CraftingRecipes() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_CraftingRecipes.prototype = Object.create(Window_Selectable.prototype);
	Window_CraftingRecipes.prototype.constructor = Window_CraftingRecipes;
	
	Window_CraftingRecipes.prototype.initialize = function(x, y, w, h, discipline) {
		this._discipline = discipline;
		this._categories = [];
		this._categoriesOpen = [];
		this.calculateCategories();
		Window_Selectable.prototype.initialize.call(this, x, y, w, h);
		this.refresh();
	};

	Window_CraftingRecipes.prototype.calculateCategories = function() {
		this._categories = [];
		var recipes = this._discipline.Recipes;
		for (var i = 0; i < recipes.length; i++) {
			var data = $gameSystem.getRecipe(recipes[i]);
			if (data.Learned)
			{
				var dataCats = data.Category;
				for (var j = 0; j < dataCats.length; j++) {
					var index = this._discipline.Categories.indexOf(dataCats[j]);
					if (!this._categories[index]) this._categories[index] = [];
					this._categories[index].push(data);
				}
			}
		}
	};

	Window_CraftingRecipes.prototype.maxItems = function() {
		var items = 0;
		if (this._discipline)
		{
			items += this._discipline.Categories.length;
			for (var i = 0; i < this._categories.length; i++) {
				if (!this._categories[i]) continue;
				if (!this._categoriesOpen[i]) continue;
				for (var j = 0; j < this._categories[i].length; j++) {
					items++;
				}
			}
		}
	    return items;
	};

	Window_CraftingRecipes.prototype.item = function(index) {
		var item = null;
		if (this._discipline)
		{
			var l = -1;
			for (var i = 0; i < this._discipline.Categories.length; i++) {
				l++;
				if (l === index) {
					item = this._discipline.Categories[i];
					return item;
				}
				if (!this._categories[i]) continue;
				if (!this._categoriesOpen[i]) continue;
				for (var j = 0; j < this._categories[i].length; j++) {
					l++;
					if (l === index) {
						item = this._categories[i][j];
						return item;
					}
				}
			}
		}
		return item;
	};

	Window_CraftingRecipes.prototype.drawItem = function(index) {
		var item = this.item(index);
		if (item)
		{
			var rect = this.itemRectForText(index);
			if (typeof item === "string" || item instanceof String)
			{
				var catIndex = this._discipline.Categories.indexOf(item);
				if (this._categoriesOpen[catIndex]) item = paramOpenSymbol + " " + item;
				if (!this._categoriesOpen[catIndex]) item = paramClosedSymbol + " " + item;
				this.changeTextColor(paramCategoryColor);
				this.drawText(item, rect.x, rect.y);
    			this.resetTextColor();
			}
			else
			{
				this.drawIcon(item.IconIndex, rect.x+15, rect.y+2);
				this.drawText(item.Name, rect.x+15+4+Window_Base._iconWidth, rect.y);
			}
		}
	};

	Window_CraftingRecipes.prototype.processOk = function() {
		var item = this.item(this._index);
		if (typeof item === "string" || item instanceof String)
		{
			var i = this._discipline.Categories.indexOf(item);
			this._categoriesOpen[i] = !this._categoriesOpen[i];
			this.refresh();
		}
		else
			Window_Selectable.prototype.processOk.call(this);
	};

	Window_CraftingRecipes.prototype.setHelpWindow = function(helpWindow) {
	    this._helpWindow = helpWindow;
	};

	Window_CraftingRecipes.prototype.updateHelp = function() {
	    this._helpWindow.setItem(this.item(this.index()));
	};

	//--------------------------------------------------------------------------
	// Window_CraftingInfo
	//
	// Shows a list of required items as well as result of recipe.
	
	function Window_CraftingInfo() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_CraftingInfo.prototype = Object.create(Window_Base.prototype);
	Window_CraftingInfo.prototype.constructor = Window_CraftingInfo;
	
	Window_CraftingInfo.prototype.initialize = function(x, y, w, h) {
		this._item = null;
		Window_Base.prototype.initialize.call(this, x, y, w, h);
	};
	
	Window_CraftingInfo.prototype.refresh = function() {
		this.contents.clear();
		var item = this._item;
		if (item)
		{
			var lineHeight = this.lineHeight();
			var line = 0;
			this.drawText(paramResultTxt, 0, lineHeight*line);
			for (var i = 0; i < item.Result.length; i++) {
				line++;
				var resultItem = null;
				switch (item.Result[i].Type)
				{
					case 'weapon':
					{
						resultItem = $dataWeapons[item.Result[i].ID];
					} break;
					case 'armor':
					{
						resultItem = $dataArmors[item.Result[i].ID];
					} break;
					case 'item':
					{
						resultItem = $dataItems[item.Result[i].ID];
					} break;
				}

				this.drawIcon(resultItem.iconIndex, 2, lineHeight*line+2);
				this.drawText(resultItem.name, 4 + Window_Base._iconWidth, lineHeight*line);
				line++;
				this.contents.fontSize -= 6;
				this.drawText(paramOwnedTxt + " " + String($gameParty.numItems(resultItem)), 0, lineHeight*line-3);
				this.contents.fontSize += 6;
				this.drawText("x" + String(item.Result[i].Amount * this._multiplier), 0, lineHeight*line, this.contentsWidth(), 'right');
			}
			line++;
			line++;
			this.drawText(paramReqItemTxt, 0, lineHeight*line);
			for (var i = 0; i < item.Requires.length; i++) {
				line++;
				var reqItem = null;
				switch (item.Requires[i].Type)
				{
					case 'weapon':
					{
						reqItem = $dataWeapons[item.Requires[i].ID];
					} break;
					case 'armor':
					{
						reqItem = $dataArmors[item.Requires[i].ID];
					} break;
					case 'item':
					{
						reqItem = $dataItems[item.Requires[i].ID];
					} break;
				}
				this.drawIcon(reqItem.iconIndex, 2, lineHeight*line+2);
				this.drawText(reqItem.name, 4 + Window_Base._iconWidth, lineHeight*line);
				line++
				var has = $gameParty.numItems(reqItem);
				var requires = item.Requires[i].Amount * this._multiplier
				if (has >= requires) this.changeTextColor(paramHasItemsColor);
				else this.changeTextColor(paramHasNotItemsColor);
				this.drawText(String(has) + "/" + String(requires), 0, lineHeight*line, this.contentsWidth(), 'right');
				this.resetTextColor();
			}
			if (paramReqLevels)
			{
				this.makeFontSmaller();
				this.drawText(paramReqLvlTxt + " " + String(item.LevelReq), 0, this.contentsHeight() - this.lineHeight(), this.contentsWidth(), 'center');
				this.makeFontBigger();
			}
		}
	};

	Window_CraftingInfo.prototype.setItem = function(item) {
		if (typeof item === "string" || item instanceof String) return;
		this._item = item;
		this._multiplier = 1;
		this.refresh();
	};

	//--------------------------------------------------------------------------
	// Window_CraftingCraft
	//
	// Craft items here.
	
	function Window_CraftingCraft() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_CraftingCraft.prototype = Object.create(Window_Selectable.prototype);
	Window_CraftingCraft.prototype.constructor = Window_CraftingCraft;
	
	Window_CraftingCraft.prototype.initialize = function(x, y, w, h) {
		this._multiplier = 1;
		Window_Selectable.prototype.initialize.call(this, x, y, w, h);
		this.opacity = 0;
		this.createButtons();
    	this.placeButtons();
    	this.hideButtons();
		this.refresh();
	};

	Window_CraftingCraft.prototype.createButtons = function() {
		var bitmap = ImageManager.loadSystem('ButtonSet');
	    var buttonWidth = 48;
	    var buttonHeight = 48;
	    this._buttons = [];
	    for (var i = 0; i < 4; i++) {
	        var button = new Sprite_Button();
	        var x = buttonWidth * i;
	        var w = buttonWidth * (i === 4 ? 2 : 1);
	        button.bitmap = bitmap;
	        button.setColdFrame(x, 0, w, buttonHeight);
	        button.setHotFrame(x, buttonHeight, w, buttonHeight);
	        button.visible = false;
	        this._buttons.push(button);
	        this.addChild(button);
	    }
	    this._buttons[0].setClickHandler(this.onButtonDown2.bind(this));
	    this._buttons[1].setClickHandler(this.onButtonDown.bind(this));
	    this._buttons[2].setClickHandler(this.onButtonUp.bind(this));
	    this._buttons[3].setClickHandler(this.onButtonUp2.bind(this));
	};

	Window_CraftingCraft.prototype.placeButtons = function() {
	    var numButtons = this._buttons.length;
	    var spacing = 16;
	    var rect = this.itemRect(0);
	    this._buttons[0].x = rect.x - spacing*2 - 48 -4;
	    this._buttons[0].y = this.height/2 - 48/2;
	    this._buttons[1].x = rect.x - spacing*2 -4;
	    this._buttons[1].y = this.height/2 - 48/2;
	    this._buttons[2].x = rect.x + rect.width + spacing +4;
	    this._buttons[2].y = this.height/2 - 48/2;
	    this._buttons[3].x = rect.x + rect.width + spacing + 48 +4;
	    this._buttons[3].y = this.height/2 - 48/2;
	};

	Window_CraftingCraft.prototype.showButtons = function() {
		if (!paramShowButtons) return;
	    for (var i = 0; i < this._buttons.length; i++) {
	        this._buttons[i].visible = true;
	    }
	};

	Window_CraftingCraft.prototype.hideButtons = function() {
	    for (var i = 0; i < this._buttons.length; i++) {
	        this._buttons[i].visible = false;
	    }
	};

	Window_CraftingCraft.prototype.onButtonUp = function() {
	    this.cursorUp();
	};

	Window_CraftingCraft.prototype.onButtonUp2 = function() {
	    this.cursorRight();
	};

	Window_CraftingCraft.prototype.onButtonDown = function() {
	    this.cursorDown();
	};

	Window_CraftingCraft.prototype.onButtonDown2 = function() {
	    this.cursorLeft();
	};

	Window_CraftingCraft.prototype.maxItems = function() {
		return 1;
	};

	Window_CraftingCraft.prototype.drawItem = function(index) {
		var rect = this.itemRect(index);
		var txt = paramCraftTxt + " [" + String(this._multiplier) + "]";
		this.drawText(txt, rect.x, rect.y, rect.width, 'center');
	};

	Window_CraftingCraft.prototype.itemRect = function(index) {
	    var rect = new Rectangle();
	    var maxCols = this.maxCols();
	    rect.width = this.textWidth(paramCraftTxt + " [99]") + this.textPadding()*2;
	    rect.height = this.itemHeight();
	    rect.x = this.contentsWidth()/2 - rect.width/2;
	    rect.y = this.contentsHeight()/2 - rect.height/2;
	    return rect;
	};

	Window_CraftingCraft.prototype.itemRectForText = function(index) {
	    var rect = this.itemRect(index);
	    rect.x += this.textPadding();
	    return rect;
	};

	Window_CraftingCraft.prototype.updateArrows = function() {
	    this.downArrowVisible = this._multiplier > 1;
	    this.upArrowVisible = this._multiplier < 99;
	};

	Window_CraftingCraft.prototype.cursorDown = function(wrap) {
		if (this._multiplier > 1)
		{
			this._multiplier--;
			if (this._infoWindow)
			{
				this._infoWindow._multiplier = this._multiplier;
				this._infoWindow.refresh();
			}
			this.refresh();
		}
	};

	Window_CraftingCraft.prototype.cursorUp = function(wrap) {
		if (this._multiplier < 99) 
		{
			this._multiplier++;
			if (this._infoWindow)
			{
				this._infoWindow._multiplier = this._multiplier;
				this._infoWindow.refresh();
			}
			this.refresh();
		}
	};

	Window_CraftingCraft.prototype.cursorLeft = function(wrap) {
		if (this._multiplier > 1)
		{
			this._multiplier -= 10;
			if (this._multiplier < 1) this._multiplier = 1;
			if (this._infoWindow)
			{
				this._infoWindow._multiplier = this._multiplier;
				this._infoWindow.refresh();
			}
			this.refresh();
		}
	};

	Window_CraftingCraft.prototype.cursorRight = function(wrap) {
		if (this._multiplier < 99) 
		{
			this._multiplier += 10;
			if (this._multiplier > 99) this._multiplier = 99;
			if (this._infoWindow)
			{
				this._infoWindow._multiplier = this._multiplier;
				this._infoWindow.refresh();
			}
			this.refresh();
		}
	};

	Window_CraftingCraft.prototype.isCursorMovable = function() {
	    return this.active;
	};

	Window_CraftingCraft.prototype.playOkSound = function() {
	};
})();
