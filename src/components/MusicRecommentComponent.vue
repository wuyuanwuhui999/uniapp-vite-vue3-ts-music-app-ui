<template>
	<scroll-view class="page-wrapper" :lower-threshold="50" @refresherrefresh="useRefresh" refresher-enabled="true"	:refresher-triggered="triggered" @scrolltolower="onScrolltolower" scroll-y show-scrollbar="false">
		<view class="music-list">
			<view class="music-item module-block" :key="item.id" v-for="item,index in musicList">
				<image v-if="index === 0" :src="icon_no1" class="music-rank" />
				<image v-if="index === 1" :src="icon_no2" class="music-rank" />
				<image v-if="index === 2" :src="icon_no3" class="music-rank" />
				<text v-if="index > 2" class="music-rank">{{index + 1}}</text>
				<MusicAvaterComponent type="music" :name="item.songName" :avater="item.cover"/>
				<view class="music-info">
					<text>{{item.songName}}</text>
					<text class="music-author">{{item.authorName}}</text>
				</view>
				<image class="icon-operatation" @click="usePlayMusicList(item)" :src="store.isPlaying && store.musicItem?.id === item.id ? pauseIcon : playingIcon" />
				<image class="icon-operatation" @click="useLike(item)" :src="item.isLike ? icon_like_active : icon_like" />
				<image class="icon-operatation" :src="icon_music_menu" />
			</view>

			<view class="bottom"><text>{{total > pageSize * pageNum  ? "正在加载更多..." :"已经到底了" }}</text></view>
		</view>
	</scroll-view>
</template>

<script setup lang="ts">
	import { getMusicListByClassifyIdService, deleteMusicLikeService, insertMusicLikeService} from '../service';
	import { ref, reactive } from 'vue';
	import type { MusicType } from '../types';
	import { useStore } from "../stores/useStore";
	import {MAX_FAVORITE_NUMBER} from '../common/constant';
	import playingIcon from '../../static/icon_music_play.png';
	import pauseIcon from '../../static/icon_music_playing_grey.png';
	import MusicAvaterComponent from './MusicAvaterComponent.vue';
	import icon_no1 from "../../static/icon_no1.png";
	import icon_no2 from "../../static/icon_no1.png";
	import icon_no3 from "../../static/icon_no1.png";
	import icon_like_active from "../../static/icon_like_active.png";
	import icon_like from "../../static/icon_like.png";
	import icon_music_menu from "../../static/icon_music_menu.png";

	const triggered = ref<boolean>(false);
	const store = useStore()
	const pageSize = ref<number>(20);
	let loadding : boolean = false;

	const pageNum = ref<number>(1);
	const total = ref<number>(0);
	const musicList = reactive<Array<MusicType>>([]);
	let loading:boolean = false

	/**
	 * @description: 下拉刷新
	 * @date: 2025-03-08 12:31
	 * @author wuwenqiang
	 */
	const useRefresh = ()=>{
		pageNum.value = 1;
		triggered.value = true
		useMusicList(true)
	}

	/**
	 * @description: 获取推荐列表，1为列表的id
	 * @date: 2024-03-03 18:23
	 * @author wuwenqiang
	 */
	const useMusicList = (isRefresh:boolean = false) => {
		loadding = true;
		uni.showLoading();
		return getMusicListByClassifyIdService(1, pageNum.value, pageSize.value).then((res) => {
			if (total.value === 0) total.value = res.total;
			if(isRefresh) musicList.length = 0
			musicList.push(...res.data);
		}).finally(() => {
			triggered.value = false;
			uni.hideLoading();
			loadding = false;
		});
	}

	/**
	 * @description: 滚动到底部出发
	 * @date: 2024-03-03 18:23
	 * @author wuwenqiang
	 */
	const onScrolltolower = () => {
		console.log(111)
		if (loadding) return;
		if (total.value > pageSize .value * pageNum.value) {
			pageNum.value++;
			useMusicList();
		}
	}

	const usePlayMusicList =async (musicModel:MusicType) => {
		if(store.musicItem?.id !== musicModel.id){
			store.setMusic(musicModel);
			if(store.classifyName !== "推荐歌曲"){
				await getMusicListByClassifyIdService(1, 1, MAX_FAVORITE_NUMBER).then((res) => store.setMusicList(res.data));
			}
		}
		uni.navigateTo({url: `../pages/MusicPlayerPage`});
	}

	/**
	 * @description: 添加或者取消点赞
	 * @date: 2024-05-12 11:45
	 * @author wuwenqiang
	 */
	 const useLike = (musicItem:MusicType) => {
		if (loading) return;
		loading = true;
		if (musicItem.isLike) {
			deleteMusicLikeService(musicItem.id).then((res) => {
				if (res.data > 0) {
					musicItem.isLike = 0;
					uni.showToast({
						duration: 2000,
						position: 'center',
						title: '取消点赞成功'
					})
				}

			}).finally(() => loading = false)
		} else {
			insertMusicLikeService(musicItem.id).then(res => {
				if (res.data > 0) {
					musicItem.isLike = 1;
					uni.showToast({
						duration: 2000,
						position: 'center',
						title: '点赞成功'
					})
				}
			}).finally(() => loading = false)
		}
	}

	useMusicList()
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
		.music-list {
			margin-bottom: @page-padding;

			.music-item {
				display: flex;
				align-items: center;
				margin-top: @page-padding;
				gap: @page-padding;
				.music-rank {
					width: @small-icon-size;
					height: @small-icon-size;
					align-items: center;
					justify-content: center;
					display: flex;
				}

				.music-info {
					display: flex;
					flex-direction: column;
					margin-left: @page-padding;
					flex: 1;

					.music-author {
						color: @disable-text-color;
						padding-top: @small-margin;
					}
				}

				.icon-operatation {
					width: @small-icon-size;
					height: @small-icon-size;
					margin-left: @page-padding;
					;
				}
			}
		}

		.bottom {
			display: flex;
			justify-content: center;
			margin: @page-padding 0;
		}
	}
</style>
