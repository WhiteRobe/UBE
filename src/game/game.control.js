// 游戏初始化
function gameInit(){
	if(gp_store.state.debug)console.log('游戏初始化...');
	inventory.commit('rstInventory');
	gp_store.dispatch('rstParams');
	for(var w of wildernessSet)w.resetArea();
	gameReadyToStart(); // @click TO Start
}

function gameRestart(){
	if(gp_store.state.debug) console.log('重启完毕...');
	gameInit();
}

function gameReadyToStart(){
	app.$Message.config({
		top: 120, // 设置距离上端120px
		duration:3
	});
	success(app,'资源载入完毕, 游戏可以开始!');
}

// 游戏开始 @click
function gameStart(){
	//gameInit();
	gp_store.commit('setGamePhase',GAMEPHASE.MAP); // to /main/map
}

// 游戏结束
function gameEnd(isWin){
	// @click->gameRestart();
	gp_store.commit('setGamePhase',GAMEPHASE.GAME_END);
	gameRouter.push('/main/end');
}

// 投骰子
function roll(){
	return parseInt((Math.random()*6)+1);
}

// 清除所有事件
function cleanAllEvent(){
	for(let w of wildernessSet) w.events = new Array();
}

// 发生事件
function eventHappend(){
	cleanAllEvent();
	var rolls=[roll(),roll(),roll(),roll()];
	let index = 0;
	for(let r of rolls)
		for(let w of wildernessSet)
			if(r == w.num)
				w.events.push(EVENT_LIST[index++]);
}

/*
// 探索 : 获取探索结果 - 废弃
function searchResult(){
	let result = searchBox.calculate();
	let wilderness = gp_store.state.viewWilderness.wilderness;
	searchBox.clean();
	if(wilderness.events.indexOf(EVENT_LIST[2])!=-1) result = moveToBase(0,result,-10); // 事件:好运气
	return result;
}
*/

// 探索 : 投掷骰子并通过技能得到最终结果后执行
function search(result){
	let wilderness = gp_store.state.viewWilderness.wilderness;
	if(result == 0){
		gp_store.commit('incPerfectSearchSum',1);
		gp_store.commit('incGodsHand',5); // 完美探索:上帝之手充能5
		let construct = wilderness.construct; // 完美探索:找到[已充能]装置
		inventory.dispatch('findItem',construct);
		gp_store.dispatch('chargeItem',construct);
		success(app,'找到一个已充能装置['+construct+']及获得5点上帝之手能量!');
		return endSearch();
	} else if(1<=result && result<=10){
		let construct = wilderness.construct; // 发现装置(若已拥有，改为发现两个组件)
		if(isConstructOwned(construct)){
			let component = wilderness.component;
			inventory.dispatch('findItem',component);inventory.dispatch('findItem',component);
			success(app,'装置['+construct+']已拥有，改为获得2个['+component+']组件!');
		} else {
			inventory.dispatch('findItem',construct);
			success(app,'获得装置['+construct+']!');
		}
		return endSearch();
	} else if(11<=result && result<=99){ // 找到一个组件
		let component = wilderness.component;
		inventory.dispatch('findItem',component);
		success(app,'获得一个组件'+component+'!');
		return endSearch();
	} else {
		let monster = wilderness.pickMonster(result); // 设置遭遇对象
		gp_store.commit('viewBattle/setMonster',monster);
		// if(inventory.state.tre_moonlace) chooseIfEncounter(); // 选择是否无视遭遇战
		return encounter();
	}
}

/*
// 探索 : 选择是否进行遭遇战 [废弃]
function chooseIfEncounter(){
	// showModal yes->encounter() no->pass
}
*/

// 遭遇 : 确认进行遭遇战后进行
function encounter(){
	// showModal usrToll->[dice1 & dice2]+2
	gp_store.commit('setGamePhase',GAMEPHASE.BATTLE);
	gameRouter.push('/main/wilderness/battle');
}

