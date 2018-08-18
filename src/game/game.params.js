// 当前阶段模式
const GAMEPHASE = {'WELCOME':0,'MAP':1,'WILDERNESS':2,'BATTLE':3,'WORKSHOP':4,'START_CONSTRUCT':5,'CONNECT_CONSTRUCT':6,'START_ENGINE':7,'GAME_END':8};
const calendar = [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0];// 0:Normal 1:Event 2:Doomsday
const audioList = [ "./res/audio/Still Human.mp3",
					"./res/audio/Nilin the Memory Hunter.mp3",
					"./res/audio/Memorize.mp3",
					"./res/audio/Fragments.mp3"]; // 音乐列表
	
// 全局参数
const gp_store = new Vuex.Store({
	modules:{
		viewConstruct : constructStart,
		viewConnect :constructConnect,
		viewEngine : engineStart,
		viewWilderness : wildernessZone,
		viewBattle : battleZone
	},
	state: {
		version : 'v1.0', // 游戏版本
		clientWidth : 300, // 客户端的宽度
		debug : true, // 调试模式
		musicModeOn : false, // 启用音乐 - 不在rstParams中进行重置
		monsterPicOn :false, // 启用怪物图片 - 不在rstParams中进行重置
		gamePhase : GAMEPHASE.WELCOME, // 当前游戏模式
		health : 6, //  生命值
		godsHand : 0, // 上帝之手能量
		doomsdayBegin : 14, // 第(数组14)15天为末日
		today : 0, // 当日日期
		trash : 0, // 垃圾桶中垃圾数量
		perfectSearchSum : 0, // 完美探索次数
		engineStarted : false, // 引擎是否启动
		batteryUsingModalShow : false, // 电池充电界面是否显示
		
		connectPoiontLead : 0,// 铅-连接点
		connectPoiontSilica : 0, // 硅土-连接点
		connectPoiontWax : 0, // 蜡-连接点
		connectPoiontQuartz : 0, // 石英-连接点
		connectPoiontSilver : 0, // 银-连接点
		connectPoiontGum : 0, // 树胶-连接点
		
		charge_con_battery : false, // 水晶电池 - 充能
		charge_con_chassis : false, // 黄金罗盘(底盘) - 充能
		charge_con_lens : false, // 全知镜片 - 充能
		charge_con_mirror : false, // 密闭魔镜 - 充能
		charge_con_seal : false, // 平衡印章 - 充能
		charge_con_gate : false, // 虚空之门 - 充能
		
		connect_seal_lens_silver : false, // 链接平衡印章-全知镜片 (银)
		connect_seal_quartz : false, // 链接平衡印章-x (石英)
		connect_seal_mirror_silica : false, // 链接平衡印章-密闭魔镜 (硅土)
		connect_gate_mirror_wax : false, // 链接虚空之门-密闭魔镜 (蜡)
		connect_gate_chassis_gum : false, // 链接虚空之门-黄金罗盘 (树胶)
		connect_battery_chassis_lead : false, // 链接水晶电池-黄金罗盘 (铅)
		
		tool_charm : true, // 聚焦护符-充能
		tool_wand : true, // 麻痹魔杖-充能
		tool_rod : true, // 探索手杖-充能
		
		battery_used : false, // 水晶电池使用情况
		seal_used : false // 平衡印章使用情况
	},
	mutations: {
		setClientWidth : (state,v) => state.clientWidth = v,
		setGamePhase : (state,e) => state.gamePhase = e,
		switchDebug : (state) => state.debug=!state.debug,
		setMusicModeOn : (state) => state.musicModeOn = true,
		setMonsterPicOn : (state) => state.monsterPicOn = true,
		incHealth : (state,n) => state.health+n<6?state.health+=n:state.health=6,
		incGodsHand : (state,n) => state.godsHand+n<6?state.godsHand+=n:state.godsHand=6,
		incDoomsdayBegin : (state,n) => state.doomsdayBegin+n<22?state.doomsdayBegin+=n:state.doomsdayBegin=22,// 拯救日
		incToday : (state,n) => state.today+n<21?state.today+=n:state.today=21,
		incTrash : (state,n) => state.trash+n<10?state.trash+=n:state.trash=10,
		incPerfectSearchSum : (state,n) => state.perfectSearchSum+=n,
		setEngineStarted: (state,b) => state.engineStarted=b,
		setBatteryUsingModalShow: (state,b) => state.batteryUsingModalShow=b,
		
		incConnectPoiontLead : (state,n) => state.connectPoiontLead+=n,
		incConnectPoiontSilica : (state,n) => state.connectPoiontSilica+=n,
		incConnectPoiontWax : (state,n) => state.connectPoiontWax+=n,
		incConnectPoiontQuartz : (state,n) => state.connectPoiontQuartz+=n,
		incConnectPoiontSilver : (state,n) => state.connectPoiontSilver+=n,
		incConnectPoiontGum : (state,n) => state.connectPoiontGum+=n,
		
		rstConnetPoint : (state,component) => {
			if(component==COMPONENT_NAME[0])state.connectPoiontLead=0;
			else if(component==COMPONENT_NAME[1])state.connectPoiontSilica=0;
			else if(component==COMPONENT_NAME[2])state.connectPoiontWax=0;
			else if(component==COMPONENT_NAME[3])state.connectPoiontQuartz=0;
			else if(component==COMPONENT_NAME[4])state.connectPoiontSilver=0;
			else if(component==COMPONENT_NAME[5])state.connectPoiontGum=0;
		},
		
		setBattery : (state,b) => state.charge_con_battery = b,
		setChassis : (state,b) => state.charge_con_chassis = b,
		setLens : (state,b) => state.charge_con_lens = b,
		setMirror : (state,b) => state.charge_con_mirror = b,
		setSeal : (state,b) => state.charge_con_seal = b,
		setGate : (state,b) => state.charge_con_gate = b,
		
		setConnectSealLensSilver : (state,b) => state.connect_seal_lens_silver = b,
		setConnectSealQuartz : (state,b) => state.connect_seal_quartz = b,
		setConnectSealMirrorSilica : (state,b) => state.connect_seal_mirror_silica = b,
		setConnectGateMirrorWax : (state,b) => state.connect_gate_mirror_wax = b,
		setConnectGateChassisGum : (state,b) => state.connect_gate_chassis_gum = b,
		setConnectBatteryChassisLead : (state,b) => state.connect_battery_chassis_lead = b,
		
		setCharm : (state,b) => state.tool_charm = b,
		setWand : (state,b) => state.tool_wand = b,
		setRod : (state,b) => state.tool_rod = b,
		
		setBatteryUsed : (state,b) => state.battery_used = b,
		setSealUsed : (state,b) => state.seal_used = b,
		
		rstHealth : (state) => state.health = 6,
		
		// 重置游戏参数
		rstParams : (state) => {
			state.gamePhase = GAMEPHASE.WELCOME, // 当前游戏模式
			state.health = 6;
			state.godsHand = 0;
			state.doomsdayBegin = 14;
			state.today = 0;
			state.trash = 0; // 垃圾数量
			state.perfectSearchSum = 0; // 完美探索次数
			batteryUsingModalShow = false; // 充电电池界面是否显示
			state.engineStarted = false; // 引擎是否启动
			state.connectPoiontLead = 0;// 铅-连接点
			state.connectPoiontSilica = 0; // 硅土-连接点
			state.connectPoiontWax = 0; // 蜡-连接点
			state.connectPoiontQuartz = 0; // 石英-连接点
			state.connectPoiontSilver = 0; // 银-连接点
			state.connectPoiontGum = 0; // 树胶-连接点
			state.charge_con_battery = false; // 水晶电池 - 充能
			state.charge_con_chassis = false; // 黄金罗盘(底盘) - 充能
			state.charge_con_lens = false; // 全知镜片 - 充能
			state.charge_con_mirror = false; // 密闭魔镜 - 充能
			state.charge_con_seal = false; // 平衡印章 - 充能
			state.charge_con_gate = false; // 虚空之门 - 充能
			state.connect_seal_lens_silver = false; // 链接平衡印章-全知镜片 (银)
			state.connect_seal_quartz = false; // 链接平衡印章-x (石英)
			state.connect_seal_mirror_silica = false; // 链接平衡印章-密闭魔镜 (硅土)
			state.connect_gate_mirror_wax = false; // 链接虚空之门-密闭魔镜 (蜡)
			state.connect_gate_chassis_gum = false; // 链接虚空之门-黄金罗盘 (树胶)
			state.connect_battery_chassis_lead = false; // 链接水晶电池-黄金罗盘 (铅)
			state.tool_charm = true; // 聚焦护符
			state.tool_wand = true; // 麻痹魔杖
			state.tool_rod = true; // 探索手杖
			state.battery_used = false; // 水晶电池使用情况
			state.seal_used = false; // 平衡印章使用情况
		}
	},
	actions:{
		rstParams : (context)=>{
			context.commit('rstParams');
			context.commit('viewConstruct/rstParams');
			context.commit('viewConnect/rstParams');
			context.commit('viewEngine/rstParams');
			context.commit('viewWilderness/rstParams');
			context.commit('viewBattle/rstParams');
		},
		// 充能
		chargeItem : (context,itemName) => {
			if (itemName==TOOL_NAME[0]) context.commit('setCharm',true); //'聚焦护符'
			else if (itemName==TOOL_NAME[1]) context.commit('setWand',true); // '麻痹魔杖'
			else if (itemName==TOOL_NAME[2]) context.commit('setRod',true); // '探索手杖'
			
			else if(itemName==CONSTRUCT_NAME[0]) context.commit('setBattery',true); // '水晶电池'
			else if (itemName==CONSTRUCT_NAME[1]) context.commit('setChassis',true); // '黄金罗盘'
			else if (itemName==CONSTRUCT_NAME[2]) context.commit('setLens',true); // '全知镜片'
			else if (itemName==CONSTRUCT_NAME[3]) context.commit('setMirror',true); // '密闭魔镜'
			else if (itemName==CONSTRUCT_NAME[4]) context.commit('setSeal',true); // '平衡印章'
			else if (itemName==CONSTRUCT_NAME[5]) context.commit('setGate',true); // '虚空之门'
			else return gp_store.state.debug?console.log('未知物品['+itemName+']，无法充能'):-1;
			if(gp_store.state.debug)console.log('物品:[ '+itemName+' ]充能成功!');
		},
		// 链接装置
		connectItem : (context,usageItemName) => { // '铅','硅土','蜡','石英','银','树胶'
			if(usageItemName==COMPONENT_NAME[0]) context.commit('setConnectBatteryChassisLead',true); // '铅'
			else if (usageItemName==COMPONENT_NAME[1]) context.commit('setConnectSealMirrorSilica',true); // '硅土'
			else if (usageItemName==COMPONENT_NAME[2]) context.commit('setConnectGateMirrorWax',true); // '蜡'
			else if (usageItemName==COMPONENT_NAME[3]) context.commit('setConnectSealQuartz',true); // '石英'
			else if (usageItemName==COMPONENT_NAME[4]) context.commit('setConnectSealLensSilver',true); // '银'
			else if (usageItemName==COMPONENT_NAME[5]) context.commit('setConnectGateChassisGum',true); // '树胶'
			else return gp_store.state.debug?console.log('未知材料['+usageItemName+']，无法链接'):-1;
			if(gp_store.state.debug)console.log('材料:[ '+usageItemName+' ]链接成功!');
		},
		setConnectItemPoint: (context,params) => { // [usageItemName,point]
			let usageItemName=params[0],point=params[1];
			if(usageItemName==COMPONENT_NAME[0]) context.commit('incConnectPoiontLead',point); // '铅'
			else if (usageItemName==COMPONENT_NAME[1]) context.commit('incConnectPoiontSilica',point); // '硅土'
			else if (usageItemName==COMPONENT_NAME[2]) context.commit('incConnectPoiontWax',point); // '蜡'
			else if (usageItemName==COMPONENT_NAME[3]) context.commit('incConnectPoiontQuartz',point); // '石英'
			else if (usageItemName==COMPONENT_NAME[4]) context.commit('incConnectPoiontSilver',point); // '银'
			else if (usageItemName==COMPONENT_NAME[5]) context.commit('incConnectPoiontGum',point); // '树胶'
			else return gp_store.state.debug?console.log('未知材料['+usageItemName+']，无法链接'):-1;
			if(gp_store.state.debug)console.log('材料:[ '+usageItemName+' ]链接成功!连接点:'+point+'.');
		}
	}
});

