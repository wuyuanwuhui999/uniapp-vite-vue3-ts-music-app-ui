<template>
	<view class="page-wrapper">
		<view class="page-header">
			<AvaterComponent size="small"/>
			<text class="my-favorite" @click="onSwitchModel">当前接入模型：{{ chatModelList[activeModelIndex]?.modelName }}</text>
			<view class="menu-wrapper">
				<image class="icon-small icon-record" @click="onShowMenu" :src="icon_menu"/>
				<template v-if="showMenu">
					<view class="menu-box" >
						<view class="menu-arrow"></view>
						<view class="menu-list">
							<view class="menu-item" @click="onShowHistory">会话记录</view>
							<view class="menu-line"></view>
							<view class="menu-item" @click="onSwitchModel">切换模型</view>
						</view>
					</view>
					<view class="menu-mask" @click="onHideMenu"></view>
				</template>
			</view>
			
		</view>
		<view class="page-body">
			<scroll-view class="scroll-view" scroll-y :show-scrollbar="false" :scroll-top="scrollTop" @scroll="onScroll">
				<view class="chat-list">
					<template v-for="item,index in chatList" :key="'chat'+index">
						<view class="chat-wrapper">
							<template v-if="item.position === PositionEnum.LEFT && (item.thinkContent || item.responseContent)">
								<image :src="icon_ai" class="icon-middle"/>
								<view class="chat-text-wrapper">
									<view class="chat-text chat-prompt">
										<view class="icon-angle icon-angle-left"></view>
											<view class="think-text" v-if="item.thinkContent">
												<text>
													{{ item.thinkContent.replace(/^(<think>)[\s\s\n]?|(<\/think>[\s\S\n]?)$/gi,"") }}
												</text>
											</view>
										
											<!-- 正式回答黑色区块 -->
											 <view class="response-box">
												<mp-html :content="marked.parse(item.responseContent)"></mp-html>
											 </view>

									</view>
								</view>		
								<image v-if="item.type === 'system'" @click="onEditPrompt" :src="icon_edit" class="icon-small"/>
							</template>
							<template v-else-if="item.text">
								<view class="chat-prompt-wrapper">
									<view class="chat-prompt">
										<view class="icon-angle icon-angle-right"></view>
										<text>{{ item.text }}</text>
									</view>
								</view>
								<AvaterComponent/>
							</template>
						</view>
					</template>
					<view class="chat-wrapper" v-if="thinking">
						<image :src="icon_ai" class="icon-middle"/>
						<view class="chat-text-wrapper">
							<view class="chat-text chat-prompt">
								<view class="icon-angle icon-angle-left"></view>
								<view  class="think-text">
									<text>正在思考中</text>
								</view>
							</view>
						</view>	
					</view>
				</view>
			</scroll-view>
		</view>
		<scroll-view scroll-x class="scroll-container">
			<view class="type-wrapper">
				<text class="type-item" :class="{'type-item-active': showThink}" @click="onSwitchThink()">深度思考</text>
				<view class="type-item type-item-language" @click="onSwitchLang()"><text>{{ language }}</text><image class="icon-small" :src="icon_switch"/></view>
			</view>
		</scroll-view>
		
		<view class="input-wrapper">
			<image :src="icon_chat" class="icon-middle icon_send" @click="onCreateNewChat"/>
			<input class="chat-input" placeholder="有问题，尽管问" v-model="inputValue">
			<view class="icon-wrapper">
				<image v-show="isCompleted" :src="icon_send" class="icon-middle icon_send" @click="onSend"></image>
				<view class="icon-sending" v-show="!isCompleted"></view>
			</view>
		</view>
		<view class="side-wrapper" v-show="showHistory">
			<scroll-view class="pop-scroll-view side-scroll-view" scroll-y :show-scrollbar="false" @scrolltolower="onScrolltolower">
				<view class="history-list">
					<view class="chat-item" :key="items.timeAgo" v-for="items in chatHistoryData">
						<text class="chat-time">{{ items.timeAgo }}</text>
						<text class="chat-content" @click="onChat(item)" :key="'chat-content'+index" v-for="item,index in items.list">{{ item[0].prompt }}</text>
					</view>
				</view>
			</scroll-view>
			<view class="side-mask" @click="onClose"></view>
		</view>
		<OptionsDialog ref="modelOptionsDialog" @onCheck= "onCheckModel" :options="chatModelOption"/>
	</view>
