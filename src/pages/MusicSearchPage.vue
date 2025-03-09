<template>
	<view class="page-wrapper" scroll-y show-scrollbar="false">
		<NavigatorTitleComponent title="我喜欢的歌曲"/>
		<view class="page-body">
			<view class="module-block module-block-row">
				<view class="search-input-wrapper">
					<input class="search-input" v-model="keyword" :placeholder="placeholder" />
					<image @click="useClear" v-if="keyword" class="icon-clear" :src="icon_clear" />
				</view>
				<text class="search-btn" @click="useSearch">搜索</text>
			</view>

			<template v-if="searching">
				<scroll-view v-if="!loading" scroll-y class="scroll-list" show-scrollbar="false" @scrolltolower="onScrolltolower">
					<view class="module-block module-block-last" >
						<view v-for="item in searchMusicList" :key="item.id" class="scroll-view-item">
							<MusicAvaterComponent type="music" class="song-cover" :name="item.songName" :avater="item.cover"/>
							<view class="name-wrapper">
								<text class="song-name">{{ item.songName }}</text>
								<text class="author-name">{{ item.authorName }}</text>
							</view>
							<image @click="usePlayMusic(item)" class="icon-play" :src=" store.isPlaying && store.musicItem.id === item.id ? playingIcon : pauseIcon" />
							<image class="icon-play" :src="item.isLike ? isLikeActiveIcon : isLikeIcon" />
							<image class="icon-play" :src="icon_music_menu" />
						</view>
					</view>
					<text class="footer">{{ total > pageNum * PAGE_SIZE ? '正在加载更多' : '已经到底了'}}</text>
				</scroll-view>
			</template>
			<template v-else>
				<view class="module-block" style="padding-right: 0;">
					<TitleComponent title="历史记录" />
					<view class="record-list">
						<template v-if="searchRecordList.length > 0">
							<text @click="useLabelSearch(item)" class="record-item" v-for="item,index in searchRecordList"
								:key="item+index">{{item}}</text>
						</template>
						<text class="no-data">暂无搜索记录</text>
					</view>
				</view>
			</template>
		</view>
		
	</view>
</template>

<script setup lang="ts">
	import { reactive, ref } from 'vue';
	import { useRoute } from "vue-router";
	import type { MusicType } from '../types';
	import { MUSIC_SEARCH_STORAGE_KEY, PAGE_SIZE } from '../common/constant';
	import NavigatorTitleComponent from '../components/NavigatorTitleComponent.vue';
	import TitleComponent from '../components/TitleComponent.vue';
	import { searchMusicService } from '../service';
	import { useStore } from "../stores/useStore";
	import pauseIcon from '../../static/icon_music_play.png';
	import playingIcon from '../../static/icon_music_playing_grey.png';
	import isLikeIcon from '../../static/icon_like.png';
	import isLikeActiveIcon from '../../static/icon_like_active.png';
	import MusicAvaterComponent from '../components/MusicAvaterComponent.vue';
	import icon_music_menu from '../../static/icon_music_menu.png';
	import icon_clear from '../../static/icon_clear.png';
	
	const store = useStore();
	const route = useRoute();

	const searchRecordList = reactive<Array<string>>([]);
	const placeholder : string = decodeURIComponent(route.query.keyword as string);

	const searchMusicList = reactive<Array<MusicType>>([]);
	const searching = ref<boolean>(false);
	const loading = ref<boolean>(false);
	const keyword = ref<string>("");
	const pageNum = ref<number>(1);
	const pageSize = ref<number>(20);
	const total = ref<number>(0);

	uni.getStorage({ key: MUSIC_SEARCH_STORAGE_KEY }).then(res => {
		if (res) {
			searchRecordList.push(...res.data.split(","))
		}
	})

	/**
	 * @description: 插入一首歌曲
	 * @date: 2024-01-30 22:24
	 * @author wuwenqiang
	 */
	const usePlayMusic = (musicModel:MusicType)=>{
		if(store.musicItem?.id === musicModel.id){
			store.setMusic(musicModel);
		}
		uni.navigateTo({url: `../pages/MusicPlayerPage`});
	}

	/**
	 * @description: 搜索
	 * @date: 2024-01-30 22:24
	 * @author wuwenqiang
	 */
	const useSearch = () => {
		if (!keyword.value) {
			keyword.value = placeholder;
		}
		if (loading.value) return;
		searching.value = loading.value = true;
		const index = searchRecordList.findIndex(item => item === keyword.value);
		if (index !== -1) {
			searchRecordList.splice(index, 1);
		}
		searchRecordList.unshift(keyword.value);
		uni.setStorage({ key: MUSIC_SEARCH_STORAGE_KEY, data: searchRecordList.join(",") })
		searchMusicService(keyword.value, pageNum.value, pageSize.value).then(res => {
			searchMusicList.splice(0, searchMusicList.length, ...res.data);
			total.value = res.total;
		}).finally(() => {
			loading.value = false
		})
	}

	/**
	 * @description: 清除搜索
	 * @date: 2024-07-08 23:08
	 * @author wuwenqiang
	 */
	const useClear = () => {
		if (loading.value) return;
		searching.value = false;
		keyword.value = '';
	}

	/**
	 * @description: 点击历史搜索记录进行搜索
	 * @date: 2024-01-30 22:24
	 * @author wuwenqiang
	 */
	const useLabelSearch = (item : string) => {
		keyword.value = item;
		useSearch();
	}

	const onScrolltolower = ()=>{
		if (loading.value) return;
		if (total.value > PAGE_SIZE * pageNum.value) {
			pageNum.value++;
			uni.showLoading();
			searchMusicService(keyword.value, pageNum.value, pageSize.value).then(res => {
				searchMusicList.push(...res.data);
			}).finally(() => {
				uni.hideLoading();
				loading.value = false;
			})
		}
	}