// 玩家的背包
const inventory = new Vuex.Store({
	state: {
		com_lead : 0, // 铅
		com_silica : 0, // 硅土
		com_wax : 0, // 蜡
		com_quartz : 0, // 石英
		com_silver : 0, // 银
		com_gum : 0, // 树胶
		
		con_battery : false, // 水晶电池
		con_chassis : false, // 黄金罗盘(底盘)
		con_lens : false, // 全知镜片
		con_mirror : false, // 密闭魔镜
		con_seal : false, // 平衡印章
		con_gate : false, // 虚空之门
		
		tre_plat : false, // 冰晶胸甲
		tre_bracelet : false, // 雷神手镯
		tre_moonlace : false, // 月光荧丝
		tre_scale : false, // 亚龙之鳞
		tre_shard : false, // 熔岩碎片
		tre_record : false // 远古记事
	},
	mutations: {
		incLead : (state,n) => {
			state.com_lead+=n;
			if(state.com_lead>4)state.com_lead=4;
			if(state.com_lead<0)state.com_lead=0;
		},
		incSilica : (state,n) => {
			state.com_silica+=n;
			if(state.com_silica>4)state.com_silica=4;
			if(state.com_silica<0)state.com_silica=0;
		},
		incWax : (state,n) => {
			state.com_wax+=n;
			if(state.com_wax>4)state.com_wax=4;
			if(state.com_wax<0)state.com_wax=0;
		},
		incQuartz : (state,n) => {
			state.com_quartz+=n;
			if(state.com_quartz>4)state.com_quartz=4;
			if(state.com_quartz<0)state.com_quartz=0;
		},
		incSilver : (state,n) => {
			state.com_silver+=n;
			if(state.com_silver>4)state.com_silver=4;
			if(state.com_silver<0)state.com_silver=0;
		},
		incGum : (state,n) => {
			state.com_gum+=n;
			if(state.com_gum>4)state.com_gum=4;
			if(state.com_gum<0)state.com_gum=0;
		},
		
		setBattery : (state,b) => state.con_battery = b,
		setChassis : (state,b) => state.con_chassis = b,
		setLens : (state,b) => state.con_lens = b,
		setMirror : (state,b) => state.con_mirror = b,
		setSeal : (state,b) => state.con_seal = b,
		setGate : (state,b) => state.con_gate = b,
		
		setPlat : (state,b) => state.tre_plat = b,
		setBracelet : (state,b) => state.tre_bracelet = b,
		setMoonlace : (state,b) => state.tre_moonlace = b,
		setScale : (state,b) => state.tre_scale = b,
		setShard : (state,b) => state.tre_shard = b,
		setRecord : (state,b) => state.tre_record = b,
		
		rstInventory : (state) => {
			state.com_lead = 0; // 铅
			state.com_silica = 0; // 硅土
			state.com_wax = 0; // 蜡
			state.com_quartz = 0; // 石英
			state.com_silver = 0; // 银
			state.com_gum = 0; // 树胶
			state.con_battery = false; // 水晶电池
			state.con_chassis = false; // 黄金罗盘(底盘)
			state.con_lens = false; // 全知镜片
			state.con_mirror = false; // 密闭魔镜
			state.con_seal = false; // 平衡印章
			state.con_gate = false; // 虚空之门
			state.tre_plat = false; // 冰晶胸甲
			state.tre_bracelet = false; // 雷神手镯
			state.tre_moonlace = false; // 月光荧丝
			state.tre_scale = false; // 亚龙之鳞
			state.tre_shard = false; // 熔岩碎片
			state.tre_record = false; // 远古记事
		}
	},
	actions:{
		findItem : (context,itemName) => {
			if (itemName==COMPONENT_NAME[0]) context.commit('incLead',1); // '铅'
			else if (itemName==COMPONENT_NAME[1]) context.commit('incSilica',1); // '硅土'
			else if (itemName==COMPONENT_NAME[2]) context.commit('incWax',1); // 蜡'
			else if (itemName==COMPONENT_NAME[3]) context.commit('incQuartz',1); // 石英'
			else if (itemName==COMPONENT_NAME[4]) context.commit('incSilver',1); // '银'
			else if (itemName==COMPONENT_NAME[5]) context.commit('incGum',1); // 树胶'
			
			else if(itemName==CONSTRUCT_NAME[0]) context.commit('setBattery',true); // '水晶电池'
			else if (itemName==CONSTRUCT_NAME[1]) context.commit('setChassis',true); // '黄金罗盘'
			else if (itemName==CONSTRUCT_NAME[2]) context.commit('setLens',true); // '全知镜片'
			else if (itemName==CONSTRUCT_NAME[3]) context.commit('setMirror',true); // '密闭魔镜'
			else if (itemName==CONSTRUCT_NAME[4]) context.commit('setSeal',true); // '平衡印章'
			else if (itemName==CONSTRUCT_NAME[5]) context.commit('setGate',true); // '虚空之门'
			
			else if (itemName==TREASURE_NAME[0]) context.commit('setPlat',true); // '冰晶胸甲'
			else if (itemName==TREASURE_NAME[1]) context.commit('setBracelet',true); // '雷神手镯'
			else if (itemName==TREASURE_NAME[2]) context.commit('setMoonlace',true); // '月光荧丝'
			else if (itemName==TREASURE_NAME[3]) context.commit('setScale',true); // '亚龙之鳞'
			else if (itemName==TREASURE_NAME[4]) context.commit('setShard',true); // '熔岩碎片'
			else if (itemName==TREASURE_NAME[5]) context.commit('setRecord',true); // '远古记事'
			else return gp_store.state.dubug?console.log('未知物品'+itemName+', inventory无法添加'):-1; 
			if(gp_store.state.debug)console.log('找到物品:[ '+itemName+' ]!');
		}
	}
});