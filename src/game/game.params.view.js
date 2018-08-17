// 装置启动界面的全局参数
const constructStart = {
	namespaced : true, // 独立命名空间
	state:{
		chargingConstruct : undefined, // 正在充能的装置
		chargingPower : 0, // 已充能能量
		isToolCharmUsed : false, // 是否使用了聚焦护符
		dice : [undefined,undefined], // 随机出的两个骰子
		diceBox : [undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined], // 填入的骰子
		tryTimes : 0 // 尝试次数
	},
	mutations:{
		incChargingPower : (state,n) => state.chargingPower+=n,
		setIsToolCharmUsed : (state,b) => state.isToolCharmUsed=b,
		setChargingConstruct : (state,b) => state.chargingConstruct=b,
		setIsToolCharmUsed : (state,b) => state.isToolCharmUsed=b,
		
		setDice : (state,nums) => {
			state.dice.splice(0,1,nums[0]);
			state.dice.splice(1,1,nums[1]);
		},
		cgDice : (state) => {
			let num1 = state.dice[0],num2 = state.dice[1];
			state.dice.splice(0,1,num2);
			state.dice.splice(1,1,num1);
		},
		removeDice : (state) => state.dice.splice(0,1),
		setDiceBox : (state,params) => { // params=[index,num]
			state.diceBox.splice(params[0],1,params[1]);
		},
		
		rstDice : (state) => state.dice = [undefined,undefined],
		rstDiceBox : (state) => state.diceBox = [undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined],
		
		incTryTimes : (state,n) => state.tryTimes += n,
		
		rstParams(state){
			state.chargingConstruct = undefined; // 正在充能的装置
			state.chargingPower = 0;
			state.isToolCharmUsed = false;
			state.dice = [undefined,undefined];
			state.diceBox = [undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined];
			state.tryTimes = 0; // 尝试次数
		}
	}
};

// 装置连接界面的全局参数
const constructConnect = {
	namespaced : true, // 独立命名空间
	state:{
		connectingComponent : undefined, // 正在充能的装置
		dice : [undefined,undefined], // 随机出的两个骰子
		diceBox00 : [undefined,undefined,undefined,undefined,undefined,undefined], // 填入的骰子
		diceBox01 : [undefined,undefined,undefined,undefined,undefined,undefined], // 填入的骰子
		diceBox02 : [undefined,undefined,undefined,undefined,undefined,undefined], // 填入的骰子
		diceBox03 : [undefined,undefined,undefined,undefined,undefined,undefined], // 填入的骰子
		diceBox04 : [undefined,undefined,undefined,undefined,undefined,undefined], // 填入的骰子
		diceBox05 : [undefined,undefined,undefined,undefined,undefined,undefined] // 填入的骰子
	},
	mutations:{
		setConnectingComponent : (state,o) => state.connectingComponent=o,
		
		setDice : (state,nums) => {
			state.dice.splice(0,1,nums[0]);
			state.dice.splice(1,1,nums[1]);
		},
		cgDice : (state) => {
			let num1 = state.dice[0],num2 = state.dice[1];
			state.dice.splice(0,1,num2);
			state.dice.splice(1,1,num1);
		},
		removeDice : (state) => state.dice.splice(0,1),
		
		setDiceBox : (state,params) => { // params=[component,index,num]
			let diceBox = undefined,component=params[0];
			if(component==COMPONENT_NAME[0])diceBox=state.diceBox00;
			else if(component==COMPONENT_NAME[1])diceBox=state.diceBox01;
			else if(component==COMPONENT_NAME[2])diceBox=state.diceBox02;
			else if(component==COMPONENT_NAME[3])diceBox=state.diceBox03;
			else if(component==COMPONENT_NAME[4])diceBox=state.diceBox04;
			else if(component==COMPONENT_NAME[5])diceBox=state.diceBox05;
			diceBox.splice(params[1],1,params[2]);
		},
		
		rstDice : (state) => state.dice = [undefined,undefined],
		rstDiceBox : (state,component) => {
			if(component==COMPONENT_NAME[0])state.diceBox00=[undefined,undefined,undefined,undefined,undefined,undefined];
			else if(component==COMPONENT_NAME[1])state.diceBox01=[undefined,undefined,undefined,undefined,undefined,undefined];
			else if(component==COMPONENT_NAME[2])state.diceBox02=[undefined,undefined,undefined,undefined,undefined,undefined];
			else if(component==COMPONENT_NAME[3])state.diceBox03=[undefined,undefined,undefined,undefined,undefined,undefined];
			else if(component==COMPONENT_NAME[4])state.diceBox04=[undefined,undefined,undefined,undefined,undefined,undefined];
			else if(component==COMPONENT_NAME[5])state.diceBox05=[undefined,undefined,undefined,undefined,undefined,undefined];
		},
		
		rstParams(state){
			connectingComponent = undefined;
			diceBox00 = [undefined,undefined,undefined,undefined,undefined,undefined]; // 填入的骰子
			diceBox01 = [undefined,undefined,undefined,undefined,undefined,undefined]; // 填入的骰子
			diceBox02 = [undefined,undefined,undefined,undefined,undefined,undefined]; // 填入的骰子
			diceBox03 = [undefined,undefined,undefined,undefined,undefined,undefined]; // 填入的骰子
			diceBox04 = [undefined,undefined,undefined,undefined,undefined,undefined]; // 填入的骰子
			diceBox05 = [undefined,undefined,undefined,undefined,undefined,undefined]; // 填入的骰子
		}
	}
};

