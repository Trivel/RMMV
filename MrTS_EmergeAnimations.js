//=============================================================================
// MrTS_EmergeAnimations.js
//=============================================================================

/*:
* @plugindesc Makes enemies emerge with animation playing into battle.
* @author Mr. Trivel
*
* @param Appear Type
* @desc In order by one or all at the same time? -- Order/Together
* Default: Order
* @default Order
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
* Use the following in enemy note fields:
* <AppearAnimation: [Animation ID], [Visible Frame]>
* [Animation ID] being ID of animation enemy uses before appearing.
* [Visible Frame] From which animation frame enemy becomes visible.
*
* In case of multiple animations listed in the same note field, random one will
* be picked.
*
* Example:
* <AppearAnimation: 118, 21>
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_EmergeAnimations');
	var paramAppear = String(parameters['Appear Type'] || "Order").toLowerCase();

	var _GameEnemy_setup = Game_Enemy.prototype.setup;
	Game_Enemy.prototype.setup = function(enemyId, x, y) {
		_GameEnemy_setup.call(this, enemyId, x, y);
		this._emergeAnimationList = this.parseEmergeAnimations(this.enemy().note);
	};

	Game_Enemy.prototype.parseEmergeAnimations = function(note) {
		var results = [];
		if (!this.enemy().meta.AppearAnimation) return results;

		var lines = note.split(/[\r\n]/);
		var regex = /<AppearAnimation:[ ]*(\d+),[ ]*(\d+)>/i;

		for (var i = 0; i < lines.length; i++) {
			var regexMatch = regex.exec(lines[i]);
			if (regexMatch)
				results.push([Number(regexMatch[1]), Number(regexMatch[2])]);
		}

		return results;
        
	};

	Game_Enemy.prototype.hasAppear = function() {
		return this._emergeAnimationList.length > 0;
	};

	var _GameEnemy_appear = Game_BattlerBase.prototype.appear;
	Game_BattlerBase.prototype.appear = function() {
		_GameEnemy_appear.call(this);
		$gameTemp.appeared = false;
	};

	Game_Enemy.prototype.startAppearAnimation = function(anim) {
		this._appearAnim = anim;
		this.startAnimation(anim[0], false, 0);
	};

	var _SceneBattle_update = Scene_Battle.prototype.update;
	Scene_Battle.prototype.update = function() {
		_SceneBattle_update.call(this);
		var active = this.isActive();
		if (active && !this.isBusy())
		{
			if (!$gameTemp.appeared) {
				for (var i = 0; i < $gameTroop.members().length; i++) {
					if ($gameTroop.members()[i].isHidden()) continue;
					if (!$gameTroop.members()[i].hasAppear()) continue;
					if (this._appeared[i]) continue;

			    	var list = $gameTroop.members()[i]._emergeAnimationList;
			        var rndAnim = list[Math.randomInt(list.length)];
			        $gameTroop.members()[i].startAppearAnimation(rndAnim);
			        this._appeared[i] = true;
			        BattleManager._logWindow.setWaitMode('animation');
			        if (paramAppear === "order") break;
			    }
			    $gameTemp.appeared = true;
			} else {

			}
		}
	};

	var _SceneBattle_start = Scene_Battle.prototype.start;
	Scene_Battle.prototype.start = function() {
		_SceneBattle_start.call(this);
		this._appeared = [];
		$gameTemp.appeared = false;
		for (var i = 0; i < $gameTroop.members().length; i++) {
			if ($gameTroop.members()[i].hasAppear()) this._appeared.push(false);
		}
	};

	var _SpriteEnemy_updateVisibility = Sprite_Enemy.prototype.updateVisibility;
	Sprite_Enemy.prototype.updateVisibility = function() {
		_SpriteEnemy_updateVisibility.call(this);
		if (this._enemy._appearAnim && this._animationSprites.length > 0)
		{
			for (var i = 0; i < this._animationSprites.length; i++) {
				if (this._animationSprites[i].currentFrameIndex() >= this._enemy._appearAnim[1])
				{
					this.startEffect('appear');
					this._enemy._appearAnim = null;
					$gameTemp.appeared = false;
				}
			}
		}
	};

	var _SpriteEnemy_initVisibility = Sprite_Enemy.prototype.initVisibility;
	Sprite_Enemy.prototype.initVisibility = function() {
		_SpriteEnemy_initVisibility.call(this);
	    if (this._enemy.hasAppear()) this.opacity = 0;
	};

	var _SpriteEnemy_setupEffect = Sprite_Enemy.prototype.setupEffect;
	Sprite_Enemy.prototype.setupEffect = function() {
	    if (!this._appeared && this._enemy.isAlive() && this._enemy.hasAppear()) {
	        this._appeared = true;
	    }
	    _SpriteEnemy_setupEffect.call(this);
	};
})();
