// 欢迎界面
const ViewWelcome = {
	data() {
		return {
			GAMEPHASE : GAMEPHASE,
			timeRelease : '2018/8/17'
		}
	},
	computed:{
		version : ()=> gp_store.state.version,
		debug : ()=> gp_store.state.debug,
		gamePhase : () => gp_store.state.gamePhase,
		musicModeOn : () => gp_store.state.musicModeOn,
		monsterPicOn : () => gp_store.state.monsterPicOn
	},
	methods:{
		gameRestart : gameRestart,
		gameStart : gameStart,
		gameMusicModeOn () {
			info(app,'音乐已启用,可能会消耗一定流量!');
			playAudio();
			gp_store.commit('setMusicModeOn');
		},
		gameMonsterPicOn(){
			info(app,'怪物图片已启用,可能会消耗一定流量!');
			gp_store.commit('setMonsterPicOn');
		}
	},
	template:
		'<div style="text-align:center">\
			<br/>\
			<Card>\
				欢迎来到单人桌游——\
				<a href="https://www.boardgamegeek.com/boardgame/75223/utopia-engine" target="_blank">《乌托邦引擎》</a></br></br>\
				<Alert>在这个即将毁灭的世界中，您将扮演一名名为Isodoros的科学家，为了拯救世界而努力。<br/>您将在在丛林、深渊中探索，搜集部件来组成乌托邦引擎，从而终止世界末日的发生。<br/>世界摇摇欲坠，而你孑然前行。</Alert>\
				Game Designer <Tag>Nick Hayes</Tag></br>\
				当前游戏版本 <Tag>{{version}}</Tag>\
				<Divider dashed v-if="!musicModeOn || !monsterPicOn"/>\
				<Button shape="circle" type="info" v-if="!musicModeOn" @click="gameMusicModeOn">启用音乐</Button>\
				<Button shape="circle" type="warning" v-if="!monsterPicOn" @click="gameMonsterPicOn">启用图片</Button>\
			</Card>\
			<Divider dashed></Divider>\
			<template v-if="gamePhase==GAMEPHASE.WELCOME">\
				<Button type="success" to="/main/map" long  @click="gameStart">开始游戏</Button>\
			</template>\
			<template v-else>\
				<Button type="info" to="/main/map" long >返回游戏</Button></br></br>\
				<Button type="warning" to="/" long @click="gameRestart">重启游戏</Button>\
			</template>\
			<Divider>Created  by <a href="https://blog.csdn.net/shenpibaipao" target="_blank">@身披白袍</a></Divider>\
			<span v-if="debug">\
				<Tag>游戏发布于 <Time :time="timeRelease" :interval="1" /></Tag>\
			</span>\
		</div>'
};

