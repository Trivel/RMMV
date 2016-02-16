//==============================================================================
// MrTS_EnemyExpChange.js
//==============================================================================

/*:
* @plugindesc Changes how enemies give EXP. Now it's based on actor and enemy level.
* @author Mr. Trivel
*
* @param Default Mode
* @desc If no tags on enemy, by default should it be percent or flat change?
* Default: percent
* @default percent
*
* @param Default Change Up
* @desc By how much should exp change per level difference when actor level > enemy level?
* @default 10
*
* @param Default Change Down
* @desc By how much should exp change per level difference when actor level < enemy level?
* @default 5
* 
* @param Obtained Exp Message
* @desc Message display after victory
* @default %1 received %2 %3!
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
* <Level: [INT]> - Set level for the enemy. All calculations are based on it.
* If not set, it'll be assumed as Level 1.
* <ChangeMode: [Flat/Percent] - Set a specific change type instead of default.
* <ChangeUp: [Number]> - Set a specific change of exp instead of default when
*                        Actor Level > Enemy Level
* <ChangeDown: [Number]> - Set a specific change of exp instead of default when
*                          Actor Level < Enemy Level
* Example:
* <Level: 57>
* <ChangeMode: Percent>
* <ChangeUp: 10>
* <ChangeDown: 5>
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function(){
	var parameters = PluginManager.parameters('MrTS_EnemyExpChange');

	var paramDefaultMode = String(parameters['Default Mode'] || "percent");
	var paramDefaultChangeUp = Number(parameters['Default Change Up'] || 10);
	var paramDefaultChangeDown = Number(parameters['Default Change Down'] || 5);
	var expObtainedMessage = String(parameters['Obtained Exp Message'] || "%1 received %2 %3!");

	Game_Troop.prototype.expTotal = function() {
		var t_exp = [];
		var i = 0;
		$gameParty.allMembers().forEach(function(member){
			t_exp[i] = 0;
			$gameTroop.deadMembers().forEach(function(enemy){
				var dif = (enemy.enemy().meta.Level ? enemy.enemy().meta.Level : 1) - member.level;
				var exp = enemy.exp();
				var mode = enemy.enemy().meta.ChangeMode ? String(enemy.enemy().meta.ChangeMode).toLowerCase() : paramDefaultMode;
				if (dif > 0)
				{
					var totalChange = (enemy.enemy().meta.ChangeDown ? enemy.enemy().meta.ChangeDown : paramDefaultChangeDown) * dif;
					if (mode === "flat" || mode === " flat")
						exp += totalChange;
					else
						exp += Math.floor(exp * (totalChange/100));
				}
				else if (dif < 0)
				{

					var totalChange = (enemy.enemy().meta.ChangeUp ? enemy.enemy().meta.ChangeUp : paramDefaultChangeUp) * dif;
					if (mode === "flat" || mode === " flat")
						exp += totalChange;
					else
						exp += Math.floor(exp * (totalChange/100));
				}

				if (exp < 0) exp = 0;
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
