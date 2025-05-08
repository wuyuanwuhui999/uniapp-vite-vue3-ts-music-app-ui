<template>
	<view class="search-wrapper module-block">
		<AvaterComponent size="middle"/>
		<view class="search-input-wrapper" @click="useNavigateToSearchPage">
			<text class="search-input-placehold">{{keyword}}</text>
		</view>
		<image :src="icon_ai" class="icon-middle" @click="useChatPage"></image>
	</view>
</template>

<script setup lang="ts">
	import AvaterComponent from '../components/AvaterComponent.vue';
	import { ref } from 'vue';
	import {getKeyWordMusicService} from '../service';
	import icon_ai from "../../static/icon_ai.png";
	const keyword = ref<string>('');
	

	/**
	 * @author: wuwenqiang
	 * @description: 跳转到搜索页面
	 * @date: 2024-01-29 22:46
	 */
	const useNavigateToSearchPage = () => {
		uni.navigateTo({
			url: `../pages/MusicSearchPage?keyword=`+encodeURIComponent(keyword.value),
		})
	}

	// 获取搜索框推荐的音乐
	getKeyWordMusicService().then(res => keyword.value = res.data.songName)

	/**
	 * @author: wuwenqiang
	 * @description: 跳转到聊天界面
	 * @date: 2024-01-29 22:46
	 */
	const useChatPage = ()=>{
		uni.navigateTo({url: `../pages/ChatPage`});
	}
</script>

<style lang="less">
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
	.search-wrapper{
	    display: flex;
		gap:@page-padding;
		align-items: center;
	    .search-input-wrapper{
	        flex: 1;
	        margin-left: @page-padding;
	        height: @middle-avater;
	        background-color: @search-input-color;
	        border-radius: @middle-avater;
	        display: flex;
	        align-items: center;
	        .search-input-placehold{
				padding-left: @page-padding;
	            color: @search-input-placehold;
	        }
	    }
	}
</style>