</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';

	.page-wrapper {
		height: 100%;
		display: flex;
		overflow: hidden;
		flex-direction: column;
		background-color: @page-background-color;
		box-sizing: border-box;
		.page-body{
			height: 0;
			flex: 1;
			padding: 0 @page-padding;
			display: flex;
			flex-direction: column;
			.module-block-row {
				.search-input-wrapper {
					flex: 1;
					background-color: @page-background-color;
					height: @input-height;
					border-radius: @input-height;
					padding-left: @page-padding;
					padding-right: @page-padding;
					display: flex;
					flex-direction: row;
					align-items: center;

					.search-input {
						flex: 1;
					}

					.icon-clear {
						width: @small-icon-size;
						height: @small-icon-size;
					}
				}

				.search-btn {
					display: inline-block;
					background-color: @line-color;
					height: @input-height;
					color: @module-background-color;
					display: flex;
					justify-content: center;
					align-items: center;
					width: 20%;
					margin-left: @page-padding;
					border-radius: @input-height;
				}
			}
			.module-block-last{
				margin-top: 0;
			}
			.record-list {
				display: flex;
				flex-wrap: wrap;

				.record-item {
					margin-top: @page-padding;
					margin-right: @page-padding;
					height: @input-height;
					background-color: @page-background-color;
					display: flex;
					justify-content: center;
					align-items: center;
					padding: 0 @btn-padding;
					border-radius: @input-height;
				}

				.no-data {
					display: flex;
					width: 100%;
					height: @big-avater;
					justify-content: center;
					align-items: center;
				}
			}

			.scroll-list {
				flex: 1;
				box-sizing: border-box;
				height: 0;
				margin-top: @page-padding;
				.footer {
					width: 100%;
					padding: @page-padding;
					text-align: center;
					display: inline-block;
				}
				.scroll-view-item {
					display: flex;
					margin-top: @page-padding;
					padding-bottom: @page-padding;
					border-bottom: 1rpx solid @search-input-color;
					align-items: center;

					&:first-child {
						margin-top: 0;
					}

					&:last-child {
						border-bottom: none;
					}

					.song-cover {
						margin-right: @page-padding;
					}

					.name-wrapper {
						display: flex;
						flex-direction: column;
						gap: @small-margin;
						flex: 1;
						width: 0;

						.song-name {
							text-overflow: ellipsis;
							white-space: nowrap;
							overflow: hidden;
						}

						.author-name {
							color: @sub-title-color;
						}
					}

					.icon-play {
						margin-left: @page-padding;
						width: @small-icon-size;
						height: @small-icon-size;
					}
				}
			}
		}
		
	}
</style>
