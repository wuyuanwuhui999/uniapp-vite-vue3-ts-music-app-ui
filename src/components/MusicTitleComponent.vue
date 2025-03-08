<template>
	<view class="classify-title-wrapper">
		<image class="icon-classify-arrow" :class="props.isFold ? 'icon-classify-arrow-fold' : ''" @click="useFold" :src="icon_down" />
		<text class="classify-name">{{props.classifyItem.classifyName}}</text>
		<slot>
			<text class="classify-more" v-if="props.showMore" @click="useMore">更多</text>
		</slot>
	</view>
</template>

<script setup lang="ts">
	import { defineProps, defineEmits } from 'vue';
	import icon_down from "../../static/icon_down.png";
	const props = defineProps({
		classifyItem: {
			type: Object,
			reqiure: true,
			default: {}
		},
		showMore:{
			reqiure: false,
			default: true
		},
		isFold:{// 是否折叠
			reqiure: false,
			default: false
		}
	});

	const emits = defineEmits(['useMore','onFold']);

	/**
	 * @description: 点击更多
	 * @date: 2024-07-21 14:45
	 * @author wuwenqiang
	 */
	const useMore = ()=>{
		emits('useMore');
	}

	/**
	 * @description: 点击折叠图标
	 * @date: 2024-07-21 14:45
	 * @author wuwenqiang
	 */
	const useFold = ()=>{
		emits('onFold',!props.isFold)
	}
</script>

<style lang="less">
	@import '../theme/size.less';
	@import '../theme/color.less';
	.classify-title-wrapper {
		display: flex;

		.icon-classify-arrow {
			width: @small-icon-size;
			height: @small-icon-size;
			opacity: 0.2;
			&.icon-classify-arrow-fold{
				transform: rotate(90deg);
			}
		}

		.classify-name {
			padding-left: @page-padding;
			flex: 1;
		}
		
		.classify-more{
			color: @disable-text-color;
			text-decoration: underline;
		}
	}
</style>