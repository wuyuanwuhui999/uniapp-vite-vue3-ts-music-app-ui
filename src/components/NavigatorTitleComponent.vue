<template>
	<view class="page-header">
        <image class="icon-back" @click="useBack" :src="icon_back"/>
        <text class="my-favorite">{{ title }}</text>
        <view class="icon-back"/>
    </view>
</template>

<script setup lang="ts">
    import { defineProps } from 'vue';
	import icon_back from '../../static/icon_back.png';
	
    const { title } = defineProps({
		title: {
			type: String,
			reqiure: true,
			default: ''
		}
	});
    /**
	 * @description: 返回按钮
	 * @date: 2024-05-10 22:10
	 * @author wuwenqiang
	 */
     const useBack = ()=>{
		uni.navigateBack()
	}
</script>

<style lang="less">
	@import '../theme/color.less';
	@import '../theme/size.less';

	.page-header {
		padding: @page-padding;
		display: flex;
		justify-content: space-between;
		background: @module-background-color;

		.icon-back{
			width: @small-icon-size;
			height: @small-icon-size;
			opacity: 0.2;
		}
	}
</style>