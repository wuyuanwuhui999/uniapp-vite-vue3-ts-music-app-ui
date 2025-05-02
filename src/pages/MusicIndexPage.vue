<template>
	<view class="page-wrapper">
		<!-- 页面容器，装载四个页面，activeIndex为当前显示的容器的下标，默认activeIndex为0，加载首页 -->
		<!-- isInitComponent为初始化页面标志，用作页面懒加载 -->
		<view class="page-container">
			<MusicHomeComponent v-show="activeIndex===0" />
			<MusicRecommentComponent v-if="isInitComponent[1]" v-show="activeIndex===1"/>
			<MusicCircleComponent v-if="isInitComponent[2]" v-show="activeIndex===2" />
			<MusicMyComponent v-if="isInitComponent[3]" v-show="activeIndex===3"/>
		</view>
		<view class="tab-bar">
			<view class="tab-item" @click="useTab(0)">
				<image class="tab-icon" :src="activeIndex === 0 ? icon_home_active : icon_home" />
				<text class="tab-text" :class='{"tab-text-active" : activeIndex === 0}'>首页</text>
			</view>
			<view class="tab-item" @click="useTab(1)">
				<image class="tab-icon" :src="activeIndex === 1 ? icon_recomment_active : icon_recomment" />
				<text class="tab-text" :class='{"tab-text-active" : activeIndex === 1}'>推荐</text>
			</view>
			<view class="mini-player-empty" v-if="store.musicItem?.id"></view>
			<view class="mini-player-wrapper" v-if="store.musicItem?.id" @click="useNavigateTo"
				:style="{transform:'translateX(-50%) rotate(' + angle + 'deg)'}">
				<image class="music-img-cover" :src="getMusicCover(store.musicItem?.cover)" />
			</view>
			<view class="tab-item" @click="useTab(2)">
				<view class="red-circle" v-show="hasCircleMessage"></view>
				<image class="tab-icon" :src="activeIndex === 2 ? icon_music_circle_active : icon_music_circle" />
				<text class="tab-text" :class='{"tab-text-active" : activeIndex === 2}'>音乐圈</text>
			</view>
			<view class="tab-item" @click="useTab(3)" data-index="3">
				<image class="tab-icon" :src="activeIndex === 3 ? icon_user_active : icon_user" />
				<text class="tab-text" :class='{"tab-text-active" : activeIndex === 3}'>我的</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import MusicHomeComponent from '../components/MusicHomeComponent.vue';
	import MusicRecommentComponent from '../components/MusicRecommentComponent.vue';
	import MusicCircleComponent from '../components/MusicCircleComponent.vue';
	import MusicMyComponent from '../components/MusicMyComponent.vue';
	import { useStore } from "../stores/useStore";
	import { ref, onMounted, reactive, onActivated, onDeactivated, onUnmounted } from 'vue';
	import { MUSIC_STORAGE_KEY, MUSIC_LIST_STORAGE_KEY, LOOP_STORAGE_KEY,CIRCLE_UPDATE_TIME} from '../common/constant';
	import { LoopModeEnum } from '../common/enum';
	import type { MusicType } from '../types';
	import {getMusicCover} from '../utils/util';
	import icon_home_active from '../../static/icon_home_active.png';
	import icon_home from '../../static/icon_home.png';
	import icon_recomment_active from '../../static/icon_recomment_active.png';
	import icon_recomment from '../../static/icon_recomment.png';
	import icon_music_circle_active from '../../static/icon_music_circle_active.png';
	import icon_music_circle from '../../static/icon_music_circle.png';
	import icon_user_active from '../../static/icon_user_active.png';
	import icon_user from '../../static/icon_user.png';
	import api from "../api";
	import { HOST } from '../common/constant';
	import { getCircleByLastUpdateTimeService } from '../service';
	
	const hasCircleMessage = ref<boolean>(false);
	const angle = ref<number>(0);// 旋转的角度
	const store = useStore();
	// 当前显示页面的下标
	const activeIndex = ref<number>(0);
	// 初始化页面标志，默认首页已经初始化，其他页面未初始化不加载，点击初始化之后再加载
	const isInitComponent = reactive<Array<boolean>>([true, false, false, false])
	const useTab = (index : number) => {// 切换页面
		activeIndex.value = index;// 设置当前页面的下标
		isInitComponent[index] = true;// 初始化页面
	}

	/**
	 * @description: 头像旋转
	 * @date: 2024-05-10 22:10
	 * @author wuwenqiang
	 */
	const useRotate = () => {
		angle.value += 10
		angle.value = angle.value === 360 ? 0 : angle.value;
	}

	/**
	 * @description: 跳转播放器页面
	 * @date: 2024-05-10 22:10
	 * @author wuwenqiang
	 */
	const useNavigateTo = () => {
		uni.navigateTo({
			url: `../pages/MusicPlayerPage`
		})
	}

	onMounted(() => {
		store.audio.onTimeUpdate(useRotate);
		uni.getStorage({
			key: MUSIC_STORAGE_KEY,
			success: (res) => {
				if (res.data !== '' && res.data !== null) {
					const musicItem:MusicType = JSON.parse(res.data) as MusicType;
					store.setMusic(musicItem, false);
				}
			},
		});

		uni.getStorage({
			key: MUSIC_LIST_STORAGE_KEY,
			success: (res) => {
				if (res.data !== '' && res.data !== null) {
					const musicList: Array<MusicType> = JSON.parse(res.data) as Array<MusicType>;
					store.setMusicList(musicList);
				}
			},
		});

		uni.getStorage({
			key: LOOP_STORAGE_KEY,
			success: (res) => {
				if (res.data !== '' && res.data !== null) {
					store.setLoop(res.data as LoopModeEnum)
				}
			},
		});
	});

	const useWebsocket = ()=>{
		// 在页面或全局创建连接
		const socketTask = uni.connectSocket({
			url: `${HOST.replace(/http/,'ws')}${api.circleWebsocket}`, // WebSocket 服务器地址（必须是 wss 或 ws 协议）
			success: () => {
				console.log('WebSocket 连接创建成功');
			},
			fail: (err) => {
				console.error('连接失败:', err);
			}
		});
		socketTask.onOpen(() => {
			console.log('WebSocket 已连接');
		});
		socketTask.onMessage((res) => {
			hasCircleMessage.value = true;
			console.log('收到消息：', res.data); // res.data 是服务器返回的数据
		});
	}

	uni.getStorage({key:CIRCLE_UPDATE_TIME + store.userData.id}).then((res)=>{
		if(!res.data){
			hasCircleMessage.value = true;
		}else{
			getCircleByLastUpdateTimeService(res.data).then((result)=>{
				hasCircleMessage.value = result.data > 0;
			})
		}
	})

	onActivated(() => store.audio.onTimeUpdate(useRotate));// 从缓存中激活

	/**
	 * @description: 移除监听事件
	 * @date: 2024-05-10 22:10
	 * @author wuwenqiang
	 */
	onDeactivated(() => store.audio.offTimeUpdate(useRotate));// 进入缓存

	onUnmounted(() => store.audio.offTimeUpdate(useRotate));// 销毁

	useWebsocket();
