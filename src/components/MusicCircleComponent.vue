<template>
	<scroll-view class="page-wrapper" @refresherrefresh="useRefresh" refresher-enabled="true"	:refresher-triggered="triggered" @click="useHideMenu" scroll-y @scrolltolower="onScrolltolower"
		show-scrollbar="false">
		<view class="module-block module-block-row" :key="item.id" v-for="item,index in circleList">
			<image class="user-avater" v-if="item.useravater" :src="HOST + item.useravater" />
			<image class="user-avater" v-else :src="default_avater" />
			<view class="content-wrapper">
				<text class="user-name">{{item.username}}</text>
				<text class="content">{{item.content}}</text>
				<view class="music-wrapper" v-if="item.musicCover">
					<MusicAvaterComponent type="music" :name="item.musicSongName" :avater="item.musicCover"/>
					<view class="music-info">
						<text class="music-name">{{item.musicSongName}} - {{item.musicAuthorName}}</text>
					</view>
					<image class="icon-music-play" :src="icon_music_play" />
				</view>
				<view class="operate-wrapper">
					<text class="create-time">{{formatTime(item.createTime)}}</text>
					<view class="popup-wrapper">
						<image class="icon-menu" :src="icon_music_menu"
							@click.stop="useMenu(index)" />
						<view class="popup-menu" v-if="circleIndex === index">
							<view class="popup-menu-item" @click.stop="useLike(item)">
								<image class="icon-popup-menu" :src="icon_like_white" />
								<text>{{(item.circleLikes||[]).find((dItem)=>dItem.userId === store.userData.id) ? '取消赞' : '赞'}}</text>
							</view>
							<view class="popup-menu-item" @click="useComment(index)">
								<image class="icon-popup-menu" :src="icon_music_like_white" />
								<text>评论</text>
							</view>
						</view>
					</view>

				</view>
				<view class="social-wrapper" v-if="item.circleLikes?.length > 0 || item.circleComments?.length > 0">
					<view class="like-wrapper" v-if="item.circleLikes?.length > 0">
						<image class="icon-like" :src="icon_music_like" />
						<template v-for="aItem,aIndex in item.circleLikes" :key="aItem.id">
							<text class="like-user">{{aItem.username}}</text>
							<text v-if="aIndex !== item.circleLikes.length - 1">、</text>
						</template>
					</view>
					<CommentComponent :showNoDate="false" v-show="item.circleComments?.length > 0 || commenIndex === index" ref="commentRefs" :relationId="item.id" :category='CommentEnum.MUSIC_CIRCLE'
						:commentList="item.circleComments"></CommentComponent>
				</view>
			</view>
		</view>

		<text class="bottm" v-if="total">{{pageNum*pageSize >= total?"已经到底了":"正在加载更多"}}</text>
		<image @click="usePublishCircle" class="icon-add-circle" :src="icon_music_add" />
	</scroll-view>
</template>