// 战斗 : 计算输入的结果
function combat(dice1,dice2){
	let wilderness = gp_store.state.viewWilderness.wilderness;
	let monster = gp_store.state.viewBattle.monster; // 存储信息，以防昏迷后丢失
	var healthLoss = (monster.isATK(dice1)?1:0) + (monster.isATK(dice2)?1:0); // 计算损失生命
	gp_store.commit('incHealth',0-healthLoss);
	if(healthLoss!=0) error(app,'损失生命'+healthLoss+'!');
	let monsterDied = false;
	if(monster.isHIT(dice1) || monster.isHIT(dice2)){
		// 怪物死亡
		if(monster.isKing()){
			console.log('gohere 1-2-1');
			let treasure = wilderness.treasure;
			inventory.dispatch('findItem',treasure);
			success(app,'击败首领, 获得宝物['+treasure+']!');
		}
		else{
			let victoryNum = roll();
			let component = wilderness.component;
			if(victoryNum>=monster.level){ // 胜利后投掷骰子决定是否取得组件
				inventory.dispatch('findItem',component);
				success(app,'击败怪物, 获得组件['+component+']!');
				if(gp_store.state.debug)console.log('掷点数:'+victoryNum+'. 取得组件:'+component+'!');
			} else {
				if(gp_store.state.debug)console.log('掷点数:'+victoryNum+'. 未取得组件:'+component+'!');
			}
		}
		monsterDied = true;
	}
	
	if(gp_store.state.health<0) return gameEnd(false); // 直接死亡
	else if(gp_store.state.health == 0){ // 昏迷(昏迷前干死敌人可以先取得物品)
		goBackWorkShop();
		recoverFromUnconsciousness();
	} else {
		if(monsterDied) return endBattle(); // 战斗结束,直接退出
		else {
			// 战斗未结束-继续战斗
			if(healthLoss==0) info(app,'新一轮的战斗开始了!'); // 无人受伤的提示
			gp_store.commit('viewBattle/rstDice');
			gp_store.commit('viewBattle/setToolWandUsed',false); // 清空工具使用效果
		}
	}
	
}

// 战斗结束
function endBattle(){
	gp_store.commit('setGamePhase',GAMEPHASE.WILDERNESS);
	gameRouter.push('/main/wilderness');
	gp_store.commit('viewBattle/rstParams',false); //全部清空
	endSearch();
}

// 一次冒险结束
function endSearch(){
	let wilderness = gp_store.state.viewWilderness.wilderness;
	wilderness.addStep();
	gp_store.commit('viewWilderness/setBeginSearch',false);
	gp_store.commit('viewWilderness/rstDiceBox');
	gp_store.commit('viewWilderness/rstDice');
	/*
	if(wilderness.step==6){
		success(app,'本地区探索结束,返回地图!');
		goBackMap();
	}*/
}

// 前往选定的冒险区域
function gotoWilderness(wilderness){
	gp_store.commit('viewWilderness/setWilderness',wilderness);
	gp_store.commit('setGamePhase',GAMEPHASE.WILDERNESS);
	gameRouter.push('/main/wilderness');
}

// 去冒险地图
function gotoMap(){
	gp_store.commit('setGamePhase',GAMEPHASE.MAP);
	gameRouter.push('/main/map');
}

// 去工作室
function gotoWorkShop(){
	gp_store.commit('setGamePhase',GAMEPHASE.WORKSHOP);
	gameRouter.push('/main/workshop');
}

// 从冒险中回到地图
function goBackMap(){
	var wilderness = gp_store.state.viewWilderness.wilderness;
	wilderness.step=0;
	gp_store.commit('viewWilderness/rstParams');
	gp_store.commit('viewBattle/rstParams');
	gotoMap();
	success(app,'已返回冒险地图');
}

