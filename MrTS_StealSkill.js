//==============================================================================
// MrTS_StealSkill.js
//==============================================================================

/*:
* @plugindesc Allows to steal items from enemies.
* @author Mr. Trivel
*  
* @param Steal Success Text
* @desc Text shown on successful steal.
* @default %1 stole %2 from %3!
*
* @param Steal Fail Text
* @desc Text shown on failed steal.
* @default %1 failed to steal from %2.
*
* @param Nothing Left Text
* @desc Text shown on when there's no more items to steal.
* @default %1 doesn't have anything left!
* 
* @help Version 1.1
* Free for non-commercial use.
*
* Skill note fields:
* <steal> - Add this to a skill that allows to steal.
*
* Enemy note fields:
* <steal: X, Y, Z, K, L>
* X - item type: w - weapon, a - armour, i - item
* Y - item ID
* Z - steal chance. 0.00 - 0% , 0.33 - 33%, 1.00 - 100%
* K - item amount
* L - number of times steal can success on the enemy
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_StealSkill');
	var stealSuccessText = String(parameters['Steal Success Text'] || "%1 stole %2 from %3!");
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
				var regex = /<steal:[ ]*([wai])+,[ ]*(\d+),[ ]*(\d+[.]*\d*),[ ]*(\d+)[, ]*(\d+)>/i;
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
		this.noItemsToSteal = false;
		this.failedSteal = false;
	};

	_Game_Action_apply = Game_Action.prototype.apply;
	Game_Action.prototype.apply = function(target) {
		_Game_Action_apply.call(this, target);
		var result = target.result();
		if (result.isHit() && this.item().meta.steal) {
			var stolenItems = this.stealSuccess(target, this.subject());
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
			
		if (target.stealableItems.length > 0)
		{
			for (var i = 0; i < target.stealableItems.length; i++)
			{
				var stealData = target.stealableItems[i];

				if (Number(target.stealableItems[i][5]) > 0) target.result().noItemsToSteal = false; 
				else if (Number(target.stealableItems[i][5]) == 0) target.result().noItemsToSteal = true;

				if (Math.random() < Number(stealData[3]) && Number(stealData[5]) > 0)
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
					} // switch
				} // if
			} // for
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
		    		this.push('addText', stealSuccessText.format(subject.name(), stolenItems[i].name, target.name()));
		    }
	        if (target.result().noItemsToSteal)
	        	this.push('addText', nothingLeftText.format(target.name()));
	        else if (target.result().failedSteal)
	        	this.push('addText', stealFailText.format(subject.name(), target.name()));
	    }
	};
})();
