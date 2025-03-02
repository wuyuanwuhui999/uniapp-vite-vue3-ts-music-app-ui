<template>
	<scroll-view class="page-wrapper" scroll-y show-scrollbar="false" enablePullDownRefresh  @pullDownRefresh="init"
	>
		<view class="module-block module-block-row user-wrapper">
			<AvaterComponent size="middle"/>
			<view class="use-info">
				<text class="username">{{store.userData.username}}</text>
				<text class="sign">{{store.userData.sign}}</text>
			</view>
			<image class="icon-middle" @click="useUserEdit" src="../../static/icon_edit.png"/>
		</view>

		<view class="module-block">
			<MusicTitleComponent @on-fold="useFoldMusicMenu" :is-fold="isFoldMusicMenu" :classifyItem="{classifyName:'我的歌单',category:''}">
				<text class="icon-add" @click="useAddDirectory">+</text>
			</MusicTitleComponent>
			<view v-show="!isFoldMusicMenu">
				<view v-if="musicPlayMenu.length !== 0" v-for="item in musicPlayMenu" class="singer-list" :key="item.id" @click="useRouter(item)">
					<image v-if="item.cover" class="music-cover" :src="getMusicCover(item.cover)"  />
					<text class="music-cover" v-else>{{item.name.slice(0,1)}}</text>
					<view class="songname-wrapper">
						<text>{{item.name}}</text>
						<text class="total">{{item.total}}首</text>
					</view>
					<image class="icon-operate" src="../../static/icon_music_play.png"/>
					<image class="icon-operate" src="../../static/icon_delete.png"/>
					<image class="icon-operate" src="../../static/icon_music_menu.png"/>
				</view>
				<MusicNoData text="暂无数据，点击刷新" @click="useFavoriteDirectory(true)" v-else/>
			</view>
		</view>

		<view class="module-block">
			<MusicTitleComponent @on-fold="useFoldSingList" :is-fold="isFoldSingerList" :classifyItem="{classifyName:'我关注的歌手',category:''}" :showMore="mySingerList.length > 5">
				<image src="../../static/icon_refresh.png" @click="useMyLikeMusicAuthor(true)" class="icon-small"/>
			</MusicTitleComponent>
			<view v-show="!isFoldSingerList">
				<view v-if="mySingerList.length !== 0" v-for="item in mySingerList" class="singer-list" :key="item.id">
					<MusicAvaterComponent type="author" :name="item.authorName" :avater="item.avatar"/>
					<view class="songname-wrapper">
						<text>{{item.authorName}}</text>
						<text class="total">{{item.total}}首</text>
					</view>
					<image class="icon-operate" src="../../static/icon_music_play.png"/>
					<image class="icon-operate" src="../../static/icon_delete.png"/>
					<image class="icon-operate" src="../../static/icon_music_menu.png"/>
				</view>
				<MusicNoData text="暂无数据，点击刷新" @click="useMyLikeMusicAuthor(true)" v-else/>
			</view>
		</view>

		<view class="module-block module-block-last">
			<MusicTitleComponent @on-fold="useFoldPlayRecord" :is-fold="isFoldPlayRecord" :classifyItem="{classifyName:'我听过的歌曲',category:''}" :showMore="recordMusicList.length > 5">
				<image src="../../static/icon_refresh.png" @click="useMusicRecord(true)" class="icon-small"/>
			</MusicTitleComponent>
			<view v-show="!isFoldPlayRecord">
				<view v-if="recordMusicList.length !== 0" v-for="item in recordMusicList" class="singer-list" :key="item.id">
					<MusicAvaterComponent type="music" :name="item.songName" :avater="item.cover"/>
					<view class="songname-wrapper">
						<text>{{item.songName}}</text>
						<text class="total">{{formatTime(item.createTime)}}</text>
					</view>
					<image class="icon-operate" src="../../static/icon_music_play.png"/>
					<image class="icon-operate" src="../../static/icon_delete.png"/>
					<image class="icon-operate" src="../../static/icon_music_menu.png"/>
				</view>
				<MusicNoData @click="useMusicRecord(true)" text="暂无数据，点击刷新" v-else/>
			</view>
		</view>
		<DialogComponent @onClose="showFavoriteDialog = false" v-if="showFavoriteDialog">
			<template #header>
				<view class="dialog-header"><text class="comment-header">收藏夹</text></view>
			</template>
			<template #content>
				<view class="favorite-wrapper">
					<CreateFavoriteDirectoryComponent @on-cancle="showFavoriteDialog = false" @on-sure="useCreateFavorite"/>
				</view>
			</template>
		</DialogComponent>
	</scroll-view>
</template>

