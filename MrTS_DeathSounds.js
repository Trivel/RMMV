//=============================================================================
// MrTS_DeathSounds.js
//=============================================================================

/*:
* @plugindesc Makes players and enemies play a different sound on death.
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
* Version 1.0
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Actor/Enemy Tags
* --------------------------------------------------------------------------------
* Place the following tag into Actor or Enemy note fields. You can place multiple
* tags on same character - in that case a random sound will be picked to play.
* <Death: [SFX], [VOL], [PITCH]>
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
		this._deathSounds = this.parseDeathSounds(this.actor().note);
	};

	var _GameEnemy_setup = Game_Enemy.prototype.setup;
	Game_Enemy.prototype.setup = function(enemyId, x, y) {
		_GameEnemy_setup.call(this, enemyId, x, y);
		this._deathSounds = this.parseDeathSounds(this.enemy().note);
	};

	Game_Battler.prototype.parseDeathSounds = function(note) {
		var lines = note.split(/[\r\n]/);
		var regex = /<Death:[ ]*(.+),[ ]*(\d+),[ ]*(\d+)>/i;
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

	var _GameBattler_performCollapse = Game_Battler.prototype.performCollapse;
	Game_Battler.prototype.performCollapse = function() {
		_GameBattler_performCollapse.call(this);
		if (this._deathSounds.length > 0)
		{
			var sound = AudioManager.makeEmptyAudioObject();
			var randomDeathSound = this._deathSounds[Math.floor(Math.random()*this._deathSounds.length)];
			sound.name = randomDeathSound[0];
			sound.volume = randomDeathSound[1];
			sound.pitch = randomDeathSound[2];
			AudioManager.loadStaticSe(sound);
			AudioManager.playStaticSe(sound);
		}
	};

	SoundManager.playEnemyCollapse = function() {
	};

	SoundManager.playBossCollapse1 = function() {
	};

	SoundManager.playBossCollapse2 = function() {
	};

	SoundManager.playActorCollapse = function() {
	};
})();
