//=============================================================================
// MrTS_GlobalSavesData.js
//=============================================================================

/*:
* @plugindesc Allows player to set and change variables that affect all saves.
* @author Mr. Trivel
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial non-commercial projects.
* --------------------------------------------------------------------------------
* Version 1.0
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* GlobalVar Set [NAME] [VALUE] - Sets variable to [VALUE]
* GlobalVar Add [NAME] [VALUE] - Adds [VALUE] to variable
* GlobalVar Sub [NAME] [VALUE] - Subtracts [VALUE] from value
*
* [NAME] - Variable name, case sensitive
* [VALUE] - Value of variable a number or true/false
*
* Examples:
* GlobalVar Set Glasses true
* 
* GlobalVar Set GameCompleted 1
* GlobalVar Add GameCompleted 1
* GlobalVar Sub GameCompleted 2
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Script Calls - for use in switches, variables, branches and script calls
* --------------------------------------------------------------------------------
* DataManager.getGlobalVar(NAME) - returns global variable of NAME
*
* Example:
* DataManager.getGlobalVar(Glasses)
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
		if (command.toLowerCase() === "globalvar") {
			switch (args[0].toUpperCase())
			{
				case 'SET':
				{
					DataManager.setGlobalVar(args[1], eval(args[2]))
				} break;
				case 'ADD':
				{
					DataManager.addGlobalVar(args[1], Number(args[2]))
				} break;
				case 'SUB':
				{
					DataManager.setGlobalVar(args[1], Number(args[2]))
				} break;
				
			}
		}
	};

	//--------------------------------------------------------------------------
	// StorageManager
	// 

	var _StorageManager_localFilePath = StorageManager.localFilePath;
	StorageManager.localFilePath = function(key) {
	    if (key === 'globalsavedata') return this.localFileDirectoryPath() + 'globalSaveData.rpgsave';
	    else return _StorageManager_localFilePath.call(this, key);
	};

	var _StorageManager_webStorageKey = StorageManager.webStorageKey;
	StorageManager.webStorageKey = function(key) {
		if (key === 'globalsavedata') return 'RPG GlobalSaveData';
		else return _StorageManager_webStorageKey.call(this, key);
	};

	//--------------------------------------------------------------------------
	// DataManager
	// 

	var _DataManager_loadGameWithoutRescue = DataManager.loadGameWithoutRescue;
	DataManager.loadGameWithoutRescue = function(savefileId) {
		var success = _DataManager_loadGameWithoutRescue.call(this, savefileId);
	    if (success) this._globalSaveData = this.loadGlobalSaveData();
	    return success;
	};

	var _DataManager_setupNewgame = DataManager.setupNewGame;
	DataManager.setupNewGame = function() {
		_DataManager_setupNewgame.call(this);
		this._globalSaveData = this.loadGlobalSaveData();
	};

	DataManager.setGlobalVar = function(name, value) {
		this._globalSaveData[name] = value;
	};

	DataManager.addGlobalVar = function(name, value) {
		if (!this._globalSaveData[name]) this._globalSaveData[name] = 0;
		this._globalSaveData[name] += value;
	};

	DataManager.subGlobalVar = function(name, value) {
		this.addGlobalVar(name, -value);
	};

	DataManager.getGlobalVar = function(name) {
		if (!this._globalSaveData[name]) this._globalSaveData[name] = 0;
		return this._globalSaveData[name];
	};

	DataManager.loadGlobalSaveData = function() {
		var data = StorageManager.load('globalsavedata');
		if (data)
		{
			return JsonEx.parse(data);
		}
		else return {};
	};

	var _DataManager_saveGameWithoutRescue = DataManager.saveGameWithoutRescue;
	DataManager.saveGameWithoutRescue = function(savefileId) {
		var saved = _DataManager_saveGameWithoutRescue.call(this, savefileId);
		if (saved) {
			this.saveGlobalSaveData(this._globalSaveData);
		}
		return saved;
	};

	DataManager.saveGlobalSaveData = function(data) {
		StorageManager.save('globalsavedata', JSON.stringify(data));
	};
})();	
