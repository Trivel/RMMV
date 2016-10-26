//=============================================================================
// MrTS_HurtSounds.js
//=============================================================================

/*:
* @plugindesc Makes players and enemies play a sound when they get hit.
* @author Mr. Trivel
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial and  non-commercial projects.
* --------------------------------------------------------------------------------
* Version 1.2
* --------------------------------------------------------------------------------
** 
* --------------------------------------------------------------------------------
* Actor/Enemy Tags
* --------------------------------------------------------------------------------
* Place the following tag into Actor or Enemy note field. You can place multiple
* tags on same enemy - in that case a random sound from those will be picked.
* <Hurt: [SFX], [VOL], [PITCH]>
* [SFX] - SFX name
* [VOL] - Volume
* [PITCH] - Pitch
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
* 1.1 - Picking a random sound if multiple tags are on the same enemy.
* 1.2 - Crash fix when attacking enemies/actors without hurt notes
*/

(function() {
	var _GameActor_setup = Game_Actor.prototype.setup;
	Game_Actor.prototype.setup = function(actorId) {
		_GameActor_setup.call(this, actorId);
		this._hurtSounds = this.parseHurtSounds(this.actor().note);
	};

	var _GameEnemy_setup = Game_Enemy.prototype.setup;
	Game_Enemy.prototype.setup = function(enemyId, x, y) {
		_GameEnemy_setup.call(this, enemyId, x, y);
		this._hurtSounds = this.parseHurtSounds(this.enemy().note);
	};

	Game_Battler.prototype.parseHurtSounds = function(note) {
		var lines = note.split(/[\r\n]/);
		var regex = /<Hurt:[ ]*(.+),[ ]*(\d+),[ ]*(\d+)>/i;
		var results = [];

		for (var i = 0; i < lines.length; i++) {
			var regexMatch = regex.exec(lines[i]);
			if (regexMatch)
			{
				results.push([regexMatch[1], Number(regexMatch[2]), Number(regexMatch[3])]);
			}
		};

		return results;
	};

	var _GameAction_executeDamage = Game_Action.prototype.executeDamage;
	Game_Action.prototype.executeDamage = function(target, value) {
		_GameAction_executeDamage.call(this, target, value);
		if (value > 0 && target._hurtSounds.length > 0)
		{
			var sound = AudioManager.makeEmptyAudioObject();
			var randomHurtSound = target._hurtSounds[Math.floor(Math.random()*target._hurtSounds.length)];
			sound.name = randomHurtSound[0];
			sound.volume = randomHurtSound[1];
			sound.pitch = randomHurtSound[2];
			AudioManager.loadStaticSe(sound);
			AudioManager.playStaticSe(sound);
		}
	};
})();
