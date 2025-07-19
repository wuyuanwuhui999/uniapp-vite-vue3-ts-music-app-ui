<template>
	<view class="page-wrapper">
		<view class="page-header">
			<image class="icon-back" @click="useBack" :src="icon_back"/>
			<text class="my-favorite">当前接入模型：{{ activeModel }}</text>
			<view class="menu-wrapper">
				<image class="icon-small icon-record" @click="onShowMenu" :src="icon_menu"/>
				<template v-if="showMenu">
					<view class="menu-box" >
						<view class="menu-arrow"></view>
						<view class="menu-list">
							<view class="menu-item" @click="onUploadDoc">上传文档</view>
							<view class="menu-line"></view>
							<view class="menu-item" @click="onShowMyDoc">我的文档</view>
							<view class="menu-line"></view>
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
												<text>{{ item.responseContent }}</text>
											</view>
									</view>
								</view>								
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
				<text class="type-item" :class="{'type-item-active': type === 'document'}" @click="onCheckType('document')">查询文档</text>
				<text class="type-item" :class="{'type-item-active': type === 'db'}" @click="onCheckType('db')">查询数据库</text>
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
			<view class="pop-wrapper">
				<scroll-view class="pop-scroll-view" scroll-y :show-scrollbar="false" @scrolltolower="onScrolltolower">
					<view class="history-list">
						<view class="chat-item" :key="items.timeAgo" v-for="items in chatHistoryData">
							<text class="chat-time">{{ items.timeAgo }}</text>
							<text class="chat-content" @click="onChat(item)" :key="'chat-content'+index" v-for="item,index in items.list">{{ item[0].prompt }}</text>
						</view>
					</view>
				</scroll-view>
			</view>
			<view class="side-mask" @click="onClose"></view>
		</view>
		<view class="side-wrapper" v-show="showMyDoc">
			<view class="pop-wrapper">
				<scroll-view class="pop-scroll-view" scroll-y :show-scrollbar="false">
					<uni-swipe-action v-if="myDocList.length !== 0">
						<template v-for="item,index in myDocList" :key="item.id">
							<uni-swipe-action-item >
								<view class="doc-item" :key="item.id" v-for="item in myDocList">
									<text class="doc-time">{{ formatTimeAgo(item.createTime) }}</text>
									<text class="doc-name">{{ item.name }}</text>
								</view>
								<template v-slot:right>
									<view class="delete-button" @click="onDeleteDoc(item,index)"><text class="delete-button-text">删除</text></view>
								</template>
							</uni-swipe-action-item>
							<view class="line" v-if="index < myDocList.length -1"></view>
						</template>
					</uni-swipe-action>
				</scroll-view>
			</view>
			<view class="side-mask" @click="onClose"></view>
		</view>
		<OptionsDialog ref="modelOptionsDialog" @onCheck= "onCheckModel" :options="chatModelOption"/>
		<PopupComponent :text="dialogText" @on-sure="sureDeleteDoc" ref="popupComponent"></PopupComponent>
	</view>
</template>