// 从冒险中回到工作室
function goBackWorkShop(){
	var wilderness = gp_store.state.viewWilderness.wilderness;
	wilderness.step=0;
	gp_store.commit('viewWilderness/rstParams');
	gp_store.commit('viewBattle/rstParams');
	gotoWorkShop();
	success(app,'已返回工作室');
}

// 从昏迷中恢复
function recoverFromUnconsciousness(){
	gp_store.commit('rstHealth');
	let adjustEffectText='';
	let dayPassed = 6;
	if(gp_store.state.charge_con_gate){
		dayPassed=4; // 虚空之门效果-不提示触发
		adjustEffectText='由于'+CONSTRUCT_NAME[5]+'的效果,';
	}
	safelyChangeDay(dayPassed);
	warning(app,adjustEffectText+'你昏迷了'+dayPassed+'天');
	// goBackWorkShop() -> recoverFromUnconsciousness();
}

// 在工作室中休息
function restInWorkshop(){
	if(gp_store.state.health+1>6)warning(app,'现在不是休息的时候!');
	else {
		gp_store.commit('incHealth',1);
		safelyChangeDay(1);
		success(app,'休息1天:生命值+1!');
	}
}

// 度过一天 不推荐直接调用, 请调用safelyChangeDay()
function nextDay(){
	if(calendar[gp_store.state.today]==1) eventHappend();
	gp_store.commit('incToday',1);
	if(inventory.state.tre_scale){
		gp_store.commit('incHealth',1); // 亚龙之鳞效果
		info(app,TREASURE_NAME[3]+'触发,生命值+1!');
	}
	if(inventory.state.tre_bracelet){
		gp_store.commit('incGodsHand',1); // 雷神手镯效果
		info(app,TREASURE_NAME[1]+'触发,上帝之手能力+1!');
	}
	// else if(gp_store.state.today>=gp_store.state.doomsdayBegin) gameEnd(false);
}

// 返回一天
function gobackDay(){
	if(gp_store.state.today==0) return error(app,'当前天数即将溢出:小于0');
	if(calendar[gp_store.state.today]==1) eventHappend();
	gp_store.commit('incToday',-1);
}

// 数值安全地增加天数
function safelyChangeDay(days){
	for(var i=0;i<Math.abs(days);i++){
		if(days>=0) nextDay();
		else gobackDay();
		if(gp_store.state.today>=gp_store.state.doomsdayBegin) gameEnd(false);
	}
}

// 使用上帝之手
function useGodsHand(){
	if(gp_store.state.godsHand<3) warning(app,'上帝之手能量不足');
	else {
		if(gp_store.state.doomsdayBegin==21) { // 直接获胜
			success(app,'你阻止了末日的到来！');
			gp_store.commit('incDoomsdayBegin',1);
			gp_store.commit('setEngineStarted',true); // 等同于启动引擎获胜
			return gameEnd(true);
		}
		else {
			gp_store.commit('incDoomsdayBegin',1);
			gp_store.commit('incGodsHand',-3);
			success(app,'上帝之手使末日延迟1天到来!');
		}
	}
}

// 消耗某个组件
function consumeComponent(itemName){
	if(itemName==COMPONENT_NAME[0]) return inventory.commit('incLead',-1);
	else if (itemName==COMPONENT_NAME[1]) return inventory.commit('incSilica',-1);
	else if (itemName==COMPONENT_NAME[2]) return inventory.commit('incWax',-1);
	else if (itemName==COMPONENT_NAME[3]) return inventory.commit('incQuartz',-1);
	else if (itemName==COMPONENT_NAME[4]) return inventory.commit('incSilver',-1);
	else if (itemName==COMPONENT_NAME[5]) return inventory.commit('incGum',-1);
}

// 启动装置
function startConstruct(itemName){
	gp_store.commit('viewConstruct/setChargingConstruct',itemName);
	gp_store.commit('setGamePhase',GAMEPHASE.START_CONSTRUCT);
	gameRouter.push('/main/workshop/construct/charge');
}

