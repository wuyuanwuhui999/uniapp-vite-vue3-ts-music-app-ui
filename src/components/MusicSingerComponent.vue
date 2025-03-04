<template>
	<view class="module-block">
		<MusicTitleComponent :classifyItem="classifyItem" @useMore="useMore" :isFold="isFold" @on-fold="useFold"/>
		<view class="author-list" v-show="!isFold">
			<view class="author-item" :key="item.id" v-for="item in authorList" @click="useAuthorMusicList(item)">
				<MusicAvaterComponent type="author" size="big" :name="item.authorName" :avater="item.avatar"/>
				<text class="author-name">{{item.authorName}}</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { reactive, ref, defineProps } from "vue";
	import { getMusicAuthorListByCategoryIdService } from '../service';
	import type { MusicAuthorType } from "../types";
	import MusicTitleComponent from './MusicTitleComponent.vue';
	import MusicAvaterComponent from './MusicAvaterComponent.vue';

	const isFold = ref<boolean>(false);

	const authorList = reactive<Array<MusicAuthorType>>([]);
	const { classifyItem } = defineProps({
		classifyItem: {
			type: Object,
			reqiure: true,
			default: {}
		}
	});

	/**
	 * @description: 展开或者折叠
	 * @date: 2025-03-04 20:27
	 * @author wuwenqiang
	 */
	 const useFold = (fold:boolean)=>{
		isFold.value = fold;
	}

	/**
	 * @description: 获取前四个歌手列表
	 * @date: 2024-03-03 18:23
	 * @author wuwenqiang
	 */
	getMusicAuthorListByCategoryIdService(0, 1, 4).then((res) => {
		authorList.push(...res.data);
	});

	 /**
	 * @description: 跳转到歌手分类页面
	 * @date: 2024-08-26 22:02
	 * @author wuwenqiang
	 */
	 const useMore = ()=>{
        uni.navigateTo({
			url: '../pages/MusicAuthorCategoryPage'
		});
    }

	const useAuthorMusicList = (item:MusicAuthorType)=>{
		uni.navigateTo({ url: `../pages/AuthorMusicListPage?data=${encodeURIComponent(JSON.stringify(item))}` });
	}
</script>

<style lang="less">
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';

	.author-list {
		display: flex;
		margin-top: @page-padding;

		.author-item {
			display: flex;
			flex-direction: column;
			flex: 1;
			justify-content: center;
			align-items: center;

			.author-avatar {
				width: @big-avater;
				height: @big-avater;
				border-radius: 50%;
				margin-bottom: @small-margin;
			}
		}

	}
</style>