<script setup lang="ts">
    import { reactive, ref, onBeforeUnmount } from 'vue';
	import icon_back from '../../static/icon_back.png';
	import icon_send from '../../static/icon_send.png';
	import icon_menu from '../../static/icon_menu.png';
	import icon_ai from '../../static/icon_ai.png';
	import icon_chat from '../../static/icon_chat.png';
	import icon_switch from '../../static/icon_switch.png';
	import AvaterComponent from '../components/AvaterComponent.vue';
	import type {OptionInterce,DocumentInterface ,ChatHistoryType, ChatType, ChatStructure, ChatModelType, GroupedByChatIdType,FileType,PayloadInterface,UploadFile,UploadResponse} from '../types';
    import { PositionEnum } from '../enum';
	import { formatTimeAgo, generateSecureID } from "../utils/util";
	import { HOST, PAGE_SIZE } from '../common/constant';
	import api from '@/api';
	import { getChatHistoryService, getModelListService, getMyDocumentService,deleteMyDocumentService }from "../service";
	import { useStore } from "../stores/useStore";
	import OptionsDialog from '../components/OptionsDialog.vue';
	import uniSwipeAction from '@dcloudio/uni-ui/lib/uni-swipe-action/uni-swipe-action.vue';
	import uniSwipeActionItem from '@dcloudio/uni-ui/lib/uni-swipe-action-item/uni-swipe-action-item.vue';
	import PopupComponent from "../components/PopupComponent.vue";
	import {LanguageEnum,LanguageMap} from '../enum/index';

	// 响应式状态
	let socketTask: UniApp.SocketTask | null = null; // WebSocket 实例
	const isCompleted = ref<boolean>(true);
	const chatHistoryData = reactive<Array<ChatStructure>>([]);
	const pageNum = ref<number>(1);
	const showHistory = ref<boolean>(false);
	const total = ref<number>(0);
	let chatId:string = "";
	let deleteIndex:number = -1;
	const popupComponent = ref<null | InstanceType<typeof PopupComponent>>(null);
	const inputValue = ref<string>("");
	const store = useStore();
	const scrollTop = ref<number>(0);
	const activeModel = ref<string>("");
	const showMenu = ref<boolean>(false);
	const showMyDoc = ref<boolean>(false);
	const myDocList = reactive<Array<DocumentInterface>>([]);
	const showThink = ref<boolean>(false);// 是否深度思考
	const thinking = ref<boolean>(false);
	const dialogText = ref<string>("");// 弹窗的内容
	const chatList = reactive<Array<ChatType>>([
		{
			responseContent:"你好，我是智能音乐助手小吴同学，请问有什么可以帮助您？",
			position: PositionEnum.LEFT
		}
	]);
	const chatModelList = reactive<Array<ChatModelType>>([]);
	const chatModelOption = reactive<Array<OptionInterce>>([]);
	const modelOptionsDialog = ref<null | InstanceType<typeof OptionsDialog>>(null);
	const type = ref<string>("");
	const language = ref<LanguageEnum>(LanguageEnum.zh);
	// 支持的MIME类型映射
    const supportedMimeTypes = {
      'txt': 'text/plain',
      'pdf': 'application/pdf'
    }
	// 支持的扩展名
	
    const supportedExtensions = Object.keys(supportedMimeTypes) as FileType[]
    /**
	 * @author: wuwenqiang
	 * @description: 获取模型列表
	 * @date: 2025-06-02 21:45
	 */
	getModelListService().then((res)=>{
		chatModelList.push(...res.data);
		res.data.forEach((item)=>chatModelOption.push({value:item.modelName,text:item.modelName}));
		activeModel.value = res.data[0].modelName;
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
				modelName: activeModel.value,
				token: store.token, // 替换为实际用户ID
				chatId, // 替换为实际聊天ID
				type:type.value,
				prompt: inputValue.value.trim(),
				showThink:showThink.value,
				language: LanguageMap[language.value],
			};
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
				url: `${HOST.replace(/http[s]?/,'ws')}${api.chatWs}`,
				success: (res) => {
					console.error('WebSocket 连接成功:', res);
					
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
				if(regex.test(chatList[chatList.length - 1].thinkContent || "")){
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

	/**	
	 * @description: 上传文档
	 * @date: 2025-06-21 12:58
	 * @author wuwenqiang
	 */	
    const onUploadDoc = () => {
		uni.chooseFile({
			count: 9,
			type: 'file',
			extension: supportedExtensions,
			success: async (res: { tempFiles: UploadFile[] }) => {
			// 过滤出符合类型的文件
			const validFiles = res.tempFiles.filter(file => {
				const ext = file.name.split('.').pop()?.toLowerCase() as FileType | undefined;
				return ext && supportedExtensions.includes(ext);
			});

			if (validFiles.length === 0) {
				uni.showToast({
				icon: 'none',
				title: '未选择有效的txt或pdf文件',
				duration: 2000
				});
				return;
			}

			// 显示加载中
			uni.showLoading({
				title: '上传中...',
				mask: true
			});

			try {
				uni.addInterceptor('uploadFile', {
					invoke(options) {
						options.header = {
							...options.header,
							'Authorization': `Bearer ${store.token}`
						};
					}
				});
				// 使用Promise.all并行上传所有文件
				const uploadPromises = validFiles.map(file => {
					return new Promise<void>((resolve, reject) => {
						uni.uploadFile({
						url: HOST + api.uploadDoc, // 替换为你的上传接口URL
						filePath: file.path,
						name: 'file',
						formData: {
							filename: file.name
						},
						success: (uploadRes) => {
							try {
							const data: UploadResponse = JSON.parse(uploadRes.data);
							if (data.status !== "SUCCESS") {
								reject(new Error(data.message || '上传失败'));
							} else {
								uni.showToast({
									duration: 2000,
									position: 'center',
									title: '文件上传成功'
								});
								resolve();
							}
							} catch (e) {
								reject(new Error('解析响应数据失败'));
							}
						},
						fail: (err) => {
							reject(new Error(err.errMsg || '上传请求失败'));
						}
						});
					});
				});

				// 等待所有文件上传完成
				await Promise.all(uploadPromises);
				
				// 上传成功提示
				uni.showToast({
					title: `成功上传${validFiles.length}个文件`,
					icon: 'success',
					duration: 2000
				});
			} catch (error) {
				uni.showToast({
					title: error instanceof Error ? error.message : '上传过程中出错',
					icon: 'none',
					duration: 2000
				});
			} finally {
				showMenu.value = false;
				uni.hideLoading();
			}
			},
			fail: (err) => {
				uni.showToast({
					duration: 2000,
					position: 'center',
					title: "上传文档失败",
					icon: 'none'
				});
			}
		});
	};

	/**	
	 * @description: 展示我的文档
	 * @date: 2025-06-21 12:58
	 * @author wuwenqiang
	 */
	const onShowMyDoc = () => {
		uni.showLoading();
		getMyDocumentService().then((res)=>{
			showMyDoc.value = true;
			showMenu.value = false;
			myDocList.length = 0;
			myDocList.push(...res.data);
		}).finally(()=>{
			uni.hideLoading();
		})
	}

	const onClose = ()=>{
		showMyDoc.value = showHistory.value = false;
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
	const onCheckModel = (model:string|number) => {
		console.log("model=",model)
		activeModel.value = model.toString()
	}

	/**	
	 * @description: 删除文档
	 * @date: 2025-07-12 13:03
	 * @author wuwenqiang
	 */
	const onDeleteDoc = (item:DocumentInterface,index:number) =>{
		deleteIndex = index;
		dialogText.value = `是否删除文档：${item.name}`;
		popupComponent.value?.popup.value?.open('top');
		console.log("popupComponent.value?.popup.value?=",popupComponent.value?.popup.open("top"))
	}

	/**	
	 * @description: 确认删除文档
	 * @date: 2025-07-12 13:03
	 * @author wuwenqiang
	 */
	const sureDeleteDoc = ()=>{
		deleteMyDocumentService(myDocList[deleteIndex].id).then((res)=>{
			uni.showToast({
				duration:2000,
				position:'center',
				title: "删除文档成功"
			});
			myDocList.splice(deleteIndex,1);
			popupComponent.value?.popup?.close();
		}).catch(()=>{
			uni.showToast({
				duration:2000,
				position:'center',
				title: "删除文档失败"
			});
		});
	}

	const onSwitchLang = ()=>{
		language.value = language.value === LanguageEnum.zh ? LanguageEnum.cn : LanguageEnum.zh
	}
</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
	.page-wrapper{
		position: relative;
		.page-header {
			padding: @page-padding;
			display: flex;
			justify-content: space-between;
			background: @module-background-color;
			align-items: center;
			.icon-back{
				width: @small-icon-size;
				height: @small-icon-size;
				opacity: 0.2;
			}
			.icon-record{
				opacity: 0.5;
			}
			.menu-wrapper{
				width: @small-icon-size;
				height: @small-icon-size;
				position: relative;
				.menu-box{
					position: absolute;
					z-index: 2;
					width: @popup-menu-width;
					background-color: @pop-background-color;
					right: -@arrow-size;
					top: calc(@small-icon-size + @arrow-size);
					border-radius: @module-border-radius;
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
						padding: @page-padding;
						display: flex;
						flex-direction: column;
						color:@white-background-color;
						gap:@page-padding;
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
					gap: @page-padding;
					padding: @page-padding;
					.chat-wrapper{
						display: flex;
						gap:@page-padding;	
						.chat-prompt-wrapper{
							flex: 1;
							display: flex;
							justify-content: flex-end;
							.chat-prompt{
								max-width: 100%;
								background-color: @module-background-color;
								padding: @page-padding;
								border-radius: @btn-border-radius;
								position: relative;
							}
						}
						.chat-text-wrapper{
							flex: 1;
							display: flex;
							.chat-text{
								max-width: 100%;
								background-color: @module-background-color;
								padding: @page-padding;
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
								border-right: 15rpx solid @module-background-color;
							}
							&.icon-angle-right{
								right: -15rpx;
								border-left: 15rpx solid @module-background-color;
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
				padding: @page-padding 0;
				gap: @page-padding;
				flex-wrap: nowrap;
				width: auto;
				float: left;
				.type-item{
					padding: @small-margin @page-padding;
					color: @sub-title-color;
					border: 1rpx solid @disable-text-color;
					border-radius: @big-border-radius;
					background-color: @module-background-color;
					display: flex;
					justify-content: center;
					align-items: center;
					white-space: nowrap;
					flex-shrink: 0;
					gap:@small-margin;
					&.type-item-language{
						color: #000;
					}
					&.type-item-active{
						border-color: @selected-color;
						color:  @selected-color;
					}
					&:first-child{
						margin-left: @page-padding;
					}
					&:last-child{
						margin-right: calc(@page-padding * 3);
					}
				}
			}
		}
		
		.input-wrapper{
			display: flex;
			gap:@page-padding;
			padding: @page-padding;
			background-color: @module-background-color;
			align-items: center;
			.chat-input{
				background-color: @page-background-color;
				flex: 1;
				height: @middle-avater;
				border-radius: @middle-avater;
				padding-left: @page-padding;
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
			height: 100vh;
			width: 100vw;
			position: absolute;
			display: flex;
			.pop-wrapper{
				width: 70%;
				background-color: @module-background-color;
				.pop-scroll-view{
					height: 100vh;
					padding: @page-padding;
					box-sizing: border-box;
					.history-list{
						padding: @page-padding;
						display: flex;
						flex-direction: column;
						gap: calc(@page-padding * 2);
						.chat-item{
							display: flex;
							flex-direction: column;
							gap:  @page-padding;
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
					.delete-button{
						display: flex;
						height: 100%;
						flex: 1;
						flex-direction: row;
						justify-content: center;
						align-items: center;
						background-color: @warn-color;
						margin-left: @page-padding;
						.delete-button-text{
							color: @module-background-color;
							padding: 0 calc(@page-padding * 2);
						}
					}
					.doc-item{
						display: flex;
						flex-direction: column;
						padding-bottom: @page-padding;
						border-bottom: 1rpx solid @disable-text-color;
						padding-top: @page-padding;
						&:last-child{
							border-bottom: none;
						}
						&:first-child{
							padding-top:0;
						}
						.doc-name{
							flex: 1;
						}
						.doc-time{
							color: @sub-title-color;
						}
						
					}
				}
			}
			.side-mask{
				flex: 1;
				background-color: @black-background-color;
				opacity: 0.5;
			}
		}
	}
</style>
