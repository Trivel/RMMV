//=============================================================================
// MrTS_HurtSounds.js
//=============================================================================

/*:
* @plugindesc Makes players and enemies play a sound when they get hit.
* @author Mr. Trivel
* 
* @help 
* --------------------------------------------------------------------------------
* Free for non commercial use.
* Version 1.0
* --------------------------------------------------------------------------------
** 
* --------------------------------------------------------------------------------
* Actor/Enemy Tags
* --------------------------------------------------------------------------------
* <Hurt:[SFX], [VOL], [PITCH]>
* Place it in note field of actor or enemy. Note there's no space after :
* [SFX] - SFX name
* [VOL] - Volume
* [PITCH] - Pitch
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var _GameActor_setup = Game_Actor.prototype.setup;
	Game_Actor.prototype.setup = function(actorId) {
		_GameActor_setup.call(this, actorId);
		if (this.actor().meta.Hurt)
		{
			this._hurtSound = this.actor().meta.Hurt.split(',');
			this._hurtSound[1] = Number(this._hurtSound[1]);
			this._hurtSound[2] = Number(this._hurtSound[2]);
		}
	};

	var _GameEnemy_setup = Game_Enemy.prototype.setup;
	Game_Enemy.prototype.setup = function(enemyId, x, y) {
		_GameEnemy_setup.call(this, enemyId, x, y);
		if (this.enemy().meta.Hurt)
		{
			this._hurtSound = this.enemy().meta.Hurt.split(',');
			this._hurtSound[1] = Number(this._hurtSound[1]);
			this._hurtSound[2] = Number(this._hurtSound[2]);
		}
	};

	var _GameAction_executeDamage = Game_Action.prototype.executeDamage;
	Game_Action.prototype.executeDamage = function(target, value) {
		_GameAction_executeDamage.call(this, target, value);
		if (value > 0 && target._hurtSound)
		{
			var sound = AudioManager.makeEmptyAudioObject();
			sound.name = target._hurtSound[0];
			sound.volume = target._hurtSound[1];
			sound.pitch = target._hurtSound[2];
			AudioManager.loadStaticSe(sound);
			AudioManager.playStaticSe(sound);
		}
	};
})();
