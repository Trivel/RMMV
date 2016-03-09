//=============================================================================
// MrTS_ItemsSkillsDiffReactions.js
//=============================================================================

/*:
* @plugindesc Skills and items react differently depending on target.
* @author Mr. Trivel
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
* Item/Skill tags
* --------------------------------------------------------------------------------
* Place the following tag into item or skill note field to make it use different
* skill depending on target.
* Note: Works with single target spells only.
* <DependsActor: [ActorID] [SkillID]>
* <DependsEnemy: [EnemyID] [SkillID]>
*
* If target is [ActorID] replace the skill or item with skill of ID [SkillID].
* Examples:
* <DependsActor: 4 99>
* <DependsEnemy: 13 51>
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {

	var _GameAction_apply = Game_Action.prototype.apply;
	Game_Action.prototype.apply = function(target) {
		if ((target.isActor() && this.item().meta.DependsActor ) || 
			(target.isEnemy() && this.item().meta.DependsEnemy))
		{
			this.tryChangeSkillTemporary(this.item(), target);
		}
		_GameAction_apply.call(this, target);
		if (this._tempItem)
		{
			this._item = this._tempItem;
			this._tempItem = null;
		}
	};

	Game_Action.prototype.tryChangeSkillTemporary = function(item, target) {
		var isTargetActor = target.isActor();
		var noteList = item.note.split(/[\r\n]/);
		if (isTargetActor)
		{
			var regex = /<DependsActor:[ ]*(\d+)[ ]+(\d+)>/i;
			for (var i = 0; i < noteList.length; i++) {
				var regexMatch = regex.exec(noteList[i]);
				if (regexMatch)
				{
					if (Number(regexMatch[1]) === target.actorId())
					{
						this._tempItem = this._item;
						this.setSkill(Number(regexMatch[2]));
						break;
					}
				}
			}
		}
		else
		{
			var regex = /<DependsEnemy:[ ]*(\d+)[ ]+(\d+)>/i;
			for (var i = 0; i < noteList.length; i++) {
				var regexMatch = regex.exec(noteList[i]);
				if (regexMatch)
				{
					if (Number(regexMatch[1]) === target.enemyId())
					{
						this._tempItem = this._item;
						this.setSkill(Number(regexMatch[2]));
						break;
					}
				}
			}
		}
	};
})();
