//=============================================================================
// MrTS_EventNames.js
//=============================================================================

/*:
* @plugindesc Allows events to show their names above them.
* @author Mr. Trivel
*
* @param Default Range
* @desc How close player has to be to see event's name in tiles.
* Default: 5
* @default 5
*
* @param Font Size
* @desc Font size for event's name.
* Default: 24
* @default 24
*
* @param Fade
* @desc Should event names/pictures/icons have a fade effect? True/False
* Default: True
* @default True
*
* @param Fade Timer
* @desc How quickly should fade happen? In frames. 60 = 1s
* Default: 30
* @default 30
* 
* @help 
* --------------------------------------------------------------------------------
* Free for non commercial use.
* Version 1.5
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Event Comment Commands or Event Note Field
* --------------------------------------------------------------------------------
* - If tag is in comment, it'll display according to event's page.
* Use "Comment..." command under Flow Control for those tags.
* 
* - If tag is in Event Note Field, it'll be permanent there no matter the page.
*
* <Name: NAME, RANGE>
* NAME - Event Name
* RANGE - How close player has to be to see the event name above it.
*
* <Picture: NAME, RANGE>
* NAME - Picture Name (Picture located in img\system)
* RANGE - How close player has to be to see the event's picture above it.
*
* <Icon: ID, RANGE>
* ID - Icon Index (You can check that in database when selecting icons)
* RANGE - How close player has to be to see the event's icon above it.
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.5 - Added Icon drawing, cleaned up the code.
* 1.4 - Added Fade in and Fade out effects for event names and pictures.
*     - Fixed layering of pictures and names. They're properly above now.
* 1.3 - Crash fix
* 1.2 - Bug fix
* 1.1 - Added Pictures above event heads.
*       Added Picture and Names changing when event switches pages.
* 1.0 - Release
*/