// 冒险界面
const ViewWilderness = {
	computed:{
		seal_used : () => gp_store.state.seal_used,
		charge_con_seal : () => gp_store.state.charge_con_seal,
		charge_con_battery : () => gp_store.state.charge_con_battery,
		battery_used : () => gp_store.state.battery_used,
		wilderness : ()=> gp_store.state.viewWilderness.wilderness,
		tre_moonlace : ()=> inventory.state.tre_moonlace, // 月光荧丝 跳过战斗
		tool_rod : ()=>  gp_store.state.tool_rod,
		toolRodUsed : ()=> gp_store.state.viewWilderness.toolRodUsed,
		beginSearch : ()=> gp_store.state.viewWilderness.beginSearch, // 是否开始探索-需要重置的变量
		dice : ()=> gp_store.state.viewWilderness.dice, // 需要重置的变量
		diceBox : ()=> gp_store.state.viewWilderness.diceBox, // 需要重置的变量
		getEvents(){
			let eventList = '',events=this.wilderness.events;
			for(var e of events) eventList += (e+'\n');
			if(!eventList) return "无事件";
			return eventList;
		},
		toolRodCanUseColor(){
			return this.tool_rod?"#19be6b":"#ed4014";
		},
		getItemCount(){
			switch(this.wilderness.component){
				case COMPONENT_NAME[0]: return inventory.state.com_lead;
				case COMPONENT_NAME[1]: return inventory.state.com_silica;
				case COMPONENT_NAME[2]: return inventory.state.com_wax;
				case COMPONENT_NAME[3]: return inventory.state.com_quartz;
				case COMPONENT_NAME[4]: return inventory.state.com_silver;
				case COMPONENT_NAME[5]: return inventory.state.com_gum;
			}
		},
		getConstructCharge(){
			if(!isConstructOwned(this.wilderness.construct)) return 'default'; // 未拥有
			if(isConstructCharged(this.wilderness.construct)) return 'success'; // 已充能
			return 'warning'; // 未充能
		},
		getTreasureOwned(){
			if(!isTreasureOwned(this.wilderness.treasure)) return 'default'; // 未拥有
			else return 'success'; // 已拥有
		},
		canNextRoll(){
			if(this.boxAllFilled) return ;
			if(!this.dice[0] && !this.dice[1]) {
				this.nextRoll();
				return ;
			} else return ;
		},
		canUseMoonlace(){
			let result = this.searchResult[0];
			if(!this.searchResult[0]) return false;
			return this.tre_moonlace && (this.searchResult[0]<0 || this.searchResult[0]>100);
		},
		boxAllFilled(){
			for(var i of this.diceBox) if(!i) return false;
			return true;
		},
		searchResult(){
			if(!this.boxAllFilled) return ['','探索中']; // [0,'完美探索'];
			else {
				var bb = new BattleBox(this.diceBox);
				result = moveToBase(0,bb.calculate(),this.searchResultAdjust);
				return [result,this.getSearchResultInfo(result)];
			}
		},
		searchResultAdjust(){
			let w = this.wilderness;
			let adj = 0;
			if(gp_store.state.charge_con_lens){ // 全知镜片 厉岩峡谷-扼根峡谷
				if(w.name== WILDERNESS_NAME[1]|| w.name==WILDERNESS_NAME[5]) adj-=10;
			}
			if(gp_store.state.charge_con_mirror){ // 密闭魔镜 炎熔噬窟-苍髯群峰
				if(w.name== WILDERNESS_NAME[0]|| w.name==WILDERNESS_NAME[4]) adj-=10;
			}
			if(w.events.indexOf(EVENT_LIST[2])!=-1) adj-=10; // 好运气
			if(this.toolRodUsed) adj-=100;
			return adj;
		},
		sealColor(){
			return !this.seal_used?"#19be6b":"#ed4014";
		},
		batteryColor(){
			return !this.battery_used?"#19be6b":"#ed4014";
		}
	},
	methods:{
		useToolRod(){
			if(!this.tool_rod) return warning(app,TOOL_NAME[2]+'未充能!');
			if(this.toolRodUsed) return warning(app,TOOL_NAME[2]+'在每次探索中最多使用一次!');
			gp_store.commit('viewWilderness/setToolRodUsed',true);
			gp_store.commit('setRod',false);
			info(app,TOOL_NAME[2]+':'+getToolDetail(TOOL_NAME[2]));
		},
		useSealCleanAllEvent(){
			if(this.seal_used) return warning(app,'平衡印章已使用过！');
			success(app,'使用平衡印章清除了所有事件！');
			gp_store.commit('setSealUsed',true);
			cleanAllEvent();
		},
		getItemColor(itemName){
			switch(itemName){
				case COMPONENT_NAME[0]: return ZONE_COLOR[0];
				case COMPONENT_NAME[1]: return ZONE_COLOR[1];
				case COMPONENT_NAME[2]: return ZONE_COLOR[2];
				case COMPONENT_NAME[3]: return ZONE_COLOR[3];
				case COMPONENT_NAME[4]: return ZONE_COLOR[4];
				case COMPONENT_NAME[5]: return ZONE_COLOR[5];
			}
		},
		getDateTrackStatus(statu,index){
			let isProcessing='';
			if(index==this.wilderness.step)isProcessing='processing';
			if(statu == -1) return "error"+isProcessing;
			else return "success"+isProcessing;
		},
		goBackWorkShop : goBackWorkShop,
		goBackMap : goBackMap,
		doSearch(){
			//this.wilderness.addStep();
			gp_store.commit('viewWilderness/setBeginSearch',true);
			//this.nextRoll();
		},
		spendOneDayToPlunder(){ // 探索完6格区域后可选择进行搜刮
			let construct = this.wilderness.construct;
			if(!isConstructOwned(construct)){
				inventory.dispatch('findItem',construct);
				info(app,'花费一天时间进行搜刮,得到['+construct+']');
			} else {
				let component = this.wilderness.component;
				inventory.dispatch('findItem',component);
				info(app,'花费一天时间进行搜刮,得到['+component+']');
			}
			safelyChangeDay(1);
			goBackMap();
		},
		endSearch : endSearch,
		escapeBattle(){
			// 逃离战斗
			info(app,'使用['+TREASURE_NAME[2]+']逃离了战斗');
			this.endSearch();
		},
		comfirmResult(){
			// 接受探索结果并结算
			let result = this.searchResult[0];
			search(result); // -> endSearch() or encounter():'/main/wilderness/battle'
		},
		nextRoll(){
			gp_store.commit('viewWilderness/setDice',[roll(),roll()]);
		},
		cgDice : () => gp_store.commit('viewWilderness/cgDice'),
		selectDiceBox(index){
			if(this.boxAllFilled) return;
			if(!!this.diceBox[index]) return warning(app,'已填入数字, 不可重复填入!');
			gp_store.commit('viewWilderness/setDiceBox',[index,this.dice[0]]);
			gp_store.commit('viewWilderness/removeDice');
		},
		getSearchResultInfo(result){
			if(result==0) return' | 完美探索';
			else if(1<=result && result<=10) return ' | 发现装置';
			else if(11<=result && result<=99) return ' | 发现组件';
			else{
				let monster = this.wilderness.pickMonster(result);
				return ' | 迎战-'+monster.levelText()+' '+monster.name;
			}
		},
		getTreasureDetail : getTreasureDetail,
		getConstructDetail : getConstructDetail,
		readyToChargeTool(){
			if(gp_store.state.tool_charm && gp_store.state.tool_wand && gp_store.state.tool_rod)
				return warning(app,'没有需要充能的物品!');
			else if(this.battery_used) return warning(app,'水晶电池已使用过！');
			let componentsSum = 0;
			for(var i of COMPONENT_NAME)  componentsSum += getComponentNum(i);
			if(componentsSum<3) return warning(app,'组件数目不足！');
			else gp_store.commit('setBatteryUsingModalShow',true);
		},
	},
	components:{
		'monster-info-cellgroup':InfoMonsterCellGroup,
		'dice-icon':DiceIcon,
		'battery-pop-modal':BatteryPopModal
	},
	template:
		'<div>\
			<Card :dis-hover="true">\
				<span slot="title">\
					<Icon type="md-boat" />\
					<Tooltip :content="getEvents" transfer max-width="180">\
						<!--有事件发生时将会有红点-->\
						<Badge :dot="getEvents!=\'无事件\'"><b>{{wilderness.name}}</b></Badge>\
					</Tooltip>\
					<Tooltip transfer max-width="280">\
						<span slot="content">\
							<Icon type="md-paw"size="10"/>&nbsp;<font color="#2db7f5">怪物等级</font> | 怪物名称 | <font color="#ed4014">攻击范围</font> | <font color="#19be6b">命中范围</font><!--此处不可分行-->\
							<br/>\
							<Icon type="logo-octocat" size="10"/>&nbsp物理体<Divider type="vertical"/><Icon type="logo-snapchat" size="10"/>&nbsp精神体<!--此处不可分行-->\
						</span>\
						<Icon type="md-information-circle"size="10"/>\
					</Tooltip>\
					<Divider type="vertical"/>\
					<Poptip trigger="hover" transfer>\
						<span slot="content">\
							<Badge status="success"/>为正常日期格<br/>\
							<Badge status="error"/>为-1天日期格<br/>\
							<Badge status="processing"/>为当前日期格\
						</span>\
						<Badge v-for="(i,k) in wilderness.track" :key="k" :status="getDateTrackStatus(i,k)"/>\
					</Poptip >\
					<Divider type="vertical" v-if="beginSearch"/>\
					<Tooltip content="探索手杖:探索结果最多-100" transfer v-if="beginSearch">\
						<Icon type="md-compass" :color="toolRodCanUseColor" @click="useToolRod"/>\
					</Tooltip>\
					<span v-show="charge_con_battery" @click="readyToChargeTool">\
						<Divider type="vertical" />\
						<Tooltip max-width="200" content="利用水晶电池给工具充能" transfer>\
							<Icon type="md-battery-charging" :color="batteryColor"/>\
						</Tooltip>\
					</span>\
					<span v-show="charge_con_seal" @click="useSealCleanAllEvent" transfer>\
						<Divider type="vertical" />\
						<Tooltip max-width="200" content="利用平衡印章取消所有事件">\
							<Icon type="md-timer" :color="sealColor"/>\
						</Tooltip>\
					</span>\
				</span>\
				<!--未开始搜查时的界面-->\
				<template v-if="!beginSearch">\
					<div style="text-align:center">\
					<monster-info-cellgroup/><!--怪物信息list-->\
						<Divider dashed/>\
						<Badge :count="getItemCount" type="primary" show-zero :offset="[0,25]">\
							<Avatar size="small" :style="{background: getItemColor(wilderness.component)}">\
								{{wilderness.component}}\
							</Avatar>\
						</Badge>\
						<Tooltip :content="getConstructDetail(wilderness.construct)" max-width="200" transfer>\
							<Tag type="dot" :color="getConstructCharge">\
								{{wilderness.construct}}\
							</Tag>\
						</Tooltip>\
						<Tooltip :content="getTreasureDetail(wilderness.treasure)" max-width="200" transfer>\
							<Tag type="dot" :color="getTreasureOwned" >\
								{{wilderness.treasure}}\
							</Tag>\
						</Tooltip>\
						<Divider dashed/>\
						<ButtonGroup shape="circle">\
							<Button type="success" v-if="wilderness.step!=6" icon="md-arrow-forward" @click="doSearch">前进</Button>\
							<Button type="warning" v-else icon="logo-usd" @click="spendOneDayToPlunder">搜刮</Button>\
							<Button type="info" icon="ios-home" @click="goBackWorkShop">工作室</Button>\
							<Button type="primary" icon="md-map" @click="goBackMap">返回</Button>\
						</ButtonGroup>\
					</div>\
				</template>\
				<div v-else>\
					<div style="text-align:center">\
						{{canNextRoll}}<!--触发器--->\
						<span @click="cgDice" v-show="!boxAllFilled"><!--探险投骰--->\
							<dice-icon size="large" :num="dice[0]"/>\
							<dice-icon size="small" :num="dice[1]"/>\
						</span>\
					</div>\
					<Divider><!-- v-show="!boxAllFilled" -->\
						<Tooltip :content="\'点数修正: \'+searchResultAdjust" max-width="200" transfer v-if="searchResultAdjust!=0">\
							<Badge dot>探索区</Badge>\
						</Tooltip>\
						<p v-else>探索区</p>\
					</Divider>\
					<div style="text-align:center">\
						<table border="0" align="center">\
						  <tr>\
							<th @click="selectDiceBox(0)"><dice-icon :num="diceBox[0]" size="default"/></th>\
							<th @click="selectDiceBox(1)"><dice-icon :num="diceBox[1]" size="default"/></th>\
							<th @click="selectDiceBox(2)"><dice-icon :num="diceBox[2]" size="default"/></th>\
						  </tr>\
						  <tr>\
							<th @click="selectDiceBox(3)"><dice-icon :num="diceBox[3]" size="default"/></th>\
							<th @click="selectDiceBox(4)"><dice-icon :num="diceBox[4]" size="default"/></th>\
							<th @click="selectDiceBox(5)"><dice-icon :num="diceBox[5]" size="default"/></th>\
						  </tr>\
						</table>\
						<br/>\
						<Alert type="info">探索结果为:{{searchResult[0]}}{{searchResult[1]}}</Alert>\
						<Divider dashed/>\
						<ButtonGroup v-if="boxAllFilled" shape="circle">\
							<Button type="success" icon="md-arrow-forward" @click="comfirmResult">确认结果</Button>\
							<Button type="info" icon="ios-moon" @click="escapeBattle" v-if="canUseMoonlace">月光荧丝</Button>\
							<Button type="primary" icon="md-compass" @click="useToolRod" v-if="tool_rod">探索手杖</Button>\
						</ButtonGroup>\
					</div>\
				</div>\
				<battery-pop-modal/><!--水晶电池充电-->\
			</Card>\
		</div>'
};

