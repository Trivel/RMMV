//=============================================================================
// MrTS_SimpleSaveLoadMenu.js
//=============================================================================

/*:
* @plugindesc Shows faces instead of character sprites and adds 4 lines of things.
* @author Mr. Trivel
*
* @param Background Image
* @desc Background image name for saving and loading. Leave blank for default.
* Default: 
* @default 
*
* @param Select Text
* @desc Select savefile text.
* Default: Select Savefile
* @default Select Savelife
*
* @param Line 1
* @desc What to display in line 1? 'gold' 'time' 'variable [ID]' 'none'
* Default: time
* @default time
*
* @param Line 2
* @desc What to display in line 2? 'gold' 'time' 'variable [ID]' 'none'
* Default: gold
* @default gold
*
* @param Line 3
* @desc What to display in line 3? 'gold' 'time' 'variable [ID]' 'none'
* Default: none
* @default none
*
* @param Line 4
* @desc What to display in line 4? 'gold' 'time' 'variable [ID]' 'none'
* Default: variable 4
* @default variable 4
*
* @param Line 1 Icon
* @desc Which icon to display before Line 1?
* Default 220 
* @default 220
*
* @param Line 2 Icon
* @desc Which icon to display before Line 2?
* Default: 313
* @default 313
*
* @param Line 3 Icon
* @desc Which icon to display before Line 3?
* Default: 0
* @default 0
*
* @param Line 4 Icon
* @desc Which icon to display before Line 4?
* Default: 190
* @default 190
*
* @param Max Saves
* @desc Amount of Savefiles available.
* Default: 99
* @default 99
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial and for non-commercial projects.
* --------------------------------------------------------------------------------
* Version 1.0
* --------------------------------------------------------------------------------
*
* Everything is in plugin parameters.
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_SimpleSaveLoadMenu');

	var paramBackgroundImage = String(parameters['Background Image'] || "");
	var paramSelectText = String(parameters['Select Text'] || "Select Savefile");
	var paramLine1 = String(parameters['Line 1'] || "time");
	var paramLine2 = String(parameters['Line 2'] || "gold");
	var paramLine3 = String(parameters['Line 3'] || "none");
	var paramLine4 = String(parameters['Line 4'] || "variable 4");
	var paramLine1Icon = Number(parameters['Line 1 Icon'] || 220);
	var paramLine2Icon = Number(parameters['Line 2 Icon'] || 313);
	var paramLine3Icon = Number(parameters['Line 3 Icon'] || 0);
	var paramLine4Icon = Number(parameters['Line 4 Icon'] || 190);
	var paramLineIcons = [paramLine1Icon, paramLine2Icon, paramLine3Icon, paramLine4Icon];
	var paramMaxSaves = Number(parameters['Max Saves'] || 99);

	DataManager.maxSavefiles = function() {
	    return paramMaxSaves;
	};


	Scene_File.prototype.createBackground = function() {
	    this._backgroundSprite = new Sprite();
	    this._backgroundSprite.bitmap = paramBackgroundImage.length > 0 ? ImageManager.loadSystem(paramBackgroundImage) : SceneManager.backgroundBitmap();
	    this.addChild(this._backgroundSprite);
	};

	var _SceneFile_createListWindow = Scene_File.prototype.createListWindow;
	Scene_File.prototype.createListWindow = function() {
		_SceneFile_createListWindow.call(this);
		var rectH = this._listWindow.itemRect(0).height;
	    var y = this._helpWindow.height;
	    var occupiedSpace = this._listWindow.standardPadding() * 2 + y;
	    var possibleItems = Math.floor((Graphics.boxHeight-occupiedSpace)/rectH);
	    var height = possibleItems * rectH + this._listWindow.standardPadding() * 2;
	    var width = 816;
	    this._listWindow.width = width;
	    this._listWindow.height = height;
	    this._listWindow.refresh();
	    this._listWindow.y = y + (Graphics.boxHeight-y)/2 - height/2;
	    this._listWindow.x = Graphics.boxWidth/2 - width/2;

	    this.addWindow(this._listWindow);

	    this._helpWindow.width = width;
	    this._helpWindow.x = this._listWindow.x;
	    this._helpWindow.y = this._listWindow.y/2 - this._helpWindow.height/2;
	};

	Window_SavefileList.prototype.drawItem = function(index) {
	    var id = index + 1;
	    var valid = DataManager.isThisGameFile(id);
	    var info = DataManager.loadSavefileInfo(id);
	    var rect = this.itemRectForText(index);
	    this.resetTextColor();
	    if (this._mode === 'load') {
	        this.changePaintOpacity(valid);
	    }
	    if (info) {
	        this.changePaintOpacity(valid);
	        this.drawContents(info, rect, valid);
	        this.changePaintOpacity(true);
	    }
	};

	Window_SavefileList.prototype.drawContents = function(info, rect, valid) {
	    var bottom = rect.y + rect.height;
	    if (rect.width >= 420) {
	        if (valid) {
	            this.drawPartyCharacters(info, rect.x, rect.y);
	        }
	    }
	    var lineHeight = this.lineHeight();
	    var y2 = rect.y + this.padding/2;
	    for (var i = 0; i < paramLineIcons.length; i++) {
	    	this.drawLine(info, rect.x, y2, rect.width, i+1);
	    	y2 += lineHeight;
	    }
	};

	Window_SavefileList.prototype.drawPartyCharacters = function(info, x, y) {
	    if (info.characters) {
	        for (var i = 0; i < info.faces.length; i++) {
	            var data = info.faces[i];
	            this.drawFace(data[0], data[1], x + i * Window_Base._faceWidth, y+this.padding/2);
	        }
	    }
	};

	Window_SavefileList.prototype.drawLine = function(info, x, y, width, line) {
		var txt = info["line"+line];
		this.drawText(txt, x, y, width, 'right');
		this.drawIcon(paramLineIcons[line-1], x + width - this.textWidth(txt)-Window_Base._iconWidth-4, y);	
	};

	Window_SavefileList.prototype.itemHeight = function() {
	    return Window_Base._faceHeight + this.padding;
	};

	var _DataManager_makeSavefileInfo = DataManager.makeSavefileInfo;
	DataManager.makeSavefileInfo = function() {
		var info = _DataManager_makeSavefileInfo();
		var data = [paramLine1, paramLine2, paramLine3, paramLine4];
		var parsedData = [];
		for (var i = 0; i < data.length; i++) {
			switch (data[i].split(' ')[0])
			{
				case 'gold':
				{
					parsedData[i] = $gameParty.gold();
				} break;
				case 'time':
				{
					parsedData[i] = $gameSystem.playtimeText();
				} break;
				case 'variable':
				{
					parsedData[i] = $gameVariables.value(Number(data[i].split(' ')[1]));
				} break;
				default:
				{
					parsedData[i] = '';
				} break;
				
			}
		}
		info.line1 = parsedData[0];
		info.line2 = parsedData[1];
		info.line3 = parsedData[2];
		info.line4 = parsedData[3];
		console.log(info);
	    return info;
	};
})();
