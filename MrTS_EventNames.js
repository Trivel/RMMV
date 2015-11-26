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
* @help 
* --------------------------------------------------------------------------------
* Free for non commercial use.
* Version 1.0
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Event Note Fields
* --------------------------------------------------------------------------------
* <Name:NAME, RANGE>
* NAME - event name
* RANGE - how far player has to be to see the event name
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
	var parameters = PluginManager.parameters('MrTS_EventNames');

	var paramDefaultRange 	= Number(parameters['Default Range'] || 5);
	var paramFontSize		= Number(parameters['Font Size'] || 24);

	//-----------------------------------------------------------------------------
	// Game_Event
	// 

	var _GameEvent_initialize = Game_Event.prototype.initialize;
	Game_Event.prototype.initialize = function(mapId, eventId) {
		_GameEvent_initialize.call(this, mapId, eventId);
		if (this.event().meta.Name)
	    {
	        var nameMeta = this.event().meta.Name.split(",");
	        this._displayEventName = nameMeta[0];
	        this._displayEventRange = Number(nameMeta[1]) === 0 ? paramDefaultRange : Number(nameMeta[1]);
	        
	    }
	};

	//-----------------------------------------------------------------------------
	// Sprite_Character
	// 

	var _SpriteCharacter_initialize = Sprite_Character.prototype.initialize;
	Sprite_Character.prototype.initialize = function(character) {
		_SpriteCharacter_initialize.call(this, character);
	    if (character._displayEventName)
	    {
	        this._spriteEventName = new Sprite();
	        this._spriteEventName.bitmap = new Bitmap(200, 60);
	        this._spriteEventName.bitmap.fontSize = paramFontSize;
	        var nameWidth = this._spriteEventName.bitmap.measureTextWidth(character._displayEventName);
	        this._spriteEventName.bitmap = new Bitmap(nameWidth+40, paramFontSize+10);
	        this._spriteEventName.bitmap.fontSize = paramFontSize;
	        this._spriteEventName.bitmap.drawText(character._displayEventName, 0, 0, nameWidth+40, paramFontSize+10, 'center');
	        this.addChild(this._spriteEventName);
	    }
	    
	};

	var _SpriteCharacter_updatePosition = Sprite_Character.prototype.updatePosition;
	Sprite_Character.prototype.updatePosition = function() {
	    _SpriteCharacter_updatePosition.call(this);
	    if (this._spriteEventName) {
		    this._spriteEventName.x = -this._spriteEventName.width/2;
	        this._spriteEventName.y = -this._spriteEventName.height/2 - 12 - 48;
    		this._spriteEventName.z = 5;
    		if (this._character._displayEventRange < Math.abs(($gamePlayer.x - this._character.x)) + Math.abs(($gamePlayer.y - this._character.y)))
    		{
    			this._spriteEventName.visible = false;
    		}
    		else this._spriteEventName.visible = true;
	    }
	};

})();
