<template>
	<view class="page-wrapper">
		<view class="page-header">
			<image class="icon-back" @click="useBack" :src="icon_back"/>
			<text class="my-favorite">当前接入模型：deepseek-r1:7b</text>
			<image class="icon-middle icon-record" @click="onShowHistory" :src="icon_menu"/>
		</view>
		<view class="page-body">
			<scroll-view class="scroll-view" scroll-y :show-scrollbar="false">
				<view class="chat-list">
					<view class="chat-wrapper" :key="'chat'+index" v-for="item,index in chatList">
						<image :src="icon_ai" class="icon-middle" v-if="item.position === PositionEnum.LEFT"/>
						<view class="chat-text">
							<view class="icon-angle" :class="item.position === PositionEnum.LEFT ? 'icon-angle-left' : 'icon-angle-right'"></view>
							<template v-if="item.thinkContent && item.start !== false">
								<view class="think-text">
									<text>
										{{ item.thinkContent }}
									</text>
								</view>
							
								<!-- 正式回答黑色区块 -->
								<view class="response-box">
									<text>{{ item.responseContent }}</text>
								</view>
							</template>
							<text v-else>{{ item.text }}</text>
						</view>
						<AvaterComponent v-if="item.position === PositionEnum.RIGHT"/>
					</view>
				</view>
			</scroll-view>
		</view>
		<view class="input-wrapper">
			<input class="chat-input" placeholder="有问题，尽管问" v-model="inputValue">
			<view class="icon-wrapper">
				<image :src="icon_send" class="icon-middle icon_send" @click="onSend"></image>
			</view>
		</view>
		<view class="side-wrapper" v-show="showHistory">
			<view class="history-wrapper">
				<scroll-view class="history-scroll-view" scroll-y :show-scrollbar="false" @scrolltolower="onScrolltolower">
					<view class="history-list">
						<view class="chat-item" :key="key" v-for="(items, key) in chatHistoryData">
							<text class="chat-time">{{ key }}</text>
							<text class="chat-content" @click="onChat(item)" :key="key+item[0].chatId" v-for="item in items">{{ item[0].prompt }}</text>
						</view>
					</view>
				</scroll-view>
			</view>
			<view class="side-mask"></view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import {httpRequest, streamRequest,fetchApi} from '../utils/HttpUtils';
    import { reactive, ref,onMounted,onBeforeUnmount } from 'vue';
	import icon_back from '../../static/icon_back.png';
	import icon_send from '../../static/icon_send.png';
	import icon_menu from '../../static/icon_menu.png';
	import icon_ai from '../../static/icon_ai.png';
	import AvaterComponent from '../components/AvaterComponent.vue';
	import type { ChatHistoryType, ChatType, ChatStructure} from '../types';
    import { PositionEnum } from '../enum';
	import { formatTimeAgo, generateSecureID } from "../utils/util";
	import { HOST, PAGE_SIZE } from '../common/constant';
	import api from '@/api';
	import { getChatHistoryService }from "../service";
	import { useStore } from "../stores/useStore";

	// 响应式状态
	let socketTask: UniApp.SocketTask | null = null; // WebSocket 实例
	const chatHistoryData = reactive<ChatStructure>({});
	const pageNum = ref<number>(1);
	const showHistory = ref<boolean>(false);
	const total = ref<number>(0);
	let chatId:string = ""
	const inputValue = ref<string>("");
	const store = useStore();
	const chatList = reactive<Array<ChatType>>([
		{
			text:"你好，我是智能助手小吴同学，请问有什么可以帮助您？",
			position: PositionEnum.LEFT
		}
	]);

    /**
	 * @author: wuwenqiang
	 * @description: 注册
	 * @date: 2024-01-10 22:13
	 */
	const onSend = async() => {
		if(inputValue.value){
			chatList.push({
				text:inputValue.value,
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
			const payload = {
				token: store.token, // 替换为实际用户ID
				chatId, // 替换为实际聊天ID
				prompt: inputValue.value,
				files: [] // 如果需要上传文件，请根据实际情况调整
			};
			socketTask?.send({
				data: JSON.stringify(payload),
				success: () => {
					console.log('消息发送成功');
					inputValue.value = "";
				},
				fail: (err) => {
				console.error('消息发送失败:', err);
				}
			});
			
			// fetchApi(`${HOST}${api.chat}?chatId=${chatId}&prompt=${inputValue.value}`,item).then(()=>{
				
			// })
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
		getChatHistoryService(pageNum.value,PAGE_SIZE).then((res) => {
			total.value = res.total;
			const historyList:Array<Array<ChatHistoryType>> = []; 
			res.data.forEach((aItem)=>{
				aItem.timeAgo = formatTimeAgo(aItem.createTime);
				let items = historyList.find((bItem)=>{
					return bItem[0].chatId === aItem.chatId;
				});
				if(!items){
					items = [];
					historyList.push(items);
				}
				items?.push(aItem);
			})
			historyList.forEach((items)=>{
				const key = items[items.length - 1].timeAgo;
				if(!chatHistoryData[key])chatHistoryData[key] = [];
				chatHistoryData[key].push(items.reverse())
			});
		});
	}

	/**
	 * @description: 展示历史记录
	 * @date: 2024-05-18 12:29
	 * @author wuwenqiang
	 */
	const onShowHistory = ()=>{
		showHistory.value = true;
		useChatHistory();
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
			let thinkContent = "",responseContent="";
			const thinkMatch = item.content.match(/<think>([\s\S]*?)<\/think>/i)
			if (thinkMatch) {
				// 去除首尾空白及换行
				thinkContent = thinkMatch[1]
				.trim()
				.replace(/^\s+|\s+$/g, '')
			}

			// 提取正式回答内容
			responseContent =  item.content
				// 移除think标签及内容
				.replace(/<think>[\s\S]*?<\/think>/gi, '')
				// 清理多余空白
				.trim()
				// 去除首尾空格
				.replace(/^\s+|\s+$/g, '')
			chatList.push({
				text:"",
				position:PositionEnum.LEFT,
				thinkContent: thinkContent,
				responseContent:responseContent
			});
		})
	}	

	const connectWebSocket = () => {
      socketTask = uni.connectSocket({
        url: `${HOST.replace(/http[s]?/,'ws')}${api.chatWs}`,
        success: (res) => {
          console.log('WebSocket 连接成功:', res);
        },
        fail: (err) => {
          console.error('WebSocket 连接失败:', err);
        }
      });

      socketTask.onOpen(() => {
        console.log('WebSocket 连接已建立');
      });

      socketTask.onMessage(({data}) => {
		chatList[chatList.length - 1].start = true;
		// 匹配所有形式的 `<think>` 标签（包括属性和自闭合）
		const regex = /<\/?think\b[^>]*>/gi;
		if(regex.test(chatList[chatList.length - 1].thinkContent || "")){
			chatList[chatList.length - 1].responseContent += data;
		}else{
			chatList[chatList.length - 1].thinkContent += data;
		}
		
        // const data = JSON.parse(res.data);
        // if (data.content) {
        //   console.log(data.content)
        // }
      });

      socketTask.onError((err) => {
        console.error('WebSocket 错误:', err);
      });

      socketTask.onClose(() => {
        console.log('WebSocket 连接已关闭');
      });
    };

	// 在组件挂载时连接 WebSocket
    onMounted(() => {
      connectWebSocket();
    });

	// 在组件卸载前断开 WebSocket 连接
    onBeforeUnmount(() => {
      if (socketTask) {
        socketTask.close({
          success: () => {
            console.log('WebSocket 连接已关闭');
          }
        });
      }
    });
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

			.icon-back{
				width: @small-icon-size;
				height: @small-icon-size;
				opacity: 0.2;
			}
			.icon-record{
				opacity: 0.5;
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
						.chat-text{
							flex: 1;
							background-color: @module-background-color;
							padding: @page-padding;
							border-radius: @btn-border-radius;
							position: relative;
							.think-text{
								color:@sub-title-color;
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
				padding: @small-margin;
				background-color: @page-background-color;
			}
		}
		.side-wrapper{
			height: 100vh;
			width: 100vw;
			position: absolute;
			display: flex;
			.history-wrapper{
				width: 70%;
				background-color: @module-background-color;
				.history-scroll-view{
					height: 100vh;
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