// 战斗界面
const ViewBattle = {
	data(){
		return {
			randomSeedCache : parseInt(Math.random()*16+1) // 战斗图像的种子缓存
		}
	},
	computed:{
		charge_con_battery : () => gp_store.state.charge_con_battery,
		battery_used : () => gp_store.state.battery_used,
		monster : ()=> gp_store.state.viewBattle.monster,
		tool_wand : ()=> gp_store.state.tool_wand,
		toolWandUsed : ()=> gp_store.state.viewBattle.toolWandUsed,
		monsterPicOn : () => gp_store.state.monsterPicOn,
		dice : () => gp_store.state.viewBattle.dice,
		toolWandCanUseColor(){
			return this.tool_wand?"#19be6b":"#ed4014";
		},
		doBattleRoll(){
			if(!this.dice[0] || !this.dice[1])
				gp_store.commit('viewBattle/setDice',[roll(),roll()]);
		},
		diceAdjust(){
			let adj=0;
			if(this.toolWandUsed) adj+=2;
			if(this.compassEffected) adj+=1; // 黄金罗盘加成
			return adj;
		},
		diceResult(){
			let dice = this.dice,diceAdjust=this.diceAdjust;
			let num1=dice[0]+diceAdjust>6?6:dice[0]+diceAdjust;
			let num2=dice[1]+diceAdjust>6?6:dice[1]+diceAdjust;
			return [num1,num2];
		},
		compassEffected(){
			return gp_store.state.charge_con_chassis && this.monster.isSpirit;
		},
		batteryColor(){
			return !this.battery_used?"#19be6b":"#ed4014";
		},
	},
	methods:{
		useToolWand(){
			if(!this.tool_wand) return warning(app,TOOL_NAME[1]+'未充能!');
			if(this.toolWandUsed) return warning(app,TOOL_NAME[1]+'在每个战斗回合中最多使用一次!');
			gp_store.commit('viewBattle/setToolWandUsed',true);
			gp_store.commit('setWand',false);
			info(app,TOOL_NAME[1]+':'+getToolDetail(TOOL_NAME[1]));
		},
		monsterType(monster){
			if(monster.isSpirit) return 'logo-snapchat';
			else return 'logo-octocat';
		},
		getBattleDiceColor(num){
			if(this.monster.isHIT(num)) return '#19be6b';
			else if(this.monster.isATK(num)) return '#ed4014';
			else return '#808695';
		},
		comfirmBattleBtn(){
			combat(this.diceResult[0],this.diceResult[1]);
		},
		getRandomMonsterPic(){
			let id = this.randomSeedCache;
			return "./res/monsters/monster_"+id+".png"
		},
		readyToChargeTool(){
			if(gp_store.state.tool_charm && gp_store.state.tool_wand && gp_store.state.tool_rod)
				return warning(app,'没有需要充能的物品!');
			else if(this.battery_used) return warning(app,'水晶电池已使用过！');
			let componentsSum = 0;
			for(var i of COMPONENT_NAME)  componentsSum += getComponentNum(i);
			if(componentsSum<3) return warning(app,'组件数目不足！');
			else gp_store.commit('setBatteryUsingModalShow',true);
		},
	},
	components:{
		'battery-pop-modal':BatteryPopModal
	},
	template:
		'<div>\
			<Card :dis-hover="true">\
				<span slot="title">\
					<Icon type="logo-freebsd-devil" size="13"/>\
					{{monster.name}}\
					<Tooltip transfer max-width="280">\
						<span slot="content">\
							<Icon type="md-paw"size="10"/>&nbsp;<font color="#2db7f5">怪物等级</font> | 怪物名称 | <font color="#ed4014">攻击范围</font> | <font color="#19be6b">命中范围</font><!--此处不可分行-->\
							<br/>\
							<Icon type="logo-octocat" size="10"/>&nbsp物理体<Divider type="vertical"/><Icon type="logo-snapchat" size="10"/>&nbsp精神体<!--此处不可分行-->\
						</span>\
						<Icon type="md-information-circle"size="10"/>\
					</Tooltip>\
					<Divider type="vertical"/>\
					<Tooltip content="麻痹魔杖:战斗时+2到骰子结果" transfer>\
						<Icon type="md-color-wand" :color="toolWandCanUseColor" @click="useToolWand"/>\
					</Tooltip>\
					<span v-show="charge_con_battery" @click="readyToChargeTool">\
						<Divider type="vertical" />\
						<Tooltip max-width="200" content="利用水晶电池给工具充能" transfer>\
							<Icon type="md-battery-charging" :color="batteryColor"/>\
						</Tooltip>\
					</span>\
				</span>\
				<div style="text-align:center"><!--怪物图像-->\
					<img :src="getRandomMonsterPic()" height="150" style="transform:scale(0.8)" v-if="monsterPicOn"/>\
					<Icon type="logo-freebsd-devil" v-else size="150"/>\
				</div>\
				<Divider dashed/>\
				<Alert type="info" show-icon>\
					<font style="font-weight:bold">{{monster.name}}</font>\
					<Tooltip content="怪物的属性将会根据背包物品自动更新" transfer max-width="200">\
						<Icon type="md-information-circle"size="10"/>\
					</Tooltip>\
					<Icon slot="icon" :type="monsterType(monster)" size="35" color="#ed4014"/>\
					<span slot="desc" style="font-weight:bold;font-size:125%">\
						<font color="#2db7f5">{{monster.levelText()}}</font>\
						<Divider type="vertical"/>\
						<font color="#ed4014">{{monster.adjustATKText()}}</font>\
						<Divider type="vertical"/>\
						<font color="#19be6b">{{monster.adjustHITText()}}</font>\
					</span>\
				</Alert>\
				<Divider>\
					<Tooltip content="黄金罗盘:对精神类怪物+1骰子结果" max-width="200" transfer v-if="compassEffected">\
						<Badge dot>战斗结果</Badge>\
					</Tooltip>\
					<template v-else>战斗结果</template>\
				</Divider>\
				<!--战斗时的骰子-->\
				{{doBattleRoll}}<!--触发-->\
				<div style="text-align:center">\
					<Avatar :style="{background: getBattleDiceColor(diceResult[0])}">{{diceResult[0]}}</Avatar>\
					<Avatar :style="{background: getBattleDiceColor(diceResult[1])}">{{diceResult[1]}}</Avatar>\
					<br/><br/>\
				</div>\
				<Button shape="circle" long type="info" icon="md-color-filter" @click="comfirmBattleBtn">确定</Button>\
			</Card>\
			<battery-pop-modal/><!--水晶电池充电-->\
		</div>'
};

