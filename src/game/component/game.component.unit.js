// 背包中"组件"的显示元素 - 带尺寸缩放
const InventoryComponentBadge = {
	props:['itemName','twoLineToShowWidth'],
	data(){
		return{
			COMPONENT_NAME: COMPONENT_NAME,
			ZONE_COLOR : ZONE_COLOR,
			smallAvatarWidth : 345
		}
	},
	computed:{
		com_lead : () => inventory.state.com_lead,
		com_silica : () => inventory.state.com_silica,
		com_wax : () => inventory.state.com_wax,
		com_quartz : () => inventory.state.com_quartz,
		com_silver : () => inventory.state.com_silver,
		com_gum : () => inventory.state.com_gum,
		getItemColor(){
			switch(this.itemName){
				case COMPONENT_NAME[0]: return ZONE_COLOR[0];
				case COMPONENT_NAME[1]: return ZONE_COLOR[1];
				case COMPONENT_NAME[2]: return ZONE_COLOR[2];
				case COMPONENT_NAME[3]: return ZONE_COLOR[3];
				case COMPONENT_NAME[4]: return ZONE_COLOR[4];
				case COMPONENT_NAME[5]: return ZONE_COLOR[5];
			}
		},
		getItemCount(){
			switch(this.itemName){
				case COMPONENT_NAME[0]: return this.com_lead;
				case COMPONENT_NAME[1]: return this.com_silica;
				case COMPONENT_NAME[2]: return this.com_wax;
				case COMPONENT_NAME[3]: return this.com_quartz;
				case COMPONENT_NAME[4]: return this.com_silver;
				case COMPONENT_NAME[5]: return this.com_gum;
			}
		},
		getComponentRegion(){
			let region = "Unknow";
			for(var w of wildernessSet){
				if(w.component == this.itemName) region = w.name;
			}
			return '产自:'+region;
		},
		// 屏幕适配
		clientWidth: () => gp_store.state.clientWidth,
		showSmallAvatar(){ // 此处有强依赖
			if(this.clientWidth>=this.smallAvatarWidth) return 'default';
			else if (this.clientWidth>=this.twoLineToShowWidth) return 'small'; 
			else return 'large';
		}
	},
	template:
		'<Badge :count="getItemCount" type="primary" show-zero>\
			<Tooltip :content="getComponentRegion" transfer>\
				<Avatar :size="showSmallAvatar" :style="{background: getItemColor}">{{itemName}}</Avatar>\
			</Tooltip">\
		</Badge>'
};

// 背包中"装置"的显示元素 interface-methods:itemClicked()
const InventoryConstructTag = {
	props:['itemName'],
	data(){
		return{
			//CONSTRUCT_NAME: CONSTRUCT_NAME,
		}
	},
	computed:{
		getConstructCharge(){
			if(!isConstructOwned(this.itemName))return 'default'; // 未拥有
			if(isConstructCharged(this.itemName))return 'success'; // 已充能
			return 'warning'; // 未充能
		},
		getConstructChargeText(){
			var region = 'unknow';
			for(var w of wildernessSet){
				if(w.construct == this.itemName) region = w.name;
			}
			if(!isConstructOwned(this.itemName))return this.itemName+'尚未拥有!\n所属区域:'+region; // 未拥有
			if(isConstructCharged(this.itemName))return this.itemName+'已经拥有!\n所属区域:'+region; // 已充能
			return this.itemName+'尚未充能!'; // 未充能
		}
	},
	methods : {
		getConstructDetail : getConstructDetail,
		showDetail(){
			info(app,this.itemName+' : '+this.getConstructDetail(this.itemName));
		},
		itemClicked(){ // 点击事件接口
			this.showDetail();
		}
	},
	template:
		'<span>\
			<Tooltip :content="getConstructChargeText" max-width="200" transfer>\
				<Tag type="dot" :color="getConstructCharge">\
					<span @click="itemClicked">{{itemName}}</span>\
				</Tag>\
			</Tooltip">\
		</span>'
};

