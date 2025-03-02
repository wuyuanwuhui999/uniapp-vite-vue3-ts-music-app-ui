<template>
	<view class="favorite-add-row">
		<text class="require-text">*</text>
		<text>名称</text>
		<input v-model="favoriteName" placeholder="请输入收藏夹名称" class="favorite-input" />
	</view>
	<view class="favorite-add-row favorite-cover-row">
		<text class="require-text require-text-hidden">*</text>
		<text>封面</text>
		<view class="rectangle">
			<image class="icon-favorite-add" src="../../static/icon_add.png" />
		</view>
	</view>
	<view class="favorite-btn-row">
		<button class="favorite-btn favorite-create" :class="isEnableCreate ? '' : 'favorite-btn-disable'"
			@click="useInsertFavoriteDirectory">创建</button>
		<button class="favorite-btn favorite-cancle" @click="useCancle">取消</button>
	</view>
</template>

<script setup lang="ts">
	import { defineEmits, ref, watch } from 'vue';
	import type { FavoriteDirectoryType } from '../types';
	import { insertFavoriteDirectoryService } from '../service';
	const isEnableCreate = ref<boolean>(false);
	const favoriteName = ref<string>('');

	const emits = defineEmits(['onSure','onCancle']);

	const useInsertFavoriteDirectory = () => {
		uni.showLoading()
		const favoriteDirectory : FavoriteDirectoryType = { name: favoriteName.value, id: -1 };
		insertFavoriteDirectoryService(favoriteDirectory).then(res => {
			if (res.data) {
				uni.showToast({
					duration: 2000,
					position: 'center',
					title: '创建收藏夹成功'
				});
				emits("onSure",res.data)
				emits("onCancle");
			} else {
				uni.showToast({
					duration: 2000,
					position: 'center',
					title: '收藏夹已存在'
				});
			}
		}).finally(()=>{
			uni.hideLoading();
		});
	}

	watch(() => favoriteName.value,
		(newVal) => {
			isEnableCreate.value = Boolean(newVal)
		}
	);
	
	const useCancle = ()=>{
		emits("onCancle")
	}
</script>


<style scoped lang="less">
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';

	.favorite-add-row {
		display: flex;
		align-items: center;

		&.favorite-cover-row {
			margin-top: @page-padding;

			.rectangle {
				width: calc(@middle-icon-size * 4);
				height: calc(@middle-icon-size * 4);
				display: flex;
				justify-content: center;
				align-items: center;
				background: @page-background-color;
				border-radius: @btn-border-radius;
				margin-left: @page-padding;

				.icon-favorite-add {
					width: @middle-icon-size;
					height: @middle-icon-size;
				}
			}
		}

		.require-text {
			color: @warn-color;

			&.require-text-hidden {
				visibility: hidden;
			}
		}

		.favorite-input {
			flex: 1;
			width: 0;
			margin-left: @page-padding;
			padding: @page-padding;
			background: @page-background-color;
			border-radius: @btn-border-radius;
		}
	}

	.favorite-btn-row {
		.favorite-btn {
			width: 100%;
			margin-top: @page-padding;
			border-radius: @big-border-radius;

			&.favorite-create {
				background: @warn-color;
				border: none;
				color: @white-background-color;

				&.favorite-btn-disable {
					opacity: 0.5;
					pointer-events: none;
				}
			}

			&.favorite-cancle {
				background: transparent;
				border: 1rpx solid @page-background-color;
			}
		}
	}

	.favorite-directory {
		flex: 1;
		height: 0;
		margin-top: @page-padding;

		.checkbox-item {
			margin-bottom: @page-padding;
			display: flex;
			align-items: center;

			&:last-child {
				margin-bottom: 0;
			}

			.checkbox-name {
				display: flex;
				flex: 1;
				margin-left: @page-padding;
				flex-direction: column;

				.favorite-total {
					color: @sub-title-color;
				}
			}
		}
	}
</style>