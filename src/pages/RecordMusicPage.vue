<template>
	<view class="page-wrapper" scroll-y show-scrollbar="false">
		<NavigatorTitleComponent title="我听过的歌曲"/>
		<scroll-view  scroll-y :show-scrollbar="false" @scrolltolower="onScrolltolower" class="page-body">
            <view class="module-block">
				<template v-if="recordMusicList.length !== 0" v-for="item,index in recordMusicList" :key="item.id">
					<view class="singer-list">
						<MusicAvaterComponent type="music" :name="item.songName" :avater="item.cover"/>
						<view class="songname-wrapper">
							<text>{{item.songName}}</text>
							<text class="total">{{formatTime(item.createTime)}}</text>
						</view>
						<image class="icon-small" :src="store.isPlaying && store.musicItem.id === item.id ? playingIcon : pauseIcon"/>
						<image class="icon-small" :src="icon_music_menu"/>
					</view>
					<view class="line" v-if="index < recordMusicList.length -1"></view>
				</template>
            </view>
            <text class="footer">{{ total >= pageNum * PAGE_SIZE ? '正在加载更多' : '已经到底了'}}</text>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive,type Ref } from 'vue';
	import type { MusicType } from '../types';
	import { getMusicRecordService } from '../service';
    import { PAGE_SIZE } from '../common/constant';
	import NavigatorTitleComponent from '../components/NavigatorTitleComponent.vue';
	import icon_music_menu from '../../static/icon_music_menu.png';
	import pauseIcon from '../../static/icon_music_play.png';
	import playingIcon from '../../static/icon_music_playing_grey.png';
	import { formatTime } from "../utils/util";
	import MusicAvaterComponent from '../components/MusicAvaterComponent.vue';
	import { useStore } from "../stores/useStore";

	const store = useStore()
    const total:Ref<number> = ref<number>(0);// 总数
	const pageNum:Ref<number> = ref<number>(1);
	const recordMusicList:Array<MusicType> = reactive<Array<MusicType>>([]);
    let loading:boolean = false;
	
    /**
	 * @description: 我听过的歌曲
	 * @date: 2025-03-04 21:47
	 * @author wuwenqiang
	 */
	const useRecordMusicList = ()=>{
		uni.showLoading();
		getMusicRecordService(pageNum.value,PAGE_SIZE).then((res)=>{
			recordMusicList.push(...res.data);
			total.value = res.total;
		}).finally(()=>{
			loading = false;
			uni.hideLoading();
		});
	}

     /**
	 * @description: 滚动加载更多
	 * @date: 2024-08-27 21:19
	 * @author wuwenqiang
	 */
    const onScrolltolower = ()=>{
		console.log(total.value,PAGE_SIZE * pageNum.value)
        if (loading) return;
		if (total.value > PAGE_SIZE * pageNum.value) {
			pageNum.value++;
			useRecordMusicList();
		}
    }

	useRecordMusicList();
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