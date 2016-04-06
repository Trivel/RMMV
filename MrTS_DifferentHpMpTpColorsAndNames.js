//=============================================================================
// MrTS_DifferentHpMpTpColorsAndNames.js
//=============================================================================

var Imported = Imported || {};
Imported.MrTS_DifferentHpMpTpColorsAndNames = true;

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
* Version 1.1
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Actor/Class Tags
* --------------------------------------------------------------------------------
* To set colors for actors/classes, use the following tags in the note fields:
* (Color is in HEX) (If Class and Actor has same tags, Class takes priority)
* <HPName: Name>
* <MPName: Name>
* <TPName: Name>
* <HPColor: #Color1, #Color2>
* <MPColor: #Color1, #Color2>
* <TPColor: #Color1, #Color2>
*
* Examples:
* <HPName: QP>
* <MPName: BP>
* <TPName: RP>
* <HPColor: #23b94d, #60e021>
* <MPColor: #D02E2E, #ED5757>
* <TPColor: #e29a00, #f8f4b2>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - Moved color setting up to Database.
*     - Added gauge colors to Classes.
* 1.0 - Release
*/

(function() {
	Window_Base.prototype.setHpGaugeColors = function(actorId) {
		var actor = $gameActors.actor(actorId);
		var aData = actor.actor();
		var cData = actor.currentClass();
		var colors = null;

		if (cData.meta.HPColor)
			colors = cData.meta.HPColor.split(',');
		else if (aData.meta.HPColor)
			colors = aData.meta.HPColor.split(',');
		else
			colors = [this.textColor(20), this.textColor(21)];

		for (var i = 0; i < colors.length; i++) {
			if (colors[i][0] === ' ') colors[i] = colors[i].slice(1);
		}
		
		this._hpGaugeColors = colors;
	};

	Window_Base.prototype.setMpGaugeColors = function(actorId) {
		var actor = $gameActors.actor(actorId);
		var aData = actor.actor();
		var cData = actor.currentClass();
		var colors = null;

		if (cData.meta.MPColor)
			colors = cData.meta.MPColor.split(',');
		else if (aData.meta.MPColor)
			colors = aData.meta.MPColor.split(',');
		else
			colors = [this.textColor(22), this.textColor(23)];

		for (var i = 0; i < colors.length; i++) {
			if (colors[i][0] === ' ') colors[i] = colors[i].slice(1);
		}
		
		this._mpGaugeColors = colors;
	};

	Window_Base.prototype.setTpGaugeColors = function(actorId) {
		var actor = $gameActors.actor(actorId);
		var aData = actor.actor();
		var cData = actor.currentClass();
		var colors = null;

		if (cData.meta.TPColor)
			colors = cData.meta.TPColor.split(',');
		else if (aData.meta.TPColor)
			colors = aData.meta.TPColor.split(',');
		else
			colors = [this.textColor(28), this.textColor(29)];

		for (var i = 0; i < colors.length; i++) {
			if (colors[i][0] === ' ') colors[i] = colors[i].slice(1);
		}
		
		this._tpGaugeColors = colors;
	};

	var _WindowBase_hpGaugeColor1 = Window_Base.prototype.hpGaugeColor1;
	Window_Base.prototype.hpGaugeColor1 = function() {
		if (this._hpGaugeColors) return this._hpGaugeColors[0];
		return _WindowBase_hpGaugeColor1.call(this);
	};

	var _WindowBase_hpGaugeColor2 = Window_Base.prototype.hpGaugeColor2;
	Window_Base.prototype.hpGaugeColor2 = function() {
		if (this._hpGaugeColors) return this._hpGaugeColors[1];
		return _WindowBase_hpGaugeColor2.call(this);
	};

	var _WindowBase_mpGaugeColor1 = Window_Base.prototype.mpGaugeColor1;
	Window_Base.prototype.mpGaugeColor1 = function() {
		if (this._mpGaugeColors) return this._mpGaugeColors[0];
		return _WindowBase_mpGaugeColor1.call(this);
	};

	var _WindowBase_mpGaugeColor2 = Window_Base.prototype.mpGaugeColor2;
	Window_Base.prototype.mpGaugeColor2 = function() {
		if (this._mpGaugeColors) return this._mpGaugeColors[1];
		return _WindowBase_mpGaugeColor2.call(this);
	};

	var _WindowBase_tpGaugeColor1 = Window_Base.prototype.tpGaugeColor1;
	Window_Base.prototype.tpGaugeColor1 = function() {
		if (this._tpGaugeColors) return this._tpGaugeColors[0];
		return _WindowBase_tpGaugeColor1.call(this);
	};

	var _WindowBase_tpGaugeColor2 = Window_Base.prototype.tpGaugeColor2;
	Window_Base.prototype.tpGaugeColor2 = function() {
		if (this._tpGaugeColors) return this._tpGaugeColors[1];
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
		return TextManager.ctpA;
	};

	Game_System.prototype.setActorHpName = function(actorId) {
		var actor = $gameActors.actor(actorId);
		var name = undefined;

		if (actor.currentClass().meta.HPName)
			name = actor.currentClass().meta.HPName;
		if (actor.actor().meta.HPName)
			name = actor.actor().meta.HPName;

		if (name && name[0] === ' ') name = name.slice(1);
		this._actorHpName = name;
	};

	Game_System.prototype.setActorMpName = function(actorId) {
		var actor = $gameActors.actor(actorId);
		var name = undefined;

		if (actor.currentClass().meta.MPName)
			name = actor.currentClass().meta.MPName;
		if (actor.actor().meta.MPName)
			name = actor.actor().meta.MPName;

		if (name && name[0] === ' ') name = name.slice(1);
		this._actorMpName = name;
	};

	Game_System.prototype.setActorTpName = function(actorId) {
		var actor = $gameActors.actor(actorId);
		var name = undefined;

		if (actor.currentClass().meta.TPName)
			name = actor.currentClass().meta.TPName;
		if (actor.actor().meta.TPName)
			name = actor.actor().meta.TPName;

		if (name && name[0] === ' ') name = name.slice(1);
		this._actorTpName = name;
	};
})();
