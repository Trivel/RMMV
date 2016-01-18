//=============================================================================
// MrTS_Battler_BattleUI.js
//=============================================================================

/*:
* @plugindesc Shows Actor's portraits/battlers in battle.
* @author Mr. Trivel
* 
* @help 
* --------------------------------------------------------------------------------
* Free for commercial and non commercial use.
* Version 1.0
* --------------------------------------------------------------------------------
* --------------------------------------------------------------------------------
*  Actor Images
* --------------------------------------------------------------------------------
* Put actor images into img\system folder named "Actor#.png" where # is Actor's ID.
* Example: 
* Actor5.png
* Actor133.png
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_Battler_BattleUI');

	Window_BattleStatus.prototype.initialize = function() {
	    var width = this.windowWidth();
	    var height = this.windowHeight();
	    var x = Graphics.boxWidth - width;
	    var y = Graphics.boxHeight - height;
	    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
	    this.refresh();
	    this.openness = 0;
	    this.opacity = 0;
	    
	};

	Window_BattleStatus.prototype.windowWidth = function() {
	    return Graphics.boxWidth/4*this.maxItems()+this.standardPadding()*2;
	};

	Window_BattleStatus.prototype.windowHeight = function() {
	    return this.fittingHeight(4);
	};

	Window_BattleStatus.prototype.itemHeight = function() {
	    return this.contentsHeight();
	};

	Window_BattleStatus.prototype.updateCursor = function() {
	    if (this._cursorAll) {
	        var allRowsHeight = this.maxRows() * this.itemHeight();
	        this.setCursorRect(0, 0, this.contents.width, allRowsHeight);
	        this.setTopRow(0);
	    } else if (this.isCursorVisible()) {
	        var rect = this.itemRect2(this.index());
	        this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
	    } else {
	        this.setCursorRect(0, 0, 0, 0);
	    }
	};

	Window_Selectable.prototype.itemRect2 = function(index) {
	    var rect = new Rectangle();
	    var maxCols = this.maxCols();
	    rect.width = this.itemWidth();
	    rect.height = 36;
	    rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX + 10;
	    rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY + ($dataSystem.optDisplayTp ? 0 : this.lineHeight());
	    rect.width -= 20;
	    return rect;
	};

	Window_BattleStatus.prototype.numVisibleRows = function() {
	    return 1;
	};

	Window_BattleStatus.prototype.maxCols = function() {
	    return this.maxItems();
	};

	Window_BattleStatus.prototype.maxItems = function() {
	    return $gameParty.battleMembers().length;
	};

	Window_BattleStatus.prototype.drawItem = function(index) {
	    var actor = $gameParty.battleMembers()[index];
	    var rect = this.itemRect(index);
	    if (actor)
	    {
		    var x = rect.x;
		    var y = rect.y;
		    var width = rect.width - x - this.textPadding();
		    var lineHeight = this.lineHeight();
		    if (!$dataSystem.optDisplayTp) y += lineHeight;
		    this.drawActorName(actor, x+20, y);
		    this.drawActorHp(actor, x+15, y + lineHeight * 1, rect.width -30);
	    	this.drawActorMp(actor, x+15, y + lineHeight * 2, rect.width -30);
		    if ($dataSystem.optDisplayTp)
		    	this.drawActorTp(actor, x+15, y + lineHeight * 3, rect.width -30);
	    }
	};

	Window_Selectable.prototype.clearItem = function(index) {
	    var rect = this.itemRect(index);
	    this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
	};

	Scene_Battle.prototype.updateWindowPositions = function() {
	    var statusX = 0;
	    if (BattleManager.isInputting()) {
	    	var rect = this._statusWindow.itemRect(this._statusWindow.index());
	    	var x = this._statusWindow.x + this._statusWindow.standardPadding() + rect.x + rect.width/2 - this._actorCommandWindow.width/2;
	    	this._actorCommandWindow.x = x;
	    	this._actorCommandWindow.y = this._statusWindow.y - this._actorCommandWindow.height;
	    }
	};

	var _SceneBattle_createStatusWindow = Scene_Battle.prototype.createStatusWindow;
	Scene_Battle.prototype.createStatusWindow = function() {
		_SceneBattle_createStatusWindow.call(this);
	    this._statusWindow.x = Graphics.boxWidth/2 - this._statusWindow.width/2;
	};

	var _SceneBattle_createActorWindow = Scene_Battle.prototype.createActorWindow;
	Scene_Battle.prototype.createActorWindow = function() {
		_SceneBattle_createActorWindow.call(this);
	    this._actorWindow.x = Graphics.boxWidth/2 - this._actorWindow.width/2;
	};

	var _SceneBattle_createPartyCommandWindow = Scene_Battle.prototype.createPartyCommandWindow;
	Scene_Battle.prototype.createPartyCommandWindow = function() {
		_SceneBattle_createPartyCommandWindow.call(this);
		this._partyCommandWindow.x = Graphics.boxWidth/2 - this._partyCommandWindow.width/2;
		this._partyCommandWindow.y = Graphics.boxHeight/2 - this._partyCommandWindow.height/2;
	};

	var _SceneBattle_createEnemyWindow = Scene_Battle.prototype.createEnemyWindow;
	Scene_Battle.prototype.createEnemyWindow = function() {
		_SceneBattle_createEnemyWindow.call(this);
		this._enemyWindow.x = 0;
		this._enemyWindow.width = Graphics.boxWidth;
	};

	var _WindowBattleActor_Initialize = Window_BattleActor.prototype.initialize;
	Window_BattleActor.prototype.initialize = function(x, y) {
	    this._actorSprites = [];
	    this._actorSpritesFitted = [];
	    _WindowBattleActor_Initialize.call(this, x, y);
	    for (var i = 0; i < $gameParty.battleMembers().length; i++) {
	    	var spr = new Sprite();
	    	spr.bitmap = ImageManager.loadSystem("Actor"+$gameParty.battleMembers()[i].actorId());
	    	this._actorSpritesFitted.push(false);
	    	this._actorSprites.push(spr);
	    };
	    
	};

	var _WindowBattleActor_Update = Window_BattleActor.prototype.update;
	Window_BattleActor.prototype.update = function() {
		_WindowBattleActor_Update.call(this);
		if (this._actorSpritesFitted && this._actorSpritesFitted.contains(false))
		{
			for (var i = 0; i < this._actorSprites.length; i++) {
				if (this._actorSpritesFitted[i] === true) continue;
		    	var rect = this.itemRect2(i);

		    	this._actorSprites[i].x = rect.x + rect.width/2 - this._actorSprites[i].width/2;
		    	this._actorSprites[i].y = this.y + this.height - this._actorSprites[i].height;
		    	this._actorSprites[i].z = -10;
		    	this._actorSpritesFitted[i] = true;
		    	this.parent.parent._spriteset.addChild(this._actorSprites[i]);
			};
		}
	};
})();
