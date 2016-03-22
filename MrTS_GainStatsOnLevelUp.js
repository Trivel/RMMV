//=============================================================================
// MrTS_GainStatsOnLevelUp.js
//=============================================================================

/*:
* @plugindesc Actors gain stats on level up.
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
* Class Tags
* --------------------------------------------------------------------------------
* <STAT>
* formula
* </STAT>
*
* Stats:
* MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK
*
* v = variables
* a = actor
*
* Examples:
* <ATK>
* v[10];
* </ATK>
* <DEF>
* Math.randomInt(5);
* </DEF>
* <LUK>
* -1
* </LUK>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - Crash fix with multi line stat evaluations.
* 1.0 - Release
*/

(function() {

	var _GameActor_setup = Game_Actor.prototype.setup;
	Game_Actor.prototype.setup = function(actorId) {
		_GameActor_setup.call(this, actorId);
		this._classExtraParam = [];
		this._classExtraParamLevels = [];
		this._classExtraParamLevels[this._classId] = this._level;
	};

	var _GameActor_levelUp = Game_Actor.prototype.levelUp;
	Game_Actor.prototype.levelUp = function() {
		_GameActor_levelUp.call(this);
		this.addClassExtraParams();
	};

	var _GameActor_paramPlus = Game_Actor.prototype.paramPlus;
	Game_Actor.prototype.paramPlus = function(paramId) {
	    var value = _GameActor_paramPlus.call(this, paramId);
	    if (this._classExtraParam && this._classExtraParam[this._classId] && this._classExtraParam[this._classId][paramId])
	    	value += this._classExtraParam[this._classId][paramId];
	    return value;
	};

	var _GameActor_changeClass = Game_Actor.prototype.changeClass;
	Game_Actor.prototype.changeClass = function(classId, keepExp) {
		_GameActor_changeClass.call(this, classId, keepExp);
		this.addClassExtraParams();
	};

	Game_Actor.prototype.addClassExtraParams = function() {
		if (!this._classExtraParamLevels[this._classId]) 
			this._classExtraParamLevels[this._classId] = this.actor().initialLevel;

		var difference = this._level - this._classExtraParamLevels[this._classId];
		var note = this.currentClass().note.split(/[\r\n]/);
		var statStarted = null
		var code = "";
		var regexStart = /<(MHP|MMP|ATK|DEF|MAT|MDF|AGI|LUK)>/i;
		var regexEnd = /<(\/MHP|\/MMP|\/ATK|\/DEF|\/MAT|\/MDF|\/AGI|\/LUK)>/i;
		var paramCode = [];

		for (var i = 0; i < note.length; i++) {
			var regexStartMatch = regexStart.exec(note[i]);
			if (regexStartMatch)
			{
				statStarted = regexStartMatch[1].toLowerCase();
				continue;
			}

			var regexEndMatch = regexEnd.exec(note[i]);
			if (regexEndMatch)
			{
				switch(statStarted)
				{
					case 'mhp':
					{
						paramCode[0] = code;
					} break;
					case 'mmp':
					{
						paramCode[1] = code;
					} break;
					case 'atk':
					{
						paramCode[2] = code;
					} break;
					case 'def':
					{
						paramCode[3] = code;
					} break;
					case 'mat':
					{
						paramCode[4] = code;
					} break;
					case 'mdf':
					{
						paramCode[5] = code;
					} break;
					case 'agi':
					{
						paramCode[6] = code;
					} break;
					case 'luk':
					{
						paramCode[7] = code;
					} break;
					
				}
				statStarted = null;
				code = "";
				continue;
			}

			if (statStarted)
			{
				code += " " + note[i];
				continue;
			}
		} // for

		for (var i = 0; i < difference; i++) {
			for (var j = 0; j < 8; j++) {
				if (!paramCode[j]) continue;

				var v = $gameVariables._data;
				var a = this;
				var increase = eval(paramCode[j]);
				if (!this._classExtraParam[this._classId])
					this._classExtraParam[this._classId] = [0, 0, 0, 0, 0, 0, 0, 0];
				this._classExtraParam[this._classId][j] += Number(increase);
			}
		}
		this._classExtraParamLevels[this._classId] = this._level;
	};
})();