// 乌托邦引擎启动界面的全局参数
const engineStart = {
	namespaced : true, // 独立命名空间
	state:{
		sacrifice : 0,
		dice : [undefined,undefined] // 启动结果
	},
	mutations:{
		incSacrifice : (state,n) => state.sacrifice+=n,
		setDice:(state,num)=>{
			state.dice.splice(0,1,num[0]);
			state.dice.splice(1,1,num[1]);
		},
		rstParams(state){
			state.sacrifice = 0;
			state.dice = [undefined,undefined];
		}
	}
};

// 冒险:探索界面的全局参数
const wildernessZone = {
	namespaced : true, // 独立命名空间
	state:{
		wilderness : undefined, // 当前荒野
		beginSearch : false,
		toolRodUsed : false, // 使用过探索手杖
		dice : [undefined,undefined],
		diceBox : [undefined,undefined,undefined,undefined,undefined,undefined] // 填入的骰子
	},
	mutations:{
		setWilderness : (state,o) => state.wilderness=o,
		setBeginSearch : (state,b) => state.beginSearch=b,
		setToolRodUsed : (state,b) => state.toolRodUsed=b,
		
		setDice : (state,nums) => {
			state.dice.splice(0,1,nums[0]);
			state.dice.splice(1,1,nums[1]);
		},
		cgDice : (state) => {
			let num1 = state.dice[0],num2 = state.dice[1];
			state.dice.splice(0,1,num2);
			state.dice.splice(1,1,num1);
		},
		removeDice : (state) => state.dice.splice(0,1),
		rstDice : (state) => state.dice = [undefined,undefined],
		rstDiceBox : (state) => state.diceBox = [undefined,undefined,undefined,undefined,undefined,undefined],
		
		setDiceBox : (state,params) => { // params=[index,num]
			state.diceBox.splice(params[0],1,params[1]);
		},
		
		rstParams(state){
			state.wilderness = undefined;
			state.beginSearch = false;
			state.toolRodUsed = false; // 使用过探索手杖
			state.dice = [undefined,undefined];
			state.diceBox = [undefined,undefined,undefined,undefined,undefined,undefined];
		}
	}
};

// 冒险:战斗界面的全局参数
const battleZone = {
	namespaced : true, // 独立命名空间
	state:{
		monster : undefined, // 当前怪物
		toolWandUsed : false,
		dice : [undefined,undefined]
	},
	mutations:{
		setMonster : (state,o) => state.monster = o,
		setToolWandUsed : (state,b) => state.toolWandUsed = b,
		setDice : (state,nums) => {
			state.dice.splice(0,1,nums[0]);
			state.dice.splice(1,1,nums[1]);
		},
		cgDice : (state) => {
			let num1 = state.dice[0],num2 = state.dice[1];
			state.dice.splice(0,1,num2);
			state.dice.splice(1,1,num1);
		},
		removeDice : (state) => state.dice.splice(0,1),
		rstDice : (state) => state.dice = [undefined,undefined],
		
		rstParams(state){
			state.monster = undefined;
			toolWandUsed = false;
			state.dice = [undefined,undefined];
		}
	}
}