</template>

<script setup lang="ts">
	import { marked } from 'marked';
	import mpHtml from "mp-html/dist/uni-app/components/mp-html/mp-html";
	import 'highlight.js/styles/github.css';
	import "highlight.js/styles/paraiso-light.css";
    import { reactive, ref, onBeforeUnmount,defineAsyncComponent } from 'vue';
	import icon_send from '../../static/icon_send.png';
	import icon_menu from '../../static/icon_menu.png';
	import icon_ai from '../../static/icon_ai.png';
	import icon_chat from '../../static/icon_chat.png';
	import icon_switch from '../../static/icon_switch.png';
	import icon_edit from "../../static/icon_edit.png";
	import AvaterComponent from '../components/AvaterComponent.vue';
    import type {
      OptionType,
      ChatHistoryType,
      ChatType,
      ChatStructure,
      ChatModelType,
      GroupedByChatIdType,
      FileType,
      PayloadInterface,
    } from '../types';
    import { PositionEnum } from '../enum';
	import { formatTimeAgo, generateSecureID } from "../utils/util";
    import {HOST, PAGE_SIZE, COMPANY_ID} from '../common/constant';
	import api from '@/api';
    import {
      getChatHistoryService,
      getModelListService,
    } from "../service";
	import { useStore } from "../stores/useStore";
	import PopupComponent from "../components/PopupComponent.vue";
	import {LanguageEnum,LanguageMap} from '../enum/index';

	const OptionsDialog = defineAsyncComponent(()=>import('../components/OptionsDialog.vue'))

	// 响应式状态
	let socketTask: UniApp.SocketTask | null = null; // WebSocket 实例
	const isCompleted = ref<boolean>(true);
	const chatHistoryData = reactive<Array<ChatStructure>>([]);
	const pageNum = ref<number>(1);
	const showHistory = ref<boolean>(false);
	const total = ref<number>(0);
	let chatId:string = "";
	const inputValue = ref<string>("");
	const store = useStore();
	const scrollTop = ref<number>(0);
	const activeModelIndex = ref<number>(0);
	const showMenu = ref<boolean>(false);
	const showThink = ref<boolean>(false);// 是否深度思考
	const thinking = ref<boolean>(false);
	const dialogText = ref<string>("");// 弹窗的内容
	const chatList = reactive<Array<ChatType>>([
		{
			responseContent:"你好，我是智能助手小吴同学，请问有什么可以帮助您？",
			position: PositionEnum.LEFT,
		}
	]);
	const chatModelList = reactive<Array<ChatModelType>>([]);
	const chatModelOption = reactive<Array<OptionType>>([]);
	const modelOptionsDialog = ref<null | InstanceType<typeof OptionsDialog>>(null);
	const type = ref<string>("");
	const language = ref<LanguageEnum>(LanguageEnum.zh);
	const directoryId = ref<string>("default");
	const mDirectoryId = ref<string>("default");// 待确定选择的文件夹
	const showDirDialog = ref<boolean>(false);// 实现上传文档的目录
	const showCreateDialog = ref<boolean>(false);// 创建文件夹弹窗
	const directoryName = ref<string>("");// 文件夹名称
	const showCheckDocument = ref<boolean>(false);

	// 支持的MIME类型映射
    const supportedMimeTypes = {
      'txt': 'text/plain',
      'pdf': 'application/pdf'
    }

	
    /**
	 * @author: wuwenqiang
	 * @description: 获取模型列表
	 * @date: 2025-06-02 21:45
	 */
	getModelListService(COMPANY_ID).then((res)=>{
		chatModelList.push(...res.data);
		res.data.forEach((item,index)=>chatModelOption.push({value:index,text:item.modelName}));
    	activeModelIndex.value = 0;
	});

    /**
	 * @author: wuwenqiang
	 * @description: 发送
	 * @date: 2025-05-10 22:13
	 */
	const onSend = async() => {
		if(inputValue.value.trim()){
			chatList.push({
				text:inputValue.value.trim(),
				position:PositionEnum.RIGHT
			});
			if(!chatId)chatId = generateSecureID();
			const item:ChatType = {
				text:"",
				position:PositionEnum.LEFT,
				thinkContent:"",
				responseContent:"",
				start:false
			}
			chatList.push(item);
			const payload:PayloadInterface = {
				modelId: chatModelList[activeModelIndex.value].id,
				chatId, // 替换为实际聊天ID
				prompt: inputValue.value.trim(),
				showThink:showThink.value,
				language: LanguageMap[language.value],
			};
			console.log(payload)
			await connectWebSocket();
			socketTask?.send({
				data: JSON.stringify(payload),
				success: () => {
					console.log('消息发送成功');
					inputValue.value = "";
					isCompleted.value = false;
					thinking.value = true;
				},
				fail: (err) => {
					uni.showToast({
						duration: 2000,
						position: 'center',
						title: '发送消息失败：' + err.toString()
					});
				}
			});
		}	
	}

	/**
	 * @description: 返回按钮
	 * @date: 2024-05-10 22:10
	 * @author wuwenqiang
	 */
     const useBack = ()=>{
		uni.navigateBack()
	}

	/**
	 * @description: 加载历史记录
	 * @date: 2024-05-10 22:10
	 * @author wuwenqiang
	 */
	const useChatHistory = () => {
		chatHistoryData.length = 0;
		getChatHistoryService(pageNum.value,PAGE_SIZE).then((res) => {
			total.value = res.total;
			const chatIdGroud:GroupedByChatIdType = {};
			res.data.forEach((item)=>{
				item.timeAgo = formatTimeAgo(item.createTime);
				if(!chatIdGroud[item.chatId]){
					chatIdGroud[item.chatId] = [];
				}
				chatIdGroud[item.chatId].push(item)
			});
			for(let key in chatIdGroud){
				chatIdGroud[key].reverse();
				const timeAgo:string = chatIdGroud[key][0].timeAgo;
				let items = chatHistoryData.find((item)=>item.timeAgo === timeAgo);
				if(!items){
					items = {
						timeAgo,
						list:[]
					}
					chatHistoryData.push(items)
				}
				items?.list.unshift(chatIdGroud[key])
			}
		});
	}

	/**
	 * @description: 展示历史记录
	 * @date: 2025-05-18 12:29
	 * @author wuwenqiang
	 */
	const onShowHistory = ()=>{
		showHistory.value = true;
		showMenu.value = false;
		pageNum.value = 1;
		useChatHistory();
	}

	/**
	 * @description: 展示菜单
	 * @date: 2025-06-21 12:56
	 * @author wuwenqiang
	 */
	const onShowMenu = () =>{
		showMenu.value = true;
	}

	/**
	 * @description: 展示菜单
	 * @date: 2025-06-21 12:56
	 * @author wuwenqiang
	 */
	const onHideMenu = () =>{
		showMenu.value = false;
	}

	/**
	 * @description: 关闭会话记录抽屉（点击遮罩时触发）
	 * @date: 2026-09-30 21:10
	 * @author wuwenqiang
	 */
	const onClose = () =>{
		showHistory.value = false;
	}

	/**
	 * @description: 滚动加载历史记录
	 * @date: 2024-05-18 12:29
	 * @author wuwenqiang
	 */
	const onScrolltolower = ()=>{
		if(total.value > pageNum.value * PAGE_SIZE){
			useChatHistory();
		}
	}

	/**
	 * @description: 滚动加载历史记录
	 * @date: 2024-05-18 12:29
	 * @author wuwenqiang
	 */
	const onChat = (chatHistoryList:Array<ChatHistoryType>)=>{
		chatList.length = 0;
		showHistory.value = false;
		chatId = chatHistoryList[0].chatId;
		chatHistoryList.forEach((item)=>{
			chatList.push({
				text:item.prompt,
				position:PositionEnum.RIGHT,
			});
			chatList.push({
				text:"",
				start:true,
				position:PositionEnum.LEFT,
				thinkContent: item.thinkContent,
				responseContent: item.responseContent
			});
		})
	}	

	const connectWebSocket = () => {
		return new Promise((resolve,reject)=>{
			socketTask = uni.connectSocket({
				// token 参数带上 Bearer 前缀（与 http 请求头 Authorization 的格式保持一致）
				url: `${HOST.replace(/http[s]?/,'ws')}${api.chatWs}?token=${encodeURIComponent('Bearer ' + store.token)}`,
				success: (res) => {
					console.log('WebSocket 连接成功:', res);
				},
				fail: (err) => {
				console.error('WebSocket 连接失败:', err);
				}
			});

			socketTask.onOpen(() => {
				resolve(null)
				console.log('WebSocket 连接已建立');
			});

			socketTask.onMessage(({data}) => {
				thinking.value = false;
				if(data == "[completed]"){
					return isCompleted.value = true;
					closeSocket()
				}
				chatList[chatList.length - 1].start = true;
				// 匹配所有形式的 `<think>` 标签（包括属性和自闭合）
				const regex = /<think>([\s\S]*?)<\/think>/gi
				if(!showThink.value || regex.test(chatList[chatList.length - 1].thinkContent || "")){
					chatList[chatList.length - 1].responseContent += data;
				}else{
					chatList[chatList.length - 1].thinkContent += data;
				}
				scrollTop.value+=10
			});

			socketTask.onError((err) => {
				console.error('WebSocket 错误:', err);
				thinking.value = false;
			});

			socketTask.onClose(() => {
				thinking.value = false;
				console.log('WebSocket 连接已关闭');
			});
			
		})
      
    };

	/**	
	 * @description: 创建新会话
	 * @date: 2025-06-21 12:19
	 * @author wuwenqiang
	 */	
	const onCreateNewChat = () => {
		chatList.length = 0;
		chatId = "";
		chatList.push({
			responseContent:"你好，我是智能音乐助手小吴同学，请问有什么可以帮助您？",
			position: PositionEnum.LEFT
		});
	}


	const onScroll = (event : Event)=>{
		scrollTop.value = event.detail.scrollTop
	}

	// 在组件卸载前断开 WebSocket 连接
    onBeforeUnmount(() => {
      	socketTask?.close({
          success: () => {
            console.log('WebSocket 连接已关闭');
          }
        });
    });
	
	const closeSocket = ()=>{
		socketTask?.close({
          success: () => {
            console.log('WebSocket 连接已关闭');
          }
        });
	}
	/**	
	 * @description: 选择文档
	 * @date: 2025-06-21 18:47
	 * @author wuwenqiang
	 */
	const onCheckType = (checkType:string)=>{
		type.value = type.value === checkType ? "" : checkType;
	}

	/**	
	 * @description: 是否开启深度思考
	 * @date: 2025-06-21 18:47
	 * @author wuwenqiang
	 */
	const onSwitchThink = () => {
		showThink.value = !showThink.value;
	}

	/**	
	 * @description: 切换类型
	 * @date: 2025-07-05 18:47
	 * @author wuwenqiang
	 */
	const onSwitchModel = ()=>{
		modelOptionsDialog.value?.$refs.popup.open('top');
		showMenu.value = false;
	}

	/**	
	 * @description: 选择模型
	 * @date: 2025-07-05 18:47
	 * @author wuwenqiang
	 */
	const onCheckModel = (index:number) => {
    	activeModelIndex.value = index
	}

	const onSwitchLang = ()=>{
		language.value = language.value === LanguageEnum.zh ? LanguageEnum.en : LanguageEnum.zh
	}
