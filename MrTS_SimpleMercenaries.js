//=============================================================================
// MrTS_SimpleMercenaries.js
//=============================================================================

/*:
* @plugindesc Allows mercenary recruiting. They join for X batles.
* @author Mr. Trivel
*
* @param Reduce Timer On Escape
* @desc Should the timer be reduced for mercenaries when escaping?
* (true/false) Default: false
* @default false
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
** 
* --------------------------------------------------------------------------------
* Actor Tags
* --------------------------------------------------------------------------------
* To set up quicksand regions, use the following setup in Map Note Field:
* <Mercenary: [J_CE], [L_CE], [LD_CE]>
* [J_CE] - common event to play when mercenary is recruited
* [L_CE] - common event to play when mercenary leaves
* [LD_CE]- common event to play when mercenary leaves after death (if enabled)
* Set argument to 0 if you don't want Common Event to play.
*
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* Mercenary Add [ID] [BATTLES_COUNT] [LEAVES_ON_DEATH?]
* Mercenary Remove [ID]
*
* [ID] - Actor ID
* [BATTLES_COUNT] - For how many battles will mercenary join
* [LEAVES_ON_DEATH] - true/false - will he leave on death?
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {

	var parameters = PluginManager.parameters('MrTS_SimpleMercenaries');
	var prmTimer = parameters['Reduce Timer On Escape'];
	var paramTimer = (prmTimer && (prmTimer.toLowerCase()) === "true") || false;

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toUpperCase() === 'MERCENARY') {
			switch(args[0].toUpperCase())
			{
				case 'ADD':
				{
					$gameParty.addMercenary(Number(args[1]), Number(args[2]), args[3].toLowerCase() === "true");
				} break;
				case 'REMOVE':
				{
					$gameParty.removeMercenary(Number(args[1]));
				} break;
			}
		}
	};

	//--------------------------------------------------------------------------
	// Game_Actor
	// 

	var _GameActor_setup = Game_Actor.prototype.setup;
	Game_Actor.prototype.setup = function(actorId) {
		_GameActor_setup.call(this, actorId);
		if (this.actor().meta.Mercenary)
		{
			var data = this.actor().meta.Mercenary.split(",");
			this._mercJoinCE = Number(data[0]);
			this._mercLeaveCE = Number(data[1]);
			this._mercDeathCE = Number(data[2]);
		}
		this._isMercenary = false;
		this._mercTimer = 0;
		this._mercLeaveOnDeath = false;
	};

	Game_Actor.prototype.setMercenary = function(turns) {
		this._isMercenary = true;
		this._mercTimer = turns;
	};

	//--------------------------------------------------------------------------
	// Game_Party
	// 

	Game_Party.prototype.reduceMercTimer = function() {
		for (var i = 0; i < this.battleMembers().length; i++) {
			if (this.battleMembers()[i]._isMercenary)
			{
				this.battleMembers()[i]._mercTimer--;
				if (this.battleMembers()[i]._mercTimer <= 0)
					this.removeMercenary(this.battleMembers()[i].actorId());
			}
			
		};
	};

	Game_Party.prototype.removeMercenary = function(id, leaveEvent) {
		var leaveEvent = leaveEvent || true;
		var actor = $gameActors.actor(id);
		actor._isMercenary = false;
		
		if (leaveEvent && actor._mercLeaveCE > 0)
			$gameTemp.reserveCommonEvent(actor._mercLeaveCE);
		this.removeActor(id);
	};

	Game_Party.prototype.addMercenary = function(id, battles, leavesOnDeath) {
		var actor = $gameActors.actor(id);
		actor._isMercenary = true;
		actor._mercTimer = battles;
		actor._mercLeaveOnDeath = leavesOnDeath;
		this.addActor(id);
		if (actor._mercJoinCE > 0)
		{
			$gameTemp.reserveCommonEvent(actor._mercJoinCE);
		}
	};

	Game_Party.prototype.checkForDeadMercs = function() {
		for (var i = 0; i < this.battleMembers().length; i++) {
			if (this.battleMembers()[i]._isMercenary && this.battleMembers()[i].isDead())
			{
				if (this.battleMembers()[i]._mercLeaveOnDeath)
				{
					if (this.battleMembers()[i]._mercDeathCE > 0)
						$gameTemp.reserveCommonEvent(this.battleMembers()[i]._mercDeathCE);
					this.removeMercenary(this.battleMembers()[i].actorId(), false)
				}
			}
		};
	};

	//--------------------------------------------------------------------------
	// BattleManager
	// 

	var _BattleManager_endBattle = BattleManager.endBattle;
	BattleManager.endBattle = function(result) {
		if ((result === 1 && paramTimer) || result !== 1)
			$gameParty.reduceMercTimer();
		
		_BattleManager_endBattle.call(this, result);
	};

	var _BattleManager_endAction = BattleManager.endAction;
	BattleManager.endAction = function() {
		_BattleManager_endAction.call(this);
		$gameParty.checkForDeadMercs();
	};
})();
