//=============================================================================
// MrTS_ProgressTitleScreen.js
//=============================================================================

/*:
* @plugindesc Changes title screen picture according to game progress.
* @author Mr. Trivel
*
* @param Image List
* @desc Title screen image list. 
* (no space after ,)
* @default Book,Castle,Crystal,Sword,Volcano
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
* Infor
* --------------------------------------------------------------------------------
* Save file with highest TitleScreen value will be used to display title screen.
* 
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* 	TitleScreen [PROGRESS]
* E.g.: TitleScreen 3
* That would set TitleScreen to 3rd item on the Image List. Using defaults it'd be
* Crystal.
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {

	//-----------------------------------------------------------------------------
	// Parameters
	// 
	
	var parameters = PluginManager.parameters('MrTS_ProgressTitleScreen');
	var paramTitleList = String(parameters['Image List'] || "Book,Castle,Crystal,Sword,Volcano");
	var paramImageList = paramTitleList.split(",");

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command === 'TitleScreen') {
			$gameSystem.setTitleScreenProgressTo(Number(args[0]));
		}
	};

	//--------------------------------------------------------------------------
	// Game_System
	// 

	Game_System.prototype.setTitleScreenProgressTo = function(progress) {
		this._titleProgress = progress;
	};

	Game_System.prototype.getTitleScreenProgress = function() {
		return this._titleProgress;
	};

	//--------------------------------------------------------------------------
	// DataManager
	// 

	var _DataManager_makeSavefileInfo = DataManager.makeSavefileInfo;
	DataManager.makeSavefileInfo = function() {
		var info = _DataManager_makeSavefileInfo.call(this);
	    info.titleProgress = $gameSystem.getTitleScreenProgress();
	    return info;
	};

	DataManager.highestTitleProgress = function() {
		var progress = 0;
	    var globalInfo = this.loadGlobalInfo();
	    if (globalInfo) {
	        for (var i = 1; i < globalInfo.length; i++) {
	            if (this.isThisGameFile(i)) {
	            	if (globalInfo[i].titleProgress && globalInfo[i].titleProgress > progress) 
	            		progress = globalInfo[i].titleProgress;
	            }
	        }
	    }
	    return progress;
	};

	//--------------------------------------------------------------------------
	// Scene_Title
	// 

	Scene_Title.prototype.createBackground = function() {
	    var progress = DataManager.highestTitleProgress();
		if (progress > 0)
			this._backSprite1 = new Sprite(ImageManager.loadTitle1(paramImageList[progress-1]));
		else
			this._backSprite1 = new Sprite(ImageManager.loadTitle1($dataSystem.title1Name));
	    this._backSprite2 = new Sprite(ImageManager.loadTitle2($dataSystem.title2Name));
	    this.addChild(this._backSprite1);
	    this.addChild(this._backSprite2);
	};
})();
