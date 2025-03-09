<template>
	<scroll-view class="page-wrapper" scroll-y @scrolltolower="onScrolltolower" show-scrollbar="false">
		<view>
			<MusicSearchComponent />
			<view class="category-wrapper module-block">
				<view class="category-item" @click="useMusicAuthorCategoryPage">
					<image class="category-img" :src="icon_music_singer" />
					<text class="category-name">歌手</text>
				</view>
				<view class="category-item" @click="useMusicCategoryListPage">
					<image class="category-img" :src="icon_music_classify" />
					<text class="category-name">分类歌曲</text>
				</view>
				<view class="category-item">
					<image class="category-img" :src="icon_music_classics" />
					<text class="category-name">经典老歌</text>
				</view>
				<view class="category-item">
					<image class="category-img" :src="icon_music_rank" />
					<text class="category-name">热门榜单</text>
				</view>
			</view>
			<template v-for="item,index in allClassifies.slice(0,pageNum)">
				<MusicSingerComponent :key="'singerId' + item.id" :classifyItem="item"
					v-if="item.classifyName === '推荐歌手'" />
				<MusicClassifyComponent :showLoading="pageNum > 3" :class="index === allClassifies.length - 1 ? 'module-block-last': ''"
					:key="'classifyId' + item.id" v-else :classifyItem="item" />
			</template>

			<view class="bottom"><text>{{pageNum === allClassifies.length - 1 ? "已经到底了" : "正在加载更多..."}}</text></view>
		</view>
	</scroll-view>
</template>

<script setup lang="ts">
	import { ref, reactive } from "vue";
	import MusicSearchComponent from './MusicSearchComponent.vue';
	import { getMusicClassifyService } from '../service';
	import type { MusicClassifyType } from "../types";
	import MusicSingerComponent from './MusicSingerComponent.vue';
	import MusicClassifyComponent from './MusicClassifyComponent.vue';
	import icon_music_singer from '../../static/icon_music_singer.png';
	import icon_music_classify from "../../static/icon_music_classify.png";
	import icon_music_classics from "../../static/icon_music_classics.png";
	import icon_music_rank from "../../static/icon_music_rank.png"

	const pageNum = ref<number>(3);// 初始化加载3个模块，其他模块按需加载
	const allClassifies = reactive<Array<MusicClassifyType>>([]);// 所有分类模块
	
	// 跳转到歌手列表
	const useMusicAuthorCategoryPage = ()=>{
		uni.navigateTo({url: `../pages/MusicAuthorCategoryPage`});
	}

	// 跳转到歌手列表
	const useMusicCategoryListPage = ()=>{
		uni.navigateTo({url: `../pages/MusicCategoryListPage`});
	}

	/**
	 * @description: 获取模块分类
	 * @date: 2024-03-03 11:23
	 * @author wuwenqiang
	 */
	getMusicClassifyService().then((res) => {
		allClassifies.push(...res.data);
	});

	/**
	 * @description: 获取模块分类
	 * @date: 2024-03-03 11:23
	 * @author wuwenqiang
	 */
	const onScrolltolower = () => {
		if (pageNum.value < allClassifies.length - 1) {
			pageNum.value++;
		}
	}
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

		.category-wrapper {
			display: flex;

			.category-item {
				width: 25%;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;

				.category-img {
					width: calc(@big-icon-size * 1.5);
					height: calc(@big-icon-size * 1.5);
					margin-bottom: @small-margin;
				}

				.category-name {}
			}
		}

		.bottom {
			padding: @page-padding 0;
			display: flex;
			justify-content: center;
		}
	}
</style>