// 连接装置
function connectConstruct(itemName){
	consumeComponent(itemName); // 开始时消耗一个组件
	gp_store.commit('viewConnect/setConnectingComponent',itemName);
	gp_store.commit('setGamePhase',GAMEPHASE.CONNECT_CONSTRUCT);
	gameRouter.push('/main/workshop/construct/connect');
}

// 完成一个装置的连接
function connectConstructDone(itemName){
	gp_store.dispatch('connectItem',itemName);
	// gp_store.dispatch('setConnectItemPoint',[itemName,point]);
}

/*
// 使用工具
function useTool(toolName){
	if (toolName==TOOL_NAME[0]) {
		if(gp_store.state.tool_charm)return warning(app,toolName+'未充能'); // 聚焦护符
		gp_store.commit('setCharm',false);
		// 装置充能+2
	}
	else if (toolName==TOOL_NAME[1]) {
		if(gp_store.state.tool_wand)return warning(app,toolName+'未充能'); // 麻痹魔杖
		gp_store.commit('setWand',false);
		// 骰子+2
	}
	else if (toolName==TOOL_NAME[2]) {
		if(gp_store.state.tool_rod)return warning(app,toolName+'未充能'); // 探索手杖
		gp_store.commit('setRod',false);
		// 探索值-100
	}
}*/

// 检查是否已拥有某个装置
function isConstructOwned(itemName){
	if(itemName==CONSTRUCT_NAME[0]) return inventory.state.con_battery;
	else if (itemName==CONSTRUCT_NAME[1]) return inventory.state.con_chassis;
	else if (itemName==CONSTRUCT_NAME[2]) return inventory.state.con_lens;
	else if (itemName==CONSTRUCT_NAME[3]) return inventory.state.con_mirror;
	else if (itemName==CONSTRUCT_NAME[4]) return inventory.state.con_seal;
	else if (itemName==CONSTRUCT_NAME[5]) return inventory.state.con_gate;
}

// 检查是否已某个装置是否充能
function isConstructCharged(itemName){
	if(itemName==CONSTRUCT_NAME[0]) return gp_store.state.charge_con_battery;
	else if (itemName==CONSTRUCT_NAME[1]) return gp_store.state.charge_con_chassis;
	else if (itemName==CONSTRUCT_NAME[2]) return gp_store.state.charge_con_lens;
	else if (itemName==CONSTRUCT_NAME[3]) return gp_store.state.charge_con_mirror;
	else if (itemName==CONSTRUCT_NAME[4]) return gp_store.state.charge_con_seal;
	else if (itemName==CONSTRUCT_NAME[5]) return gp_store.state.charge_con_gate;
}

// 检测装置是否利用组件连接
function isConponentConnected(itemName){
	if(itemName==COMPONENT_NAME[0]) return gp_store.state.connect_battery_chassis_lead;
	else if (itemName==COMPONENT_NAME[1]) return gp_store.state.connect_seal_mirror_silica;
	else if (itemName==COMPONENT_NAME[2]) return gp_store.state.connect_gate_mirror_wax;
	else if (itemName==COMPONENT_NAME[3]) return gp_store.state.connect_seal_quartz;
	else if (itemName==COMPONENT_NAME[4]) return gp_store.state.connect_seal_lens_silver;
	else if (itemName==COMPONENT_NAME[5]) return gp_store.state.connect_gate_chassis_gum;
}

// 获取装置的功能性描述
function getConstructDetail(itemName){
	if(itemName==CONSTRUCT_NAME[0]) return CONSTRUCT_DETAIL[0];
	else if(itemName==CONSTRUCT_NAME[1]) return CONSTRUCT_DETAIL[1];
	else if(itemName==CONSTRUCT_NAME[2]) return CONSTRUCT_DETAIL[2];
	else if(itemName==CONSTRUCT_NAME[3]) return CONSTRUCT_DETAIL[3];
	else if(itemName==CONSTRUCT_NAME[4]) return CONSTRUCT_DETAIL[4];
	else if(itemName==CONSTRUCT_NAME[5]) return CONSTRUCT_DETAIL[5];
}

