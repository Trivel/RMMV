//=============================================================================
// MrTS_QuestLog.js
//=============================================================================

/*:
* @plugindesc Tracks quests, awards players for completing them.
* @author Mr. Trivel
*
* @param --Icons--
* @default 
*
* @param All Quests Icon
* @desc Icon ID for all quests tab.
* Default: 93
* @default 93
*
* @param Ongoing Quests Icon
* @desc Icon ID for ongoing quests.
* Default: 92
* @default 92
*
* @param Completed Quests Icon
* @desc Icon ID for completed quests tab.
* Default: 90
* @default 90
*
* @param Failed Quests Icon
* @desc Icon ID for failed quests tab.
* Default: 91
* @default 91
*
* @param Gold Icon
* @desc Icon ID for gold rewards.
* Default: 313
* @default 313
*
* @param --Text--
* @default 
*
* @param Description Text
* @desc Description text.
* Default: Description
* @default Description
*
* @param Objective Text
* @desc Current Objective text.
* Default: Current Objective
* @default Current Objective
*
* @param Rewards Text
* @desc Rewards Text
* Default: Rewards
* @default Rewards
*
* @param Quest Log Text
* @desc Quest Log Text in menu.
* Default: Quest Log
* @default Quest Log
*
* @param No Objective Text
* @desc Text to show in objectives when quest failed or finished.
* Default: - No Objectives
* @default - No Objectives
*
* @param --Colors--
* @default
*
* @param Started Color
* @desc Started quest color.
* Default: #FFFFFF
* @default #FFFFFF
*
* @param Completed Color
* @desc Completed quest color.
* Default: #11FF11
* @default #11FF11
*
* @param Failed Color
* @desc Failed quest color.
* Default: #FF1111
* @default #FF1111
*
* @param --Windows--
* @default 
*
* @param Quest Log Menu
* @desc Is Quest log accessible from menu? True/False
* Default: True
* @default True
*
* @param Quest Category X
* @desc X Position of Quest Category Window
* Default: Graphics.boxWidth/2 - 816/2
* @default Graphics.boxWidth/2 - 816/2
*
* @param Quest Category Y
* @desc Y Position of Quest Category Window
* Default: Graphics.boxHeight/2 - 624/2
* @default Graphics.boxHeight/2 - 624/2
*
* @param Quest Category Width
* @desc Quest Category Window's Width
* Default: 266
* @default 266
*
* @param Quest Category Height
* @desc Quest Category Window's Height
* Default: 72
* @default 72
*
* @param Quest List X
* @desc X Position of Quest List
* Default: Graphics.boxWidth/2 - 816/2
* @default Graphics.boxWidth/2 - 816/2
*
* @param Quest List Y
* @desc Y Position of Quest List
* Default: Graphics.boxHeight/2 - 624/2 + 72
* @default Graphics.boxHeight/2 - 624/2 + 72
*
* @param Quest List Width
* @desc Width of Quest List
* Default: 266
* @default 266
*
* @param Quest List Height
* @desc Height of Quest List
* Default: 624-72
* @default 624-72
*
* @param Description X
* @desc X Position of Description window.
* Default: Graphics.boxWidth/2 - 816/2 + 266
* @default Graphics.boxWidth/2 - 816/2 + 266
*
* @param Description Y
* @desc Y Position of Description window.
* Default: Graphics.boxHeight/2 - 624/2
* @default Graphics.boxHeight/2 - 624/2
*
* @param Description Width
* @desc Description window Width.
* Default: 816-266
* @default 816-266
*
* @param Description Height
* @desc Description window Height.
* Default: 624
* @default 624
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial and non-commercial projects.
* --------------------------------------------------------------------------------
* Version 1.0a
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* How to Set Up Quests
* --------------------------------------------------------------------------------
* Create a new file in Data folder:
* Quests.json
*
* Quests file will hold data regarding quests. I highly recommend checking sample
* that file that is located in the demo of this plugin
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Quests.json
* --------------------------------------------------------------------------------
* Quest object looks like this:
* {
*    "ID": 1337,
*    "Name": "Tutorial Island 1",
*    "IconID": 83,
*    "Description": "The island on a tutorial or the tutorial on an island.",
*    "Rewards": [Reward Object, 
*       Reward Object,
*       Reward Object,
*       ...],
*    "Steps": ["This is step 1",
*       "This shall be step II",
*       "And this is not the last step.",
*       ...]
* }
*
* You can use special characters in Steps text, just add extra backslash.
* E.g. "Collect rare weapons - \\V[20] from 100"
*
* Reward object looks like this:
* {
*   "Type": "weapon"
*   "ID": 99999,
*   "Amount": 99
*   "Text": "Text for text reward type"
* }
* Type being "weapon", "armor", "item", "gold", "exp", "text"
*  "gold", "exp" and "text" types don't need "ID".
*  If ID is specified for exp, actor of that ID will get the exp.
*  
*
* File itself should look like this:
* [
* null,
* Quest Object,
* Quest Object,
* ...
* Quest Object
* ]
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* QuestLog Start ID - Starts quest
* QuestLog Advance ID - Advances quest by a single step
* QuestLog SetStep ID STEP - Sets quest to a specific step
* QuestLog Finish ID - Finishes quest and gives rewards
* QuestLog Fail ID - Fails a quest
* QuestLog Enter - Enters quest log scene
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Script Calls
* --------------------------------------------------------------------------------
* $gameSystem.getQuestStep(id) - returns step number of a quest
* $gameSystem.isQuestStarted(id) - returns true/false is quest started
* $gameSystem.isQuestFinished(id) - returns true/false is quest finished
* $gameSystem.isQuestFailed(id) - returns true/false is quest failed
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
* 1.0a - Window size bug fix.
*/