// 背包中"宝物"的显示元素 interface-methods:itemClicked()
const InventoryTreasureTag = {
	props:['itemName'],
	data(){
		return{
			//TREASURE_NAME : TREASURE_NAME
		}
	},
	computed:{
		getTreasureOwned(){
			if(!isTreasureOwned(this.itemName))return 'default'; // 未拥有
			else return 'success'; // 已拥有
		},
		getTreasureOwnedText(){
			var region = 'unknow';
			for(var w of wildernessSet){
				if(w.treasure == this.itemName) region = w.name;
			}
			if(!isTreasureOwned(this.itemName))return this.itemName+'尚未拥有!\n所属区域:'+region; // 未拥有
			else return this.itemName+'已经拥有!\n所属区域:'+region; // 已拥有
		}
	},
	methods:{
		getTreasureDetail :getTreasureDetail,
		showDetail(){
			info(app,this.itemName+' : '+this.getTreasureDetail(this.itemName));
		},
		itemClicked(){ // 点击事件接口
			this.showDetail();
		}
	},
	template:
		'<span>\
			<Tooltip :content="getTreasureOwnedText" max-width="200" transfer>\
				<Tag type="dot" :color="getTreasureOwned" >\
					<span @click="itemClicked">{{itemName}}</span>\
				</Tag>\
			</Tooltip">\
		</span>'
};

// 背包中"工具"的显示元素 interface-methods:itemClicked()
const InventoryToolTag = {
	props:['toolName'],
	data(){
		return{
			//TOOL_NAME: TOOL_NAME, //  ['聚焦护符':tool_charm,'麻痹魔杖':tool_wand,'探索手杖'tool_rod：]
		}
	},
	computed:{
		getToolCharge(){
			if(this.isToolCharged(this.toolName)) return 'success';
			return 'warning';
		},
		getToolChargeText(){
			if(this.isToolCharged(this.toolName)) return this.toolName+'已充能!';
			return this.toolName+'未充能!';
		}
	},
	methods:{
		getToolDetail : getToolDetail,
		isToolCharged : isToolCharged,
		showDetail(){
			info(app,this.toolName+' : '+this.getToolDetail(this.toolName));
		},
		itemClicked(){ // 点击事件接口
			this.showDetail();
		}
	},
	template:
		'<span>\
			<Tooltip :content="getToolChargeText" max-width="200" transfer>\
				<Tag type="dot" :color="getToolCharge">\
					<span @click="itemClicked">{{toolName}}</span>\
				</Tag>\
			</Tooltip">\
		</span>'
};