</script>

<style lang="less">
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';

	.page-wrapper {
		position: relative;
		.page-container {
			flex: 1;
			height: 0;
			padding: 0 @page-padding;
			box-sizing: border-box;
			overflow: auto;

			&::-webkit-scrollbar {
				display: none;
			}
		}

		.tab-bar {
			z-index: 1;
			position: relative;
			display: flex;
			background-color: @module-background-color;
			border-top: @tab-border-buttom;
			padding: @middle-margin 0;
			position: relative;

			.mini-player-empty {
				width: @mini-music-player-size;
			}

			.mini-player-wrapper {
				position: absolute;
				left: 50%;
				top: -50%;
				transform: translateX(-50%);
				width: @mini-music-player-size;
				height: @mini-music-player-size;
				border-radius: 50%;
				overflow: hidden;
				border: @mini-player-border-size solid @page-background-color;
				background-color: @white-background-color;
				display: flex;
				justify-content: center;
				align-items: center;

				.music-img-default {
					width: @big-icon-size;
					height: @big-icon-size;
				}

				.music-img-cover {
					width: 100%;
					height: 100%;
				}
			}

			.tab-item {
				flex: 1;
				align-items: center;
				justify-content: center;
				display: flex;
				flex-direction: column;
				position: relative;
				.red-circle{
					position: absolute;
					width: @red-circle;
					height: @red-circle;
					background-color: @warn-color;
					border-radius: 50%;
					right: calc(@page-padding *2);
					top: 0;
					z-index: 1;
				}
				.tab-icon {
					width: @middle-icon-size;
					height: @middle-icon-size;
					margin-bottom: @small-margin;
				}

				.tab-text {
					color: #000;
					font-size: @font-size-normal;

					&.tab-text-active {
						color: @tab-color-active;
					}
				}
			}
		}
	}
</style>