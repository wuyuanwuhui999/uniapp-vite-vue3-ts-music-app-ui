<template>
	<view class="page-wrapper">
		<view class="page-header">
			<image class="icon-back" @click="useBack" :src="icon_back"/>
			<text class="my-favorite">当前接入模型：deepseek-r1:7b</text>
			<image class="icon-middle icon-record" :src="icon_menu"/>
		</view>
		<view class="page-body">
			<scroll-view class="scroll-view" scroll-y :show-scrollbar="false">
				<view class="chat-list">
					<view class="chat-wrapper" :key="'chat'+index" v-for="item,index in chatList">
						<image :src="icon_ai" class="icon-middle" v-if="item.position === PositionEnum.LEFT"/>
						<view class="chat-text">
							<view class="icon-angle" :class="item.position === PositionEnum.LEFT ? 'icon-angle-left' : 'icon-angle-right'"></view>
							<template v-if="item.thinkContent">
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
				<image :src="icon_send" class="icon-middle icon_send" @click="useSend"></image>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import {streamRequest} from '../utils/HttpUtils';
    import { reactive, ref } from 'vue';
	import icon_back from '../../static/icon_back.png';
	import icon_send from '../../static/icon_send.png';
	import icon_menu from '../../static/icon_menu.png';
	import icon_ai from '../../static/icon_ai.png';
	import AvaterComponent from '../components/AvaterComponent.vue';
	import type { ChatType } from '../types';
    import { PositionEnum } from '@/enum';
	import { generateSecureID } from "../utils/util";
	import { HOST } from '@/common/constant';
	import api from '@/api';
	let chatId:string = ""
	const inputValue = ref<string>("");
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
	const useSend = async() => {
		if(inputValue.value){
			chatList.push({
				text:inputValue.value,
				position:PositionEnum.RIGHT
			});
			if(!chatId)chatId = generateSecureID()
			streamRequest(`${HOST}${api.chat}?chatId=${chatId}&prompt=${inputValue.value}`).then((res)=>{
				let thinkContent = "",responseContent="";
				  // 使用正则表达式提取think内容
				  const thinkMatch = res.match(/<think>([\s\S]*?)<\/think>/i)
					if (thinkMatch) {
						// 去除首尾空白及换行
						thinkContent = thinkMatch[1]
						.trim()
						.replace(/^\s+|\s+$/g, '')
					}

					// 提取正式回答内容
					responseContent = res
						// 移除think标签及内容
						.replace(/<think>[\s\S]*?<\/think>/gi, '')
						// 清理多余空白
						.trim()
						// 去除首尾空格
						.replace(/^\s+|\s+$/g, '')
					
				chatList.push({
					thinkContent,
					responseContent,
					text:res,
					position:PositionEnum.LEFT
				});
			})
			inputValue.value = "";
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
</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
	.page-wrapper{
		height: 100vh;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: @page-background-color;
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
	}
</style>