// 冒险地图选择单元 - 带尺寸缩放
const MapUnit = {
	props:['wilderness'],
	data(){
		return{
			COMPONENT_NAME:COMPONENT_NAME,
			BADGE_COLOR_CLASS:BADGE_COLOR_CLASS,
			ZONE_COLOR:ZONE_COLOR,
			width1:350, // 350 屏幕显示宽度 第一阶段
			width2:310 // 310-270 // 屏幕显示宽度 第二阶段
		}
	},
	computed:{
		getEvents(){
			let eventList = '',events=this.wilderness.events;
			for(var e of events) eventList += (e+"\n");
			if(!eventList) return "无事件";
			return eventList;
		},
		getComponentColor(){
			switch(this.wilderness.component){
				case COMPONENT_NAME[0]: return ZONE_COLOR[0];
				case COMPONENT_NAME[1]: return ZONE_COLOR[1];
				case COMPONENT_NAME[2]: return ZONE_COLOR[2];
				case COMPONENT_NAME[3]: return ZONE_COLOR[3];
				case COMPONENT_NAME[4]: return ZONE_COLOR[4];
				case COMPONENT_NAME[5]: return ZONE_COLOR[5];
			}
		},
		getComponentNum(){
			let c = this.wilderness.component;
			if(c==COMPONENT_NAME[0]) return inventory.state.com_lead;
			else if(c==COMPONENT_NAME[1]) return inventory.state.com_silica;
			else if(c==COMPONENT_NAME[2]) return inventory.state.com_wax;
			else if(c==COMPONENT_NAME[3]) return inventory.state.com_quartz;
			else if(c==COMPONENT_NAME[4]) return inventory.state.com_silver;
			else if(c==COMPONENT_NAME[5]) return inventory.state.com_gum;
		},
		getConstructStatus(){
			let s = this.wilderness.construct;
			if(!isConstructOwned(s)) return 'default';
			else if(isConstructCharged(s)) return 'success';
			else return 'warning';
		},
		getConstructStatusText(){
			let s = this.wilderness.construct;
			if(!isConstructOwned(s)) return s+'未拥有!';
			else if(isConstructCharged(s)) return s+'已充能!';
			else return s+'已拥有!';
		},
		getTreasureStatusText(){
			let t = this.wilderness.treasure;
			if(isTreasureOwned(t)) return t+'已拥有!';
			else return t+'未拥有!';
		},
		getTreasureStatus(){
			let t = this.wilderness.treasure;
			if(isTreasureOwned(t)) return 'success';
			else return 'default';
		},
		// 屏幕适配
		clientWidth: () => gp_store.state.clientWidth,
		isBrShow(){
			if(this.clientWidth<this.width2) return true;
			else return false;
		},
		isComponentAvatarShow(){
			if(this.clientWidth>=this.width1) return true; // 第一阶段 显示
			else if(this.clientWidth>=this.width2) return false; // 第二阶段 隐藏
			else return true; // 第二阶段 显示
		},
		isDeviderShow(){
			if(this.clientWidth>=this.width1) return true;
			else if(this.clientWidth>=this.width2) return false;
			else return true;
		},
		getOffset(){
			if(this.isComponentAvatarShow) return [2.2,28.5];
			else return [-5,0]; // 上移保持对齐
		}
	},
	methods:{
		getBadgeColorClass(){
			let c = this.wilderness.component;
			if(c==COMPONENT_NAME[0]) return BADGE_COLOR_CLASS[0];
			else if(c==COMPONENT_NAME[1]) return BADGE_COLOR_CLASS[1];
			else if(c==COMPONENT_NAME[2]) return BADGE_COLOR_CLASS[2];
			else if(c==COMPONENT_NAME[3]) return BADGE_COLOR_CLASS[3];
			else if(c==COMPONENT_NAME[4]) return BADGE_COLOR_CLASS[4];
			else if(c==COMPONENT_NAME[5]) return BADGE_COLOR_CLASS[5];
		}
	},
	template:
		'<Cell :name="wilderness.name" :title="wilderness.name">\
			<!--<Avatar src="https://i.loli.net/2017/08/21/599a521472424.jpg" />-->\
			<Tooltip :content="getEvents" transfer max-width="180">\
				<!--有事件发生时将会有红点-->\
				<Badge :dot="getEvents!=\'无事件\'"><b>{{wilderness.name}}</b></Badge>\
			</Tooltip>\
			<Divider type="vertical" v-if="!isBrShow"/>\
			<br v-else/>\
			<Tooltip :content="wilderness.component+\',已拥有: \'+getComponentNum" transfer><!--transfer很重要-->\
				<Badge :count="getComponentNum" :class-name="getBadgeColorClass()" show-zero :offset="getOffset">\
					<Avatar size="small" shape="square" :style="{background: getComponentColor}" v-show="isComponentAvatarShow">{{wilderness.component}}</Avatar>\
				</Badge>\
			</Tooltip>\
			<!--装置和宝物-->\
			<Divider type="vertical"/>\
			<Tooltip :content="getConstructStatusText" transfer><!--transfer很重要-->\
				<Badge :status="getConstructStatus" :text="wilderness.construct"/>\
			</Tooltip>\
			<Divider type="vertical" v-show="isDeviderShow"/>\
			<Tooltip :content="getTreasureStatusText" transfer><!--transfer很重要-->\
				<Tag :color="getTreasureStatus">{{wilderness.treasure}}</Tag>\
			</Tooltip>\
		</Cell>'
};

// 工作室中"启动装置"的显示元素 - 点击事件:启动
const WorkshopConstructTag = {
	mixins:[InventoryConstructTag],
	computed:{
		isDotShow(){
			for(var w of wildernessSet){
				if(w.construct == this.itemName){
					if(w.events.indexOf(EVENT_LIST[1])!=-1) return true;
				}
			}
			return false;
		},
		// 添加了地区事件提示
		eventText(){ 
			if(this.isDotShow) return '\n[短暂预视]:本地区装置充能+1';
			else return '';
		}
	},
	methods : {
		readyToStartConstruct(){
			if(!isConstructOwned(this.itemName)) warning(app,itemName+' : '+'未取得!');
			else if(isConstructCharged(this.itemName)) info(app,itemName+' : '+'无需充能启动!');
			else startConstruct(this.itemName); // -> game.control.js
		},
		itemClicked(){ // 重写点击事件接口
			// 启动装置
			this.readyToStartConstruct();
		},
	},
	template:
		'<span>\
			<Tooltip :content="getConstructChargeText+eventText" max-width="200" transfer>\
				<Badge :dot="isDotShow" :offset=[5,8]><!--添加了地区事件提示-->\
					<Tag type="dot" :color="getConstructCharge">\
						<span @click="itemClicked">{{itemName}}</span>\
					</Tag>\
				</Badge>\
			</Tooltip">\
		</span>'
};

// 工作室中"装置"的显示元素 - 无点击事件
const WorkshopConstructTagWithoutClickEvent = {
	mixins:[InventoryConstructTag],
	methods : {
		itemClicked(){ // 重写点击事件接口
		
		}
	}
};

