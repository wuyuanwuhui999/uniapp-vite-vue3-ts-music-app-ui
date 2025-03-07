<template>
	<view class="page-wrapper" scroll-y show-scrollbar="false">
		<view class="page-header">
			<text class="page-btn btn-cancle" @click="useCancle">取消</text>
			<text class="page-btn btn-publish" @click="useSave">发布</text>
		</view>
		<view class="page-body">
			<textarea class="textarea" v-model="content" placeholder="这一刻的想法"></textarea>
			<view class="module-block">
				<view class="check-song" v-if="store.shareMusicItem?.id" @click="useCheckMusic">
					<MusicAvaterComponent type="music" :name="store.shareMusicItem?.songName" :avater="store.shareMusicItem?.cover"/>
					<text>{{ store.shareMusicItem?.authorName }} - {{ store.shareMusicItem?.songName }}</text>
				</view>
				<view v-else class="check-song" @click="useCheckMusic">
					<text class="check-tip">请选择一首歌词</text>
					<image class="icon-small" :src="icon_arrow"></image>
				</view>
			</view>
			<view class="module-block module-block-row" @click="usePermission">
				<image class="icon-middle" :src="icon_permission" />
				<text class="permission-text">谁可以看</text>
				<text>{{PermissionMap[permission]}}</text>
				<image class="icon-small" :src="icon_arrow" />
			</view>
		</view>
		<OptionsDialog ref="permissionOptionsDialog" @onCheck="onCheckPermission"
			:options="[{text:'公开',value:1},{text:'私密',value:0}]" />
	</view>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import type { CircleType } from '../types';
	import { saveCircleService } from '../service';
	import { CircleEnum } from '../common/enum';
	import { PermissionMap } from '../common/config';
	import { useStore } from "../stores/useStore";
	import OptionsDialog from '../components/OptionsDialog.vue';
	import MusicAvaterComponent from '../components/MusicAvaterComponent.vue';
	import icon_arrow from '../../static/icon_arrow.png';
	import icon_permission from '../../static/icon_permission.png';
	

	const content = ref<string>('');
	const permission = ref<number>(1);
	const permissionOptionsDialog = ref<null | InstanceType<typeof OptionsDialog>>(null);

	const store = useStore();

	/**
	 * @description: 下载权限
	 * @date: 2024-07-11 23:00
	 * @author wuwenqiang
	 */
	const usePermission = () => {
		permissionOptionsDialog.value?.$refs.popup.open('top');
	}


	/**
	 * @description: 选中权限
	 * @date: 2024-07-13 13:50
	 * @author wuwenqiang
	 */
	const onCheckPermission = (vlaue : number) => {
		permission.value = vlaue;
	}

	/**
	* @description: 取消说说
	* @date: 2024-07-13 13:50
	* @author wuwenqiang
	*/
	const useCancle = () => {
		uni.navigateBack();
	}

	/**
	* @description: 保存说说
	* @date: 2024-07-13 14:50
	* @author wuwenqiang
	*/
	const useSave = () => {
		const params : CircleType = {
			permission: permission.value,
			type: CircleEnum.MUSIC,
			relationId: store.shareMusicItem?.id,// 关联音乐audio_id或者电影movie_id
			content: content.value,// 朋友圈内容
		}
		saveCircleService(params).then(() => {
			uni.showToast({
				duration: 2000,
				position: 'center',
				title: '发布成功'
			})
			uni.navigateBack();
			store.setShareMusicItem(null);
		})
	}

	/**
	* @description: 选择音乐
	* @date: 2025-03-01 14:50
	* @author wuwenqiang
	*/
	const useCheckMusic = ()=>{
		uni.navigateTo({
			url: `../pages/MusicCirCleCheckPage`
		})
	}
</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';

	.page-wrapper {
		height: 100%;
		display: flex;
		overflow: hidden;
		flex-direction: column;
		background-color: @page-background-color;
		box-sizing: border-box;

		.page-header {
			padding: @page-padding;
			display: flex;
			justify-content: space-between;
			background: @module-background-color;

			.page-btn {
				background-color: @module-background-color;
				border-radius: @btn-border-radius;
				border: 1rpx solid @disable-text-color;
				margin: 0;
				overflow: hidden;
				padding: @page-padding @btn-padding;

				&.btn-publish {
					border: none;
					background: @line-color;
					color: @module-background-color;
				}
			}
		}

		.page-body {
			flex: 1;
			overflow: hidden;
			padding: @page-padding;
			.icon-middle{
				opacity: 0.5;
			}
			.textarea {
				background: @search-input-placehold;
				width: 100%;
				padding: @page-padding;
				border-radius: @module-border-radius;
				box-sizing: border-box;
			}

			.module-block {
				gap: @page-padding;
				align-items: center;

				.permission-text {
					flex: 1;
				}

				.icon-small {
					opacity: 0.5;
				}
				.check-song{
					display: flex;
					align-items: center;
					width: 100%;
					gap: @page-padding;
					.check-tip{
						flex:1;
					}
				}
			}
		}
	}
</style>