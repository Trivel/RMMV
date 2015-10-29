//==============================================================================
// MrTS_StealSkill.js
//==============================================================================

/*:
* @plugindesc Adds postfixes to damage dealt.
* @author Mr. Trivel
* * 
* @help Version 1.0
* Free for non-commercial use.
*
* Skill note fields:
* <steal> - Add this to a skill that allows to steal.
*
* Enemy note fields:
* <steal: X, Y, Z, K>
* X - item type: w - weapon, a - armour, i - item
* Y - item ID
* Z - steal chance. 0.00 - 0% , 0.33 - 33%, 1.00 - 100%
* K - amount
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_StealSkill');

	_Game_ActionResult_clear = Game_ActionResult.prototype.clear;
	Game_ActionResult.prototype.clear = function() {
		_Game_ActionResult_clear.call(this);
		this.stolenItems = [];
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
				this.makeSuccess(target);
			}
		}	
	};

	Game_Action.prototype.stealSuccess = function(target, subject){
		var success = [];
			
		if (target.enemy().meta.steal)
		{
			var note = target.enemy().note.split(/[\r\n]+/);

			for (var i = 0; i < note.length; i++)
			{
				var regex = /<steal:[ ]*([wai])+,[ ]*(\d+),[ ]*(\d+[.]*\d*),[ ]*(\d+)>/i;
				var match = regex.exec(note[i]);

				if (match[1] && match[2] && match[3] && match[4])
				{
					if (Math.random() < Number(match[3]))
					{
						switch(match[1].toLowerCase()){
							case "a":
								var item = $dataArmors[Number(match[2])];
								$gameParty.gainItem(item, Number(match[4]));
								success.push(item);
								break;
							case "w":
								var item = $dataWeapons[Number(match[2])];
								$gameParty.gainItem(item, Number(match[4]));
								success.push(item);
								break;
							case "i":
								var item = $dataItems[Number(match[2])];
								$gameParty.gainItem(item, Number(match[4]));
								success.push(item);
								break;
						} // switch
					} // if
				} // if
			} // for
		} // if

		return success;
	};

	_Window_BattleLog_displayActionResults = Window_BattleLog.prototype.displayActionResults;
	Window_BattleLog.prototype.displayActionResults = function(subject, target) {
		_Window_BattleLog_displayActionResults.call(this, subject, target);
	    if (target.result().used && target.result().stolenItems.length > 0) {
	    	var stolenItems = target.result().stolenItems;
	    	for (var i = 0; i < stolenItems.length; i++)
	    		this.push('addText', subject.name() + " stole " + stolenItems[i].name + "!");
	        
	    }
	};
})();