// 工作室中"连接装置"的显示元素 - [点击事件:连接] -> $father.selectCell()
const WorkshopConstructConnectUnit = {
	data(){
		return{
			COMPONENT_NAME : COMPONENT_NAME,
			CONNECT_MAP : CONNECT_MAP,
			ZONE_COLOR : ZONE_COLOR,
			BADGE_COLOR_CLASS : BADGE_COLOR_CLASS,
			undefinedConstructTagName : '无限通路',
			warpWidth : 365
		}
	},
	props:['component'],
	computed:{
		getItemColor(){
			switch(this.component){
				case COMPONENT_NAME[0]: return ZONE_COLOR[0];
				case COMPONENT_NAME[1]: return ZONE_COLOR[1];
				case COMPONENT_NAME[2]: return ZONE_COLOR[2];
				case COMPONENT_NAME[3]: return ZONE_COLOR[3];
				case COMPONENT_NAME[4]: return ZONE_COLOR[4];
				case COMPONENT_NAME[5]: return ZONE_COLOR[5];
			}
		},
		getItemCount(){
			switch(this.component){
				case COMPONENT_NAME[0]: return inventory.state.com_lead;
				case COMPONENT_NAME[1]: return inventory.state.com_silica;
				case COMPONENT_NAME[2]: return inventory.state.com_wax;
				case COMPONENT_NAME[3]: return inventory.state.com_quartz;
				case COMPONENT_NAME[4]: return inventory.state.com_silver;
				case COMPONENT_NAME[5]: return inventory.state.com_gum;
			}
		},
		getComponentConnectPoiont(){
			if(this.component==COMPONENT_NAME[0]) return gp_store.state.connectPoiontLead;
			else if(this.component==COMPONENT_NAME[1]) return gp_store.state.connectPoiontSilica;
			else if(this.component==COMPONENT_NAME[2]) return gp_store.state.connectPoiontWax;
			else if(this.component==COMPONENT_NAME[3]) return gp_store.state.connectPoiontQuartz;
			else if(this.component==COMPONENT_NAME[4]) return gp_store.state.connectPoiontSilver;
			else if(this.component==COMPONENT_NAME[5]) return gp_store.state.connectPoiontGum;
		},
		connetIconColor(){
			let c=this.getComponentConnectConstruct();
			if(isConponentConnected(this.component)) return '#19be6b';
			if(c[1] == undefined){
				if(isConstructCharged(c[0])) return '#ff9900'; // 单回路待连通
			} else {
				if(isConstructCharged(c[0]) && isConstructCharged(c[1]))return '#ff9900'; // 双回路待连通
			}
			return '#808695'; // 未取得
		},
		// --- 屏幕适配 --- //
		clientWidth: () => gp_store.state.clientWidth,
		needToWarp(){
			return this.clientWidth<this.warpWidth;
		}
	},
	methods:{
		getComponentConnectConstruct(){
			for(var k in CONNECT_MAP){
				if(this.component==k) return CONNECT_MAP[k];
			}
			return undefined;
		},
		getBadgeColorClass(){
			let c = this.component;
			if(c==COMPONENT_NAME[0]) return BADGE_COLOR_CLASS[0];
			else if(c==COMPONENT_NAME[1]) return BADGE_COLOR_CLASS[1];
			else if(c==COMPONENT_NAME[2]) return BADGE_COLOR_CLASS[2];
			else if(c==COMPONENT_NAME[3]) return BADGE_COLOR_CLASS[3];
			else if(c==COMPONENT_NAME[4]) return BADGE_COLOR_CLASS[4];
			else if(c==COMPONENT_NAME[5]) return BADGE_COLOR_CLASS[5];
		},
		getComponentRegion(){
			let region = "Unknow";
			for(var w of wildernessSet){
				if(w.component == this.component) region = w.name;
			}
			return '产自:'+region;
		},
	},
	components:{
		'workshop-construct-tag':WorkshopConstructTagWithoutClickEvent
	},
	template:
		'<Cell :name="component" :title="component">\
			<Tooltip content="装置连接点" transfer>\
				<Icon type="md-git-compare" />&nbsp;{{getComponentConnectPoiont}}\
			</Tooltip>\
			<Divider type="vertical"/>\
			<Tooltip :content="getComponentRegion()" transfer max-width="200">\
				<Badge :count="getItemCount" :class-name="getBadgeColorClass()" show-zero :offset="[3,0]">\
					<Avatar shape="circle" :style="{background: getItemColor}">{{component}}</Avatar>\
				</Badge>\
			</Tooltip>\
			<Divider type="vertical" v-if="!needToWarp"/>\
			<hr v-if="needToWarp">\
			<workshop-construct-tag :itemName="getComponentConnectConstruct()[0]"/>\
			<Icon type="md-git-commit" size="20" :color="connetIconColor"/><!--连接图标-->\
			<template v-if="!!getComponentConnectConstruct()[1]"><!--单回路装置直接连通-->\
				<workshop-construct-tag :itemName="getComponentConnectConstruct()[1]" />\
			</template>\
			<Tooltip transfer content="通向未来" v-else>\
				<Tag type="dot" color="success" >{{undefinedConstructTagName}}</Tag>\
			</Tooltip>\
		</Cell>'
};

