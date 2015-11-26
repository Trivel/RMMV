//=============================================================================
// MrTS_RandomSkillPosition.js
//=============================================================================

/*:
* @plugindesc Makes skill to be in a random offset instead of always striking the same place.
* @author Mr. Trivel
*
* @param Vertical Bounds
* @desc Default: 1.0
* @default 1.0
*
* @param Horizontal Bounds
* @desc Default: 1.0
* @default 1.0
* 
* @help 
* --------------------------------------------------------------------------------
* Free for non commercial use.
* Version 1.0
* --------------------------------------------------------------------------------
** 
* --------------------------------------------------------------------------------
* Skill Tags
* --------------------------------------------------------------------------------
* <RandomPos>
* Place it in skill note field of skills you want to have random position.
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {

	var parameters = PluginManager.parameters('MrTS_RandomSkillPosition');
	var paramHBounds = Number(parameters['Horizontal Bounds'] || 1.0);
	var paramVBounds = Number(parameters['Vertical Bounds'] || 1.0);
	

	var _SpriteAnimation_setup = Sprite_Animation.prototype.setup;
	Sprite_Animation.prototype.setup = function(target, animation, mirror, delay) {
	    _SpriteAnimation_setup.call(this, target, animation, mirror, delay);
	    if ((target._battler && target._battler._randomSkillPos) ||
	    	(target.parent._battler && target.parent._battler._randomSkillPos))
	    {
	    	var w_bounds = paramHBounds;
	    	var h_bounds = paramVBounds;
	    	var tw = target.width * w_bounds;
	    	var th = target.height * h_bounds;
		    this._offset.x = Math.randomInt(tw) - tw/2;
		    this._offset.y = Math.randomInt(th) - th/2;
		}
	};

	var _SpriteAnimation_updatePosition = Sprite_Animation.prototype.updatePosition;
	Sprite_Animation.prototype.updatePosition = function() {
		_SpriteAnimation_updatePosition.call(this);
	    if (this._animation.position !== 3)
	    {
	        this.y += this._offset.y;
	        this.x += this._offset.x;	    	
	    }
	};

	var _WindowBattleLog_startAction = Window_BattleLog.prototype.startAction;
	Window_BattleLog.prototype.startAction = function(subject, action, targets) {
		var item = action.item();
		if (item.meta.RandomPos)
			for (var i = 0; i < targets.length; i++)
				targets[i]._randomSkillPos = true;
		_WindowBattleLog_startAction.call(this, subject, action, targets);

	};

	var _GameBattler_performResultEffects = Game_Battler.prototype.performResultEffects;
	Game_Battler.prototype.performResultEffects = function() {
	    _GameBattler_performResultEffects.call(this);
	    this._randomSkillPos = false;
	};

})();