// 检查是否已拥有某个宝物
function isTreasureOwned(itemName){
	if(itemName==TREASURE_NAME[0]) return inventory.state.tre_plat;
	else if (itemName==TREASURE_NAME[1]) return inventory.state.tre_bracelet;
	else if (itemName==TREASURE_NAME[2]) return inventory.state.tre_moonlace;
	else if (itemName==TREASURE_NAME[3]) return inventory.state.tre_scale;
	else if (itemName==TREASURE_NAME[4]) return inventory.state.tre_shard;
	else if (itemName==TREASURE_NAME[5]) return inventory.state.tre_record;
}

// 获取宝物的功能性描述
function getTreasureDetail(itemName){
	if(itemName==TREASURE_NAME[0]) return TREASURE_DETAIL[0];
	else if(itemName==TREASURE_NAME[1]) return TREASURE_DETAIL[1];
	else if(itemName==TREASURE_NAME[2]) return TREASURE_DETAIL[2];
	else if(itemName==TREASURE_NAME[3]) return TREASURE_DETAIL[3];
	else if(itemName==TREASURE_NAME[4]) return TREASURE_DETAIL[4];
	else if(itemName==TREASURE_NAME[5]) return TREASURE_DETAIL[5];
}

// 某个工具是否充能
function isToolCharged(toolName){
	if(toolName==TOOL_NAME[0] && gp_store.state.tool_charm) return true;
	else if(toolName==TOOL_NAME[1] && gp_store.state.tool_wand) return true;
	else if(toolName==TOOL_NAME[2] && gp_store.state.tool_rod) return true;
	return false;
}

// 某个工具是否充能
function getToolDetail(toolName){
	if(toolName==TOOL_NAME[0]) return TOOL_DETAIL[0];
	else if(toolName==TOOL_NAME[1]) return TOOL_DETAIL[1];
	else if(toolName==TOOL_NAME[2]) return TOOL_DETAIL[2];
	return '未知物品:'+toolName;
}

//----------计算分数---------//

// 获取某种组件的数量
function getComponentNum(itemName){
	if(itemName==COMPONENT_NAME[0]) return inventory.state.com_lead;
	else if (itemName==COMPONENT_NAME[1]) return inventory.state.com_silica;
	else if (itemName==COMPONENT_NAME[2]) return inventory.state.com_wax;
	else if (itemName==COMPONENT_NAME[3]) return inventory.state.com_quartz;
	else if (itemName==COMPONENT_NAME[4]) return inventory.state.com_silver;
	else if (itemName==COMPONENT_NAME[5]) return inventory.state.com_gum;
}