</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
	.page-wrapper{
		position: relative;
		.page-header {
			padding: @md-padding;
			display: flex;
			justify-content: space-between;
			background: @white-color;
			align-items: center;
			.icon-back{
				width: @sm-icon-size;
				height: @sm-icon-size;
				opacity: 0.2;
			}
			.icon-record{
				opacity: 0.5;
			}
			.menu-wrapper{
				width: @sm-icon-size;
				height: @sm-icon-size;
				position: relative;
				.menu-box{
					position: absolute;
					z-index: 2;
					width: @popup-menu-width;
					background-color: @pop-background-color;
					right: -@arrow-size;
					top: calc(@sm-icon-size + @arrow-size);
					border-radius: @md-border-radius;
					.menu-arrow{
						position: absolute;
						width: 0;
						height: 0;
						top: @arrow-size;
						border-top: @arrow-size solid transparent;   
						border-bottom: @arrow-size solid @pop-background-color; 
						border-right:@arrow-size solid transparent;;
						border-left:@arrow-size solid transparent;
						z-index: 1;
						right: calc(@arrow-size * 2);
						top: calc(@arrow-size * -2);
					}
					.menu-list{
						padding: @md-padding;
						display: flex;
						flex-direction: column;
						color:@white-background-color;
						gap:@md-padding;
						.menu-line{
							height: 1rpx;
							background-color: @pop-line-color;
						}
						.menu-item{

						}
					}
				}
				.menu-mask{
					width: 100vw;
					height: 100vh;
					z-index: 1;
					left: 0;
					top:0;
					position: fixed;
					background-color: transparent;
				}
			}
		}
		.page-body{
			flex: 1;
			height: 0;
			.scroll-view{
				height: 100%;
				.chat-list{
					display: flex;
					flex-direction: column;
					gap: @md-padding;
					padding: @md-padding;
					.chat-wrapper{
						display: flex;
						gap:@md-padding;	
						.chat-prompt-wrapper{
							flex: 1;
							display: flex;
							justify-content: flex-end;
							.chat-prompt{
								max-width: 100%;
								background-color: @white-color;
								padding: @md-padding;
								border-radius: @btn-border-radius;
								position: relative;
							}
						}
						.chat-text-wrapper{
							flex: 1;
							display: flex;
							.chat-text{
								max-width: 100%;
								background-color: @white-color;
								padding: @md-padding;
								border-radius: @btn-border-radius;
								position: relative;
								
								.think-text{
									color:@sub-title-color;
								}
							}
						}
						
						.icon-angle{
							position: absolute;
							width: 0;
							height: 0;
							top: 15rpx;
							border-top: 15rpx solid transparent;   
							border-bottom: 15rpx solid transparent; 
							&.icon-angle-left{
								left: -15rpx;
								border-right: 15rpx solid @white-color;
							}
							&.icon-angle-right{
								right: -15rpx;
								border-left: 15rpx solid @white-color;
							}
						}
					}
				}
			}
		}
		.scroll-container {
			width: 100%;
			white-space: nowrap;
			.type-wrapper{
				display: flex;
				justify-content: flex-start;
				background-color: @page-background-color;
				padding: @md-padding 0;
				gap: @md-padding;
				flex-wrap: nowrap;
				width: auto;
				float: left;
				.type-item{
					padding: @small-margin @md-padding;
					color: @sub-title-color;
					border: 1rpx solid @gray-color;
					border-radius: @big-border-radius;
					background-color: @white-color;
					display: flex;
					justify-content: center;
					align-items: center;
					white-space: nowrap;
					flex-shrink: 0;
					gap:@small-margin;
					&.type-item-doc{
						display: flex;
					}
					&.type-item-language{
						color: #000;
					}
					&.type-item-active{
						border-color: @selected-color;
						color:  @selected-color;
					}
					&:first-child{
						margin-left: @md-padding;
					}
					&:last-child{
						margin-right: calc(@md-padding * 3);
					}
				}
			}
		}
		
		.input-wrapper{
			display: flex;
			gap:@md-padding;
			padding: @md-padding;
			background-color: @white-color;
			align-items: center;
			.chat-input{
				background-color: @page-background-color;
				flex: 1;
				height: @middle-avater;
				border-radius: @middle-avater;
				padding-left: @md-padding;
				box-sizing: border-box;
			}
			.icon-wrapper{
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 50%;
				background-color: @page-background-color;
				width:  @middle-avater;
				height:  @middle-avater;
				.icon-sending{
					width: 35%;
					height: 35%;
					border-radius: @btn-border-radius;
					background-color: @sub-title-color;
				}
			}
		}
		.side-wrapper{
			// 历史记录抽屉：固定定位铺满屏幕，叠在页面之上，不参与文档流（避免把输入框顶走）
			position: fixed;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			z-index: 2;
			.side-mask{
				// 遮罩层铺满屏幕，点击可关闭抽屉
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				background: @black-background-color;
				opacity: 0.5;
			}
			.pop-scroll-view{
				// 历史记录面板叠在遮罩之上
				position: relative;
				z-index: 1;
			}
		}
		.pop-scroll-view{
			background-color: @white-color;
			&.side-scroll-view{
				width: 80%;
			}
			height: 100vh;
			padding: @md-padding;
			box-sizing: border-box;
			.line{
				height: 1rpx;
				background-color: @gray-color;
				margin-bottom: @md-padding;
			}
			.history-list{
				padding: @md-padding;
				display: flex;
				flex-direction: column;
				gap: calc(@md-padding * 2);
				.chat-item{
					display: flex;
					flex-direction: column;
					gap:  @md-padding;
					.chat-time{
						color: @sub-title-color;
					}
					.chat-content{
						display: block;
						width: 100%;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
				}
				
			}
		}
	}
</style>
