var gameRouter = new VueRouter({
	routes:[
		{ path: '/', component: ViewWelcome },
		{ 	
			path: '/main/map',
			components: {
				default : InfoNav,
				subMain : ViewMap
			}
		},
		{ 	
			path: '/main/workshop',
			components: {
				default : InfoNav,
				subMain : ViewWorkshop
			}
		},
		{ 	
			path: '/main/workshop/construct/charge',
			components: {
				default : InfoNav,
				subMain : ViewConstructStart
			}
		},
		{ 	
			path: '/main/workshop/construct/connect',
			components: {
				default : InfoNav,
				subMain : ViewConstructConnect
			}
		},
		{ 	
			path: '/main/workshop/engine',
			components: {
				default : InfoNav,
				subMain : ViewEngineStart
			}
		},
		{ 	
			path: '/main/wilderness',
			components: {
				default : InfoNav,
				subMain : ViewWilderness
			}
		},
		{ 	
			path: '/main/wilderness/battle',
			components: {
				default : InfoNav,
				subMain : ViewBattle
			}
		},
		{ 	
			path: '/inventory',
			components: {
				default : InfoNav,
				subMain : InfoInventory
			}
		},
		{ 	
			path: '/calendar',
			components: {
				default : InfoNav,
				subMain : InfoCalendar
			}
		},
		{ 	
			path: '/scoringRulesTable',
			components:{
				default : InfoNav,
				subMain : InfoScoringRulesTable
			}
		},
		{ 	
			path: '/main/end',
			components:{
				default : InfoNav,
				subMain : InfoGameEnd
			}
		}
	]
});
gameRouter.beforeEach((to, from, next) => {
	// 当尝试进入 /main/:path 的地址时，根据游戏阶段重定向地址
	// 如果要去的地址不是符合游戏阶段的地址进行重定向
	let redirectPath = getRedirectPath(gp_store.state.gamePhase);
	if(to.path.indexOf('/main')!=-1 && to.path != redirectPath) next(redirectPath);
	else return next();
});

// 根据游戏阶段重定向路径
function getRedirectPath(gp){
	switch(gp){
		case GAMEPHASE.MAP : return '/main/map';
		case GAMEPHASE.WILDERNESS : return '/main/wilderness';
		case GAMEPHASE.BATTLE : return '/main/wilderness/battle';
		case GAMEPHASE.WORKSHOP : return '/main/workshop';
		case GAMEPHASE.START_CONSTRUCT : return '/main/workshop/construct/charge';
		case GAMEPHASE.CONNECT_CONSTRUCT : return '/main/workshop/construct/connect';
		case GAMEPHASE.START_ENGINE : return '/main/workshop/engine';
		case GAMEPHASE.GAME_END : return '/main/end';
	}
}