(function() {

	//-----------------------------------------------------------------------------
	// Parameters
	// 
	var parameters = PluginManager.parameters('MrTS_EventNames');

	var paramDefaultRange 	= Number(parameters['Default Range'] || 5);
	var paramFontSize		= Number(parameters['Font Size'] || 24);
	var paramFade		= Boolean(parameters['Fade'] && parameters['Fade'].toLowerCase() !== "false" || true);
	var paramFadeTimer		= Number(parameters['Fade Timer'] || 30);

	var regexEventName = /<(name):[ ]*(.*),[ ]*(\d+)>/i;
	var regexPictureName = /<(picture):[ ]*(.*),[ ]*(\d+)>/i;
	var regexIconName = /<(icon):[ ]*(.*),[ ]*(\d+)>/i

	//-----------------------------------------------------------------------------
	// Game_Event
	// 

	var _GameEvent_initialize = Game_Event.prototype.initialize;
	Game_Event.prototype.initialize = function(mapId, eventId) {
		_GameEvent_initialize.call(this, mapId, eventId);
	    var meta = this.event().meta;
	    this._displayOverheadType = null;
	    var nameMeta = null;
	    if (meta.Icon) { 
	    	this._displayOverheadType = "icon" 
	    	nameMeta = meta.Icon.split(","); 
	    }
	    else if (meta.Picture) { 
	    	this._displayOverheadType = "picture" 
	    	nameMeta = meta.Picture.split(","); 
	    }
	    else if (meta.Name) { 
	    	this._displayOverheadType = "name" 
	    	nameMeta = meta.Name.split(","); 
	    }
	    if (nameMeta)
	    {
	    	if (nameMeta[0][0] == " ") nameMeta[0] = nameMeta[0].substring(1);
	    	this._displayOverheadName = nameMeta[0];
	    	this._displayOverheadRange = Number(nameMeta[1]) === 0 ? paramDefaultRange : Number(nameMeta[1]);	    	
	    }
	    this.updateOverheadData();
	};

	Game_Event.prototype.updateOverheadData = function() {
		this._overheadPageIndex = this._pageIndex;
		if (!this.page() || this.event().meta.Name || this.event().meta.Picture || this.event().meta.Icon) return;

		var overheadType = null;
		var overheadName = "";
		var overheadRange = 0;

		if (this.list())
	    {
	    	for (action of this.list())
	    	{
	    		if (action.code == "108") {
	    			var a = action.parameters[0];
	    			var match = regexEventName.exec(a);
	    			if (!match) match = regexPictureName.exec(a);
	    			if (!match) match = regexIconName.exec(a);
	    			if (match)
	    			{
	    				overheadType = match[1].toLowerCase();
	    				overheadName = match[2];
	    				overheadRange = Number(match[3]);
	    			} 
	    		} 
	    	}
	    }
	    this._displayOverheadType = overheadType;
	    this._displayOverheadName = overheadName;
	    this._displayOverheadRange = overheadRange;
	};

	var _GameEvent_update = Game_Event.prototype.update;
	Game_Event.prototype.update = function()
	{
	    _GameEvent_update.call(this);
	    if (this._pageIndex != this._overheadPageIndex)
	    	this.updateOverheadData();
	};

	//-----------------------------------------------------------------------------
	// Sprite_Character
	// 

	var _SpriteCharacter_initialize = Sprite_Character.prototype.initialize;
	Sprite_Character.prototype.initialize = function(character) {
		_SpriteCharacter_initialize.call(this, character);

    	this._npAdded = false;
	};

	Sprite_Character.prototype.updateOverhead = function() {
		this._currentOverheadType = this._character._displayOverheadType;
		this._currentOverheadName = this._character._displayOverheadName;
		this._currentOverheadRange = this._character._displayOverheadRange;
		if(!this._currentOverheadType)
			this.removeOverhead()
		else
		{
			switch (this._currentOverheadType)
			{
				case "name":
				{
					this._spriteOverhead.bitmap = new Bitmap(200, 60);
			        this._spriteOverhead.bitmap.fontSize = paramFontSize;
			        var nameWidth = this._spriteOverhead.bitmap.measureTextWidth(this._currentOverheadName);
			        this._spriteOverhead.bitmap = new Bitmap(nameWidth+40, paramFontSize+10);
			        this._spriteOverhead.bitmap.fontSize = paramFontSize;
			        this._spriteOverhead.bitmap.drawText(this._currentOverheadName, 0, 0, nameWidth+40, paramFontSize+10, 'center');
				} break;
				case "picture":
				{
					this._spriteOverhead.bitmap = ImageManager.loadSystem(this._currentOverheadName);
				} break;
				case "icon":
				{
					var icons = ImageManager.loadSystem('IconSet');
					var index = Number(this._currentOverheadName);
				    var pw = Window_Base._iconWidth;
				    var ph = Window_Base._iconHeight;
				    var sx = index % 16 * pw;
				    var sy = Math.floor(index / 16) * ph;
					this._spriteOverhead.bitmap = new Bitmap(pw, ph);
					this._spriteOverhead.bitmap.blt(icons, sx, sy, pw, ph, 0, 0);
				} break;
			}
		}
	};

	Sprite_Character.prototype.removeOverhead = function() {
		if (this._spriteOverhead.bitmap) this._spriteOverhead.bitmap.clear();
	};

	var _SpriteCharacter_update = Sprite_Character.prototype.update;
	Sprite_Character.prototype.update = function() {
		_SpriteCharacter_update.call(this);
		this.updateOverheadData();
		this.updateOverheadPosition();
	};

	Sprite_Character.prototype.updateOverheadPosition = function() {
	    if (this._spriteOverhead) {
		    this._spriteOverhead.x = this.x -this._spriteOverhead.width/2;
		    this._spriteOverhead.y = this.y -this._spriteOverhead.height/2 - 12 - this._frame.height;
    		if (this._character._displayOverheadRange < Math.abs(($gamePlayer.x - this._character.x)) + Math.abs(($gamePlayer.y - this._character.y)))
    		{
    			if (paramFade)
    			{
	    			if (this._spriteOverhead.opacity !== 0)
	    			{
	    				this._spriteOverhead.opacity -= 255/paramFadeTimer;
	    				if (this._spriteOverhead.opacity < 0) this._spriteOverhead.opacity = 0;
	    			}
	    		}
	    		else this._spriteOverhead.visible = false;
    		}
    		else {
    			if (paramFade)
    			{
	    			if (this._spriteOverhead.opacity !== 255)
	    			{
	    				this._spriteOverhead.opacity += 255/paramFadeTimer;
	    				if (this._spriteOverhead.opacity > 255) this._spriteOverhead.opacity = 255;
	    			}
	    		}
	    		else this._spriteOverhead.visible = true;
    		}
	    }
	};

	Sprite_Character.prototype.updateOverheadData = function() {
		if (!this._npAdded)
		{
			this._npAdded = true;
			this._spriteOverhead = new Sprite();

	    	this._spriteOverhead.z = 7;

	        this.updateOverhead();
	        this.parent.addChild(this._spriteOverhead);
		}

		if ((this._character._displayOverheadType && this._character._displayOverheadType != this._currentOverheadType) || 
			(this._character._displayOverheadName && this._character._displayOverheadName != this._currentOverheadName) || 
			(this._character._displayOverheadRange && this._character._displayOverheadRange != this._currentOverheadRange))
			this.updateOverhead();
	};
		

})();
