//=============================================================================
// MrTS_LuminusStatus.js
//=============================================================================

/*:
* @plugindesc Luminus Status Screen. Changes how data is displayed there.
* @author Mr. Trivel
*
* @param Short Attack
* @desc Short text for Attack
* Default: ATK
* @default ATK
*
* @param Short Defense
* @desc Short text for Defense
* Default: DEF
* @default DEF
*
* @param Short MAttack
* @desc Short text for Magical Attack
* Default: MAT
* @default MAT
*
* @param Short MDefense
* @desc Short text for MDefense
* Default: MDF
* @default MDF
*
* @param Short Agility
* @desc Short text for Agility
* Default: AGI
* @default AGI
*
* @param Short Luck
* @desc Short text for Luck
* Default: LUK
* @default LUK
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
* Required Files
* --------------------------------------------------------------------------------
* "img\system\LuminusBackground.png" - At least as big as screen. Background.
* "img\system\LuminusStatus.png" - 348x539 - Background for stats and equipment.
* "img\system\LuminusBar.png" - 324x48 - background for equipment.
* "img\system\LuminusSeparator.png" - 327x9 - separator bar between blocks.
* "img\system\LuminusStatusName.png" - 264x70 - Status Scene name in top right.
* "img\system\LuminusActor#.png" - any preferred size. # - Actor ID
*    E.g. LuminusActor5.png would be actor's with ID 5 image.
* "img\system\LuminusBottomBar.png" - 40height, width - as big as screen.
*    Is at the very bottom of status screen. Can be used to display controls.
*
* 
* --------------------------------------------------------------------------------
* Map Tags
* --------------------------------------------------------------------------------
* <LuminusBackground: [FILENAME]>
* Luminus Status Scene background is set depending on the map you're in.
* If no tag set it uses default background - "LuminusBackground".
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {

	var parameters = PluginManager.parameters('MrTS_LuminusStatus');
	var paramATK  = String(parameters['Short Attack'] 	|| "ATK")
	var paramDEF  = String(parameters['Short Defense'] 	|| "DEF")
	var paramMATK = String(parameters['Short MAttack'] 	|| "MAT")
	var paramMDEF = String(parameters['Short MDefense'] || "MDF")
	var paramAGI  = String(parameters['Short Agility'] 	|| "AGI")
	var paramLUK  = String(parameters['Short Luck'] 	|| "LUK")

	Scene_Status.prototype.create = function() {
	    Scene_MenuBase.prototype.create.call(this);
	    this._statusWindow = new Window_Status();
	    this._statusWindow.setHandler('cancel',   this.popScene.bind(this));
	    this._statusWindow.setHandler('pagedown', this.nextActor.bind(this));
	    this._statusWindow.setHandler('pageup',   this.previousActor.bind(this));
	    this.addWindow(this._statusWindow);
	    this.refreshActor();
	};

	Scene_Status.prototype.createBackground = function() {
	    this._backgroundSprite = new Sprite();
	    if ($dataMap.meta.LuminusBackground)
	    {
	    	var fileName = String($dataMap.meta.LuminusBackground);
	    	if (fileName[0] == " ") fileName = fileName.substring(1);
	    	this._backgroundSprite.bitmap = ImageManager.loadSystem(fileName);
	    }
	    else
	    	this._backgroundSprite.bitmap = ImageManager.loadSystem("LuminusBackground");
	    this.addChild(this._backgroundSprite);

	    this._statusBackground = new Sprite();
	    this._statusBackground.bitmap = ImageManager.loadSystem("LuminusStatus");
	    this._statusBackground.x = 30;
	    this._statusBackground.y = Graphics.boxHeight/2 - 540/2;
	    this.addChild(this._statusBackground);

	    this._actorSprite = new Sprite()
	    this.addChild(this._actorSprite);

	    this._barSprites = [];
	    var equips = $gameActors.actor(1).equips();
	    for (var i = 0; i < equips.length; i++) {
	    	var sprite = new Sprite();
	    	sprite.bitmap = ImageManager.loadSystem("LuminusBar");
	    	sprite.x = this._statusBackground.x + 9;
	    	sprite.y = this._statusBackground.y + 250 + 48*i;
			this.addChild(sprite);
	    };

	    this._bottomBarSprite = new Sprite();
	    this._bottomBarSprite.bitmap = ImageManager.loadSystem("LuminusBottomBar");
	    this._bottomBarSprite.y = Graphics.boxHeight - 40;
	    this.addChild(this._bottomBarSprite);

	    this._statusName = new Sprite();
	    this._statusName.bitmap = ImageManager.loadSystem("LuminusStatusName");
	    var sprite = this._statusName;
	    sprite.bitmap.addLoadListener(function() {
	    	sprite.x = Graphics.width - sprite.width;
	    });
	    this.addChild(this._statusName);
	};

	Scene_Status.prototype.refreshActor = function() {
	    var actor = this.actor();
	    this._statusWindow.setActor(actor);
	    var actorSprite = this._actorSprite;
	    var statusSprite = this._statusBackground;
	    
	    actorSprite.bitmap = ImageManager.loadSystem("LuminusActor" + actor.actorId());
	    actorSprite.bitmap.addLoadListener(function() {
	    	var w = Graphics.boxWidth - statusSprite.x - statusSprite.width;
	    	var x = statusSprite.x + statusSprite.width;
	    	var y = Graphics.boxHeight - actorSprite.height;
	    	if (y < 0) y = 0;
	    	actorSprite.x = x + w/2 - actorSprite.width/2;
	    	actorSprite.y = y;
	    });
	};

	Window_Status.prototype.initialize = function() {
	    var width = Graphics.boxWidth;
	    var height = Graphics.boxHeight;
	    Window_Selectable.prototype.initialize.call(this, 0, 0, width, height);
	    this.refresh();
	    this.activate();
	    this.opacity = 0;
	};

	Window_Status.prototype.refresh = function() {
	    this.contents.clear();

	    var positions = [];
	    var x = 30 - this.standardPadding();

	    if (this._actor) {
	    	var actor = this._actor;
	        var lineHeight = this.lineHeight();
	        
	        var y = Graphics.boxHeight/2 - 540/2 - this.standardPadding() + 8;
	        var mw = 348/2;
	        this.drawText(TextManager.levelA, x + 9, y);
	        this.drawText(actor.level, x, y, mw - 6, 'right');
	        this.drawText(actor.name(), x + mw, y, mw, 'center');

	        y += lineHeight;
	        this.drawText(TextManager.exp, x + 9, y, mw - 6);
	        var exp = (actor.currentExp()-actor.currentLevelExp()) + "/" + (actor.nextLevelExp()-actor.currentLevelExp());
	        this.drawText(exp, x, y, mw*2-12, 'right');

	        y += lineHeight;
	        this.drawText(TextManager.hpA, x + 9, y);
	        var hp = actor.hp + "/" + actor.mhp;
	        var whp = this.textWidth(hp);
	        this.drawText(hp, x, y, mw - 6, 'right');
	        this.drawText(TextManager.mpA, x + mw + 6, y);
	        var mp = actor.mp + "/" + actor.mmp;
	        this.drawText(mp, mw, y, mw, 'right');

	        y += lineHeight;
	        positions.push(y)
	        
	        y += lineHeight/3;
	        var sw = mw  - this.textWidth(paramATK);
	        var swx = this.textWidth(paramATK);
	        this.drawText(paramATK, x + 9, y);
	        this.drawText(actor.atk, x + swx, y, sw, 'center');
	        this.drawText(paramDEF, x + mw + 6, y);
	        this.drawText(actor.def, mw + swx, y, sw, 'center');

	        y += lineHeight;
	        this.drawText(paramMATK, x + 9, y);
	        this.drawText(actor.mat, x + swx, y, sw, 'center');
	        this.drawText(paramMDEF, x + mw + 6, y);
	        this.drawText(actor.mdf, mw + swx, y, sw, 'center');

	        y += lineHeight;
	        this.drawText(paramAGI, x + 9, y);
	        this.drawText(actor.agi, x + swx, y, sw, 'center');
	        this.drawText(paramLUK, x + mw + 6, y);
	        this.drawText(actor.luk, mw + swx, y, sw, 'center');

	        y += lineHeight;
	        positions.push(y);

	        y += lineHeight/3+2;
	        var equips = this._actor.equips();
		    var count = Math.min(equips.length, this.maxEquipmentLines());
		    for (var i = 0; i < count; i++) {
		    	this.drawItemName(equips[i], x + 18, y + 48 * i + 6);
		    }
	    }

	    var bitmapSeparator = ImageManager.loadSystem("LuminusSeparator");
	    var c = this.contents;
	    bitmapSeparator.addLoadListener(function() {
	    	for (var i = 0; i < positions.length; i ++)
	    		c.blt(bitmapSeparator, 0, 0, bitmapSeparator.width, bitmapSeparator.height, x + 9, positions[i]);
	    });
	};

	Window_Status.prototype.drawVertLine = function(x) {
	    this.contents.paintOpacity = 48;
	    this.contents.fillRect(x, 0, 2, this.contentsHeight(), this.lineColor());
	    this.contents.paintOpacity = 255;
	};
})();