// 启动装置界面 - 组件唯一
const ViewConstructStart ={
	data(){
		return{
			
		}
	},
	computed:{
		trash : () => gp_store.state.trash,
		chargingConstruct : () => gp_store.state.viewConstruct.chargingConstruct,
		chargingPower : () => gp_store.state.viewConstruct.chargingPower,
		isToolCharmUsed : () => gp_store.state.viewConstruct.isToolCharmUsed,
		tool_charm : ()=> gp_store.state.tool_charm,
		dice : () => gp_store.state.viewConstruct.dice,
		diceBox : () => gp_store.state.viewConstruct.diceBox,
		tryTimes : () => gp_store.state.viewConstruct.tryTimes,
		toolCharmColor(){
			return this.tool_charm?"#19be6b":"#ed4014";
		},
		powerAdjust(){
			let sum = 0;
			if(this.isEventAdjust) sum+=1;
			if(this.isToolCharmUsed) sum+=2;
			return sum;
		},
		isEventAdjust(){
			let w = undefined;//'短暂预视'
			for(var i of wildernessSet){
				if(i.construct==this.chargingConstruct){
					w = i;
					break;
				} 
			}
			if(w.events.indexOf(EVENT_LIST[1])!=-1) return true;
			else return false;
		},
		canConstructStart(){
			return this.powerAdjust + this.chargingPower >=4;
		},
		needToForceStart(){
			return this.boxAllFilled && this.tryTimes == 1 && (this.powerAdjust+this.chargingPower)<4;
		},
		roll2Dice(){ // 随机得到两个骰子
			if(!this.dice[0] && !this.dice[1]) {
				let num1=roll(),num2=roll();
				gp_store.commit('viewConstruct/setDice',[num1,num2]);
			}
		},
		boxAllFilled(){
			for(var d of this.diceBox) if(!d) return false;
			return true;
		}
	},
	methods:{
		viewDataReset(){ // 重置组件的数据
			gp_store.commit('viewConstruct/rstParams');
		},
		cancelAction(){
			this.viewDataReset();
			gotoWorkShop();
		},
		constructStart(){
			let powerSum = this.powerAdjust + this.chargingPower;
			gp_store.commit('incGodsHand',powerSum-4);
			gp_store.dispatch('chargeItem',this.chargingConstruct);
			success(app,this.chargingConstruct+'已启动!');
			this.viewDataReset();
			gotoWorkShop();
		},
		forceStart(){
			gp_store.dispatch('chargeItem',this.chargingConstruct);
			success(app,this.chargingConstruct+'已启动!');
			safelyChangeDay(2); // 额外耗时1天,即2天
			success(app,this.chargingConstruct+'已强行启动!');
			if(inventory.state.tre_bracelet){
				gp_store.commit('incGodsHand',1); // 雷神手镯
				info(app,TREASURE_NAME[1]+'触发,上帝之手能量+1!');
			} 
			this.viewDataReset();
			gotoWorkShop();
		},
		cgDice() {
			if(this.dice.length<2)return;
			gp_store.commit('viewConstruct/cgDice');
		},
		setDiceBox(index){
			gp_store.commit('viewConstruct/setDiceBox',[index,this.dice[0]]),
			gp_store.commit('viewConstruct/removeDice');
		},
		useToolCharm(){
			if(!this.tool_charm) return warning(app,TOOL_NAME[0]+'未充能!');
			gp_store.commit('viewConstruct/setIsToolCharmUsed',true); // power+=2
			gp_store.commit('setCharm',false);
			info(app,TOOL_NAME[0]+':'+getToolDetail(TOOL_NAME[0]));
		},
		selectDiceBox(index){
			if(this.boxAllFilled) return;
			if(!!this.diceBox[index]) warning(app,'已填入数字, 不可重复填入!');
			else {
				this.setDiceBox(index);
				this.checkedFilled(index);
			}
		},
		continueBtn(){
			safelyChangeDay(1);
			warning(app,'时间过去了1天');
			gp_store.commit('viewConstruct/incTryTimes',1);
			gp_store.commit('viewConstruct/rstDiceBox'); // 清空数值填入框
		},
		checkedFilled(index){
			let i = index>=4?index-4:index;
			if(!!this.diceBox[i] && !!this.diceBox[i+4]){
				let value = this.diceBox[i] - this.diceBox[i+4];
				if(value==0){
					gp_store.commit('viewConstruct/setDiceBox',[i,undefined]);
					gp_store.commit('viewConstruct/setDiceBox',[i+4,undefined]);
				}
				else if(value == 4) gp_store.commit('viewConstruct/incChargingPower',1);
				else if(value == 5) gp_store.commit('viewConstruct/incChargingPower',2);
				else if(value < 0) {
					gp_store.commit('incHealth',-1);
					warning(app,'启动装置时触电,生命值-1');
					if(gp_store.state.health==0) {
						this.cancelAction();
						recoverFromUnconsciousness(); // 昏迷
					}
				}
			}
		}
	},
	components:{
		'dice-icon' : DiceIcon,
	},
	template:
		'<Card>\
			<span slot="title">\
				<Tooltip transfer mix-width="200">\
					<p slot="content">\
						启动时差值小于0, -1生命;<br/>\
						启动时差值等于4, +1能量;<br/>\
						启动时差值等于5, +2能量;<br/>\
						共有两次机会, 每次机会耗时1天;<br/>\
						若两次启动失败, 可多耗时1天强行启动;<br/>\
						多余能量将转化为上帝之手能量;<br/>\
						一旦终止将重新来过;<br/>\
						点击右方绿色图标可使用工具\
					</p>\
					{{chargingConstruct}}\
					<Icon type="md-information-circle" size="10"/>\
				</Tooltip>\
				<!--roll2Dice并不显示，只做监听-->\
				{{roll2Dice}}\
				<Divider type="vertical"/>\
				<Tooltip content="已充能的能量" transfer mix-width="200">\
					<Icon type="md-power"/>&nbsp;{{chargingPower+powerAdjust}}\
				</Tooltip>\
				<Divider type="vertical"/>\
				<Tooltip max-width="200" content="垃圾桶尚余容量" transfer>\
					<Icon type="ios-trash" />&nbsp;{{trash}}\
				</Tooltip>\
				<Tooltip content="聚焦护符:启动时+2能量" transfer mix-width="200">\
					<Divider type="vertical"/>\
					<Icon type="md-search" :color="toolCharmColor" @click="useToolCharm"/>\
				</Tooltip>	\
				<template v-if="isEventAdjust">\
					<Tooltip content="短暂预视:启动时+1能量" transfer mix-width="200">\
						<Divider type="vertical"/>\
						<Icon type="ios-eye" />\
					</Tooltip>\
				</template>\
			</span>\
			<!--随机得到两个骰子显示区-->\
			<Alert type="success" show-icon v-if="canConstructStart">\
				请注意:\
				<template slot="desc">现在可以安全启动装置!</template>\
			</Alert>\
			<Alert type="warning" show-icon v-else-if="needToForceStart">\
				请注意:\
				<template slot="desc">强行启动机器将额外消耗一天时间!</template>\
			</Alert>\
			<Button v-else-if="boxAllFilled" shape="circle" long icon="md-done-all" type="success" @click="continueBtn">花费1天继续启动</Button>\
			<div style="text-align:center" v-if="!boxAllFilled" >\
				<span @click="cgDice"><dice-icon :num="dice[0]" size="large"/></span>\
				<span @click="cgDice"><dice-icon :num="dice[1]" size="small"/></span>\
			</div>\
			<Divider>启动区</Divider>\
			<div style="text-align:center">\
				<table border="0" align="center">\
				  <tr>\
					<th @click="selectDiceBox(0)"><dice-icon :num="diceBox[0]" size="default"/></th>\
					<th @click="selectDiceBox(1)"><dice-icon :num="diceBox[1]" size="default"/></th>\
					<th @click="selectDiceBox(2)"><dice-icon :num="diceBox[2]" size="default"/></th>\
					<th @click="selectDiceBox(3)"><dice-icon :num="diceBox[3]" size="default"/></th>\
				  </tr>\
				  <tr>\
					<th @click="selectDiceBox(4)"><dice-icon :num="diceBox[4]" size="default"/></th>\
					<th @click="selectDiceBox(5)"><dice-icon :num="diceBox[5]" size="default"/></th>\
					<th @click="selectDiceBox(6)"><dice-icon :num="diceBox[6]" size="default"/></th>\
					<th @click="selectDiceBox(7)"><dice-icon :num="diceBox[7]" size="default"/></th>\
				  </tr>\
				</table>\
			</div>\
			<Divider dashed/>\
			<Button shape="circle" long icon="md-arrow-forward" type="success" v-if="canConstructStart" @click="constructStart">启动装置</Button>\
			<Button shape="circle" long icon="md-arrow-forward" type="error" v-if="needToForceStart" @click="forceStart">强行启动</Button>\
			<Button shape="circle" long icon="md-arrow-back" type="warning" @click="cancelAction">终止启动</Button>\
		</Card>'
};

