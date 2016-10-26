//=============================================================================
// MrTS_ConjureWeapons.js
//=============================================================================

/*:
* @plugindesc Skills can conjure weapons.
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
* Version 1.1
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Skill Tags
* --------------------------------------------------------------------------------
* To make skill conjure a weapon use the following tag:
* <ConjureWeapon: [WEAPON_ID], [DURATION]>
* [WEAPON_ID] - ID of the weapon you're conjuring.
* [DURATION] - How many turns will weapon last. If 0 - lasts whole battle.
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - Bug fix.
* 1.0 - Release
*/

(function() {
	var _GameActor_initMembers = Game_Actor.prototype.initMembers;
	Game_Actor.prototype.initMembers = function() {
		_GameActor_initMembers.call(this);
		this._originalWeapon = 0;
		this._conjureWeaponTimer = 0;
		this._conjuredWeapon = false;
	};

	Game_Actor.prototype.conjureWeapon = function(item, timer) {
		if (this._equips[0]._itemId != item.id)
		{
			if (this._originalWeapon === 0)
				this._originalWeapon = this._equips[0]._itemId;

			this._conjureWeaponTimer = timer;
			this._conjuredWeapon = true;
		    this._equips[0].setObject(item);
		}
		else
		{
			this._conjureWeaponTimer = timer;
		}
	};

	_Game_Action_apply = Game_Action.prototype.apply;
	Game_Action.prototype.apply = function(target) {
		_Game_Action_apply.call(this, target);
	    var result = target.result();
	    if (result.isHit() && this.item().meta.ConjureWeapon)
	    {
	    	var data = this.item().meta.ConjureWeapon.split(",");
	    	var weapon = $dataWeapons[Number(data[0])];
	    	var time = Number(data[1]);
	    	target.conjureWeapon(weapon, time === 0 ? -1 : time+1);
	    }
	};

	Game_Actor.prototype.releaseUnequippableItems = function(forcing) {
	    for (;;) {
	        var slots = this.equipSlots();
	        var equips = this.equips();
	        var changed = false;
	        for (var i = 0; i < equips.length; i++) {
	            var item = equips[i];
	            if (item && (!this.canEquip(item) || item.etypeId !== slots[i]) &&
	            	(!this._conjuredWeapon && i != 0)) {
	                if (!forcing) {
	                    this.tradeItemWithParty(null, item);
	                }
	                this._equips[i].setObject(null);
	                changed = true;
	            }
	        }
	        if (!changed) {
	            break;
	        }
	    }
	};

	var _GameActor_onBattleEnd = Game_Actor.prototype.onBattleEnd;
	Game_Actor.prototype.onBattleEnd = function() {
		_GameActor_onBattleEnd.call(this);
		if (this._originalWeapon > 0)
		{
			this.forceChangeEquip(0, $dataWeapons[this._originalWeapon]);
			this._originalWeapon = 0;
			this._conjuredWeapon = false;
		}
	};

	var _GameActor_onTurnEnd = Game_Actor.prototype.onTurnEnd;
	Game_Actor.prototype.onTurnEnd = function() {
		_GameActor_onTurnEnd.call(this);
		if (this._conjureWeaponTimer > 0)
			this._conjureWeaponTimer--;

		if (this._conjuredWeapon && this._conjureWeaponTimer <= 0)
		{
			this.forceChangeEquip(0, $dataWeapons[this._originalWeapon]);
			this._originalWeapon = 0;
			this._conjuredWeapon = false;
		}
	};
})();
