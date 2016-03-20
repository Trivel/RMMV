//=============================================================================
// MrTS_DifferentHpMpTpColorsAndNames.js
//=============================================================================

/*:
* @plugindesc Changes colors and names of HP, MP and TP. Purely graphical.
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
* How to set up
* --------------------------------------------------------------------------------
* Open the plugin in your favorite text editor and scroll down to
* SET UP COLORS HERE
* Follow the template there and change it to your needs.
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	//--------------------------------------------------------------------------------
	// SET UP COLORS HERE v
	//--------------------------------------------------------------------------------
	// HP Color List
	//--------------------------------------------------------------------------------
	var hpColorList = {
		// ActorId: ["HP Name", #hexcolor1, #hexcolor2],
		// ActorId: ["HP Name", #hexcolor1, #hexcolor2]
		1: ["QP", "#23b94d", "#60e021"],
		2: ["QP", "#23b94d", "#60e021"],
		3: ["QP", "#23b94d", "#60e021"],
		4: ["QP", "#23b94d", "#60e021"]
	}
	//--------------------------------------------------------------------------------
	// MP Color List
	//--------------------------------------------------------------------------------
	var mpColorList = {
		// ActorId: ["MP Name", #hexcolor1, #hexcolor2],
		// ActorId: ["MP Name", #hexcolor1, #hexcolor2]
		1: ["MP", "#4080C0", "#40C0F0"],
		2: ["SP", "#F718FC", "#FC69FF"],
		3: ["RP", "#42FEC1", "#40FFF0"],
		4: ["BP", "#D02E2E", "#ED5757"]
	}
	//--------------------------------------------------------------------------------
	// TP Color List
	//--------------------------------------------------------------------------------
	var tpColorList = {
		// ActorId: ["TP Name", #hexcolor1, #hexcolor2],
		// ActorId: ["TP Name", #hexcolor1, #hexcolor2]
		1: ["RP", "#e29a00", "#f8f4b2"],
		2: ["RP", "#e29a00", "#f8f4b2"]
	}
	//--------------------------------------------------------------------------------
	// SET UP COLORS THERE ^
	//-------------------------------------------------------------------------------- 

	Window_Base.prototype.setHpGaugeColors = function(actorId) {
		if (hpColorList[actorId])
		{
			this._hpGaugeColor1 = hpColorList[actorId][1];
			this._hpGaugeColor2 = hpColorList[actorId][2];
		}
		else
		{
			this._hpGaugeColor1 = this.textColor(20);
			this._hpGaugeColor2 = this.textColor(21);
		}
	};

	Window_Base.prototype.setMpGaugeColors = function(actorId) {
		if (mpColorList[actorId])
		{
			this._mpGaugeColor1 = mpColorList[actorId][1];
			this._mpGaugeColor2 = mpColorList[actorId][2];
		}
		else
		{
			this._mpGaugeColor1 = this.textColor(22);
			this._mpGaugeColor2 = this.textColor(23);
		}
	};

	Window_Base.prototype.setTpGaugeColors = function(actorId) {
		if (tpColorList[actorId])
		{
			this._tpGaugeColor1 = tpColorList[actorId][1];
			this._tpGaugeColor2 = tpColorList[actorId][2];
		}
		else
		{
			this._tpGaugeColor1 = this.textColor(28);
			this._tpGaugeColor2 = this.textColor(29);
		}
	};

	var _WindowBase_hpGaugeColor1 = Window_Base.prototype.hpGaugeColor1;
	Window_Base.prototype.hpGaugeColor1 = function() {
		if (this._hpGaugeColor1) return this._hpGaugeColor1;
		return _WindowBase_hpGaugeColor1.call(this);
	};

	var _WindowBase_hpGaugeColor2 = Window_Base.prototype.hpGaugeColor2;
	Window_Base.prototype.hpGaugeColor2 = function() {
		if (this._hpGaugeColor2) return this._hpGaugeColor2;
		return _WindowBase_hpGaugeColor2.call(this);
	};

	var _WindowBase_mpGaugeColor1 = Window_Base.prototype.mpGaugeColor1;
	Window_Base.prototype.mpGaugeColor1 = function() {
		if (this._mpGaugeColor1) return this._mpGaugeColor1;
		return _WindowBase_mpGaugeColor1.call(this);
	};

	var _WindowBase_mpGaugeColor2 = Window_Base.prototype.mpGaugeColor2;
	Window_Base.prototype.mpGaugeColor2 = function() {
		if (this._mpGaugeColor2) return this._mpGaugeColor2;
		return _WindowBase_mpGaugeColor2.call(this);
	};

	var _WindowBase_tpGaugeColor1 = Window_Base.prototype.tpGaugeColor1;
	Window_Base.prototype.tpGaugeColor1 = function() {
		if (this._tpGaugeColor1) return this._tpGaugeColor1;
		return _WindowBase_tpGaugeColor1.call(this);
	};

	var _WindowBase_tpGaugeColor2 = Window_Base.prototype.tpGaugeColor2;
	Window_Base.prototype.tpGaugeColor2 = function() {
		if (this._tpGaugeColor2) return this._tpGaugeColor2;
		return _WindowBase_tpGaugeColor2.call(this);
	};

	var _WindowBase_drawActorHp = Window_Base.prototype.drawActorHp;
	Window_Base.prototype.drawActorHp = function(actor, x, y, width) {
		this.setHpGaugeColors(actor.actorId());
		$gameSystem.setActorHpName(actor.actorId());
		_WindowBase_drawActorHp.call(this, actor, x, y, width);
	};

	var _WindowBase_drawActorMp = Window_Base.prototype.drawActorMp;
	Window_Base.prototype.drawActorMp = function(actor, x, y, width) {
		this.setMpGaugeColors(actor.actorId());
		$gameSystem.setActorMpName(actor.actorId());
		_WindowBase_drawActorMp.call(this, actor, x, y, width);
	};

	var _WindowBase_drawActorTp = Window_Base.prototype.drawActorTp;
	Window_Base.prototype.drawActorTp = function(actor, x, y, width) {
		this.setTpGaugeColors(actor.actorId());
		$gameSystem.setActorTpName(actor.actorId());
		_WindowBase_drawActorTp.call(this, actor, x, y, width);
	};

	Object.defineProperties(TextManager, {
	    chpA             : TextManager.getter('basic', 3),
	    cmpA             : TextManager.getter('basic', 5),
	    ctpA             : TextManager.getter('basic', 7),
	});

	Object.defineProperty(TextManager, 'hp', {
	    get: function() { return $gameSystem.getActorHpName(); },
	    configurable: true
	});

	Object.defineProperty(TextManager, 'hpA', {
	    get: function() { return $gameSystem.getActorHpName(); },
	    configurable: true
	});

	Object.defineProperty(TextManager, 'mp', {
	    get: function() { return $gameSystem.getActorMpName(); },
	    configurable: true
	});

	Object.defineProperty(TextManager, 'mpA', {
	    get: function() { return $gameSystem.getActorMpName(); },
	    configurable: true
	});

	Object.defineProperty(TextManager, 'tp', {
	    get: function() { return $gameSystem.getActorTpName(); },
	    configurable: true
	});

	Object.defineProperty(TextManager, 'tpA', {
	    get: function() { return $gameSystem.getActorTpName(); },
	    configurable: true
	});

	Game_System.prototype.getActorHpName = function() {
		if (this._actorHpName) return this._actorHpName;
		return TextManager.chpA;
	};

	Game_System.prototype.getActorMpName = function() {
		if (this._actorMpName) return this._actorMpName;
		return TextManager.cmpA;
	};

	Game_System.prototype.getActorTpName = function() {
		if (this._actorTpName) return this._actorTpName;
		console.log(TextManager.getter('basic', 7));
		return TextManager.ctpA;
	};

	Game_System.prototype.setActorHpName = function(actorId) {
		if (hpColorList[actorId])
			this._actorHpName = hpColorList[actorId][0];
		else
			this._actorHpName = undefined;
	};

	Game_System.prototype.setActorMpName = function(actorId) {
		if (mpColorList[actorId])
			this._actorMpName = mpColorList[actorId][0];
		else
			this._actorMpName = undefined;
	};

	Game_System.prototype.setActorTpName = function(actorId) {
		if (tpColorList[actorId])
			this._actorTpName = tpColorList[actorId][0];
		else
			this._actorTpName = null;
	};
})();