// 连接装置界面
const ViewConstructConnect = {
	computed:{
		connectingComponent : () => gp_store.state.viewConnect.connectingComponent,
		trash : ()=> gp_store.state.trash,
		dice : ()=> gp_store.state.viewConnect.dice,
		diceBox(){
			switch(this.connectingComponent){
				case COMPONENT_NAME[0]: return gp_store.state.viewConnect.diceBox00;
				case COMPONENT_NAME[1]: return gp_store.state.viewConnect.diceBox01;
				case COMPONENT_NAME[2]: return gp_store.state.viewConnect.diceBox02;
				case COMPONENT_NAME[3]: return gp_store.state.viewConnect.diceBox03;
				case COMPONENT_NAME[4]: return gp_store.state.viewConnect.diceBox04;
				case COMPONENT_NAME[5]: return gp_store.state.viewConnect.diceBox05;
			}
		},
		boxAllFilled(){
			for(var d of this.diceBox) if(!d) return false;
			return true;
		},
		getTrashColor(){
			return this.trash<10?'#19be6b':'#ed4014';
		},
		getComponentConnectPoiont(){
			let component =  this.connectingComponent;
			if(component==COMPONENT_NAME[0]) return gp_store.state.connectPoiontLead;
			else if(component==COMPONENT_NAME[1]) return gp_store.state.connectPoiontSilica;
			else if(component==COMPONENT_NAME[2]) return gp_store.state.connectPoiontWax;
			else if(component==COMPONENT_NAME[3]) return gp_store.state.connectPoiontQuartz;
			else if(component==COMPONENT_NAME[4]) return gp_store.state.connectPoiontSilver;
			else if(component==COMPONENT_NAME[5]) return gp_store.state.connectPoiontGum;
		}
	},
	methods:{
		nextRoll(){
			gp_store.commit('viewConnect/setDice',[roll(),roll()]);
		},
		throwDice(){
			if(this.trash==10) return error(app,'垃圾桶已满');
			gp_store.commit('incTrash',1);
			gp_store.commit('viewConnect/rstDice');
		},
		cancelAction(){
			this.resetParams();
			gotoWorkShop();
		},
		resetParams(){
			gp_store.commit('viewConnect/setConnectingComponent',undefined);
			gp_store.commit('viewConnect/rstDice');
		},
		cgDice(){
			gp_store.commit('viewConnect/cgDice');
		},
		selectDiceBox(index){
			if(this.boxAllFilled) return;
			if(!!this.diceBox[index]) return warning(app,'已填入数字, 不可重复填入!');
			gp_store.commit('viewConnect/setDiceBox',[this.connectingComponent,index,this.dice[0]]);
			gp_store.commit('viewConnect/removeDice');
			this.checkValue(index);
		},
		checkValue(index){
			let i = index<3?index:index-3;
			let component = this.connectingComponent;
			if(!!this.diceBox[i]&&!!this.diceBox[i+3]){
				let value = this.diceBox[i]-this.diceBox[i+3];
				if(value<0){
					warning(app,'连接装置时操作失误, 生命值-1!');
					gp_store.commit('incHealth',-1);
					if(getComponentNum(component)<1){// 不足以支付组件
						info(app,'组件['+component+']不足, 连接数据已丢失!');
						gp_store.commit('viewConnect/rstDiceBox',component);
						gp_store.commit('rstConnetPoint',component);
						if(gp_store.state.health==0){
							warning(app,'连接装置时昏迷!');
							this.cancelAction();
							return recoverFromUnconsciousness();
						} else return this.cancelAction();
					}
					else{
						info(app,'糟糕的连接, 装置连接点为2!');
						gp_store.dispatch('setConnectItemPoint',[component,2]); // 设置连接点为2
						consumeComponent(component); // 同时再消耗一个组件
						if(gp_store.state.health==0){
							warning(app,'连接装置时昏迷!');
							this.cancelAction();
							return recoverFromUnconsciousness();
						}
					}
				} else {
					gp_store.dispatch('setConnectItemPoint',[component,value]);
				}
			}
			if(this.boxAllFilled){
				connectConstructDone(component);
				success(app,'已完成装置的连接, 连接点:'+this.getComponentConnectPoiont);
				this.cancelAction();
			}
		}
	},
	components:{
		'dice-icon':DiceIcon
	},
	template:
		'<div>\
			<Card :dis-hover="true">\
				<span slot="title">\
					<Icon type="md-git-commit" />\
					连接装置\
					<Tooltip transfer max-width="230">\
						<p slot="content">\你可以在任何时候暂停连接装置<!--玄学样式,别换行-->\
							<br/>连接结果若为负数, 失去一点生命值\
							<br/>连接结果若为负数, 额外消耗一个组件\
							<br/>若此时组件不足, 清除所有连接数据\
							<br/>连接结果若为负数, 将结果修改为2\
						</p>\
						<Icon type="md-information-circle"size="10"/>\
					</Tooltip>\
					<Divider type="vertical"/>\
					<Tooltip content="垃圾桶尚余容量" transfer >\
						<Icon type="ios-trash" :color="getTrashColor" size="15"/>&nbsp;{{trash}}\
					</Tooltip>\
					<Divider type="vertical"/>\
					<Tooltip content="装置连接点" transfer>\
						<Icon type="md-git-compare" />&nbsp;{{getComponentConnectPoiont}}\
					</Tooltip>\
				</span>\
				<div style="text-align:center">\
					<Button type="success" long icon="md-arrow-forward" v-show="!dice[0]&&!dice[1]" @click="nextRoll">继续</Button>\
					<span @click="cgDice" v-show="!!dice[0]||!!dice[1]">\
						<dice-icon size="large" :num="dice[0]"/>\
						<dice-icon size="default" :num="dice[1]"/>\
					</span>\
					<Divider>连接区</Divider>\
					<table border="0" align="center">\
						<tr>\
							<th @click="selectDiceBox(0)"><dice-icon :num="diceBox[0]" size="default"/></th>\
							<th @click="selectDiceBox(1)"><dice-icon :num="diceBox[1]" size="default"/></th>\
							<th @click="selectDiceBox(2)"><dice-icon :num="diceBox[2]" size="default"/></th>\
						</tr>\
						<tr>\
							<th @click="selectDiceBox(3)"><dice-icon :num="diceBox[3]" size="default"/></th>\
							<th @click="selectDiceBox(4)"><dice-icon :num="diceBox[4]" size="default"/></th>\
							<th @click="selectDiceBox(5)"><dice-icon :num="diceBox[5]" size="default"/></th>\
						</tr>\
					</table>\
					<Divider dashed/>\
					<Button type="warning" long icon="md-arrow-back" @click="cancelAction">暂停</Button>\
					<span v-show="(!!dice[0]||!!dice[1])&&trash<10">\
						<br/><br/><Button type="error" long icon="ios-trash" ghost @click="throwDice">丢弃</Button>\
					</span>\
				</div>\
			</Card>\
		</div>'
};

