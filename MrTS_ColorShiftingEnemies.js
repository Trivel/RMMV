//=============================================================================
// MrTS_ColorShiftingEnemies.js
//=============================================================================

/*:
* @plugindesc Makes enemies go disco disco in battles.
* @author Mr. Trivel
*
* @param Change Time
* @desc How long it takes -- in frames -- between each tone?
* Default: 60
* @default 60
*
* @param Tone Sequence
* @desc [Red, Green, Blue, Gray] repeat as many times as needed.
* @default [50, 50, 0, 0] [100, 0, 25, 0] [0, 0, 75, 0] [-50, 99, -10, 0] [90, 0, 0, 0]
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
* Enemy Tags
* --------------------------------------------------------------------------------
* Enemies tagged with <DiscoDisco> will go in all colors in battle.
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_ColorShiftingEnemies');
	var paramChangeTime = Number(parameters['Change Time'] || 60);
	var paramToneSequence = String(parameters['Tone Sequence'] || "[50, 50, 0, 0] [100, 0, 25, 0] [0, 0, 75, 0] [-50, 99, -10, 0] [90, 0, 0, 0]");

	_GameSystem_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_GameSystem_initialize.call(this);
		this.parseEnemyDiscoSequence();
	};

	Game_System.prototype.parseEnemyDiscoSequence = function() {
		this._discoSequence = [];
		var tmpSqn = paramToneSequence.split(']');
		var regex = /[\[]([-]*\d+)[, ]*([-]*\d+)[, ]*([-]*\d+)[, ]*([-]*\d+)/i;
		for (var i = 0; i < tmpSqn.length; i++) {
			var regexMatch = regex.exec(tmpSqn[i]);
			if (regexMatch)
			{
				var r = Number(regexMatch[1]);
				var g = Number(regexMatch[2]);
				var b = Number(regexMatch[3]);
				var gray = Number(regexMatch[4]);
				var arr = [r, g, b, gray];
				this._discoSequence.push(arr);
			}
		}
	};

	Game_System.prototype.getDiscoStep = function(step) {
		return this._discoSequence[step];
	};

	var _SpriteEnemy_initialize = Sprite_Enemy.prototype.initialize;
	Sprite_Enemy.prototype.initialize = function(battler) {
		_SpriteEnemy_initialize.call(this, battler);
		if (battler.enemy().meta.DiscoDisco)
		{
			this._discoDisco = true;
			this._currentDiscoStep = 0;
			this._nextDiscoTone = 0;
			this._currentDiscoTone = this.getColorTone().clone();
		}
	};

	var _SpriteEnemy_update = Sprite_Enemy.prototype.update;
	Sprite_Enemy.prototype.update = function() {
		_SpriteEnemy_update.call(this);
		if (this._enemy && this._discoDisco)
		{
			this.updateDiscoSteps();
		}
	};

	Sprite_Enemy.prototype.updateDiscoSteps = function() {
		this._currentDiscoStep++;

		var cTone = this._currentDiscoTone;
		var nTone = $gameSystem.getDiscoStep(this._nextDiscoTone);

		if (this._currentDiscoStep >= paramChangeTime)
		{
			this._currentDiscoStep = 0;
			this.setColorTone(nTone);
			this._currentDiscoTone = nTone.clone();
			this._nextDiscoTone++;
			if (this._nextDiscoTone >= $gameSystem._discoSequence.length)
				this._nextDiscoTone = 0;
		}
		else
		{
			var r = Math.floor(((nTone[0] - cTone[0])/paramChangeTime)*this._currentDiscoStep);
			var g = Math.floor(((nTone[1] - cTone[1])/paramChangeTime)*this._currentDiscoStep);
			var b = Math.floor(((nTone[2] - cTone[2])/paramChangeTime)*this._currentDiscoStep);
			var gray = Math.floor(((nTone[3] - cTone[3])/paramChangeTime)*this._currentDiscoStep);

			this.setColorTone([cTone[0] + r, cTone[1] + g, cTone[2] + b, cTone[3] + gray]);
		}
	};
})();
