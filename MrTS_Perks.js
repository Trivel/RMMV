//=============================================================================
// MrTS_Perks.js
//=============================================================================

/*:
* @plugindesc Allows actors to have perks which increase their stats or add something new.
* @author Mr. Trivel
*
* @param Points Per Level
* @desc How many perk points actors gets on level up?
* @default 1
*
* @param Points On Levels
* @desc Get perk points only on specific levels?
* 0 for all levels.
* @default 1 3 5 7 10 13 14 15 18 20 25 30 35 40 45 50 55 65 75 85 90 93 96 98 99
*
* @param Command Name
* @desc Name of Perks Command in menu.
* Default: Perks
* @default Perks
* 
* @help 
* --------------------------------------------------------------------------------
* Free for non commercial use.
* Version 1.0
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Actor Tags
* --------------------------------------------------------------------------------
* Creating perks:
* <perk>
* <name: [PERKNAME]>
* <requirements>
* level: [INT]
* atk: [INT]
* def: [INT]
* matk: [INT]
* mdef: [INT]
* agi: [INT]
* luk: [INT]
* perk: [NAME]
* switch: [ID] [ON/OFF]
* variable: [ID] [> >= < <= == !=] [VALUE]
* </requirements>
* <rewards>
* state: [ID]
* </rewards>
* <description>
* [TEXT]
* </description>
* </perk>
*
* Notes:
* Don't need to type out requirements you don't use.
* [TEXT] - Each line uses text wrap.
* Perk example:
* <perk>
* <name: Mana Circulation>
* <requirements>
* matk: 2
* </requirements>
* <rewards>
* state: 11
* </rewards>
* <description>
* You have amazing ability to circulate mana around you. Gaining increase mana regeneration and mana compatibility. The spirits you summon deal more damage.
* </description>
* </perk>
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* AddPerkPoints [POINTS] [ACTOR_ID] - Adds Perk Points to Actor
* E.g. AddPerkPoints 999 5
*
* ChangePerksCommand [TRUE/FALSE] - enable or disable perks command in menu
* E.g. ChangePerksCommand true
*
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_Perks');
	var paramPPPL = Number(parameters['Points Per Level'] || 1);
	var paramPPOL = String(parameters['Points On Levels'] || "1 3 5 7 10 13 14 15 18 20 25 30 35 40 45 50 55 65 75 85 90 93 96 98 99");
	var paramPPOLD = paramPPOL.split(" ");

	var paramName = String(parameters['Command Name'] || "Perks");

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 

	var _GameInterpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_GameInterpreter_pluginCommand.call(this, command, args);
		if (command === 'AddPerkPoints') {
			var points = Number(args[0]);
			var actorId = Number(args[1]);
			$gameActors.actor(actorId)._perkPoints += points;
		} else if (command === 'ChangePerksCommand') {
			var bool = (args[0].toLowerCase() === "true");
			$gameSystem.changePerksCommand(bool);
		}
	};

	//--------------------------------------------------------------------------
	// Game_Actor
	// 

	var _GameActor_initMembers = Game_Actor.prototype.initMembers;
	Game_Actor.prototype.initMembers = function() {
		_GameActor_initMembers.call(this);
		this._perkPoints = 0;
		this._perks = [];
		this._obtainedPerks = [];
	};

	var _GameActor_setup = Game_Actor.prototype.setup;
	Game_Actor.prototype.setup = function(actorId) {
		_GameActor_setup.call(this, actorId);
		this.initPerkPoints();
		this.initPerks();
	};

	Game_Actor.prototype.initPerkPoints = function() {
		for (var i = 0; i < paramPPOLD.length; i++) {
			if (Number(paramPPOLD[i]) <= this._level)
				this.addPerkPoint();
		};
	};

	Game_Actor.prototype.addPerkPoint = function() {
		this._perkPoints += paramPPPL;
	};

	Game_Actor.prototype.getPerkList = function() {
		return this._perks;
	};

	Game_Actor.prototype.getObtainedPerksList = function() {
		return this._obtainedPerks;
	};

	Game_Actor.prototype.getPerkPoints = function() {
		return this._perkPoints;
	};

	Game_Actor.prototype.isPerkObtained = function(id) {
		return this._obtainedPerks.contains(id);
	};

	Game_Actor.prototype.tryToObtainPerk = function(id) {
		if (this._perkPoints <= 0)
			return false;
		var perk = this._perks[id];
		var perkReqs = perk.requirements;

		for (var property in perkReqs)
		{
			if (perkReqs.hasOwnProperty(property))
			{

				switch (property)
				{
					case "ATK":
					{
						if (this.atk < perkReqs.ATK)
							return false;
					} break;
					case "DEF":
					{
						if (this.def < perkReqs.DEF)
							return false;
					} break;
					case "MATK":
					{
						if (this.matk < perkReqs.MATK)
							return false;
					} break;
					case "MDEF":
					{
						if (this.mdef < perkReqs.MDEF)
							return false;
					} break;
					case "AGI":
					{
						if (this.agi < perkReqs.AGI)
							return false;
					} break;
					case "LUK":
					{
						if (this.luk < perkReqs.LUK)
							return false;
					} break;
					case "LEVEL":
					{
						if (this._level < perkReqs.LEVEL)
							return false;
					} break;
					case "PERK":
					{
						var hasPerk = false;
						for (var i = 0; i < this._obtainedPerks.length; i++) {
							if (this._perks[this._obtainedPerks[i]].name === perkReqs.PERK)
								hasPerk = true;
						};
						if (!hasPerk)
							return false;
					} break;
					case "SWITCH":
					{
						var data = perkReqs.SWITCH.split(" ");
						var switchId = Number(data[0]);
						var switchState = data[1] === "ON" || false;

						if ($gameSwitches.value(switchId) !== switchState)
							return false;
					} break;
					case "VARIABLE":
					{
						var data = perkReqs.VARIABLE.split(" ");
						var varId = Number(data[0]);
						var sign = String(data[1]);
						var value = Number(data[2]);
						var varValue = $gameVariables.value(varId);
						var success = false;
						switch (sign)
						{
							case ">":
							{
								if (varValue > value)
									success = true;
							} break;
							case ">=":
							{
								if (varValue >= value)
									success = true;
							} break;
							case "<":
							{
								if (varValue < value)
									success = true;
							} break;
							case "<=":
							{
								if (varValue <= value)
									success = true;
							} break;
							case "==":
							{
								if (varValue === value)
									success = true;
							} break;
							case "!=":
							{
								if (varValue !== value)
									success = true;
							} break;
						}

						if (!success)
							return false;
					} break;
				}
			}
		}
		this._perkPoints--;
		this._obtainedPerks.push(id);
		return true;
	};

	Game_Actor.prototype.initPerks = function() {
		var perkStartRegex = /<perk>/i;
		var perkEndRegex = /<\/perk>/i
		var nameRegex = /<name:[ ]*(.+)>/i
		var reqStartRegex = /<requirements>/i;
		var reqEndRegex = /<\/requirements>/i;
		var dataRegex = /[a-zA-Z]*[:][ ]*(.*)/i;
		var rewardsStartRegex = /<rewards>/i;
		var rewardsEndRegex = /<\/rewards/i;
		var descStartRegex = /<description>/i;
		var descEndRegex = /<\/description/i;

		var perkFound = false;
		var reqFound = false;
		var rewardsFound = false;
		var descFound = false;

		var perk = {};

		var note = this.actor().note.split(/[\r\n]/);

		for (var i = 0; i < note.length; i++) {

			// <Perk>
			if (!perkFound)
			{
				var perkMatch = perkStartRegex.exec(note[i]);
				if (perkMatch)
				{
					perk = {};
					perk.requirements = {};
					perk.rewards = {};
					perk.name = "";

					perkFound = true;
					this._perks.push(perk);
				}
			} 
			else if (perkFound) 
			{
				var perkEndMatch = perkEndRegex.exec(note[i]);
				if (perkEndMatch)
				{
					perkFound = false;
					reqFound = false;
					rewardsFound = false;
					descFound = false;
				}
			}

			// <Requirements>
			if (!reqFound)
			{
				var reqMatch = reqStartRegex.exec(note[i]);
				if (reqMatch)
					reqFound = true;
			} 
			else if (reqFound) 
			{
				var reqEndMatch = reqEndRegex.exec(note[i]);
				if (reqEndMatch)
					reqFound = false;
			}

			// <Rewards>
			if (!rewardsFound)
			{
				var rewardsMatch = rewardsStartRegex.exec(note[i]);
				if (rewardsMatch)
					rewardsFound = true;
			}
			else if (rewardsFound)
			{
				var rewardsEndMatch = rewardsEndRegex.exec(note[i]);
				if (rewardsEndMatch)
					rewardsFound = false;
			}

			// <Description>
			if (!descFound)
			{
				var descMatch = descStartRegex.exec(note[i]);
				if (descMatch){
					descFound = true;
					perk.description = [];
				}
			}
			else if (descFound)
			{
				var descEndMatch = descEndRegex.exec(note[i]);
				if (descEndMatch)
					descFound = false;

				if (descFound)
					perk.description.push(note[i]);
			}

			// <Name>
			var nameMatch = nameRegex.exec(note[i]);
			if (nameMatch)
				perk.name = nameMatch[1];

			// Requirements Data
			if (reqFound)
			{
				var reqDataMatch = dataRegex.exec(note[i]);
				if (!reqDataMatch) continue;

				switch(reqDataMatch[0].toUpperCase().split(":")[0])
				{
					case "LEVEL":
					{
						perk.requirements.LEVEL = Number(reqDataMatch[1]);
					} break;
					case "ATK":
					{
						perk.requirements.ATK = Number(reqDataMatch[1]);
					} break;
					case "DEF":
					{
						perk.requirements.DEF = Number(reqDataMatch[1]);
					} break;
					case "MATK":
					{
						perk.requirements.MATK = Number(reqDataMatch[1]);
					} break;
					case "MDEF":
					{
						perk.requirements.MDEF = Number(reqDataMatch[1]);
					} break;
					case "AGI":
					{
						perk.requirements.AGI = Number(reqDataMatch[1]);
					} break;
					case "LUK":
					{
						perk.requirements.LUK = Number(reqDataMatch[1]);
					} break;
					case "PERK":
					{
						perk.requirements.PERK = String(reqDataMatch[1]);
					} break;
					case "SWITCH":
					{
						perk.requirements.SWITCH = String(reqDataMatch[1]).toUpperCase();
					} break;
					case "VARIABLE":
					{
						perk.requirements.VARIABLE = String(reqDataMatch[1]);
					} break;
				}
			} 
			// Rewards Data
			else if (rewardsFound)
			{
				var rewardsDataMatch = dataRegex.exec(note[i]);
				if (!rewardsDataMatch) continue;

				switch(rewardsDataMatch[0].toUpperCase().split(":")[0])
				{
					case "STATE":
					{
						perk.rewards.STATE = Number(rewardsDataMatch[1]);
					} break;
					case "COMMONEVENT":
					{
						perk.rewards.COMMONEVENT = Number(rewardsDataMatch[1]);
					} break;
				}
			}
		};
	};

	var _GameActor_traitObjects = Game_Actor.prototype.traitObjects;
	Game_Actor.prototype.traitObjects = function() {
		var objects = _GameActor_traitObjects.call(this);
		for (var i = 0; i < this._obtainedPerks.length; i++) {
			if (this._perks[this._obtainedPerks[i]].rewards.STATE)
				objects.push($dataStates[this._perks[this._obtainedPerks[i]].rewards.STATE]);
		};
		return objects;
	};

	//--------------------------------------------------------------------------
	// Scene_Menu
	// 

	var _SceneMenu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
	Scene_Menu.prototype.createCommandWindow = function() {
		_SceneMenu_createCommandWindow.call(this);
		this._commandWindow.setHandler('perks',		this.commandPersonal.bind(this));
	};

	Window_MenuCommand.prototype.addOriginalCommands = function() {
		this.addCommand(paramName, 'perks', $gameSystem.isPerksCommandEnabled());
	};

	var _SceneMenu_onPersonalOk = Scene_Menu.prototype.onPersonalOk;
	Scene_Menu.prototype.onPersonalOk = function() {
		_SceneMenu_onPersonalOk.call(this);
		if (this._commandWindow.currentSymbol() === 'perks')
			SceneManager.push(Scene_Perks);
	};

	//--------------------------------------------------------------------------
	// Scene_Perks
	//
	// Perks Scene where player can activate perks for perk points.
	
	function Scene_Perks() {
		this.initialize.apply(this, arguments);	
	};
	
	Scene_Perks.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_Perks.prototype.constructor = Scene_Perks;
	
	Scene_Perks.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	};
	
	Scene_Perks.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createMainWindow();
		this.createPerkWindow();
		this.createPerkInfoWindow();
		this.onActorChange();
	};

	Scene_Perks.prototype.createMainWindow = function() {
		this._windowDummy = new Window_MainPerks();
		this.addWindow(this._windowDummy);
	};

	Scene_Perks.prototype.createPerkWindow = function() {
		this._windowCommand = new Window_SelectPerks();
		this._windowCommand.setHandler('ok',	 	this.onPerkOk.bind(this));
		this._windowCommand.setHandler('cancel', 	this.popScene.bind(this));
	    this._windowCommand.setHandler('pagedown', 	this.nextActor.bind(this));
	    this._windowCommand.setHandler('pageup',	this.previousActor.bind(this));
		this.addWindow(this._windowCommand);
	};

	Scene_Perks.prototype.createPerkInfoWindow = function() {
		this._windowInfo = new Window_InfoPerks();
		this.addWindow(this._windowInfo);
		this._windowCommand.setHelpWindow(this._windowInfo);
	};

	Scene_Perks.prototype.onActorChange = function() {
		this._windowCommand.setActor(this._actor);
		this._windowCommand.activate();
		this._windowCommand.select(0);
	};

	Scene_Perks.prototype.onPerkOk = function() {
	};

	//--------------------------------------------------------------------------
	// Window_MainPerks
	//
	// Just a dummy window to take up space.
	
	function Window_MainPerks() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_MainPerks.prototype = Object.create(Window_Base.prototype);
	Window_MainPerks.prototype.constructor = Window_MainPerks;
	
	Window_MainPerks.prototype.initialize = function() {
		var ww = Graphics.boxWidth >= 816 ? 816 : Graphics.boxWidth;
		var wh = Graphics.boxHeight >= 624 ? 624 : Graphics.boxHeight;
		var wx = Graphics.boxWidth/2 - ww/2;
		var wy = Graphics.boxHeight/2 - wh/2;
		Window_Base.prototype.initialize.call(this, wx, wy, ww, wh);
	};

	//--------------------------------------------------------------------------
	// Window_SelectPerks
	//
	// Window where player can select and buy perks.
	
	function Window_SelectPerks() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_SelectPerks.prototype = Object.create(Window_Selectable.prototype);
	Window_SelectPerks.prototype.constructor = Window_SelectPerks;
	
	Window_SelectPerks.prototype.initialize = function() {
		var ww = Graphics.boxWidth >= 816 ? 816 : Graphics.boxWidth;
		var wh = Graphics.boxHeight >= 624 ? 624 : Graphics.boxHeight;
		var wx = Graphics.boxWidth/2 - ww/2;
		var wy = Graphics.boxHeight/2 - wh/2;
		Window_Selectable.prototype.initialize.call(this, wx, wy, ww/2.5, wh);
		this._actor = null;
		this.refresh();
	};

	Window_SelectPerks.prototype.maxItems = function() {
		return this._actor ? this._actor.getPerkList().length : 0;
	};

	Window_SelectPerks.prototype.item = function() {
		var index = this.index();
		return this._actor ? this._actor.getPerkList()[index] : null;
	};

	Window_SelectPerks.prototype.drawItem = function(index) {
		var item = this._actor.getPerkList()[index];
		if (item) {
			var rect = this.itemRectForText(index);
			this.changePaintOpacity(this._actor.isPerkObtained(index));
			this.drawText(item.name, rect.x+5, rect.y, rect.width);
		}
	};

	Window_SelectPerks.prototype.setActor = function(actor) {
		this._actor = actor;
		this.refresh();
	};

	Window_SelectPerks.prototype.updateHelp = function() {
	    this._helpWindow.setActor(this._actor);
	    this._helpWindow.setItem(this.item());
	};

	Window_SelectPerks.prototype.isCurrentItemEnabled = function() {
	    return !this._actor.isPerkObtained(this.index());
	};

	Window_SelectPerks.prototype.processOk = function() {
	    if (this.isCurrentItemEnabled() && this._actor.tryToObtainPerk(this.index())) {
	        this.playOkSound();
	        this.updateInputData();
	        this.redrawCurrentItem();
	        this.updateHelp();
	        this.callOkHandler();
	    } else {
	        this.playBuzzerSound();
	    }
	};

	//--------------------------------------------------------------------------
	// Window_InfoPerks
	//
	// Window that shows perk info.
	
	function Window_InfoPerks() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_InfoPerks.prototype = Object.create(Window_Base.prototype);
	Window_InfoPerks.prototype.constructor = Window_InfoPerks;
	
	Window_InfoPerks.prototype.initialize = function() {
		var ww = Graphics.boxWidth >= 816 ? 816 : Graphics.boxWidth;
		var wh = Graphics.boxHeight >= 624 ? 624 : Graphics.boxHeight;
		var wx = Graphics.boxWidth/2 - ww/2;
		var wy = Graphics.boxHeight/2 - wh/2;
		this._currentPerk = null;
		this._actor = null;
		Window_Base.prototype.initialize.call(this, wx+ww/2.5, wy, 816-ww/2.5, wh);
	};

	Window_InfoPerks.prototype.setItem = function(perk) {
		this._currentPerk = perk;
		this.refresh();
	};
	
	Window_InfoPerks.prototype.refresh = function() {
		this.contents.clear();
		if (!this._currentPerk) return;

		this.drawActorInfo();
		this.drawPerkInfo();
		this.drawPointCount();
	};

	Window_InfoPerks.prototype.drawPointCount = function() {
		var y = this.contentsHeight() - this.lineHeight()*2;
		this.drawHorzLine(y);
		y += this.lineHeight();
		this.drawText("Perk Points: " + this._actor.getPerkPoints(), 0, y);
	};

	Window_InfoPerks.prototype.drawPerkDescription = function(y) {
		var description = this._currentPerk.description;
		var tempText = [];
		for (var i = 0; i < description.length; i++) {
			tempText.push([""]);
			var text = tempText[i];

			var brokenText = description[i].split(" ");
			for (var j = 0; j < brokenText.length; j++) {
				var txtWidth = this.textWidth(text[text.length-1] + brokenText[j]);
				if (txtWidth >= this.contentsWidth())
					text.push([""]);

				text[text.length-1] += brokenText[j] + " ";
			}
		};

		for (var i = 0; i < tempText.length; i++) {
			for (var j = 0; j < tempText[i].length; j++) {
				y += this.lineHeight();
				this.drawText(tempText[i][j], 0, y);
			};
		};
	};

	Window_InfoPerks.prototype.drawPerkInfo = function() {
		var lineHeight = this.lineHeight();
		var perk = this._currentPerk;
		var y = lineHeight*5;

		var reqText = ["Req: "];
		var level = 0;
		var special = false;
		var tempText = [];
		for (var property in perk.requirements)
		{
			if (perk.requirements.hasOwnProperty(property))
			{
				switch (property)
				{
					case "LEVEL":
					{
						level = perk.requirements.LEVEL;
					} break;
					case "SWITCH":
					{
						special = true;
					} break;
					case "VARIABLE":
					{
						special = true;
					} break;
					case "PERK":
					{
						tempText.push(perk.requirements.PERK);
					} break;
					default:
					{
						tempText.push(String(property) + " " + perk.requirements[property]);
					} break;
				}
			}
		}

		if (level > 0)
		{
			var comma = (tempText.length > 0 || special) ? ", " : "";
			reqText[0] += "Level " + level + comma;
		}

		if (special)
			tempText.push("Secret");

		for (var i = 0; i < tempText.length; i++) {
			var comma = tempText.length-1 !== i ? ", " : "";
			var txtWidth = this.textWidth(reqText[reqText.length-1]+tempText[i]+comma);
			if (txtWidth >= this.contentsWidth())
				reqText.push("");

			reqText[reqText.length-1] += tempText[i] + comma;
		};

		for (var i = 0; i < reqText.length; i++) {
			this.drawText(reqText[i], 0, y);
			y += lineHeight;
		};

		this.drawHorzLine(y);
		this.drawPerkDescription(y);
	};

	Window_InfoPerks.prototype.drawActorInfo = function() {
		var lineHeight = this.lineHeight();
		var actor = this._actor;
		
		this.drawActorFace(actor, 0, 0);
		this.drawActorName(actor, 220, 0);
		this.drawActorClass(actor, 220, lineHeight);
		this.drawActorLevel(actor, 400, 0);
		this.drawActorHp(actor, 220, lineHeight*2, this.contentsWidth()-220);
		this.drawActorMp(actor, 220, lineHeight*3, this.contentsWidth()-220);
		this.drawHorzLine(lineHeight*4);
	};

	Window_InfoPerks.prototype.setActor = function(actor) {
		this._actor = actor;
	};

	Window_InfoPerks.prototype.drawHorzLine = function(y) {
	    var lineY = y + this.lineHeight() / 2 - 1;
	    this.contents.paintOpacity = 48;
	    this.contents.fillRect(0, lineY, this.contentsWidth(), 2, this.lineColor());
	    this.contents.paintOpacity = 255;
	};

	Window_InfoPerks.prototype.lineColor = function() {
	    return this.normalColor();
	};

	//--------------------------------------------------------------------------
	// Game_System
	// 

	var _GameSystem_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_GameSystem_initialize.call(this);
		this._isPerksCommandEnabled = true;
	};

	Game_System.prototype.isPerksCommandEnabled = function() {
		return this._isPerksCommandEnabled || false;
	};

	Game_System.prototype.changePerksCommand = function(bool) {
		this._isPerksCommandEnabled = bool;
	};
})();