// 启动引擎界面
const ViewEngineStart = {
	computed:{
		sacrifice : () => gp_store.state.viewEngine.sacrifice,
		connectPoiont : countConnectPoiontSum ,
		dice : () => gp_store.state.viewEngine.dice,
		health : () => gp_store.state.health,
		engineStartSum(){
			if(!this.dice[0]||!this.dice[1]) return 0;
			return this.dice[0]+this.dice[1];
		},
		isEngineStarted(){
			return this.engineStartSum>=(this.connectPoiont-this.sacrifice);
		},
		diceShow(){
			if(!this.dice[0]||!this.dice[1]) return false;
			else return true;
		}
	},
	methods:{
		rollDice(){
			let num1=roll(),num2=roll();
			gp_store.commit('viewEngine/setDice',[num1,num2]);
			if(!this.isEngineStarted){
				gp_store.commit('incHealth',-1);
				if(this.health<0){
					error(app,'很不幸, 你在启动引擎的过程中死亡了');
					return gameEnd(false);
				}
				else {
					safelyChangeDay(1);
					info(app,'骰子结果:['+num1+','+num2+'],日期+1!');
				}
			} else info(app,'骰子结果:['+num1+','+num2+'],引擎启动!');
		},
		sacrificeBtn(){
			if(this.health<=0) return warning(app,'你不能再献祭生命值了!');
			else {
				info(app,'献祭了一点生命值');
				gp_store.commit('incHealth',-1);
				gp_store.commit('viewEngine/incSacrifice',1);
			}
		},
		escapePlanet(){
			gp_store.commit('setEngineStarted',true);
			success(app,'启动引擎, 获得胜利!');
			gameEnd(true);
		}
	},
	components:{
		'dice-icon' : DiceIcon
	},
	template:
		'<Card :dis-hover="true">\
			<span slot="title">\
				<Tooltip max-width="200" content="需要投掷出大于等于启动值的骰子合值,才能启动引擎" transfer>\
					<Icon type="md-infinite" />&nbsp;启动乌托邦引擎\
				</Tooltip>\
				<Divider type="vertical"/>\
				<Tooltip max-width="200" content="启动引擎的难度值" transfer>\
					<Icon type="md-git-compare" />&nbsp;{{connectPoiont}}\
				</Tooltip>\
				<Divider type="vertical"/>\
				<Tooltip max-width="200" content="已献祭的生命值" transfer>\
					<Icon type="md-water" />&nbsp;{{sacrifice}}\
				</Tooltip>\
			</span>\
			<div style="text-align:center">\
				<a href="https://blog.csdn.net/shenpibaipao" target="_blank">\
					<img src="./res/logo.jpg" height="200" style="transform:scale(0.8)"/>\
				</a>\
				<Alert type="success"><b>最终启动值: <Icon type="md-planet" size="20"/> {{connectPoiont-sacrifice}}</b></Alert>\
				<Divider>启动结果 : {{engineStartSum}}</Divider>\
				<span v-if="diceShow">\
					<dice-icon size="large" :num="dice[0]"/>\
					<Divider type="vertical"/>\
					<dice-icon size="large" :num="dice[1]"/>\
					<br/><br/>\
				</span>\
				<span v-if="!isEngineStarted">\
					<Button type="info" icon="md-flame" @click="rollDice()">继续</Button>\
					<Divider type="vertical"/>\
					<Button type="error" icon="md-water" @click="sacrificeBtn()">献祭</Button>\
				</span>\
				<Button shape="circle" type="success" long icon="md-flame" @click="escapePlanet()" v-else>逃离</Button>\
			</div>\
		</Card>'
};

