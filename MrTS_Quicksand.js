//=============================================================================
// MrTS_Quicksand.js
//=============================================================================

/*:
* @plugindesc Allows types of regions that sink characters in.
* @author Mr. Trivel
* 
* @help 
* --------------------------------------------------------------------------------
* Free for non commercial use.
* Version 1.0
* --------------------------------------------------------------------------------
** 
* --------------------------------------------------------------------------------
* Map Tags
* --------------------------------------------------------------------------------
* To set up quicksand regions, use the following setup in Map Note Field:
* <quicksand: [ID]>
* SinkSpeed: [FLOAT]
* SlowDown: [FLOAT]
* MaxSlowDown: [FLOAT]
* DeathSink: [INT]
* MaxSink: [INT]
* Death: [true/false]
* Dash: [true/false]
* CutOff: [true/false]
* </quicksand>
*
* Let's break it down:
* <quicksand: [ID]> tells code that it's a start of a set up.
* [ID] - for which region are you setting it up
* </quicksand> tells code that it's end of a set up and prepares for another setup
*   if so desired 
* SinkSpeed: [FLOAT]   - How fast player sinks in. E.g. 0.05, 0.1, 1.0
* SlowDown: [FLOAT]    - How resistant it is to move in quicksand E.g. 0.05, 0.1
* MaxSlowDown: [FLOAT] - What's the highest resistance against moving E.g. 0.5
* DeathSink: [INT]     - At how many sunk should player die. (Usually 48)
* MaxSink: [INT]       - How deep can player sink in. E.g. 48
* Death: [true/false]  - Can player die when sunk in? true/false
* Dash: [true/false]   - Can player dash while in quicksand? true/false
* CutOff: [true/false] - Does player's body actually sink in?
*
* 
* You can have multiple set ups for different region IDs on same Map.
*
* --------------------------------------------------------------------------------
* Event Tags
* --------------------------------------------------------------------------------
* <Unsinkable>
* Place the tag inside note field in Event.
* Makes event not sink in quicksand.
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {

	//--------------------------------------------------------------------------
	// Game_Map
	// 
	
	var _GameMap_setup = Game_Map.prototype.setup;
	Game_Map.prototype.setup = function(mapId) {
		_GameMap_setup.call(this, mapId);
		this._quicksandData = {};
	    if ($dataMap)
	    {
	    	var note = $dataMap.note.split(/[\r\n]/);

	    	var regex = /[a-zA-Z]*[:][ ]*(\S*)/i;
	    	var regexRegion = /<quicksand:[ ]*(\d+)>/i;
	    	var regexEndRegion = /<\/quicksand>/i;

	    	var region = -1;
	    	var regionFound = false;

	    	for (var i = 0; i < note.length; i++) {
	    		if (!regionFound)
	    		{
		    		var regionMatch = regexRegion.exec(note[i]);
		    		if (regionMatch)
		    		{
		    			region = Number(regionMatch[1]);
		    			this._quicksandData[region] = {};
		    			regionFound = true;
		    		}
		    	} else if (regionFound)
		    	{
		    		var regionMatch = regexEndRegion.exec(note[i]);
		    		if (regionMatch)
		    			regionFound = false;
		    	}

	    		var match = regex.exec(note[i]);
	    		if (!match) continue;
	    		switch(match[0].toUpperCase().split(":")[0])
	    		{
	    			case "SINKSPEED":
	    			{ 
	    				this._quicksandData[region]["sinkspeed"] = Number(match[1]);
	    			} break;
	    			case "SLOWDOWN":
	    			{
	    				this._quicksandData[region]["slowdown"] = Number(match[1]); 
	    			} break;
	    			case "MAXSLOWDOWN":
	    			{
	    				this._quicksandData[region]["maxslowdown"] = Number(match[1]);
	    			} break;
	    			case "DEATHSINK":
	    			{ 
	    				this._quicksandData[region]["deathsink"] = Number(match[1]);
	    			} break;
	    			case "DEATH":
	    			{ 
	    				this._quicksandData[region]["death"] = String(match[1]).toLowerCase();
	    			} break;
	    			case "DASH":
	    			{ 
	    				this._quicksandData[region]["dash"] = String(match[1]).toLowerCase();
	    			} break;
	    			case "CUTOFF":
	    			{ 
	    				this._quicksandData[region]["cutoff"] = String(match[1]).toLowerCase();
	    			} break;
	    			case "MAXSINK":
	    			{ 
	    				this._quicksandData[region]["maxsink"] = Number(match[1]);
	    			} break;
	    		}
	    	};
	    }
	};

	Game_Map.prototype.isInQuicksand = function(x, y) {
		var regionId = this.regionId(x, y);
		if (this._quicksandData[regionId])
			return true;
		return false;
	};

	Game_Map.prototype.canDashInQuicksand = function(x, y) {
		var regionId = this.regionId(x, y);
		if (this._quicksandData[regionId])
			return this._quicksandData[regionId]["dash"];
		return true;
	};

	Game_Map.prototype.sinkSpeed = function(x, y) {
		var regionId = this.regionId(x, y);
		if (this._quicksandData[regionId])
			return this._quicksandData[regionId]["sinkspeed"];
		return 0.0;
	};

	Game_Map.prototype.maxSink = function(x, y) {
		var regionId = this.regionId(x, y);
		if (this._quicksandData[regionId])
			return this._quicksandData[regionId]["maxsink"];
		return 48;
	};

	Game_Map.prototype.deathSink = function(x, y) {
		var regionId = this.regionId(x, y);
		if (this._quicksandData[regionId])
			return this._quicksandData[regionId]["deathsink"];
		return 48;
	};

	Game_Map.prototype.dieInSink = function(x, y) {
		var regionId = this.regionId(x, y);
		if (this._quicksandData[regionId])
			return this._quicksandData[regionId]["death"];
		return false;
	};

	Game_Map.prototype.maxSlowDown = function(x, y) {
		var regionId = this.regionId(x, y);
		if (this._quicksandData[regionId])
			return this._quicksandData[regionId]["maxslowdown"];
		return 0.5;
	};

	Game_Map.prototype.cutOffBody = function(x, y) {
		var regionId = this.regionId(x, y);
		if (this._quicksandData[regionId])
			return this._quicksandData[regionId]["cutoff"];
		return false;
	};

	Game_Map.prototype.slowDown = function(x, y) {
		var regionId = this.regionId(x, y);
		if (this._quicksandData[regionId])
			return this._quicksandData[regionId]["slowdown"];
		return 0.0;
	};

	//--------------------------------------------------------------------------
	// Game_CharacterBase
	// 
	var _Game_CharacterBase_initialize = Game_CharacterBase.prototype.initialize;
	Game_CharacterBase.prototype.initialize = function() {
		_Game_CharacterBase_initialize.call(this);
	    this._sunk = 0.0;
	    this._unsinkable = false;
	};

	var _Game_CharacterBase_shiftY = Game_CharacterBase.prototype.shiftY;
	Game_CharacterBase.prototype.shiftY = function() {
		var shift = _Game_CharacterBase_shiftY.call(this);
	    return shift - this._sunk;
	};

	var _GameCharacterBase_update = Game_CharacterBase.prototype.update;
	Game_CharacterBase.prototype.update = function() {
		_GameCharacterBase_update.call(this);
		this.updateSinking();
	};

	Game_CharacterBase.prototype.updateSinking = function() {
		if (this.isInQuicksand() && !this._unsinkable)
		{
			this._sunk += this.sinkSpeed();
			if (this._sunk > this.maxSink())
				this._sunk = this.maxSink();
		} 
		else 
		{
			if (this._sunk > 0.0) this._sunk -= 8.0;
			if (this._sunk < 0.0) this._sunk = 0.0;
		}
	};

	var _GameCharacterBase_moveStraight = Game_CharacterBase.prototype.moveStraight;
	Game_CharacterBase.prototype.moveStraight = function(d) {
		this.setMovementSuccess(this.canPass(this._x, this._y, d));
		var dx = (d === 6 ? 1 : d === 4 ? -1 : 0);
		var dy = (d === 2 ? 1 : d === 8 ? -1 : 0);
		var newX = this.x + dx;
		var newY = this.y + dy;

		if (this.isInQuicksand() && !$gameMap.isInQuicksand(newX, newY) && 
			this.isMovementSucceeded() && !this._unsinkable)
		{
			this.jump(dx, dy);
		}
		else
		{
			_GameCharacterBase_moveStraight.call(this, d);
		}
	};

	Game_CharacterBase.prototype.updateMove = function() {
		var slowdown = this.distancePerFrame() * Math.max(this.maxSlowDown(), (1 - this._sunk * this.slowDown()));
	    if (this._x < this._realX) {
	        this._realX = Math.max(this._realX - slowdown, this._x);
	    }
	    if (this._x > this._realX) {
	        this._realX = Math.min(this._realX + slowdown, this._x);
	    }
	    if (this._y < this._realY) {
	        this._realY = Math.max(this._realY - slowdown, this._y);
	    }
	    if (this._y > this._realY) {
	        this._realY = Math.min(this._realY + slowdown, this._y);
	    }
	    if (!this.isMoving()) {
	        this.refreshBushDepth();
	    }
	};

	Game_CharacterBase.prototype.isInQuicksand = function() {
		return $gameMap.isInQuicksand(this.x, this.y);
	};

	Game_CharacterBase.prototype.canDashInQuicksand = function() {
		return $gameMap.canDashInQuicksand(this.x, this.y);
	};

	Game_CharacterBase.prototype.sinkSpeed = function() {
		return $gameMap.sinkSpeed(this.x, this.y);
	};

	Game_CharacterBase.prototype.maxSink = function() {
		return $gameMap.maxSink(this.x, this.y);
	};

	Game_CharacterBase.prototype.deathSink = function() {
		return $gameMap.deathSink(this.x, this.y);
	};

	Game_CharacterBase.prototype.dieInSink = function() {
		return $gameMap.dieInSink(this.x, this.y);
	};

	Game_CharacterBase.prototype.maxSlowDown = function() {
		return $gameMap.maxSlowDown(this.x, this.y);
	};

	Game_CharacterBase.prototype.cutOffBody = function() {
		return $gameMap.cutOffBody(this.x, this.y);
	};

	Game_CharacterBase.prototype.slowDown = function() {
		return $gameMap.slowDown(this.x, this.y);
	};

	//--------------------------------------------------------------------------
	// Game_Player
	// 
	
	var _Game_Player_initialize = Game_Player.prototype.initialize;
	Game_Player.prototype.initialize = function() {
		_Game_Player_initialize.call(this);
	    this._gameOverScreen = false;
	};

	var _GamePlayer_update = Game_Player.prototype.update;
	Game_Player.prototype.update = function(sceneActive) {
		_GamePlayer_update.call(this, sceneActive);
		this.updateSinkingPlayer();
	};

	Game_Player.prototype.updateSinkingPlayer = function() {
		if (this.isInQuicksand())
		{
			if (this.dieInSink() == true && this._sunk >= this.deathSink() && !this._gameOverScreen)
			{
				this._gameOverScreen = true;
				SceneManager.goto(Scene_Gameover);
			}
		}
	}; 

	var _GamePlayer_isDashing = Game_Player.prototype.isDashing;
	Game_Player.prototype.isDashing = function() {
		if (this.canDashInQuicksand() == true)
		{
	    	return _GamePlayer_isDashing.call(this);
		}
	    else
	    	return false;
	};

	//--------------------------------------------------------------------------
	// Game_Player
	// 

	var _SpriteCharacter_initMembers = Sprite_Character.prototype.initMembers;
	Sprite_Character.prototype.initMembers = function() {
		_SpriteCharacter_initMembers.call(this);
		this._sunk = 0.0;
		this._cutOff = false;
	};

	var _SpriteCharacter_updateCharacterFrame = Sprite_Character.prototype.updateCharacterFrame;
	Sprite_Character.prototype.updateCharacterFrame = function() {
		_SpriteCharacter_updateCharacterFrame.call(this);
		if (this._cutOff)
		{
			if (this._bushDepth > 0) {
				this._lowerBody.height -= this._sunk;
				this._lowerBody.y = -this._sunk;
				if (this._lowerBody.height < 0)
				{
					this._upperBody.opacity = 176;
					this._upperBody.height += this._lowerBody.height;

				this._upperBody.y = -this._sunk;
					this._lowerBody.height = 0;
				}
			}
			else
			{
				if (this._upperBody) this._upperBody.opacity = 255;
				this.height -= this._sunk;
			}
		}
	};

	var _SpriteCharacter_updateOther = Sprite_Character.prototype.updateOther;
	Sprite_Character.prototype.updateOther = function() {
		_SpriteCharacter_updateOther.call(this);
		this._sunk = this._character._sunk;	
		this._cutOff = (this._character.cutOffBody() == "true");
	};

	//-----------------------------------------------------------------------------
	// Game_Event
	// 

	var _GameEvent_initialize = Game_Event.prototype.initialize;
	Game_Event.prototype.initialize = function(mapId, eventId) {
		_GameEvent_initialize.call(this, mapId, eventId);
		if (this.event().meta.Unsinkable)
	    {
	        this._unsinkable = true;
	    }
	};
})();