var $dataQuests = null;
DataManager._databaseFiles.push({name: '$dataQuests', src: 'Quests.json'});

(function() {
	var parameters = PluginManager.parameters('MrTS_QuestLog');
	var paramAllQuestsIcon = Number(parameters['All Quests Icon'] || 93);
	var paramCompletedQuestsIcon = Number(parameters['Completed Quests Icon'] || 90);
	var paramFailedQuestsIcon = Number(parameters['Failed Quests Icon'] || 91);
	var paramOngoingQuestsIcon = Number(parameters['Ongoing Quests Icon'] || 92);
	var paramGoldIcon = Number(parameters['Gold Icon'] || 313);

	var paramDescriptionText = String(parameters['Description Text'] || "Description");
	var paramObjectiveText = String(parameters['Objective Text'] || "Current Objective");
	var paramRewardsText = String(parameters['Rewards Text'] || "Rewards");
	var paramQuestLogText = String(parameters['Quest Log Text'] || "Quest Log");
	var paramNoObjectivesText = String(parameters['No Objectives Text'] || "- No Objectives");

	var paramStartedColor = String(parameters['Started Color'] || "#FFFFFF");
	var paramCompletedColor = String(parameters['Completed Color'] || "#11FF11");
	var paramFailedColor = String(parameters['Failed Color'] || "#FF1111");

	var paramQuestLogMenu = (parameters['Quest Log Menu'] || "True").toLowerCase() === "true";
	var paramQuestCategoryX = String(parameters['Quest Category X'] || "Graphics.boxWidth/2 - 816/2");
	var paramQuestCategoryY = String(parameters['Quest Category Y'] || "Graphics.boxHeight/2 - 624/2");
	var paramQuestCategoryWidth = String(parameters['Quest Category Width'] || "266");
	var paramQuestCategoryHeight = String(parameters['Quest Category Height'] || "624");
	var paramQuestListX = String(parameters['Quest List X'] || "Graphics.boxWidth/2 - 816/2");
	var paramQuestListY = String(parameters['Quest List Y'] || "Graphics.boxHeight/2 - 624/2 + 72");
	var paramQuestListWidth = String(parameters['Quest List Width'] || "266");
	var paramQuestListHeight = String(parameters['Quest List Height'] || "624 - 72");
	var paramQuestDescriptionX = String(parameters['Description X'] || "Graphics.boxWidth/2 - 816/2 + 266");
	var paramQuestDescriptionY = String(parameters['Description Y'] || "Graphics.boxHeight/2 - 624/2");
	var paramQuestDescriptionWidth = String(parameters['Description Width'] || "816-266");
	var paramQuestDescriptionHeight = String(parameters['Description Height'] || "624");

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "questlog") {
			switch (args[0].toUpperCase())
			{
				case 'START':
				{
					$gameSystem.startQuest(Number(args[1]));
				} break;
				case 'ADVANCE':
				{
					var id = Number(args[1]);
					var step = $gameSystem.getQuestStep(id);
					$gameSystem.setQuestStep(id, step+1);
				} break;
				case 'SETSTEP':
				{
					var id = Number(args[1]);
					var step = Number(args[2]);
					$gameSystem.setQuestStep(id, step);
				} break;
				case 'FINISH':
				{
					$gameSystem.finishQuest(Number(args[1]));
				} break;
				case 'FAIL':
				{
					$gameSystem.failQuest(Number(args[1]));
				} break;
				case 'ENTER':
				{
					SceneManager.push(Scene_QuestLog);
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
		this.initializeQuestLog();
	};

	Game_System.prototype.initializeQuestLog = function(first_argument) {
		this._quests = [];

		for (var i = 0; i < $dataQuests.length; i++) {
			if (!$dataQuests[i]) continue;

			var quest = {};
			var data = $dataQuests[i];
			quest.ID = data["ID"];
			quest.name = data["Name"];
			quest.iconId = data["IconID"];
			quest.description = data["Description"];
			quest.rewards = data["Rewards"];
			quest.steps = data["Steps"];

			quest.currentStep = 0;
			quest.started = false;
			quest.finished = false;
			quest.failed = false;

			this._quests[i] = quest;
		}
	};

	Game_System.prototype.getAllQuests = function() {
		var quests = [];
		for (var i = 0; i < this._quests.length; i++) {
			if (!this._quests[i]) continue;
			if (this._quests[i].started || this._quests[i].finished || this._quests[i].failed)
				quests.push(i);
		}

		return quests;
	};
	
	Game_System.prototype.getStartedQuests = function() {
		var quests = [];
		for (var i = 0; i < this._quests.length; i++) {
			if (!this._quests[i]) continue;
			if (this._quests[i].started && !this._quests[i].finished && !this._quests[i].failed)
				quests.push(i);
		}

		return quests;
	};

	Game_System.prototype.getCompletedQuests = function() {
		var quests = [];
		for (var i = 0; i < this._quests.length; i++) {
			if (!this._quests[i]) continue;
			if (this._quests[i].finished)
				quests.push(i);
		}

		return quests;
	};

	Game_System.prototype.getFailedQuests = function() {
		var quests = [];
		for (var i = 0; i < this._quests.length; i++) {
			if (!this._quests[i]) continue;
			if (this._quests[i].failed)
				quests.push(i);
		}

		return quests;
	};

	Game_System.prototype.getQuest = function(id) {
		return this._quests[id];
	};

	Game_System.prototype.getQuestStep = function(id) {
		if (!this._quests[id]) {
			console.warn("FAILED TO GET QUEST STEP! Quest with ID " + id + " does not exist!");
			return -1;
		}

		return this._quests[id].currentStep;
	};

	Game_System.prototype.isQuestStarted = function(id) {
		if (!this._quests[id]) {
			console.warn("FAILED TO GET IS QUEST STARTED! Quest with ID " + id + " does not exist!");
			return false;
		}

		return this._quests[id].started;
	};

	Game_System.prototype.isQuestFinished = function(id) {
		if (!this._quests[id]) {
			console.warn("FAILED TO GET IS QUEST FINISHED! Quest with ID " + id + " does not exist!");
			return false;
		}

		return this._quests[id].finished;
	};

	Game_System.prototype.isQuestFailed = function(id) {
		if (!this._quests[id]) {
			console.warn("FAILED TO GET IS QUEST FAILED! Quest with ID " + id + " does not exist!");
			return false;
		}

		return this._quests[id].failed;
	};

	Game_System.prototype.startQuest = function(id) {
		if (!this._quests[id]) {
			console.warn("FAILED TO START QUEST! Quest with ID " + id + " does not exist!");
			return;
		}

		this._quests[id].started = true;
	};

	Game_System.prototype.finishQuest = function(id) {
		if (!this._quests[id]) {
			console.warn("FAILED TO FINISh QUEST! Quest with ID " + id + " does not exist!");
			return;
		}

		this._quests[id].finished = true;
		rewards = this._quests[id].rewards;
		for (var i = 0; i < rewards.length; i++) {
			switch (rewards[i].Type)
			{
				case 'weapon':
				{
					var amount = rewards[i].Amount;
					$gameParty.gainItem($dataWeapons[rewards[i].ID], amount);
				} break;
				case 'armor':
				{
					var amount = rewards[i].Amount;
					$gameParty.gainItem($dataArmors[rewards[i].ID], amount);
				} break;
				case 'item':
				{
					var amount = rewards[i].Amount;
					$gameParty.gainItem($dataItems[rewards[i].ID], amount);
				} break;
				case 'gold':
				{
					var amount = rewards[i].Amount;
					$gameParty.gainGold(amount);
				} break;
				case 'exp':
				{
					var amount = rewards[i].Amount;
					var id = rewards[i].ID;
					if (id) {
						$gameActors.actor(id).gainExp(amount);
					}
					else {
						$gameParty.allMembers().forEach(function(actor) {
							actor.gainExp(amount);
						});
					}
				} break;
			}

		}
	};

	Game_System.prototype.failQuest = function(id) {
		if (!this._quests[id]) {
			console.warn("FAILED TO FAIL QUEST! Quest with ID " + id + " does not exist!");
			return;
		}

		this._quests[id].failed = true;
	};

	Game_System.prototype.setQuestStep = function(id, step) {
		if (!this._quests[id]) {
			console.warn("FAILED TO SET QUEST TO STEP " + step + "! Quest with ID " + id + " does not exist!");
			return;
		}

		if (!this._quests[id].steps[step]) {
			console.warn("FAILED TO SET QUEST TO STEP " + step + "! Step does not exist! Did you mean to finish the quest instead?");
			return;
		}

		this._quests[id].currentStep = step;
	};

	//--------------------------------------------------------------------------
	// Scene_QuestLog
	//
	// Scene which displays log with quests.
	
	function Scene_QuestLog() {
		this.initialize.apply(this, arguments);	
	};
	
	Scene_QuestLog.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_QuestLog.prototype.constructor = Scene_QuestLog;
	
	Scene_QuestLog.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	};
	
	Scene_QuestLog.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createWindowLayer();
	};

	Scene_QuestLog.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createCategoryWindow();
		this.createListWindow();
		this.createInfoWindow();
	};

	Scene_QuestLog.prototype.createCategoryWindow = function() {
		var wx = eval(paramQuestCategoryX);
		var wy = eval(paramQuestCategoryY);
		var ww = eval(paramQuestCategoryWidth);
		var wh = eval(paramQuestCategoryHeight);
		this._categoryWindow = new Window_QuestLogCategory(wx, wy, ww, wh);
		this._categoryWindow.setHandler('ok', this.onCategoryOk.bind(this));
		this._categoryWindow.setHandler('cancel', this.popScene.bind(this));
		this.addWindow(this._categoryWindow);
		this._categoryWindow.activate();
		this._categoryWindow.select(0);
	};

	Scene_QuestLog.prototype.createListWindow = function() {
		var wx = eval(paramQuestListX);
		var wy = eval(paramQuestListY);
		var ww = eval(paramQuestListWidth);
		var wh = eval(paramQuestListHeight);
		this._listWindow = new Window_QuestLogList(wx, wy, ww, wh);
		this._listWindow.setHandler('cancel', this.onListCancel.bind(this));
		this.addWindow(this._listWindow);
	};

	Scene_QuestLog.prototype.createInfoWindow = function() {
		var wx = eval(paramQuestDescriptionX);
		var wy = eval(paramQuestDescriptionY);
		var ww = eval(paramQuestDescriptionWidth);
		var wh = eval(paramQuestDescriptionHeight);
		this._infoWindow = new Window_QuestLogDescription(wx, wy, ww, wh);
		this.addWindow(this._infoWindow);
		this._listWindow.setDescriptionWindow(this._infoWindow);
	};

	Scene_QuestLog.prototype.onCategoryOk = function() {
		this._listWindow.activate();
		this._listWindow.select(0);
	};

	Scene_QuestLog.prototype.onListCancel = function() {
		this._listWindow.deselect();
		this._categoryWindow.activate();
	};

	Scene_QuestLog.prototype.update = function() {
		Scene_MenuBase.prototype.update.call(this);
		if (this._cIndex !== this._categoryWindow.index())
		{
			this._cIndex = this._categoryWindow.index();
			switch (this._categoryWindow.index())
			{
				case 0:
				{
					this._listWindow._data = $gameSystem.getStartedQuests();
				} break;
				case 1:
				{
					this._listWindow._data = $gameSystem.getAllQuests();
				} break;
				case 2:
				{
					this._listWindow._data = $gameSystem.getCompletedQuests();
				} break;
				case 3:
				{
					this._listWindow._data = $gameSystem.getFailedQuests();
				} break;
			}
			this._listWindow.refresh();
		}
	};

	//--------------------------------------------------------------------------
	// Window_QuestLogCategory
	//
	// Shows icons for quest categories.
	
	function Window_QuestLogCategory() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_QuestLogCategory.prototype = Object.create(Window_Selectable.prototype);
	Window_QuestLogCategory.prototype.constructor = Window_QuestLogCategory;
	
	Window_QuestLogCategory.prototype.initialize = function(x, y, w, h) {
		Window_Selectable.prototype.initialize.call(this, x, y, w, h);
		this.refresh();
	};

	Window_QuestLogCategory.prototype.maxCols = function() {
	    return 4;
	};

	Window_QuestLogCategory.prototype.maxItems = function() {
	    return 4;
	};

	Window_QuestLogCategory.prototype.itemHeight = function() {
	    return Window_Base._iconHeight + 4;
	};

	Window_QuestLogCategory.prototype.itemWidth = function() {
	    return Window_Base._iconWidth + 4;
	};

	Window_QuestLogCategory.prototype.itemRect = function(index) {
	    var maxCols = this.maxCols();
	    var rect = new Rectangle();
	    rect.width = this.itemWidth();
	    rect.height = this.itemHeight();
	    var quarter = this.contentsWidth()/4; 
	    rect.x = (quarter*index) - Window_Base._iconWidth/2 + quarter/2;
	    rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY;
	    return rect;
	};

	Window_QuestLogCategory.prototype.drawItem = function(index) {
		var rect = this.itemRect(index);
		var icon = 0;
		switch (index)
		{
			case 0:
			{
				icon = paramOngoingQuestsIcon;
			} break;
			case 1:
			{
				icon = paramAllQuestsIcon;
			} break;
			case 2:
			{
				icon = paramCompletedQuestsIcon;
			} break;
			case 3:
			{
				icon = paramFailedQuestsIcon;
			} break;
		}
		this.drawIcon(icon, rect.x+2, rect.y+2);
	};

	//--------------------------------------------------------------------------
	// Window_QuestLogList
	//
	// Shows quests depending on category.
	
	function Window_QuestLogList() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_QuestLogList.prototype = Object.create(Window_Selectable.prototype);
	Window_QuestLogList.prototype.constructor = Window_QuestLogList;
	
	Window_QuestLogList.prototype.initialize = function(x, y, w, h) {
		Window_Selectable.prototype.initialize.call(this, x, y, w, h);
		this._data = $gameSystem.getStartedQuests();
		this.refresh();
	};

	Window_QuestLogList.prototype.maxItems = function() {
		return this._data ? this._data.length : 1;
	};

	Window_QuestLogList.prototype.drawItem = function(index) {
		var quest = $gameSystem.getQuest(this._data[index]);
		if (quest)
		{
			var rect = this.itemRectForText(index);
			var iconId = quest.iconId;
			var name = quest.name;
			this.drawIcon(iconId, rect.x, rect.y+1);
			if (quest.failed)
				this.changeTextColor(paramFailedColor);
			else if (quest.finished)
				this.changeTextColor(paramCompletedColor);
			else
				this.changeTextColor(paramStartedColor);
			this.drawText(name, rect.x+Window_Base._iconWidth, rect.y);
			this.resetTextColor();
		}
	};

	Window_QuestLogList.prototype.setDescriptionWindow = function(_window) {
		this._descriptionWindow = _window;
	};

	Window_QuestLogList.prototype.update = function() {
		Window_Selectable.prototype.update.call(this);
		this.updateDescription();
	};

	Window_QuestLogList.prototype.updateDescription = function() {
		if (!this._descriptionWindow)
			return;

		this._descriptionWindow.setQuest(this._data[this.index()]);
	};

	//--------------------------------------------------------------------------
	// Window_QuestLogDescription
	//
	// Shows quest's information.
	
	function Window_QuestLogDescription() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_QuestLogDescription.prototype = Object.create(Window_Base.prototype);
	Window_QuestLogDescription.prototype.constructor = Window_QuestLogDescription;
	
	Window_QuestLogDescription.prototype.initialize = function(x, y, w, h) {
		Window_Base.prototype.initialize.call(this, x, y, w, h);
	};
	
	Window_QuestLogDescription.prototype.refresh = function() {
		this.contents.clear();

		var quest = $gameSystem.getQuest(this._quest);
		if (!quest) 
			return;

		// Name
		var textWidth = this.textWidth(quest.name);
		var nameWidth = textWidth + Window_Base._iconWidth + 2;

		this.drawIcon(quest.iconId, this.contentsWidth()/2 - nameWidth/2, 0);
		this.drawText(quest.name, this.contentsWidth()/2 - nameWidth/2 + Window_Base._iconWidth + 2, 0);

		// Description
		
		this.changeTextColor(this.systemColor());
		this.drawText(paramDescriptionText, 0, this.lineHeight());
		this.resetTextColor();

		var x = 0;
		var y = this.lineHeight()*2;
		var tWidth = this.contentsWidth();
		var words = quest.description.split(" ");
		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			var width = this.textWidth(word);
			var sWidth = this.textWidth(" ");
			if (x + width >= tWidth) {
				x = 0;
				y += this.lineHeight();
			}
			this.drawText(word + " ", x, y);
			x += width + sWidth;
		}
		y += this.lineHeight()*2;

		// Objetive
		this.changeTextColor(this.systemColor());
		this.drawText(paramObjectiveText, 0, y);
		y += this.lineHeight();
		this.resetTextColor();
		if (quest.finished || quest.failed)
			this.drawText(paramNoObjectivesText, 0, y);
		else
			this.drawTextEx(quest.steps[quest.currentStep], 0, y);
		y += this.lineHeight()*2;

		// Rewards
		this.changeTextColor(this.systemColor());
		this.drawText(paramRewardsText, 0, y);
		y += this.lineHeight();
		this.resetTextColor();

		for (var i = 0; i < quest.rewards.length; i++) {
			switch (quest.rewards[i].Type)
			{
				case 'weapon':
				{
					var amount = quest.rewards[i].Amount;
					var txt = amount + "x";
					this.drawText(txt, 0, y);
					this.drawItemName($dataWeapons[quest.rewards[i].ID], this.textWidth(txt)+2, y);
				} break;
				case 'armor':
				{
					var amount = quest.rewards[i].Amount;
					var txt = amount + "x";
					this.drawText(txt, 0, y);
					this.drawItemName($dataArmors[quest.rewards[i].ID], this.textWidth(txt)+2, y);
				} break;
				case 'item':
				{
					var amount = quest.rewards[i].Amount;
					var txt = amount + "x";
					this.drawText(txt, 0, y);
					this.drawItemName($dataItems[quest.rewards[i].ID], this.textWidth(txt)+2, y);
				} break;
				case 'gold':
				{
					var amount = quest.rewards[i].Amount;
					this.drawIcon(paramGoldIcon, 2, y+1);
					this.drawText(amount, Window_Base._iconWidth + 4, y);
				} break;
				case 'exp':
				{
					var amount = quest.rewards[i].Amount;
					var id = quest.rewards[i].ID;
					if (id)
						this.drawText(amount + " " + TextManager.expA + " for " + $gameActors.actor(id).name(), 0, y);
					else
						this.drawText(amount + " " + TextManager.expA + " for each party member.", 0, y);
				} break;
				case 'text':
				{
					this.drawText(quest.rewards[i].Text, 0, y);
				} break;
			}
			y += this.lineHeight();
		}

	};

	Window_QuestLogDescription.prototype.setQuest = function(id) {
		if (this._quest === id)
			return;
		
		this._quest = id;
		this.refresh();
	};

	//--------------------------------------------------------------------------
	// QuestLog Command
	//
	
	var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
	Scene_Menu.prototype.createCommandWindow = function() {
		_Scene_Menu_createCommandWindow.call(this);
		this._commandWindow.setHandler('questlog', this.commandQuestLog.bind(this));
	};

	Scene_Menu.prototype.commandQuestLog = function() {
		SceneManager.push(Scene_QuestLog);
	};

	Window_MenuCommand.prototype.addOriginalCommands = function() {
		if (paramQuestLogMenu) {
			this.addCommand(paramQuestLogText, 'questlog', true);
		}
	};
})();