// 骰子的样式
const DiceIcon = {
	props:['num','size'],
	data(){
		return {
			DICE_COLOR : ZONE_COLOR
		}
	},
	computed:{
		getColor(){
			if (!this.num) return '#e8eaec';
			else return this.DICE_COLOR[this.num-1];
		},
		getNum(){
			console.log('填入',this.num);
			if (!this.num) return this.num;
			else this.num;
		}
	},
	template:'<Avatar :size="size" :style="{background: getColor}">{{num}}</Avatar>'
};

const BatteryPopModal = {
	data(){
		return {
			iTargetKeys : [], // 充能要使用的组件列表
			selectedTool : undefined, // 要充能的道具
		}
	},
	computed:{
		batteryUsingModalShow :()=> gp_store.state.batteryUsingModalShow,
		// 水晶电池充电时显示的所有数据
		iData(){ // 背包中的组件
			var data = [],index=0;
			for(var i of COMPONENT_NAME){
				var sum = getComponentNum(i);
				for(var t=0;t<sum;t++){
					data.push({
						key:index++,
						label:i,
					});
				}
			}
			return data;
		},
		toolList(){ // 可以充能的工具
			let list = [];
			if(!gp_store.state.tool_charm) list.push(TOOL_NAME[0]);
			if(!gp_store.state.tool_wand) list.push(TOOL_NAME[1]);
			if(!gp_store.state.tool_rod) list.push(TOOL_NAME[2]);
			return list;
		}
	},
	methods:{
		// ---  水晶电池  ---//
		rowDataRender(item){ // 水晶电池充电时的渲染函数
			return item.label;
		},
		handleChange(targetKeys, direction, moveKeys){ // 水晶电池充电时的句柄
			this.iTargetKeys = targetKeys;
			console.log(targetKeys,direction,moveKeys);
		},
		confirmCharge(){ // 水晶电池充电
			if(!this.selectedTool) warning(app,'请选中要充能的工具');
			else if(this.iTargetKeys.length<=0) this.cancelCharge();
			else if(this.iTargetKeys.length>3) warning(app,'只需要提交3个组件');
			else if(this.iTargetKeys.length<3) warning(app,'需要提交3个组件');
			else{
				let comsumeList = [];
				for(var i of this.iTargetKeys)comsumeList.push(this.iData[i].label);
				for(var i2 of comsumeList) consumeComponent(i2);
				gp_store.dispatch('chargeItem',this.selectedTool);
				success(app,'['+this.selectedTool+']充能完毕!');
				gp_store.commit('setBatteryUsed',true);
				this.cancelCharge();
			}
		},
		cancelCharge(){ // 水晶电池取消充电
			this.iTargetKeys = [];
			gp_store.commit('setBatteryUsingModalShow',false);
			this.selectedTool = undefined;
		}
	},
	template:
		'<!--水晶电池充能-->\
		<Modal :styles="{top: \'10px\'}" :value="batteryUsingModalShow" title="进行道具充能"\
			:footer-hide="true" :closable="false" :mask-closable="false">\
			<Card :dis-hover="true">\
				<div style="text-align:center">\
					<Select v-model="selectedTool" style="width:200px" placeholder="选择要充能的工具">\
						<Option v-for="(item,k) in toolList" :value="item" :key="k">{{item}}</Option>\
					</Select>\
				</div>\
				<Divider dashed/>\
				<Transfer :data="iData" :target-keys="iTargetKeys" \
				 :render-format="rowDataRender" :titles="[\'已有组件\',\'要消耗的组件\']"\
				 @on-change="handleChange"/>\
				<Divider/>\
				<div style="text-align:center">\
					<Button size="default" type="success" @click="confirmCharge">确定</Button>\
					<Button size="default" type="default" @click="cancelCharge">取消</Button>\
				</div>\
			</Card>\
		</Modal>'
};