// 工作室界面
const ViewWorkshop = {
	data() {
		return {
			workShopButtons: (h) => {
                    return h('span', [
                        h('Icon', {
							props: {
                                type : 'ios-home',
								size : 16
                            }
						}),
						h('font', '工坊功能')
                    ]);
                },
			labelStartEngine: (h) => {
                    return h('span', [
                        h('Icon', {
							props: {
                                type : 'ios-flame',
								size : 16
                            }
						}),
						h('font', '启动装置')
                    ]);
                },//<span slot="label"><Icon type="ios-flame" size="16"/>启动装置</span>
			labelLinkConstrut: (h) => {
				return h('span', [
					h('Icon', {
						props: {
							type : 'md-git-commit',
							size : 16
						}
					}),
					h('font', '连接装置 ')
				]);
			},//<span slot="label"><Icon type="md-git-commit" size="16"/>连接装置</span>
			CONNECT_MAP : CONNECT_MAP,
			CONSTRUCT_NAME : CONSTRUCT_NAME,
			COMPONENT_NAME : COMPONENT_NAME,
			textShowWidth : 292
		}
	},
	computed:{
		canEngineFinalStart(){
			let v= gp_store.state;
			return v.connect_seal_lens_silver && v.connect_seal_quartz && v.connect_seal_mirror_silica && v.connect_gate_mirror_wax && v.connect_gate_chassis_gum && v.connect_battery_chassis_lead;
		},
		trash : () => gp_store.state.trash,
		connectPoiont : countConnectPoiontSum,
		charge_con_battery : () => gp_store.state.charge_con_battery,
		charge_con_seal : () => gp_store.state.charge_con_seal,
		battery_used : () => gp_store.state.battery_used,
		seal_used : () => gp_store.state.seal_used,
		batteryColor(){
			return !this.battery_used?"#19be6b":"#ed4014";
		},
		sealColor(){
			return !this.seal_used?"#19be6b":"#ed4014";
		},
		// --- 屏幕适配---//
		clientWidth : () => gp_store.state.clientWidth,
		showText(){
			if(this.clientWidth>this.textShowWidth) return true;
			else return false;
		}
	},
	methods:{
		useSealCleanAllEvent(){
			if(this.seal_used) return warning(app,'平衡印章已使用过！');
			success(app,'使用平衡印章清除了所有事件！');
			gp_store.commit('setSealUsed',true);
			cleanAllEvent();
		},
		restInWorkshop : restInWorkshop,
		readyToChargeTool(){
			if(gp_store.state.tool_charm && gp_store.state.tool_wand && gp_store.state.tool_rod)
				return warning(app,'没有需要充能的物品!');
			else if(this.battery_used) return warning(app,'水晶电池已使用过！');
			let componentsSum = 0;
			for(var i of COMPONENT_NAME)  componentsSum += getComponentNum(i);
			if(componentsSum<3) return warning(app,'组件数目不足！');
			else gp_store.commit('setBatteryUsingModalShow',true);
			// success(app,'使用水晶电池进行工具充能完毕！');
			// gp_store.commit('setBatteryUsed',true);
			// To do Charge
		},
		finalStart(){
			// 最终启动引擎
			gp_store.commit('setGamePhase',GAMEPHASE.START_ENGINE);
			this.$router.push('/main/workshop/engine');
		},
		gotoMap : gotoMap,
		constructReadyToConnect(name){
			// 准备连接装置
			if(isConponentConnected(name))
				return info(app,name+' : 已连接');
			let combineMap = undefined;
			for(var k in CONNECT_MAP){
				if(name==k) {
					combineMap =  CONNECT_MAP[k];
					break;
				}
			}
			let allCharged = true;
			if(!!combineMap){
				for(var c of combineMap){
					if(!c)continue;
					if(!isConstructOwned(c)){
						warning(app,c+' : '+'未取得');
						allCharged = false;
						break;
					}
					if(!isConstructCharged(c)){
						warning(app,c+' : '+'未充能');
						allCharged = false;
						break;
					}
				}
			}
			if(allCharged){
				if(getComponentNum(name)<1) warning(app,'组件['+name+']不足!');
				else if(inventory.state.tre_record){ // 远古记事, 自动启动
					info(app,TREASURE_NAME[5]+'生效, 装置已自动连接!');
					consumeComponent(name);
					gp_store.dispatch('setConnectItemPoint',[name,1]); // 连接点为1
					connectConstructDone(name);
				} else connectConstruct(name);
			} 
		},
		selectCell(name){
			// 选中连接单元格
			this.constructReadyToConnect(name);
		}
	},
	components:{
		'workshop-construct-tag':WorkshopConstructTag,
		'workshop-construct-connect-unit':WorkshopConstructConnectUnit,
		'battery-pop-modal':BatteryPopModal
	},
	template:
		'<div>\
			<div style="text-align:center">\
				<Card style="text-align:center">\
					<Tooltip max-width="200" content="垃圾桶尚余容量" transfer>\
						<Icon type="ios-trash" />&nbsp;<span v-show="showText">垃圾桶: </span>{{trash}}\
					</Tooltip>\
					<Divider type="vertical" />\
					<Tooltip max-width="200" content="启动引擎的难度值" transfer>\
						<Icon type="md-git-compare" />&nbsp;<span v-show="showText">启动值: </span>{{connectPoiont}}\
					</Tooltip>\
					<span v-show="charge_con_battery" @click="readyToChargeTool">\
						<Divider type="vertical" />\
						<Tooltip max-width="200" content="利用水晶电池给工具充能" transfer>\
							<Icon type="md-battery-charging" :color="batteryColor"/>\
						</Tooltip>\
					</span>\
					<span v-show="charge_con_seal" @click="useSealCleanAllEvent" transfer>\
						<Divider type="vertical" />\
						<Tooltip max-width="200" content="利用平衡印章取消所有事件">\
							<Icon type="md-timer" :color="sealColor"/>\
						</Tooltip>\
					</span>\
				</Card>\
				</br>\
			</div>\
			<div>\
				<Tabs type="card">\
					<TabPane :label="workShopButtons"><!--render渲染标签-->\
						<Card :dis-hover="true">\
							<Button shape="circle" type="primary" long icon="md-map" @click="gotoMap">返回地图&nbsp;</Button><br/><br/>\
							<Button shape="circle" type="success" long icon="md-beer" @click="restInWorkshop">休息一天&nbsp;</Button>\
							<template v-if="canEngineFinalStart">\
								<br/><br/>\
								<Button shape="circle" type="warning" long icon="md-infinite" @click="finalStart" >启动引擎&nbsp;</Button>\
							</template>\
						</Card>\
					</TabPane>\
					<!--启动装置一览-->\
					<TabPane :label="labelStartEngine"><!--render渲染标签-->\
						<div style="text-align:center">\
							<template v-for="(it,k) in CONSTRUCT_NAME">\
								<workshop-construct-tag  :key="k" :item-name="it"/>\
							</template>\
						</div>\
					</TabPane>\
					<!--连接装置一览-->\
					<TabPane :label="labelLinkConstrut">\
						<div style="text-align:center">\
							<!--居中:本质上是个Cell-->\
							<CellGroup @on-click="selectCell" >\
								<workshop-construct-connect-unit v-for="(c,k) in COMPONENT_NAME" :key="k" :component="c"/>\
							</CellGroup>\
						</div>\
					</TabPane>\
				</Tabs>\
			</div>\
			<Divider dashed/>\
			<!--水晶电池充能-->\
			<battery-pop-modal/>\
		</div>'
};

