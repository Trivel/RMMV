//==============================================================================
// MrTS_StaticExp.js
//==============================================================================

/*:
* @plugindesc Makes every level require same amount of EXP. Enemies give exp depending on actor level.
* @author Mr. Trivel
*
* @param EXP Needed
* @desc EXP Needed for each level.
* @default 200
*
* @param Overflow
* @desc Does EXP Overflow to next level? (Y/N)
* @default N
*
* @param EXP Reward
* @desc EXP rewarded for killing same level enemy
* @default 15
*
* @param EXP Bonus
* @desc EXP bonus for killing higher level enemy per it's level
* @default 7
*
* @param EXP Loss
* @desc EXP Loss for killing lower level enemy per it's level
* @default 3
*
* @param Obtained Exp Message
* @desc Message display after victory
* @default %1 received %2 %3!
*
* @help This plugin does not provide plugin commands.
* Version 1.0
*
* Enemies give EXP according to Actor level.
* Enemies that have lower level will give less EXP while enemies higher level than
* Actor give more EXP.
* 
* Tags for enemy note fields:
* <level: X> - Level of enemy. If no level noted assumes level 1.
* <custom_base_exp> - instead of using default base EXP, 
* use the number in enemy database EXP field for it.
*/

(function(){
	var parameters = PluginManager.parameters('MrTS_StaticExp');

	var overflow 	= String(parameters['Overflow'] 	|| "N");
	var expNeeded 	= Number(parameters['EXP Needed'] 	|| 200);
	var expReward 	= Number(parameters['EXP Reward'] 	|| 15);
	var expBonus 	= Number(parameters['EXP Bonus'] 	|| 7);
	var expLoss 	= Number(parameters['EXP Loss'] 	|| 3);

	var expObtainedMessage = String(parameters['Obtained Exp Message'] || "%1 received %2 %3!");

	Game_Actor.prototype.expForLevel = function(level) {
		return expNeeded*(level-1);
	};

	var _Game_Actor_levelUp = Game_Actor.prototype.levelUp;
	Game_Actor.prototype.levelUp = function() {
		_Game_Actor_levelUp.call(this);
		if (overflow.toUpperCase() == "N")
			this._exp[this._classId] = this.expForLevel(this._level);
	}

	var _Game_Enemy_exp = Game_Enemy.prototype.exp;
	Game_Enemy.prototype.exp = function() {
		if (this.enemy().meta.custom_base_exp)
			return _Game_Enemy_exp.call(this);
		else
			return expReward;
	}

	Game_Troop.prototype.expTotal = function() {
		var t_exp = [];
		var i = 0;
		$gameParty.allMembers().forEach(function(member){
			t_exp[i] = 0;
			$gameTroop.deadMembers().forEach(function(enemy){
				console.log("calc");
				var dif = (enemy.enemy().meta.level ? enemy.enemy().meta.level : 1) - member.level;
				console.log(dif);
				var exp = enemy.exp();
				if (dif > 0)
					exp += expBonus * dif;
				else if (dif < 0)
					exp += expLoss * dif;

				if (exp < 0) exp = 0;
				console.log(exp);
				t_exp[i] += exp;

			});
			i++;
		});

		return t_exp;
	}

	BattleManager.gainExp = function() {
		var exp = this._rewards.exp;
		var i = 0;
		$gameParty.allMembers().forEach(function(actor) {
			actor.gainExp(exp[i]);
			i++;
		});
	};

	BattleManager.displayExp = function() {
	    var exp = this._rewards.exp;

	    $gameMessage.newPage();

	    var i = 0;
	    $gameParty.battleMembers().forEach(function(member){
	    	var t_exp = exp[i];
	    	if (t_exp > 0)
	    	{
	    		var text = expObtainedMessage.format(member.name(), exp[i], TextManager.exp);
	    		$gameMessage.add('\\.' + text);
	    	}
	    	i++;
	    });
	};


})();
