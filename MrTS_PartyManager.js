//=============================================================================
// MrTS_PartyManager.js
//=============================================================================

/*:
* @plugindesc Allows to check and change your party.
* @author Mr. Trivel
*
* @param In Menu
* @desc Is Party Manager accessible from Menu? True/False
* Default: True
* @default True
*
* @param Command Name
* @desc Party Manager Command Text
* Default: Party
* @default Party
*
* @param Party Text
* @desc Current party text.
* Default: Party
* @default Party
*
* @param Members Text
* @desc Members list text.
* Default: Members
* @default Members
*
* @param Required Text
* @desc Required members text.
* Default: Required:
* @default Required: 
*
* @param Draw TP
* @desc Draw TP In Party Manager?
* Default: False
* @default False
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial and non-commercial projects.
* --------------------------------------------------------------------------------
* Version 1.1a
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* PartyManager Open - Opens Party Manager Scene
* PartyManager Require [AMOUNT] - Require a specific amount of members in party
*                               - 0 for any amount
* PartyManager MustUse [ID] - Must use actor of ID in party
* PartyManager MustUseRemove [ID] - Remove needing actor of ID
* PartyManager MustUseClear - Remove all needed actors
* 
* PartyManager Add [ID] - Add a member to party manager
* PartyManager Remove [ID] - Remove a member from party manager
* 
* PartyMangaer Lock [ID] - Lock a member in party manager (make unselectable)
* PartyManager Unlock [ID] - Unlock member in party manager (make selectable)
*
* PartyManager MenuLock - Disable command in menu (grey out)
* PartyManager MenuUnlock - Enable command in menu
*
* Examples:
* PartyManager Require 3
* PartyManager MustUse 2
* PartyManager MustUseRemove 5
* PartyManager Open
*
* PartyManager MustUseClear
* 
* PartyManager Add 7
* PartyManager Remove 8
*
* PartyManager Lock 2
* PartyManager Lock 3
* PartyManager Lock 4
* PartyManager Unlock 5 
*
* PartyManager MenuLock
* PartyManager MenuUnlock
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1a- Fixed Lv being out of window in default resolution.
* 1.1 - Fixed disappearing members.
*     - Fixed removing members from party.
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_PartyManager');
	var paramInMenu = (parameters['In Menu'] || "True").toLowerCase() === "true";
	var paramCommandName = String(parameters['Command Name'] || "Party");
	var paramPartyText = String(parameters['Party Text'] || "Party");
	var paramMembersText = String(parameters['Members Text'] || "Members");
	var paramRequiredText = String(parameters['Required Text'] || "Required:");
	var paramDrawTp = (parameters['Draw TP'] || "False").toLowerCase() === "true";

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "partymanager") {
			switch (args[0].toUpperCase())
			{
				case 'OPEN':
				{
					SceneManager.push(Scene_PartyManager);
				} break;
				case 'REQUIRE':
				{
					$gameParty.setRequiredPartyMembers(Number(args[1]));
				} break;
				case 'MUSTUSE':
				{
					$gameParty.mustUsePartyMember(Number(args[1]));
				} break;
				case 'MUSTUSEREMOVE':
				{
					$gameParty.mustNotUsePartyMember(Number(args[1]));
				} break;
				case 'MUSTUSECLEAR':
				{
					$gameParty.mustClearPartyMember(Number(args[1]));
				} break;				
				case 'ADD':
				{
					$gameParty.addMemberToPartyManager(Number(args[1]));
				} break;
				case 'REMOVE':
				{
					$gameParty.removeMemberFromPartyManager(Number(args[1]));
				} break;
				case 'LOCK':
				{
					$gameParty.lockPartyMember(Number(args[1]));
				} break;
				case 'UNLOCK':
				{
					$gameParty.unlockPartyMember(Number(args[1]));
				} break;
				case 'MENULOCK':
				{
					$gameSystem.partyManagerMenuDisabled(true);
				} break;
				case 'MENUUNLOCK':
				{
					$gameSystem.partyManagerMenuDisabled(false);
				} break;
			}
		}
	};

	//--------------------------------------------------------------------------
	// Game_System
	// 
	
	Game_System.prototype.partyManagerMenuDisabled = function(t) {
		this._partyManagerMenuDisabled = t;
	};

	Game_System.prototype.isPartyManagerInMenuDisabled = function() {
		return !!this._partyManagerMenuDisabled;
	};

	//--------------------------------------------------------------------------
	// Window_MenuCommand
	// 
	
	var _Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
	Window_MenuCommand.prototype.addOriginalCommands = function() {
		_Window_MenuCommand_addOriginalCommands.call(this);
		if (paramInMenu)
			this.addCommand(paramCommandName, 'partyManager', !$gameSystem.isPartyManagerInMenuDisabled());
	};

	//--------------------------------------------------------------------------
	// Scene_Menu
	// 

	var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
	Scene_Menu.prototype.createCommandWindow = function() {
		_Scene_Menu_createCommandWindow.call(this);
		this._commandWindow.setHandler('partyManager', this.commandPartyManager.bind(this));
	};

	Scene_Menu.prototype.commandPartyManager = function() {
		SceneManager.push(Scene_PartyManager);
	};

	//--------------------------------------------------------------------------
	// Game_Actor
	// 

	var _Game_Actor_initialize = Game_Actor.prototype.initialize;
	Game_Actor.prototype.initialize = function(actorId) {
		if (!$gameParty.partyMemberExists(actorId)) $gameParty.removeMemberFromPartyManager(actorId);
		_Game_Actor_initialize.call(this, actorId);
		
	};

	//--------------------------------------------------------------------------
	// Game_Party
	// 

	var _Game_Party_initialize = Game_Party.prototype.initialize;
	Game_Party.prototype.initialize = function() {
		_Game_Party_initialize.call(this);
		this._partyManagerMembers = [];
		this._partyManagerMembersOutside = [];
		this._requiredPartyManagerMembers = 0;
		this._mustUsePartyManagerMembers = [];
	};

	Game_Party.prototype.createPartyManagerMember = function() {
		return {ID: 0, Locked: false};
	};

	Game_Party.prototype.getRequiredPartyMemberAmount = function() {
		return this._requiredPartyManagerMembers;
	};

	Game_Party.prototype.setRequiredPartyMembers = function(amount) {
		this._requiredPartyManagerMembers = amount;
	};

	Game_Party.prototype.getRequiredPartyMembers = function() {
		return this._mustUsePartyManagerMembers;
	};

	Game_Party.prototype.getPartyManagerMembers = function() {
		return this._partyManagerMembers;
	};

	Game_Party.prototype.partyMemberExists = function(id) {
		for (var i = 0; i < this._partyManagerMembers.length; i++) {
			if (this._partyManagerMembers[i].ID === id) return true;
		}
		for (var i = 0; i < this._partyManagerMembersOutside.length; i++) {
			if (this._partyManagerMembersOutside[i].ID === id) return true;
		}
		return false;
	};

	Game_Party.prototype.partyMemberInParty = function(id) {
		for (var i = 0; i < this.members().length; i++) {
			if (this.members()[i].actorId() === id) return true;
		}
		return false;
	};

	Game_Party.prototype.addMemberToPartyManager = function(id) {
		if (!this.partyMemberExists(id)) {
			var tmpMember = this.createPartyManagerMember();
			tmpMember.ID = id;
			if (this.partyMemberInParty(id))
				this._partyManagerMembersOutside.push(tmpMember);
			else
				this._partyManagerMembers.push(tmpMember);
			ImageManager.loadCharacter($gameActors.actor(id).characterName());
		} else {
			for (var i = 0; i < this._partyManagerMembersOutside.length; i++) {
				var member = this._partyManagerMembersOutside[i];
				if (member.ID === id) {
					this._partyManagerMembers.push(member);
					this._partyManagerMembersOutside.splice(i, 1);
					break;
				}
			}
		}
	};

	Game_Party.prototype.removeMemberFromPartyManager = function(id) {
		if (!this.partyMemberExists(id)) {
			var tmpMember = this.createPartyManagerMember();
			tmpMember.ID = id;
			this._partyManagerMembersOutside.push(tmpMember);
		} else {
			for (var i = 0; i < this._partyManagerMembers.length; i++) {
				if (this._partyManagerMembers[i].ID === id) {
					var member = this._partyManagerMembers[i];
					this._partyManagerMembersOutside.push(member);
					this._partyManagerMembers.splice(i, 1);
					break;
				}
			}
		}
	};

	Game_Party.prototype.lockPartyMember = function(id) {
		if (!this.partyMemberExists(id)) {
			var tmpMember = this.createPartyManagerMember();
			tmpMember.ID = id;
			tmpMember.Locked = true;
			this._partyManagerMembersOutside.push(tmpMember);
		} else {
			for (var i = 0; i < this._partyManagerMembersOutside.length; i++) {
				if (this._partyManagerMembersOutside[i].ID === id) {
					this._partyManagerMembersOutside[i].Locked = true;
					break;
				}
			}
			for (var i = 0; i < this._partyManagerMembers.length; i++) {
				if (this._partyManagerMembers[i].ID === id) {
					this._partyManagerMembers[i].Locked = true;
					break;
				}
			}
		}
	};

	Game_Party.prototype.unlockPartyMember = function(id) {
		if (!this.partyMemberExists(id)) {
			var tmpMember = this.createPartyManagerMember();
			tmpMember.ID = id;
			tmpMember.Locked = false;
			this._partyManagerMembersOutside.push(tmpMember);
		} else {
			for (var i = 0; i < this._partyManagerMembersOutside.length; i++) {
				if (this._partyManagerMembersOutside[i].ID === id) {
					this._partyManagerMembersOutside[i].Locked = false;
					break;
				}
			}
			for (var i = 0; i < this._partyManagerMembers.length; i++) {
				if (this._partyManagerMembers[i].ID === id) {
					this._partyManagerMembers[i].Locked = false;
					break;
				}
			}
		}
	};

	Game_Party.prototype.requirePartyMemberAmount = function(amount) {
		this._requiredPartyManagerMembers = amount;
		if (this.members().length > amount)
		{
			for (var i = this.members().length - 1; i > amount; i--) {
				this.removeActor(this.members()[i].actorId());
			}
		}
	};

	Game_Party.prototype.mustUsePartyMember = function(id) {
		if (!this.partyMemberExists(id)) {
			var tmpMember = this.createPartyManagerMember();
			tmpMember.ID = id;
			if (this.partyMemberInParty(id))
				this._partyManagerMembersOutside.push(tmpMember);
			else
				this._partyManagerMembers.push(tmpMember);
			this._mustUsePartyManagerMembers.push(id);
		} else {
			this._mustUsePartyManagerMembers.push(id);
		}
	};

	Game_Party.prototype.mustNotUsePartyMember = function(id) {
		if (this._mustUsePartyManagerMembers.contains(id)) {
			this._mustUsePartyManagerMembers.splice(this._mustUsePartyManagerMembers.indexOf(id), 1);
		}
	};

	Game_Party.prototype.mustClearPartyMember = function() {
		this._mustUsePartyManagerMembers = [];
	};

	var _Game_Party_addActor = Game_Party.prototype.addActor;
	Game_Party.prototype.addActor = function(actorId) {
		if (!this._actors.contains(actorId)) this.removeMemberFromPartyManager(actorId);
		_Game_Party_addActor.call(this, actorId);
	};

	var _Game_Party_removeActor = Game_Party.prototype.removeActor;
	Game_Party.prototype.removeActor = function(actorId) {
		if (this._actors.contains(actorId)) this.addMemberToPartyManager(actorId);
		_Game_Party_removeActor.call(this, actorId);
	};

	//--------------------------------------------------------------------------
	// Scene_PartyManager
	//
	// Manages party.
	
	function Scene_PartyManager() {
		this.initialize.apply(this, arguments);	
	};
	
	Scene_PartyManager.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_PartyManager.prototype.constructor = Scene_PartyManager;
	
	Scene_PartyManager.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	};
	
	Scene_PartyManager.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createWindowPartyName();
		this.createWindowParty();
		this.createWindowMembersName();
		this.createWindowMembers();
		this.createWindowActorInfo();
	};

	Scene_PartyManager.prototype.createWindowPartyName = function() {
		var ww = 816/3;
		var wx = Graphics.boxWidth/2 - 816/2;
		var wy = Graphics.boxHeight/2 - 624/2;
		this._windowPartyName = new Window_PartyManager_PartyName(wx, wy, ww);
		this.addWindow(this._windowPartyName);
	};

	Scene_PartyManager.prototype.createWindowParty = function() {
		var ww = this._windowPartyName.width;
		var wx = this._windowPartyName.x;
		var wy = this._windowPartyName.y + this._windowPartyName.height;
		this._windowPartyList = new Window_PartyManager_PartyList(wx, wy, ww);
		this._windowPartyList.setHandler('ok', this.partyOk.bind(this));
		this._windowPartyList.setHandler('cancel', this.partyCancel.bind(this));
		this.addWindow(this._windowPartyList);
		this._windowPartyList.select(0);
		this._windowPartyList.activate();
	};

	Scene_PartyManager.prototype.createWindowMembersName = function() {
		var ww = this._windowPartyList.width;
		var wx = this._windowPartyList.x;
		var wy = this._windowPartyList.y + this._windowPartyList.height;
		this._windowMemberName = new Window_PartyManager_MemberName(wx, wy, ww);
		this.addWindow(this._windowMemberName);
	};

	Scene_PartyManager.prototype.createWindowMembers = function() {
		var ww = this._windowMemberName.width;
		var wx = this._windowMemberName.x;
		var wy = this._windowMemberName.y + this._windowMemberName.height;
		var wh = 624 - this._windowPartyName.height - this._windowPartyList.height - this._windowMemberName.height;
		this._windowMemberList = new Window_PartyManager_MemberList(wx, wy, ww, wh);
		this._windowMemberList.setHandler('ok', this.membersOk.bind(this));
		this._windowMemberList.setHandler('cancel', this.membersCancel.bind(this));
		this.addWindow(this._windowMemberList);
	};

	Scene_PartyManager.prototype.createWindowActorInfo = function() {
		var ww = 816 - this._windowMemberName.width;
		var wx = this._windowMemberName.x + this._windowMemberName.width;
		var wy = this._windowPartyName.y;
		var wh = 624;
		this._windowActorInfo = new Window_PartyManager_ActorInfo(wx, wy, ww, wh);
		this._windowActorInfo.setActor($gameParty.members()[0]);
		this.addWindow(this._windowActorInfo);

		this._windowMemberList.setInfoWindow(this._windowActorInfo);
		this._windowPartyList.setInfoWindow(this._windowActorInfo);
	};

	Scene_PartyManager.prototype.partyOk = function() {
		this._windowPartyList.deactivate();
		this._windowMemberList.select(0);
		this._windowMemberList.activate();
	};

	Scene_PartyManager.prototype.partyCancel = function() {
		var amount = $gameParty.getRequiredPartyMemberAmount();
		var mustHave = $gameParty.getRequiredPartyMembers();
		if (amount > 0 && $gameParty.members().length !== amount) 
		{
			this._windowPartyList.playBuzzerSound();
			return;
		}
		if ($gameParty.members().length === 0)
		{
			this._windowPartyList.playBuzzerSound();
			return;
		}
		for (var i = 0; i < mustHave.length; i++) {
			var actor = $gameActors.actor(mustHave[i]);
			if (!$gameParty.members().contains(actor))
			{
				this._windowPartyList.playBuzzerSound();
				return;
			} 
		}

        SoundManager.playCancel();
		this.popScene();
	};

	Scene_PartyManager.prototype.membersOk = function() {
		var actor = this._windowMemberList.item(this._windowMemberList.index());
		var partyActor = this._windowPartyList.item(this._windowPartyList.index());
		if (actor)
			$gameParty.addActor(actor.actorId());

		if (partyActor)
		{
			$gameParty.swapOrder(this._windowPartyList.index(), $gameParty.members().length-1);
			$gameParty.removeActor(partyActor.actorId());
		}

		this._windowMemberList.refresh();
		this._windowMemberName.refresh();
		this._windowPartyList.refresh();
		this._windowPartyName.refresh();
		this._windowMemberList.deselect();
		this._windowMemberList.deactivate();
		this._windowPartyList.activate();
	};

	Scene_PartyManager.prototype.membersCancel = function() {
		this._windowMemberList.deselect();
		this._windowMemberList.deactivate();
		this._windowPartyList.activate();
	};

	//--------------------------------------------------------------------------
	// Window_PartyManager_PartyName
	//
	// Shows how many slots are available.
	
	function Window_PartyManager_PartyName() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_PartyManager_PartyName.prototype = Object.create(Window_Base.prototype);
	Window_PartyManager_PartyName.prototype.constructor = Window_PartyManager_PartyName;
	
	Window_PartyManager_PartyName.prototype.initialize = function(x, y, w) {
		Window_Base.prototype.initialize.call(this, x, y, w, this.fittingHeight(1));
		this.refresh();
	};
	
	Window_PartyManager_PartyName.prototype.refresh = function() {
		this.contents.clear();
		var txt = paramPartyText;
		var amount = $gameParty.getRequiredPartyMemberAmount();
		if (amount > 0) txt += " (" + $gameParty.members().length + "/" + amount + ")";
		this.drawText(txt, 0, 0, this.contentsWidth(), 'center');
	};

	//--------------------------------------------------------------------------
	// Window_PartyManager_PartyList
	//
	// Shows a list of current party members.
	
	function Window_PartyManager_PartyList() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_PartyManager_PartyList.prototype = Object.create(Window_Selectable.prototype);
	Window_PartyManager_PartyList.prototype.constructor = Window_PartyManager_PartyList;
	
	Window_PartyManager_PartyList.prototype.initialize = function(x, y, w) {
		Window_Selectable.prototype.initialize.call(this, x, y, w, this.fittingHeight());
		this.refresh();
	};

	Window_PartyManager_PartyList.prototype.maxItems = function() {
		var amount = $gameParty.getRequiredPartyMemberAmount()
		var mlen = $gameParty.members().length;
		if (amount > 0)
			return mlen < amount ? mlen + 1 : amount;
		else
			return mlen < $gameParty.maxBattleMembers() ? mlen + 1 : $gameParty.maxBattleMembers();
	};

	Window_PartyManager_PartyList.prototype.maxCols = function() {
	    return 4;
	};

	Window_PartyManager_PartyList.prototype.itemWidth = function() {
	    return 48;
	};

	Window_PartyManager_PartyList.prototype.itemHeight = function() {
	    return 48;
	};

	Window_PartyManager_PartyList.prototype.fittingHeight = function() {
		return this.standardPadding()*2 + this.itemHeight();
	};

	Window_PartyManager_PartyList.prototype.item = function(index) {
		return $gameParty.members()[index];
	};

	Window_PartyManager_PartyList.prototype.drawItem = function(index) {
		var actor = this.item(index);
		if (actor)
		{
			var rect = this.itemRect(index);
			this.drawActorCharacter(actor, rect.x+24, rect.y+48);
		}
	};

	Window_PartyManager_PartyList.prototype.itemRect = function(index) {
	    var rect = new Rectangle();
	    var maxCols = this.maxCols();
	    rect.width = this.itemWidth();
	    rect.height = this.itemHeight();
	    rect.x = index % maxCols * (this.contentsWidth()/4);
	    rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY;
	    return rect;
	};

	Window_PartyManager_PartyList.prototype.setInfoWindow = function(infoWindow) {
		this._infoWindow = infoWindow;
	};

	Window_PartyManager_PartyList.prototype.update = function() {
		Window_Selectable.prototype.update.call(this);
		if (this._infoWindow && this.item(this.index())) this._infoWindow.setActor(this.item(this.index()));
	};

	Window_PartyManager_PartyList.prototype.processCancel = function() {
	    this.updateInputData();
	    this.callCancelHandler();
	};

	//--------------------------------------------------------------------------
	// Window_PartyManager_MemberName
	//
	// Window above member list.
	
	function Window_PartyManager_MemberName() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_PartyManager_MemberName.prototype = Object.create(Window_Base.prototype);
	Window_PartyManager_MemberName.prototype.constructor = Window_PartyManager_MemberName;
	
	Window_PartyManager_MemberName.prototype.initialize = function(x, y, w) {
		Window_Base.prototype.initialize.call(this, x, y, w, this.fittingHeight());
		this.refresh();
	};
	
	Window_PartyManager_MemberName.prototype.refresh = function() {
		this.contents.clear();
		var requiredMembers = $gameParty.getRequiredPartyMembers();
		if (requiredMembers.length > 0)
		{
			var txtWidth = this.textWidth(paramRequiredText);
			this.drawText(paramRequiredText, 0, this.contentsHeight()/2-this.lineHeight()/2);
			var pos = 0;
			for (var i = 0; i < requiredMembers.length; i++) {
				if (pos === 2) {
					break;	
				} 
				if (!$gameParty.members().contains($gameActors.actor(requiredMembers[i])))
				{
					this.drawActorCharacter($gameActors.actor(requiredMembers[i]), txtWidth + 24 + 48*pos, 48);
					pos++;
				}				
			}
		} else {
			this.drawText(paramMembersText, 0, this.contentsHeight()/2-this.lineHeight()/2, this.contentsWidth(), 'center');
		}
	};

	Window_PartyManager_MemberName.prototype.fittingHeight = function() {
		return this.standardPadding()*2 + 48;
	};

	//--------------------------------------------------------------------------
	// Window_PartyManager_MemberList
	//
	// List of all available party members.
	
	function Window_PartyManager_MemberList() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_PartyManager_MemberList.prototype = Object.create(Window_Selectable.prototype);
	Window_PartyManager_MemberList.prototype.constructor = Window_PartyManager_MemberList;
	
	Window_PartyManager_MemberList.prototype.initialize = function(x, y, w, h) {
		Window_Selectable.prototype.initialize.call(this, x, y, w, h);
		this.refresh();
	};

	Window_PartyManager_MemberList.prototype.maxItems = function() {
		return $gameParty.getPartyManagerMembers().length + 1;
	};

	Window_PartyManager_MemberList.prototype.maxCols = function() {
	    return 4;
	};

	Window_PartyManager_MemberList.prototype.itemWidth = function() {
	    return 48;
	};

	Window_PartyManager_MemberList.prototype.itemHeight = function() {
	    return 48;
	};

	Window_PartyManager_MemberList.prototype.fittingHeight = function() {
		return this.standardPadding()*2 + this.itemHeight();
	};

	Window_PartyManager_MemberList.prototype.item = function(index) {
		if ($gameParty.getPartyManagerMembers()[index])
			return $gameActors.actor($gameParty.getPartyManagerMembers()[index].ID)
		return null;
	};

	Window_PartyManager_MemberList.prototype.drawItem = function(index) {
		var actor = this.item(index);
		if (actor)
		{
			var rect = this.itemRect(index);
   			this.changePaintOpacity(this.isItemEnabled(index));
			this.drawActorCharacter(actor, rect.x+24, rect.y+48);
			this.changePaintOpacity(true);
		}
	};

	Window_PartyManager_MemberList.prototype.itemRect = function(index) {
	    var rect = new Rectangle();
	    var maxCols = this.maxCols();
	    rect.width = this.itemWidth();
	    rect.height = this.itemHeight();
	    rect.x = index % maxCols * (this.contentsWidth()/4);
	    rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY;
	    return rect;
	};

	Window_PartyManager_MemberList.prototype.setInfoWindow = function(infoWindow) {
		this._infoWindow = infoWindow;
	};

	Window_PartyManager_MemberList.prototype.update = function() {
		Window_Selectable.prototype.update.call(this);
		if (this._infoWindow && this.item(this.index())) this._infoWindow.setActor(this.item(this.index()));
	};

	Window_PartyManager_MemberList.prototype.isCurrentItemEnabled = function() {
		var actor = this.item(this.index());
		if (actor)
		{
			var a = $gameParty.getPartyManagerMembers()[this.index()];
			return !a.Locked;
		}
	    return true;
	};

	Window_PartyManager_MemberList.prototype.isItemEnabled = function(index) {
		var actor = this.item(index);
		if (actor)
		{
			var a = $gameParty.getPartyManagerMembers()[index];
			return !a.Locked;
		}
	    return true;
	};

	//--------------------------------------------------------------------------
	// Window_PartyManager_ActorInfo
	//
	// Displays all actor info.
	
	function Window_PartyManager_ActorInfo() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_PartyManager_ActorInfo.prototype = Object.create(Window_Base.prototype);
	Window_PartyManager_ActorInfo.prototype.constructor = Window_PartyManager_ActorInfo;
	
	Window_PartyManager_ActorInfo.prototype.initialize = function(x, y, w, h) {
		this._actor = null
		Window_Base.prototype.initialize.call(this, x, y, w, h);
	};
	
	Window_PartyManager_ActorInfo.prototype.refresh = function() {
		this.contents.clear();
		var actor = this._actor;
		if (actor)
		{
			var x = 0;
			var y = 0;
			var width = this.contentsWidth();
			var lineHeight = this.lineHeight();
		    var x2 = x + 180;
		    var width2 = Math.min(200, width - 180 - this.textPadding());
		    this.drawActorName(actor, x, y);
		    this.drawActorClass(actor, x2, y);
		    this.drawActorLevel(actor, x2+width2+10, y);
		    this.drawHorzLine(y+lineHeight*1);
		    this.drawActorFace(actor, x, y + lineHeight *2);
		    this.drawActorHp(actor, x2, y + lineHeight * 2, width2);
		    this.drawActorMp(actor, x2, y + lineHeight * 3, width2);
		    if (paramDrawTp)
		    	this.drawActorTp(actor, x2, y + lineHeight * 4, width2);
		    this.drawHorzLine(y+lineHeight*6);
		    this.drawParameters(x+12, y + lineHeight * 7);
		    this.drawEquipments(x+272, y + lineHeight * 7);
		}
	};

	Window_PartyManager_ActorInfo.prototype.setActor = function(actor) {
		this._actor = actor;
		this.refresh();
	};

	Window_PartyManager_ActorInfo.prototype.drawParameters = function(x, y) {
	    var lineHeight = this.lineHeight();
	    for (var i = 0; i < 6; i++) {
	        var paramId = i + 2;
	        var y2 = y + lineHeight * i;
	        this.changeTextColor(this.systemColor());
	        this.drawText(TextManager.param(paramId), x, y2, 160);
	        this.resetTextColor();
	        this.drawText(this._actor.param(paramId), x + 160, y2, 60, 'right');
	    }
	};

	Window_PartyManager_ActorInfo.prototype.drawEquipments = function(x, y) {
	    var equips = this._actor.equips();
	    var count = Math.min(equips.length, this.maxEquipmentLines());
	    for (var i = 0; i < count; i++) {
	        this.drawItemName(equips[i], x, y + this.lineHeight() * i);
	    }
	};

	Window_PartyManager_ActorInfo.prototype.maxEquipmentLines = function() {
	    return 6;
	};

	Window_PartyManager_ActorInfo.prototype.drawHorzLine = function(y) {
	    var lineY = y + this.lineHeight() / 2 - 1;
	    this.contents.paintOpacity = 48;
	    this.contents.fillRect(0, lineY, this.contentsWidth(), 2, this.lineColor());
	    this.contents.paintOpacity = 255;
	};

	Window_PartyManager_ActorInfo.prototype.lineColor = function() {
	    return this.normalColor();
	};
})();
