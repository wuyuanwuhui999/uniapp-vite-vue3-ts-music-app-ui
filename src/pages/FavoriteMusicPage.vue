<template>
	<view class="page-wrapper" scroll-y show-scrollbar="false">
		<NavigatorTitleComponent title="我喜欢的歌曲"/>
		<scroll-view  scroll-y :show-scrollbar="false" @scrolltolower="onScrolltolower" class="page-body">
            <view class="module-block">
				<uni-swipe-action v-if="favoriteMusicList.length !== 0">
					<template v-for="item,index in favoriteMusicList" :key="item.id">
						<uni-swipe-action-item >
							<view class="singer-list">
								<MusicAvaterComponent type="author" :name="item.songName" :avater="item.cover"/>
								<view class="songname-wrapper">
									<text>{{item.authorName}} - {{item.songName}}</text>
								</view>
								<image class="icon-small" :src="store.musicItem?.id == item.id && store.isPlaying && store.classifyName === '我喜欢的音乐' ? playingIcon : pauseIcon" @click="usePlayMusic(item,index)"/>
								<image class="icon-small" :src="icon_music_menu"/>
							</view>
							
							<template v-slot:right>
								<view class="delete-button" @click="useDeleteFavoriteMusic(index)"><text class="delete-button-text">删除</text></view>
							</template>
						</uni-swipe-action-item>
						<view class="line" v-if="index < favoriteMusicList.length -1"></view>
					</template>
				</uni-swipe-action>
            </view>
            <text class="footer">{{ total >= pageNum * PAGE_SIZE ? '正在加载更多' : '已经到底了'}}</text>
		</scroll-view>
		<uni-popup ref="popup" class="popup-wrapper"  type="dialog">
			<view class="dialog-wrapper">
				<view class="dialog-box">
					<view class="dialog-header"><text>提示</text></view>
					<view class="dialog-content">
						<text class="field-text">是否删除歌曲：{{ favoriteMusicList[deleteIndex].songName }}</text>
					</view>
					<view class="dialog-btn">
						<text class="btn-cancle" @click="useCloseDialog">取消</text>
						<text class="btn-sure" @click="useSureDelete">确定</text>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive,type Ref } from 'vue';
	import type { MusicType } from '../types';
	import { getMusicLikeService, deleteMusicLikeService } from '../service';
    import {PAGE_SIZE,MAX_FAVORITE_NUMBER} from '../common/constant';
	import NavigatorTitleComponent from '../components/NavigatorTitleComponent.vue';
	import { useStore } from "../stores/useStore";
	import icon_music_menu from '../../static/icon_music_menu.png';
	import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';
	import pauseIcon from '../../static/icon_music_play.png';
	import MusicAvaterComponent from '../components/MusicAvaterComponent.vue';
	import playingIcon from '../../static/icon_music_playing_grey.png';
	import uniSwipeAction from '@dcloudio/uni-ui/lib/uni-swipe-action/uni-swipe-action.vue';
	import uniSwipeActionItem from '@dcloudio/uni-ui/lib/uni-swipe-action-item/uni-swipe-action-item.vue';

	const store = useStore();
    const total:Ref<number> = ref<number>(0);// 总数
	const pageNum:Ref<number> = ref<number>(1);
	const favoriteMusicList:Array<MusicType> = reactive<Array<MusicType>>([]);
	const deleteIndex:Ref<number> = ref<number>(-1);
    let loading:boolean = false;
	const popup = ref<null | InstanceType<typeof uniPopup>>(null);
	
     /**
	 * @description: 根据分类获取歌手列表
	 * @date: 2024-08-26 22:02
	 * @author wuwenqiang
	 */
    /**
	 * @description: 我听过的歌曲
	 * @date: 2025-03-04 21:47
	 * @author wuwenqiang
	 */
	const useFavoriteMusicList = ()=>{
		uni.showLoading();
		getMusicLikeService(1,PAGE_SIZE).then((res) => {
			favoriteMusicList.push(...res.data);
			total.value = res.total;
		}).finally(()=>uni.hideLoading())
	}

     /**
	 * @description: 滚动加载更多
	 * @date: 2024-08-27 21:19
	 * @author wuwenqiang
	 */
    const onScrolltolower = ()=>{
        if (loading) return;
		if (total.value > PAGE_SIZE * pageNum.value) {
			pageNum.value++;
			useFavoriteMusicList();
		}
    }

	 /**
	 * @description: 删除喜欢的歌曲
	 * @date: 2025-03-09 15:26
	 * @author wuwenqiang
	 */
	const useSureDelete = ()=>{
		deleteMusicLikeService(favoriteMusicList[deleteIndex.value].id).then((res)=>{
			uni.showToast({
				duration:2000,
				position:'center',
				title: res.data > 0 ? '删除成功' : '删除失败'
			})
			popup.value?.close();
			favoriteMusicList.splice(deleteIndex.value,1);
		}).finally(()=>uni.hideLoading())
	}

     /**
	 * @description: 播放音乐
	 * @date: 2024-08-27 23:05
	 * @author wuwenqiang
	 */
    const usePlayMusic = (item : MusicType, index : number)=>{
		if (store.classifyName != "我喜欢的歌曲") {
			getMusicLikeService(1,MAX_FAVORITE_NUMBER).then((res)=>{
				store.setClassifyMusic(res.data, item, index,"我喜欢的歌曲");
        	});
		}else{
			store.setMusic(item, true);
		}
		uni.navigateTo({ url: `../pages/MusicPlayerPage` });
    }

	/**
	 * @description: 删除我喜欢的歌曲
	 * @date: 2025-03-04 21:47
	 * @author wuwenqiang
	 */
	 const useDeleteFavoriteMusic = (index:number)=>{
		deleteIndex.value = index;
		popup.value?.open('top');
	}

	/**
	 * @description: 关闭弹窗
	 * @date: 2025-03-03 21:51
	 * @author wuwenqiang
	 */
	 const useCloseDialog = ()=>{
		popup.value?.close()
	}

	useFavoriteMusicList();
</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
	.page-wrapper {
		/deep/.uni-scroll-view-content {
			&::-webkit-scrollbar {
				display: none;
			}
		}
		.page-body {
			flex: 1;
			overflow: hidden;
			padding:0 @page-padding;
			box-sizing: border-box;
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

			}
			.line{
				height: 1rpx;
				margin-top: @page-padding;;
				background-color: @page-background-color;
			}
            .footer {
				width: 100%;
				padding: @page-padding;
				text-align: center;
				display: inline-block;
			}
		}
	}
</style>