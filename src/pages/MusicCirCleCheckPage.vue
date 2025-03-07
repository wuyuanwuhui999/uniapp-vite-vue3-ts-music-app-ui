<template>
	<view class="page-wrapper">
        <NavigatorTitleComponent title="选择音乐"/>
		<view class="page-body">
			<view class="module-block">
				<view class="search-wrapper">
					<input v-model="inputValue" class="search-input" placeholder="请输入歌曲或者歌手名称">
					<image @click="useSearch" class="icon-middle" :src="icon_search"></image>
				</view>
			</view>

			<view class="module-block music-list-wrapper" v-if="musicList.length !== 0">
				<scroll-view class="scroll-view">
					<view class="music-list">
						<template v-for="item in musicList" :key="item.id">
							<view class="music-item" @click="useMusic(item)">
								<MusicAvaterComponent type="music" :name="item.songName" :avater="item.cover"/>
								<text>{{ item.authorName }} - {{ item.songName }}</text>
							</view>
							<view class="line"></view>
						</template>
						
					</view>
					
				</scroll-view>
			</view>

			<view class="module-block" v-else-if="showNoData">
				<text class="no-data">暂无数据</text>
			</view>
		</view>
		
	</view>
</template>

<script setup lang="ts">

    import { ref, reactive } from 'vue';
    import NavigatorTitleComponent from '../components/NavigatorTitleComponent.vue';
    import { searchMusicService } from '../service/index';
	import { PAGE_SIZE } from '../common/constant';
	import type { MusicType } from '../types';
	import MusicAvaterComponent from '../components/MusicAvaterComponent.vue';
	import { useStore } from "../stores/useStore";
	import icon_search from "../../static/icon_search.png"

	const inputValue = ref<string>("");
	const pageNum = ref<number>(1);
	const musicList = reactive<Array<MusicType>>([]);
	const showNoData = ref<boolean>(false);
	
	const store = useStore();

	/**
		* @description: 搜索音乐
		* @date: 2025-03-01 14:50
		* @author wuwenqiang
	*/
	const useSearch = ()=>{
		musicList.length = 0;
		pageNum.value = 1;
		showNoData.value = false
		useSearchMusic();
	}
    
	/**
		* @description: 搜索
		* @date: 2025-03-01 20:56
		* @author wuwenqiang
	*/
	const useSearchMusic = ()=>{
		uni.showLoading();
		searchMusicService(inputValue.value, pageNum.value, PAGE_SIZE).then((res)=>{
			musicList.push(...res.data)
			showNoData.value = musicList.length === 0 
		}).finally(()=>{
			uni.hideLoading();
		})
	}

	const useMusic = (musicItem:MusicType)=>{
		store.setShareMusicItem(musicItem);
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
		.page-body{
			flex: 1;
			height: 0;
			padding: 0 @page-padding @page-padding;
			display: flex;
			flex-direction: column;
			.module-block{
				align-items: center;
				.search-wrapper{
					width: 100%;
					display: flex;
					align-items: center;
					height: @input-height;
					padding: 0 @page-padding;
					box-sizing: border-box;
					background-color: @page-background-color;
					border-radius: @big-border-radius;
					.search-input{
						flex: 1;
					}
				}
				&.music-list-wrapper{
					flex: 1;
					height: 0;
					.scroll-view{
						height: 100%;
						/deep/.uni-scroll-view::-webkit-scrollbar {
							display: none;
						}
						.music-list{
							display: flex;
							flex-direction: column;
							gap: @page-padding;
							.music-item{
								display: flex;
								gap: @page-padding;
								align-items: center;
							}
							.line{
								height: 1rpx;
								background-color: @disable-text-color;
							}
						}
						
					}
				}
			}
		}
	}
</style>