<script setup lang="ts">
	import type { FavoriteDirectoryType,MusicAuthorType,MusicType} from "../types";
	import AvaterComponent from "../components/AvaterComponent.vue";
	import { useStore } from "../stores/useStore";
	import MusicTitleComponent from "./MusicTitleComponent.vue";
	import {getMyLikeMusicAuthorService,getMusicRecordService,getFavoriteDirectoryService} from "../service";
	import { reactive, ref} from 'vue';
	import {formatTime,getMusicCover} from '../utils/util';
	import MusicAvaterComponent from './MusicAvaterComponent.vue';
	import MusicNoData from './MusicNoData.vue';
	import DialogComponent from '../components/DialogComponent.vue';
	import CreateFavoriteDirectoryComponent from '../components/CreateFavoriteDirectoryComponent.vue';

	const store = useStore();
	const musicPlayMenu = reactive<Array<FavoriteDirectoryType>>([]);
	const mySingerList = reactive<Array<MusicAuthorType>>([]);
	const recordMusicList = reactive<Array<MusicType>>([]);
	const showFavoriteDialog = ref<boolean>(false);// 显示音乐收藏弹窗
	const isFoldMusicMenu = ref<boolean>(false);// 是否展开歌单
	const isFoldSingerList = ref<boolean>(false);// 是否展开我关注的歌手
	const isFoldPlayRecord = ref<boolean>(false);// 是否展开我的播放记录
	/**
	 * @description: 获取用户歌单
	 * @date: 2024-03-16 23:25
	 * @author wuwenqiang
	 */
	const useFavoriteDirectory = (showLoading:boolean = false)=>{
		if(showLoading)uni.showLoading();
		musicPlayMenu.length = 0;
		 getFavoriteDirectoryService(0).then((res)=>{
			musicPlayMenu.push(...res.data);
		}).finally(()=>{
			if(showLoading)uni.hideLoading()
		});;
	}

	/**
	 * @description: 获取我关注的歌手
	 * @date: 2024-03-17 22:12
	 * @author wuwenqiang
	 */
	const useMyLikeMusicAuthor = (showLoading:boolean = false)=>{
		if(showLoading)uni.showLoading()
		mySingerList.length = 0;
		getMyLikeMusicAuthorService(1,5).then((res)=>{
			mySingerList.push(...res.data);
		}).finally(()=>{
			if(showLoading)uni.hideLoading()
		});
	}

	/**
	 * @description: 获取播放记录
	 * @date: 2024-03-17 22:12
	 * @author wuwenqiang
	 */
	const useMusicRecord = (showLoading:boolean = false)=>{
		if(showLoading)uni.showLoading();
		recordMusicList.length = 0
		getMusicRecordService(1,5).then((res)=>{
			recordMusicList.push(...res.data);
		}).finally(()=>{
			if(showLoading)uni.hideLoading()
		});
	}

	const init = ()=>{
		useFavoriteDirectory();
		useMyLikeMusicAuthor();
		useMusicRecord();
	}

	/**
	 * @description: 跳转到收藏夹列表
	 * @date: 2024-03-17 22:12
	 * @author wuwenqiang
	 */
	const useRouter = (item:FavoriteDirectoryType) => {
		uni.navigateTo({url: `../pages/MusicFavoriteListPage?data=${encodeURIComponent(JSON.stringify(item))}`});
	}

	/**
	 * @description: 跳转到用户编辑页面
	 * @date: 2025-01-19 12:15
	 * @author wuwenqiang
	 */
	const useUserEdit = ()=>{
		uni.navigateTo({url: `../pages/UserPage`});
	}

	const useAddDirectory = ()=>{
		showFavoriteDialog.value = true
	}

	/**
	 * @description: 创建收藏夹
	 * @date: 2025-03-02 19:38
	 * @author wuwenqiang
	 */
	const useCreateFavorite = (favoriteDirectory:FavoriteDirectoryType) => {
		musicPlayMenu.unshift(favoriteDirectory);
	}

	/**
	 * @description: 折叠模块
	 * @date: 2025-03-02 19:57
	 * @author wuwenqiang
	 */
	 const useFoldMusicMenu = (isFold:boolean)=>{
		isFoldMusicMenu.value = isFold;
	}

	/**
	 * @description: 折叠模块
	 * @date: 2025-03-02 19:57
	 * @author wuwenqiang
	 */
	 const useFoldSingList = (isFold:boolean)=>{
		isFoldSingerList.value = isFold;
		console.log(isFoldSingerList.value)
	}

	/**
	 * @description: 折叠模块
	 * @date: 2025-03-02 19:57
	 * @author wuwenqiang
	 */
	const useFoldPlayRecord = (isFold:boolean)=>{
		isFoldPlayRecord.value = isFold;
	}

	init();

</script>

<style lang="less">
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
	.page-wrapper {
		width: 100%;
		height: 100%;
		/deep/.uni-scroll-view{
			height: auto;
		}
		/deep/.uni-scroll-view-content {
			height: auto;
			&::-webkit-scrollbar {
				display: none;
			}
		}
		.user-wrapper{
			align-items: center;
			.use-info{
				margin-left: @page-padding;
				display: flex;
				flex-direction: column;
				flex: 1;
				.username{
					font-weight: bold;
				}
				.sign{
					color: @disable-text-color;
				}
			}
		}
		
		.icon-add{
			font-size: @middle-icon-size;
			color: @disable-text-color;
			line-height: calc(@middle-icon-size / 1.5);
		}
		.singer-list{
			display: flex;
			margin-top: @page-padding;
			align-items: center;
			gap:@page-padding;
			.music-cover{
				background-color: @page-background-color;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-left: 0;
			}
			.songname-wrapper{
				display: flex;
				flex-direction: column;
				flex: 1;
				.total{
					color: @disable-text-color;
				}
			}
			.icon-operate{
				width: @small-icon-size;
				height: @small-icon-size;
			}
		}
		.dialog-header{
			display: flex;
			width: 100%;
			justify-content: center;
		}
		.favorite-wrapper{
			padding: @page-padding;
		}
		.icon-small{
			opacity: 0.2;
		}
	}
</style>
