<template>
	<scroll-view class="page-wrapper" scroll-y show-scrollbar="false" enablePullDownRefresh  @pullDownRefresh="init"
	>
		<view class="module-block module-block-row user-wrapper">
			<AvaterComponent size="middle"/>
			<view class="use-info">
				<text class="username">{{store.userData.username}}</text>
				<text class="sign">{{store.userData.sign}}</text>
			</view>
			<image class="icon-middle" @click="useUserEdit" :src="icon_edit"/>
		</view>

		<view class="module-block">
			<MusicTitleComponent @on-fold="useFoldMusicMenu" :is-fold="isFoldMusicMenu" :classifyItem="{classifyName:'我的收藏夹',category:''}">
				<view class="operate-wrappper">
					<text class="icon-add" @click="useAddDirectory">+</text>
					<image :src="icon_refresh" @click="useFavoriteDirectory(true)" class="icon-small"/>
					<text class="more" v-if="favoriteDirectoryList.length > 5">更多</text>
				</view>
				
			</MusicTitleComponent>
			<view v-show="!isFoldMusicMenu">
				<uni-swipe-action v-if="favoriteDirectoryList.length !== 0">
					<template v-for="item,index in favoriteDirectoryList" :key="item.id">
						<uni-swipe-action-item>
							<view  class="singer-list" @click="useRouter(item)">
								<image v-if="item.cover" class="music-cover" :src="getMusicCover(item.cover)"  />
								<text class="music-cover" v-else>{{item.name.slice(0,1)}}</text>
								<view class="songname-wrapper">
									<text>{{item.name}}</text>
									<text class="total">{{item.total}}首</text>
								</view>
								<image v-if="item.total" class="icon-operate" :src="icon_music_play"/>
								<image class="icon-operate" :src="icon_music_menu"/>
							</view>
							<template v-slot:right>
								<view class="delete-button" @click="useDeleteFavoriteDirectory(index)"><text class="delete-button-text">删除</text></view>
							</template>
						</uni-swipe-action-item>
						<view class="line" v-if="index < favoriteDirectoryList.length -1"></view>
					</template>
				</uni-swipe-action>

				<MusicNoData text="暂无数据，点击刷新" @click="useFavoriteDirectory(true)" v-else/>
			</view>
		</view>

		<view class="module-block">
			<MusicTitleComponent @on-fold="useFoldFavoriteMusic" :is-fold="isFoldFavoriteMusic" :classifyItem="{classifyName:'我喜欢的歌曲',category:''}">
				<view class="operate-wrappper">
					<image :src="icon_refresh" @click="useFavoriteMusicList(true)" class="icon-small"/>
					<text class="more" v-if="totalFavoriteMusic > 5">更多</text>
				</view>
			</MusicTitleComponent>
			<view v-show="!isFoldFavoriteMusic">
				<uni-swipe-action v-if="favoriteMusicList.length !== 0">
					<template v-for="item,index in favoriteMusicList" :key="item.id">
						<uni-swipe-action-item >
							<view class="singer-list">
								<MusicAvaterComponent type="author" :name="item.songName" :avater="item.cover"/>
								<view class="songname-wrapper">
									<text>{{item.authorName}} - {{item.songName}}</text>
								</view>
								<image class="icon-operate" :src="icon_music_play"/>
								<image class="icon-operate" :src="icon_music_menu"/>
							</view>
							
							<template v-slot:right>
								<view class="delete-button" @click="useDeleteFavoriteMusic(index)"><text class="delete-button-text">删除</text></view>
							</template>
						</uni-swipe-action-item>
						<view class="line" v-if="index < favoriteMusicList.length -1"></view>
					</template>
				</uni-swipe-action>
				<MusicNoData text="暂无数据，点击刷新" @click="useFavoriteMusicList(true)" v-else/>
			</view>
		</view>

		<view class="module-block">
			<MusicTitleComponent @on-fold="useFoldSingList" :is-fold="isFoldSingerList" :classifyItem="{classifyName:'我关注的歌手',category:''}">
				<view class="operate-wrappper">
					<image :src="icon_refresh" @click="useMyLikeMusicAuthor(true)" class="icon-small"/>
					<text class="more" v-if="totalFavoriteAuthor > 5">更多</text>
				</view>
			</MusicTitleComponent>
			<view v-show="!isFoldSingerList">
				<uni-swipe-action v-if="favoriteAuthorList.length !== 0">
					<template v-for="item,index in favoriteAuthorList" :key="item.id">
						<uni-swipe-action-item >
							<view class="singer-list">
								<MusicAvaterComponent type="author" :name="item.authorName" :avater="item.avatar"/>
								<view class="songname-wrapper">
									<text>{{item.authorName}}</text>
									<text class="total">{{item.total}}首</text>
								</view>
								<image class="icon-operate" :src="icon_music_play"/>
								<image class="icon-operate" :src="icon_music_menu"/>
							</view>
							
							<template v-slot:right>
								<view class="delete-button" @click="useDeleteAuthor(index)"><text class="delete-button-text">删除</text></view>
							</template>
						</uni-swipe-action-item>
						<view class="line" v-if="index < favoriteAuthorList.length -1"></view>
					</template>
				</uni-swipe-action>
				<MusicNoData text="暂无数据，点击刷新" @click="useMyLikeMusicAuthor(true)" v-else/>
			</view>
		</view>

		<view class="module-block module-block-last">
			<MusicTitleComponent @on-fold="useFoldPlayRecord" :is-fold="isFoldPlayRecord" :classifyItem="{classifyName:'我听过的歌曲',category:''}">
				<view class="operate-wrappper">
					<image :src="icon_refresh" @click="useMusicRecord(true)" class="icon-small"/>
					<text class="more" v-if="totalRecord > 5">更多</text>
				</view>
			</MusicTitleComponent>
			<view v-show="!isFoldPlayRecord">
				<template v-if="recordMusicList.length !== 0" v-for="item,index in recordMusicList" :key="item.id">
					<view class="singer-list">
						<MusicAvaterComponent type="music" :name="item.songName" :avater="item.cover"/>
						<view class="songname-wrapper">
							<text>{{item.songName}}</text>
							<text class="total">{{formatTime(item.createTime)}}</text>
						</view>
						<image class="icon-operate" :src="icon_music_play"/>
						<image class="icon-operate" :src="icon_music_menu"/>
					</view>
					<view class="line" v-if="index < recordMusicList.length -1"></view>
				</template>
				<MusicNoData @click="useMusicRecord(true)" text="暂无数据，点击刷新" v-else/>
			</view>
		</view>
		<DialogComponent @onClose="showFavoriteDialog = false" v-if="showFavoriteDialog">
			<template #header>
				<view class="dialog-header"><text class="comment-header">收藏夹</text></view>
			</template>
			<template #content>
				<view class="favorite-wrapper">
					<CreateFavoriteDirectoryComponent @on-cancle="showFavoriteDialog = false" @on-sure="useInsertFavoriteDirectory"/>
				</view>
			</template>
		</DialogComponent>
		<uni-popup ref="popup" class="popup-wrapper"  type="dialog">
			<view class="dialog-wrapper">
				<view class="dialog-box">
					<view class="dialog-header"><text>提示</text></view>
					<view class="dialog-content">
						<text class="field-text">{{ dialogText }}</text>
					</view>
					<view class="dialog-btn">
						<text class="btn-cancle" @click="useCloseDialog">取消</text>
						<text class="btn-sure" @click="useSureDelete">确定</text>
					</view>
				</view>
			</view>
		</uni-popup>
	</scroll-view>
