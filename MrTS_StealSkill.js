//==============================================================================
// MrTS_StealSkill.js
//==============================================================================

/*:
* @plugindesc Allows to steal items and skills from enemies.
* @author Mr. Trivel
*
*
* @param Steal Mode
* @desc 1 - try to steal every item, 2 - try to steal 1 item. If
* mode is 2, % of all items has to add up to 1.0 or less.
* @default 1
* 
* @param Steal Success Text
* @desc Text shown on successful steal.
* @default %1 stole %2 from %3!
*
* @param Steal Success Text
* @desc Text shown on successful skill steal.
* @default %1 stole skill %2 from %3!
*
* @param Steal Fail Text
* @desc Text shown on failed steal.
* @default %1 failed to steal from %2.
*
* @param Nothing Left Text
* @desc Text shown on when there's no more items to steal.
* @default %1 doesn't have anything left!
* 
* @help Version 1.2
* Free for non-commercial use only.
*
* ## Modes
* Mode 1 - Attempts to steal every item at once,
* So if enemy has 3 available items to steal, player has a chance
* to steal them all.
*
* Mode 2 - Attemps to steal only 1 item.
* So if enemy has 3 available items to steal, player has a chance
* to steal only 1 of them.
* E.g. Potion 30%, Sword 20%, Doom Skill 1%.
* Player will have 30% chance to get potion, 20% to get sword
* and 1% to get Doom Skill.
*
* ## Note Fields
* 
* Skill note fields:
* <steal> - Add this to a skill that allows to steal.
*
* Enemy note fields:
* <steal: X, Y, Z, K, L>
* X - item type: w - weapon, a - armour, i - item, s - skill
* Y - item/skill ID
* Z - steal chance. 0.00 - 0% , 0.33 - 33%, 1.00 - 100%
* K - item amount (Use 1 for skill)
* L - number of times steal can success on the enemy
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_StealSkill');
	var stealMode = Number(parameters['Steal Mode'] || 1);
	var stealSuccessText = String(parameters['Steal Success Text'] || "%1 stole %2 from %3!");
	var stealSkillSuccessText = String(parameters['Skill Success Text'] || "%1 stole skill %2 from %3!");
	var stealFailText = String(parameters['Steal Fail Text'] || "%1 failed to steal from %2.");
	var nothingLeftText = String(parameters['Nothing Left Text'] || "%1 doesn't have anything left!");

	var _Game_Enemy_setup = Game_Enemy.prototype.setup;

	Game_Enemy.prototype.setup = function(enemyId, x, y) {
		_Game_Enemy_setup.call(this, enemyId, x, y);
		this.stealableItems = [];
		if (this.enemy().meta.steal)
		{
			var note = this.enemy().note.split(/[\r\n]+/);

			for (var i = 0; i < note.length; i++)
			{
				var regex = /<steal:[ ]*([wais])+,[ ]*(\d+),[ ]*(\d+[.]*\d*),[ ]*(\d+)[, ]*(\d+)>/i;
				var match = regex.exec(note[i]);
				if (!match) continue;
				this.stealableItems.push(match);
			} 
		}
	};


	_Game_ActionResult_clear = Game_ActionResult.prototype.clear;
	Game_ActionResult.prototype.clear = function() {
		_Game_ActionResult_clear.call(this);
		this.stolenItems = [];
		this.stolenSkills = [];
		this.noItemsToSteal = true;
		this.failedSteal = false;
		this.stealAttempt = false;
	};

	_Game_Action_apply = Game_Action.prototype.apply;
	Game_Action.prototype.apply = function(target) {
		_Game_Action_apply.call(this, target);
		var result = target.result();
		if (result.isHit() && this.item().meta.steal) {
			var stolenItems = this.stealSuccess(target, this.subject());
			result.stealAttempt = true;
			if ( stolenItems.length > 0)
			{
				result.stolenItems = stolenItems;
			}
			else
			{
				result.failedSteal = true;
			}
			this.makeSuccess(target);
		}	
	};

	Game_Action.prototype.stealSuccess = function(target, subject){
		var success = [];
		var modeRand = 0;
		var modeRandSum = 0;

		if (stealMode == 2) modeRand = Math.random();
		
		if (target.stealableItems.length > 0)
		{
			for (var i = 0; i < target.stealableItems.length; i++)
			{
				if (stealMode == 2 && success.length > 0) break;

				var stealData = target.stealableItems[i];
				var stealSucceeded = false;

				if (stealMode == 1)
				{
					if (Math.random() <= Number(stealData[3]) && Number(stealData[5]) > 0)
						stealSucceeded = true;
				}
				else if (stealMode == 2) 
				{
					modeRandSum += Number(stealData[3]);
					if (modeRand <= modeRandSum)
						if (Number(stealData[5]) > 0)
							stealSucceeded = true;	
						else
							break;
				}

				if (stealSucceeded)
				{
					target.stealableItems[i][5] = Number(target.stealableItems[i][5])-1;
					
					switch(stealData[1].toLowerCase()){
						case "a":
							var item = $dataArmors[Number(stealData[2])];
							$gameParty.gainItem(item, Number(stealData[4]));
							success.push(item);
							break;
						case "w":
							var item = $dataWeapons[Number(stealData[2])];
							$gameParty.gainItem(item, Number(stealData[4]));
							success.push(item);
							break;
						case "i":
							var item = $dataItems[Number(stealData[2])];
							$gameParty.gainItem(item, Number(stealData[4]));
							success.push(item);
							break;
						case "s":
							var skill = $dataSkills[Number(stealData[2])];
							subject.learnSkill(skill.id);
							success.push(skill);
							break;
					} // switch
				} // if
			} // for

			for (var i = 0; i < target.stealableItems.length; i++)
			{
				if (Number(target.stealableItems[i][5]) > 0) target.result().noItemsToSteal = false; 
			}
		} // if

		return success;
	};

	_Window_BattleLog_displayActionResults = Window_BattleLog.prototype.displayActionResults;
	Window_BattleLog.prototype.displayActionResults = function(subject, target) {
		_Window_BattleLog_displayActionResults.call(this, subject, target);
	    if (target.result().used) {
	    	if (target.result().stolenItems.length > 0)
	    	{
		    	var stolenItems = target.result().stolenItems;
		    	for (var i = 0; i < stolenItems.length; i++)
		    	{
		    		if (!DataManager.isSkill(stolenItems[i]))
		    			this.push('addText', stealSuccessText.format(subject.name(), stolenItems[i].name, target.name()));
		    		else
		    			this.push('addText', stealSkillSuccessText.format(subject.name(), stolenItems[i].name, target.name()));
		    	}
		    }
	        if (target.result().noItemsToSteal && target.result().stealAttempt)
	        	this.push('addText', nothingLeftText.format(target.name()));
	        else if (target.result().failedSteal)
	        	this.push('addText', stealFailText.format(subject.name(), target.name()));
	    }
	};
})();
