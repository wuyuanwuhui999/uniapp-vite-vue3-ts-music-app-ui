<template>
	<view class="module-block">
		<MusicTitleComponent @useMore="useMore" :classifyItem="classifyItem" :isFold="isFold" @on-fold="useFold"/>
		<MusicClassifyListComponent class="component-gap" v-show="!isFold" @onPlayMusic="usePlayMusic" :musicList = 'classifyMusicList' :classifyName = 'classifyItem.classifyName'/>
	</view>
</template>

<script setup lang="ts">
	import { defineProps, reactive, ref, type PropType } from 'vue';
	import type { MusicClassifyType, MusicType } from "../types";
	import { getMusicListByClassifyIdService } from '../service';
	import MusicTitleComponent from './MusicTitleComponent.vue';
	import MusicClassifyListComponent from './MusicClassifyListComponent.vue';
	import { useStore } from "../stores/useStore";
	import {MAX_FAVORITE_NUMBER} from '../common/constant';

	const classifyMusicList = reactive<Array<MusicType>>([]);
	const isFold = ref<boolean>(false)

	const store = useStore();

	const { classifyItem,showLoading } = defineProps({
		classifyItem: {
			type: Object as PropType<MusicClassifyType>,
			reqiure: true,
			default: {}
		},
		showLoading:{
			type: Boolean,
			reqiure: false,
			default: false
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
	 * @description: 播放音乐
	 * @date: 2024-05-07 22:56
	 * @author wuwenqiang
	 */
	const usePlayMusic =async (musicModel:MusicType) => {
		if(store.musicItem?.id !== musicModel.id){
			store.setMusic(musicModel,true);
			if(store.classifyName !== classifyItem.classifyName){
				await getMusicListByClassifyIdService(classifyItem.id,1,MAX_FAVORITE_NUMBER).then((res)=>store.setMusicList(res.data));
			}
		}
		uni.navigateTo({url: `../pages/MusicPlayerPage`});
	}

	

	/**
	 * @description: 点击更多
	 * @date: 2024-07-21 14:59
	 * @author wuwenqiang
	 */
	const useMore = () => {
		uni.navigateTo({url: `../pages/MusicClassifyListPage?data=${encodeURIComponent(JSON.stringify(classifyItem))}`});
	}

	if(showLoading)uni.showLoading()
	getMusicListByClassifyIdService(classifyItem.id, 1, 3).then((res) => {
		classifyMusicList.push(...res.data);
	}).finally(()=>{
		if(showLoading)uni.hideLoading()
	});


</script>

<style lang="less">
	@import '../theme/size.less';
	@import '../theme/style.less';
	.component-gap{
		margin-top:@page-padding;;
	}
</style>