// 地图选择界面
const ViewMap = {
	data(){
		return{
			wildernessSet:wildernessSet,
			EVENT_LIST:EVENT_LIST,
			EVENT_DESCR:EVENT_DESCR
		}
	},
	methods:{
		findWildernessMap(mapName){
			for(var w of wildernessSet){
				if(mapName == w.name) return w;
			}
		},
		selectMap(name){
			gotoWilderness(this.findWildernessMap(name));
		},
		gotoWorkShop : gotoWorkShop,
		restInWorkshop : restInWorkshop,
		getEventDesc(){
			let info ='';
			for(var i=0;i<EVENT_LIST.length;i++){
				info += (''+(i+1)+'. '+EVENT_LIST[i]+' : '+EVENT_DESCR[i]+';\n');
			}
			return info;
		}
	},
	components:{
		'map-unit':MapUnit
	},
	template:
		'<div style="text-align:center">\
			<Card>\
				<span slot="title" >\
					<Icon type="md-map" size="18"/>&nbsp;选择冒险&nbsp;\
					<Poptip trigger="hover" :content="getEventDesc()" :word-wrap="true">\
						<span slot="title"><Icon type="ios-pulse" size="12"/>&nbsp;事件提示</span>\
						<Icon type="md-information-circle" size="10"/> <!--info图标-->\
					</Poptip >\
				</span>\
				<!--冒险地图列表-->\
				<CellGroup @on-click="selectMap">\
					<!--实质是一个Cell-->\
					<map-unit v-for="(m,k) in wildernessSet" :key="k" :wilderness="m"/>\
				</CellGroup>\
			</Card>\
			<br/>\
			<!--控制按钮-->\
			<ButtonGroup size="large" vertical shape="circle">\
				<Button type="info"  icon="ios-home" @click="gotoWorkShop">去工作室&nbsp;</Button>\
				<Button type="success" long icon="md-beer" @click="restInWorkshop">休息一天&nbsp;</Button>\
			</ButtonGroup>\
			<Divider dashed/>\
		</div>'
};
