//==============================================================================
// MrTS_StatesEX.js
//==============================================================================

/*:
* @plugindesc Adds more functionality to States.
* @author Mr. Trivel
*
* @param State Stack Color
* @desc HEX code for state stacks
* @default #e6cc80
* 
* @help This plugin does not provide plugin commands.
* Version 1.0
* Free for non-commercial use only.
*
* Use the following tag in State note fields:
* 
* <trs_at_stacks: X, Y> - X how many stacks needed, Y - to which state to transform
* 
* <max_stacks: X> - X being number of times state can stack.
* ---
*
* Requires <max_stacks: X> to use:
* <inflict_stacks: X> - Inflict X stacks of the state, instead of 1
* <inflict_random_stacks: X, Y> - Inflict between X and Y stacks of the state
* ---
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_StatesEX');

	var stateCountColor = String(parameters['State Stack Color'] || "#e6cc80"); 

	var _Game_BattlerBase_clearStates = Game_BattlerBase.prototype.clearStates;

	Game_BattlerBase.prototype.clearStates = function() {
	    _Game_BattlerBase_clearStates.call(this);
	    this._stateTurnsEx = {};
	};

	Game_Battler.prototype.addState = function(stateId) {
	    if (this.isStateAddable(stateId)) {
	    	var maxStacks = $dataStates[stateId].meta.max_stacks;
	    	if (maxStacks)
	    	{
	    		var inflict_stacks = $dataStates[stateId].meta.inflict_stacks || 1;
	    		if ($dataStates[stateId].meta.inflict_random_stacks)
	    		{
	    			var rand_stacks_arr = $dataStates[stateId].meta.inflict_random_stacks.split(',');
	    			rand_stacks_arr[0] = Number(rand_stacks_arr[0]);
	    			rand_stacks_arr[1] = Number(rand_stacks_arr[1]);
	    			inflict_stacks = Math.floor(Math.random() * (rand_stacks_arr[1] - rand_stacks_arr[0] + 1)  + rand_stacks_arr[0]);
	    		}
	    		
	    		for (var i = 0; i < inflict_stacks; i++)
	    		{
			    	if (this.getStateCount(stateId) < maxStacks)
			    	{
			            this.addNewState(stateId);
	            		this.refresh();
	            		this.addStateCountsEx(stateId);
	            		var trs_at_stacks = $dataStates[stateId].meta.trs_at_stacks;
	            		if (trs_at_stacks)
	            		{
	            			var trs_vals = $dataStates[stateId].meta.trs_at_stacks.split(',');
	            			if (this.getStateCount(stateId) >= Number(trs_vals[0]))
	            			{
	            				for (var j = 0; j < Number(trs_vals[0]); j++)
	            					this.eraseState(stateId);

	            				this.addState(Number(trs_vals[1]));
	            			}
	            		}
			        }
			    }
	    	}
	        else if (!this.isStateAffected(stateId)) {
	            this.addNewState(stateId);
	            this.refresh();
	            this.resetStateCounts(stateId);
	        }

	        this._result.pushAddedState(stateId);
	    }
	};

	Game_BattlerBase.prototype.addStateCountsEx = function(stateId)
	{
	    var state = $dataStates[stateId];
	    var variance = 1 + Math.max(state.maxTurns - state.minTurns, 0);
	    if (!this._stateTurnsEx[stateId]) this._stateTurnsEx[stateId] = [];
	    this._stateTurnsEx[stateId].push(state.minTurns + Math.randomInt(variance));
	}

	var _Game_BattlerBase_isStateExpired = Game_BattlerBase.prototype.isStateExpired;
	Game_BattlerBase.prototype.isStateExpired = function(stateId) {
	    return (!$dataStates[stateId].meta.max_stacks ? _Game_BattlerBase_isStateExpired.call(this, stateId) : this._stateTurnsEx[stateId].contains(0));
	};

	var _Game_BattlerBase_updateStateTurns = Game_BattlerBase.prototype.updateStateTurns;
	Game_BattlerBase.prototype.updateStateTurns = function() {
		_Game_BattlerBase_updateStateTurns.call(this);
	    this.uniqueStates().forEach(function(s) {
	        if (this._stateTurnsEx[s.id] && this._stateTurnsEx[s.id].length > 0) {
	        	for (var i = 0; i < this._stateTurnsEx[s.id].length; i++)
	        		this._stateTurnsEx[s.id][i]--;
	        }
	    }, this);
	};

	var _Game_BattlerBase_eraseState = Game_BattlerBase.prototype.eraseState;
	Game_BattlerBase.prototype.eraseState = function(stateId) {
		if ($dataStates[stateId].meta.max_stacks)
		{
			this._stateTurnsEx[stateId].splice(0, 1);
		}
		_Game_BattlerBase_eraseState.call(this, stateId);
	};

	Game_Battler.prototype.getStateCount = function(stateId) {
		var count = 0;
		this._states.forEach(function(sId) {
			if (sId === stateId) count++;
		});
		return count;	
	};

	Game_BattlerBase.prototype.uniqueStates = function() {
		var arr = this.states();
		var newArr = [];
		arr.forEach(function(s){
			if (!newArr.contains(s)) newArr.push(s);
		});
	    return newArr;
	};

	Game_BattlerBase.prototype.uniqueStateIcons = function() {
	    return this.uniqueStates().map(function(state) {
	        return state.iconIndex;
	    }).filter(function(iconIndex) {
	        return iconIndex > 0;
	    });
	};

	Game_BattlerBase.prototype.allUniqueIcons = function() {
    return this.uniqueStateIcons().concat(this.buffIcons());
};

	Window_Base.prototype.drawActorIcons = function(actor, x, y, width) {
	    width = width || 144;
	    var states = actor.uniqueStates();
	    var icons = actor.allUniqueIcons().slice(0, Math.floor(width / Window_Base._iconWidth));
	    for (var i = 0; i < icons.length; i++) {
	        this.drawIcon(icons[i], x + Window_Base._iconWidth * i, y + 2);
	        if (i < states.length)
	        {
		        var count = actor.getStateCount(states[i].id);
		        if (count > 1)
		        {
			        var lastFontSize = this.contents.fontSize;
			        this.contents.fontSize -= 12;
			        this.changeTextColor(stateCountColor);
			        this.drawText(count, x + Window_Base._iconWidth * i, y + 2, Window_Base._iconWidth, 'center');
			        this.contents.fontSize = lastFontSize;
			    }
		    }
	    }
	};
})();