// 计算找到了几个装置
function countConstrutSum(){
	var sum = 0;
	if(inventory.state.con_battery)sum++;
	if(inventory.state.con_chassis)sum++;
	if(inventory.state.con_lens)sum++;
	if(inventory.state.con_mirror)sum++;
	if(inventory.state.con_seal)sum++;
	if(inventory.state.con_gate)sum++;
	return sum;
}
// 计算启动了几个装置
function countStartedConstrutSum(){
	var sum = 0;
	if(gp_store.state.charge_con_battery)sum++;
	if(gp_store.state.charge_con_chassis)sum++;
	if(gp_store.state.charge_con_lens)sum++;
	if(gp_store.state.charge_con_mirror)sum++;
	if(gp_store.state.charge_con_seal)sum++;
	if(gp_store.state.charge_con_gate)sum++;
	return sum;
}
// 计算连接了几个装置
function countConnectedConstrutSum(){
	var sum = 0;
	if(gp_store.state.connect_seal_lens_silver)sum++;
	if(gp_store.state.connect_seal_quartz)sum++;
	if(gp_store.state.connect_seal_mirror_silica)sum++;
	if(gp_store.state.connect_gate_mirror_wax)sum++;
	if(gp_store.state.connect_gate_chassis_gum)sum++;
	if(gp_store.state.connect_battery_chassis_lead)sum++;
	return sum;
}
// 计算找到了几个宝物
function countTreasureSum(){
	var sum = 0;
	if(inventory.state.tre_plat)sum++;
	if(inventory.state.tre_bracelet)sum++;
	if(inventory.state.tre_moonlace)sum++;
	if(inventory.state.tre_scale)sum++;
	if(inventory.state.tre_shard)sum++;
	if(inventory.state.tre_record)sum++;
	return sum;
}
// 计算未使用的工具
function countUnuesdToolSum(){
	var sum = 0;
	if(gp_store.state.tool_charm)sum++;
	if(gp_store.state.tool_wand)sum++;
	if(gp_store.state.tool_rod)sum++;
	return sum;
}
// 计算总分
function countScoreSum(){
	return 10*countConstrutSum()+5*countConnectedConstrutSum()+5*countConnectedConstrutSum()+10*countTreasureSum()+20*gp_store.state.perfectSearchSum+10*countUnuesdToolSum()+1*gp_store.state.health+50*Number(gp_store.state.engineStarted)+5*(gp_store.state.engineStarted?(gp_store.state.doomsdayBegin-gp_store.state.today):0);
}
// 计算总连接点
function countConnectPoiontSum(){
	return gp_store.state.connectPoiontLead+gp_store.state.connectPoiontSilica+gp_store.state.connectPoiontWax+gp_store.state.connectPoiontQuartz+gp_store.state.connectPoiontSilver+gp_store.state.connectPoiontGum;
}

// 使数值向base靠近
function moveToBase(base,origin,adjust){
	let result = origin+adjust;
	if(Math.min(origin,result)<=base && base<=Math.max(origin,result)) return base;
	else return Math.abs(result-base)<Math.abs(origin-base)?result:origin;
}

//------全局提示函数:输入一个app:Vue实例------//
function info(app,msg){
	app.$Message.info({
		closable: true,
		render: h => h('span',{style:{color:'#2db7f5'}},msg)
	});
}
function success(app,msg){
	app.$Message.success({
		closable: true,
		render: h => h('span',{style:{color:'#19be6b'}},msg)
	});
}
function warning(app,msg){
	app.$Message.warning({
		closable: true,
		render: h => h('span',{style:{color:'#ff9900'}},msg)
	});
}
function error(app,msg){
	app.$Message.error({
		closable: true,
		render: h => h('span',{style:{color:'#ed4014'}},msg)
	});
}

//------音乐播放组件------//
var myAudio = new Audio();
var playAudio = function(){
	var arr = cloneArray(audioList); // 随机播放
	arr.sort(() => Math.random()>0.5 ? -1 : 1);
	myAudio.preload = true;
	myAudio.controls = true;
	myAudio.src = arr.pop(); // 每次读数组最后一个元素
	myAudio.addEventListener('ended',playEndedHandler,false);
	myAudio.play();
	// document.getElementById("audioBox").appendChild(myAudio); // 界面元素audioBox被注释,不启用显示,因此注释
	myAudio.loop=false; // 禁止循环，否则无法触发ended事件
	function playEndedHandler(){
		myAudio.src=arr.pop();
		myAudio.play();
		if(gp_store.state.debug)console.log('Now Play Audio:'+myAudio.src);
		if(arr.length==0){ // 循环播放设置
			arr = cloneArray(audioList);
			arr.sort(() => Math.random()>0.5 ? -1 : 1);
		}
		//!arr.length && myAudio.removeEventListener('ended',playEndedHandler,false);//只有一个元素时解除绑定
	}
};
function pauseAudio(){
	myAudio.pause();
}
function replayAudio(){
	myAudio.play();
}
function cloneArray(ary){
	let copy = [];
	for(var i of ary)copy.push(i);
	return copy;
}