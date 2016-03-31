//=============================================================================
// MrTS_MaxLevelRestriction.js
//=============================================================================

/*:
* @plugindesc Allows restricting and lifting actor, class and global max level.
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
* MaxLevel GlobalSet [LEVEL] - sets global max level restriction to [LEVEL]
* MaxLevel GlobalLift - removes global max level restriction
*
* MaxLevel ActorSet [LEVEL] [ID] - sets max level restriction to [ID] of actor
* MaxLevel ActorLift [ID] - removes actor max level restriction
*
* MaxLevel ClassSet [LEVEL] [ID] - sets max level restriction to [ID] of class
* MaxLevel ClassLift [ID] - removes class max level restriction
*
* [LEVEL] - what is the new max level
* [ID] - actor or class ID
*
* Examples:
* MaxLevel GlobalSet 10
* MaxLevel GlobalLift
*
* Maxlevel ActorSet 20 5
* Maxlevel ActorLift
*
* MaxLevel ClassSet 30 7
* Maxlevel ClassLift
*
* Priority:
* In case of multiple restrictions (default, global, actor, class) the lowest
* value one will be used.
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
		if (command.toLowerCase() === "maxlevel") {
			switch (args[0].toUpperCase())
			{
				case 'GLOBALSET':
				{
					$gameSystem.setGlobalMaxLevelRestriction(Number(args[1]));
				} break;
				case 'GLOBALLIFT':
				{
					$gameSystem.liftGlobalMaxLevelRestriction();
				} break;
				case 'ACTORSET':
				{
					$gameSystem.setActorMaxLevelRestriction(Number(args[1]), Number(args[2]));
				} break;
				case 'ACTORLIFT':
				{
					$gameSystem.liftActorMaxLevelRestriction(Number(args[1]));
				} break;
				case 'CLASSSET':
				{
					$gameSystem.setClassMaxLevelRestriction(Number(args[1]), Number(args[2]));
				} break;
				case 'CLASSLIFT':
				{
					$gameSystem.liftClassMaxLevelRestriction(Number(args[1]));
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
		this._maxLevelRestrictGlobal = -1;
		this._maxLevelRestrictActor = {};
		this._maxLevelRestrictClass = {};
	};

	Game_System.prototype.setGlobalMaxLevelRestriction = function(value) {
		this._maxLevelRestrictGlobal = value;
	};

	Game_System.prototype.liftGlobalMaxLevelRestriction = function() {
		this._maxLevelRestrictGlobal = -1;
	};

	Game_System.prototype.setActorMaxLevelRestriction = function(value, id) {
		this._maxLevelRestrictActor[id] = value;
	};

	Game_System.prototype.liftActorMaxLevelRestriction = function(id) {
		delete this._maxLevelRestrictActor[id];
	};

	Game_System.prototype.setClassMaxLevelRestriction = function(value, id) {
		this._maxLevelRestrictClass[id] = value;
	};

	Game_System.prototype.liftClassMaxLevelRestriction = function(id) {
		delete this._maxLevelRestrictClass[id];
	};

	Game_System.prototype.getGlobalMaxLevelRestriction = function() {
		return this._maxLevelRestrictGlobal;
	};

	Game_System.prototype.getActorMaxLevelRestriction = function(id) {
		return this._maxLevelRestrictActor[id];
	};

	Game_System.prototype.getClassMaxLevelRestriction = function(id) {
		return this._maxLevelRestrictClass[id];
	};

	//--------------------------------------------------------------------------
	// Game_Actor
	// 

	var _Game_Actor_maxlevel = Game_Actor.prototype.maxLevel;
	Game_Actor.prototype.maxLevel = function() {
		var aId = this.actorId();
		var cId = this._classId;
		var levelArray = [];
		
		var defaultLimit = _Game_Actor_maxlevel.call(this);
		var globalLimit = $gameSystem.getGlobalMaxLevelRestriction();
		var actorLimit = $gameSystem.getActorMaxLevelRestriction(aId);
		var classLimit = $gameSystem.getClassMaxLevelRestriction(cId);

		levelArray.push(defaultLimit);
		if (globalLimit > -1) levelArray.push(globalLimit);
		if (actorLimit) levelArray.push(actorLimit);
		if (classLimit) levelArray.push(classLimit);
	    return Math.min.apply(null, levelArray);
	};
})();