<script setup lang="ts">
	import { CIRCLE_UPDATE_TIME, HOST } from "../common/constant";
	import { getCircleListByTypeService, saveLikeService, deleteLikeService } from "../service";
	import { reactive, ref,onMounted,onUnmounted } from "vue";
	import type { CircleType, LikeType } from '../types';
	import { formatTime } from '../utils/util';
	import { useStore } from '../stores/useStore';
	import CommentComponent from './CommentComponent.vue';
	import { CommentEnum,CircleEnum } from '../common/enum';
	import MusicAvaterComponent from '../components/MusicAvaterComponent.vue';
	import default_avater from "../../static/default_avater.png";
	import icon_music_play from "../../static/icon_music_play.png";
	import icon_music_menu from "../../static/icon_music_menu.png";
	import icon_like_white from "../../static/icon_like_white.png";
	import icon_music_like from "../../static/icon_music_like.png";
	import icon_music_like_white from '../../static/icon_music_like_white.png';
	import icon_music_add from "../../static/icon_music_add.png"
	import eventBus from '../utils/eventBus.js';

	const commenIndex = ref<number>(-1);
	const triggered = ref<boolean>(false);
	const circleIndex = ref<number>(-1);// 朋友圈动态的id
	const circleList = reactive<Array<CircleType>>([]);
	const pageNum = ref<number>(1);
	const commentRefs = ref<Array<InstanceType<typeof CommentComponent>>>([])
	const pageSize = 5;
	const total = ref<number>(0);
	const store = useStore();// 获取当前登录的用户账号

	let loading : boolean = false;

	/**
	 * @description: 下拉刷新
	 * @date: 2025-03-8 12:38
	 * @author wuwenqiang
	 */
	const useRefresh = ()=>{
		pageNum.value = 1;
		triggered.value = true
		useCircleListByType(true);
	}

	/**
	 * @description: 获取朋友圈动态数据
	 * @date: 2024-03-12 22:09
	 * @author wuwenqiang
	 */
	const useCircleListByType = (isRefresh:boolean=false)=>{
		if(isRefresh)uni.showLoading()
		return getCircleListByTypeService(CircleEnum.MUSIC, pageNum.value, pageSize).then((res) => {
			if(isRefresh)circleList.length = 0;
			circleList.push(...res.data);
			total.value = res.total;
			uni.setStorage({key:CIRCLE_UPDATE_TIME + store.userData.id,data:circleList[0].createTime});
		}).finally(()=>{
			triggered.value = false;
			if(isRefresh)uni.hideLoading();
		})
	}

	
	

	/**
	 * @description: 显示弹窗的气泡
	 * @date: 2024-03-12 22:09
	 * @author wuwenqiang
	 */
	const useMenu = (index : number) => {
		circleIndex.value = index;
	}

	/**
	 * @description: 点赞
	 * @date: 2024-03-12 22:09
	 * @author wuwenqiang
	 */
	const useLike = (circleItem : CircleType) => {
		if (loading) return;
		loading = true;
		const index : number = circleItem.circleLikes!.findIndex((dItem) => dItem.userId === store.userData.id);
		if (index !== -1) {// 取消点赞
			deleteLikeService(circleItem.id!, CommentEnum.MUSIC_CIRCLE).then((res) => {
				if (res.data > 0) {
					circleItem.circleLikes!.splice(index, 1)
				}
			}).finally(() => {
				loading = false;
				circleIndex.value = -1;
			})
		} else {// 新增点赞
			const likeItem : LikeType = {
				type: CommentEnum.MUSIC_CIRCLE,
				relationId: circleItem.id!
			}
			saveLikeService(likeItem).then((res) => {
				if (res.data) {
					circleItem.circleLikes!.push(res.data)
				}
			}).finally(() => {
				loading = false;
				circleIndex.value = -1
			});
		}

	}

	/**
	 * @description: 隐藏弹窗的气泡
	 * @date: 2024-03-12 22:09
	 * @author wuwenqiang
	 */
	const useHideMenu = () => {
		circleIndex.value = -1;
	}

	const onScrolltolower = () => {
		if (pageNum.value * pageSize >= total.value) return;
		pageNum.value++;
		getCircleListByTypeService(CircleEnum.MUSIC, pageNum.value, pageSize).then((res) => {
			circleList.push(...res.data);
		});
	}

	const usePublishCircle = () => {
		uni.navigateTo({
			url: `../pages/MusicSharePage`
		})
	}

	const useComment = (index:number) => {
		commenIndex.value = index;
		commentRefs.value[index].useShowInput()
	}

	useCircleListByType();

	onMounted(()=>{
		eventBus.on('update', useRefresh);
	})

	onUnmounted(()=>{
		eventBus.off('update', useRefresh);
	});

</script>

<style lang="less">
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';

	.page-wrapper {
		width: 100%;
		height: 100%;
		/deep/.uni-scroll-view-content {
			&::-webkit-scrollbar {
				display: none;
			}
		}

		.module-block {
			.user-avater {
				width: @middle-avater;
				height: @middle-avater;
				border-radius: 50%;
				margin-right: @page-padding;
			}

			.user-name {
				color: @blue-color;
				font-weight: bold;
			}

			.content-wrapper {
				display: flex;
				flex: 1;
				flex-direction: column;
				gap: @page-padding;

				.music-wrapper {
					display: flex;
					height: @middle-avater;
					background: @page-background-color;
					border-radius: @middle-avater;
					align-items: center;

					.music-cover {
						width: @middle-avater;
						height: @middle-avater;
						border-radius: 50%;
					}

					.music-info {
						display: flex;
						margin-left: @page-padding;
						flex: 1;

						.music-author {
							color: @disable-text-color;
						}
					}

					.icon-music-play {
						width: @small-icon-size;
						height: @small-icon-size;
						margin-right: @page-padding;
					}
				}

				.operate-wrapper {
					display: flex;
					align-items: center;

					.create-time {
						flex: 1;
						color: @disable-text-color;
					}

					.popup-wrapper {
						width: @small-icon-size;
						height: @small-icon-size;
						position: relative;

						.icon-menu {
							width: @small-icon-size;
							height: @small-icon-size;
						}

						.popup-menu {
							position: absolute;
							background: @sub-title-color;
							color: @white-background-color;
							width: @popup-menu-width;
							display: flex;
							left: @popup-menu-left;
							height: @popup-menu-height;
							top: @popup-menu-top;
							border-radius: @module-border-radius;

							.popup-menu-item {
								display: flex;
								flex: 1;
								justify-content: center;
								align-items: center;
								height: @popup-menu-height;

								.icon-popup-menu {
									margin-right: @small-margin;
									width: @small-icon-size;
									height: @small-icon-size;
								}
							}
						}
					}

				}

				.social-wrapper {
					background: @page-background-color;
					border-radius: @module-border-radius;
					padding-bottom:  @page-padding;
					.like-wrapper {
						display: flex;
						flex-wrap: wrap;
						padding: @page-padding @page-padding 0;
						.icon-like {
							width: @small-icon-size;
							height: @small-icon-size;
							margin-right: @page-padding;
						}

						.like-user {
							color: @blue-color;
						}
					}
				}

			}
		}

		.bottm {
			padding: @page-padding;
			display: inline-block;
			width: 100%;
			text-align: center;
		}

		.icon-add-circle {
			width: @middle-avater;
			height: @middle-avater;
			position: fixed;
			right: @page-padding;
			bottom: 15%;
			opacity: 0.2;
		}
	}
</style>