</template>

<script setup lang="ts">
	import type { FavoriteDirectoryType,MusicAuthorType,MusicType} from "../types";
	import AvaterComponent from "../components/AvaterComponent.vue";
	import { useStore } from "../stores/useStore";
	import MusicTitleComponent from "./MusicTitleComponent.vue";
	import { getFavoriteAuthorService, getMusicRecordService, getFavoriteDirectoryService, deleteFavoriteDirectoryService, deleteFavoriteAuthorService, getMusicLikeService, deleteMusicLikeService} from "../service";
	import { reactive, ref} from 'vue';
	import {formatTime,getMusicCover} from '../utils/util';
	import MusicAvaterComponent from './MusicAvaterComponent.vue';
	import MusicNoData from './MusicNoData.vue';
	import DialogComponent from '../components/DialogComponent.vue';
	import CreateFavoriteDirectoryComponent from '../components/CreateFavoriteDirectoryComponent.vue';
	import uniSwipeAction from '@dcloudio/uni-ui/lib/uni-swipe-action/uni-swipe-action.vue';
	import uniSwipeActionItem from '@dcloudio/uni-ui/lib/uni-swipe-action-item/uni-swipe-action-item.vue';
	import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';
	import icon_edit from "../../static/icon_edit.png";
	import icon_refresh from '../../static/icon_refresh.png';
	import icon_music_play from '../../static/icon_music_play.png';
	import icon_music_menu from '../../static/icon_music_menu.png'

	const store = useStore();
	const favoriteDirectoryList = reactive<Array<FavoriteDirectoryType>>([]);
	const favoriteAuthorList = reactive<Array<MusicAuthorType>>([]);
	const recordMusicList = reactive<Array<MusicType>>([]);
	const showFavoriteDialog = ref<boolean>(false);// 显示音乐收藏弹窗
	const isFoldMusicMenu = ref<boolean>(false);// 是否展开歌单
	const isFoldSingerList = ref<boolean>(false);// 是否展开我关注的歌手
	const isFoldPlayRecord = ref<boolean>(false);// 是否展开我的播放记录
	const popup = ref<null | InstanceType<typeof uniPopup>>(null);
	const totalRecord = ref<number>(0);// 总记录条数
	const isFoldFavoriteMusic = ref<boolean>(false);// 是否折叠我喜欢的歌曲
	const favoriteMusicList = reactive<Array<MusicType>>([]);// 我喜欢的歌曲
	const totalFavoriteAuthor = ref<number>(0);// 喜欢的歌手总条数
	const totalFavoriteMusic = ref<number>(0);// 我喜欢的歌曲总数
	const dialogText = ref<string>("");
	const deletefavoriteDirectoryIndex = ref<number>(-1);
	const deleteFavoriteAuthorIndex = ref<number>(-1);
	const deleteFavoriteMusicIndex = ref<number>(-1);// 删除我喜欢的音乐

	/**
	 * @description: 获取用户歌单
	 * @date: 2024-03-16 23:25
	 * @author wuwenqiang
	 */
	const useFavoriteDirectory = (showLoading:boolean = false)=>{
		if(showLoading)uni.showLoading();
		favoriteDirectoryList.length = 0;
		 getFavoriteDirectoryService(0).then((res)=>{
			favoriteDirectoryList.push(...res.data);
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
		favoriteAuthorList.length = 0;
		getFavoriteAuthorService(1,5).then((res)=>{
			favoriteAuthorList.push(...res.data);
			totalFavoriteAuthor.value = res.total;
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
			totalRecord.value = res.total;
		}).finally(()=>{
			if(showLoading)uni.hideLoading()
		});
	}

	const init = ()=>{
		useFavoriteDirectory();
		useMyLikeMusicAuthor();
		useMusicRecord();
		useFavoriteMusicList();
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
	const useInsertFavoriteDirectory = (favoriteDirectory:FavoriteDirectoryType) => {
		favoriteDirectoryList.unshift(favoriteDirectory);
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
	}

	/**
	 * @description: 折叠模块
	 * @date: 2025-03-02 19:57
	 * @author wuwenqiang
	 */
	const useFoldPlayRecord = (isFold:boolean)=>{
		isFoldPlayRecord.value = isFold;
	}

	/**
	 * @description: 删除收藏夹
	 * @date: 2025-03-03 22:17
	 * @author wuwenqiang
	 */
	const useDeleteFavoriteDirectory = (index:number)=>{
		deletefavoriteDirectoryIndex.value = index;
		dialogText.value = `是否删除收藏夹：${favoriteDirectoryList[index].name}`;
		popup.value?.open('top');
	}

	/**
	 * @description: 删除关注的歌手
	 * @date: 2025-03-03 21:51
	 * @author wuwenqiang
	 */
	 const useDeleteAuthor = (index:number)=>{
		deleteFavoriteAuthorIndex.value = index;
		dialogText.value = `是否删除歌手：${favoriteAuthorList[index].authorName}`;
		popup.value?.open('top');
	}

	/**
	 * @description: 关闭弹窗
	 * @date: 2025-03-03 21:51
	 * @author wuwenqiang
	 */
	const useCloseDialog = ()=>{
		popup.value?.close()
		deletefavoriteDirectoryIndex.value = deleteFavoriteAuthorIndex.value = -1
	}

	/**
	 * @description: 关闭弹窗
	 * @date: 2025-03-03 21:51
	 * @author wuwenqiang
	 */
	const useSureDelete = ()=>{
		uni.showLoading()
		if(deletefavoriteDirectoryIndex.value !== -1){
			deleteFavoriteDirectoryService(favoriteDirectoryList[deletefavoriteDirectoryIndex.value].id).then((res)=>{
				uni.showToast({
					duration:2000,
					position:'center',
					title: res.data > 0 ? '删除成功' : '删除失败'
				})
				favoriteDirectoryList.splice(deletefavoriteDirectoryIndex.value,1);
				deletefavoriteDirectoryIndex.value = -1;
			}).finally(()=>uni.hideLoading())
		}else if(deleteFavoriteAuthorIndex.value !== -1){
			deleteFavoriteAuthorService(favoriteAuthorList[deleteFavoriteAuthorIndex.value].authorId).then((res)=>{
				uni.showToast({
					duration:2000,
					position:'center',
					title: res.data > 0 ? '删除成功' : '删除失败'
				})
				popup.value?.close()
				favoriteAuthorList.splice(deleteFavoriteAuthorIndex.value,1);
			}).finally(()=>{
				uni.hideLoading();
				deleteFavoriteAuthorIndex.value = -1;
			})
		}else {
			deleteMusicLikeService(favoriteMusicList[deleteFavoriteMusicIndex.value].id).then((res)=>{
				uni.showToast({
					duration:2000,
					position:'center',
					title: res.data > 0 ? '删除成功' : '删除失败'
				})
				popup.value?.close();
				favoriteMusicList.splice(deleteFavoriteMusicIndex.value,1);
			}).finally(()=>{
				uni.hideLoading();
				deleteFavoriteMusicIndex.value = -1;
			})
		}
	}

	/**
	 * @description: 我喜欢的歌曲
	 * @date: 2025-03-04 21:47
	 * @author wuwenqiang
	 */
	const useFavoriteMusicList = (showLoading:boolean = false)=>{
		if(showLoading)uni.showLoading();
		favoriteMusicList.length = 0;
		getMusicLikeService(1,5).then((res) => {
			favoriteMusicList.push(...res.data);
			totalFavoriteMusic.value = res.total;
		}).finally(()=>uni.hideLoading())
	}

	/**
	 * @description: 删除我喜欢的歌曲
	 * @date: 2025-03-04 21:47
	 * @author wuwenqiang
	 */
	 const useDeleteFavoriteMusic = (index:number)=>{
		deleteFavoriteMusicIndex.value = index;
		dialogText.value = `是否删除歌曲：${favoriteMusicList[index].songName}`;
		popup.value?.open('top');
	}

	/**
	 * @description: 展开折叠我喜欢的歌曲
	 * @date: 2025-03-04 21:47
	 * @author wuwenqiang
	 */
	const useFoldFavoriteMusic = (isFold:boolean)=>{
		isFoldFavoriteMusic.value = isFold;
	}

	init();

</script>

<style lang="less" scoped>
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
			align-items: center;
		}
		.favorite-wrapper{
			padding: @page-padding;
		}
		.icon-small{
			opacity: 0.2;
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
		.popup-wrapper{
			width: 100%;
			height: 100%;
			background-color: rgba(0,0,0,0.2);
			top: 0;
			left: 0;
			.dialog-wrapper{
				display: flex;
				height: 100vh;
				width: 100%;
				align-items: center;
				justify-content: center;
				.dialog-box{
					width: 80%;
					left: 50%;
					top: 50%;
					border-radius: @module-border-radius;
					background-color: @white-background-color;
					.dialog-header{
						padding: @page-padding;
						display: flex;
						align-items: center;
						justify-content: center;
						font-weight: bold;
						box-sizing: border-box;
					}
					.dialog-content{
						padding: calc(@page-padding * 2);
						display: flex;
						box-sizing: border-box;
						justify-content: center;
					}
					.dialog-btn{
						display: flex;
						border-top: 1rpx solid @page-background-color;
						.btn-cancle{
							height: @btn-height;
							flex: 1;
							justify-content: center;
							align-items: center;
							display: flex;
							color: @sub-title-color;
						}
						.btn-sure{
							flex: 1;
							color: @line-color;
							height: @btn-height;
							display: flex;
							justify-content: center;
							align-items: center;
							font-weight: bold;
							border-left: 1rpx solid @page-background-color;;
						}
					}
				}
			}
		}
		.line{
			height: 1rpx;
			margin-top: @page-padding;;
			background-color: @page-background-color;
		}
		.operate-wrappper{
			display: flex;
			gap:@page-padding;
			align-items: center;
			.more{
				color:@disable-text-color;
				text-decoration: underline;
			}
		}
		
	}
</style>
