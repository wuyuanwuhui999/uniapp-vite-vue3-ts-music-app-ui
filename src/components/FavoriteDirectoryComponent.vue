<template>
	<view class="favorite-list-wrapper">
		<CreateFavoriteDirectoryComponent  v-if="showCreateFavorite" @on-cancle="showCreateFavorite = false" @on-sure="useCreateFavorite"/>

		<template v-else>
			<view class="favorite-add" @click="showCreateFavorite = true">
				<view class="rectangle">
					<image class="icon-favorite-add" src="../../static/icon_add.png" />
				</view>
				<text>新建收藏夹</text>
			</view>

			<scroll-view class="favorite-directory" scroll-y show-scrollbar="false">
				<checkbox-group @change="useCheckChange">
					<label class="checkbox-item" v-for="item in favoriteDirectoryList" :key="item.id">
						<image class="rectangle" v-if="item.cover" :src="HOST + item.cover" />
						<view v-else class="rectangle">
							<text>{{ item.name.slice(0,1) }}</text>
						</view>
						<view class="checkbox-name">
							<text>{{item.name}}</text>
							<text class="favorite-total">{{ item.total }}首</text>
						</view>
						<checkbox :value="item.id" :checked="item.checked" />
					</label>
				</checkbox-group>
			</scroll-view>
			<button @click="userAddFavorite"
				class="btn-add-favorite">{{isFavorite && checkboxValue.length == 0 ? '取消收藏': '添加'}}{{checkboxValue.length > 0 ? `（已选${checkboxValue.length}个）` : ''}}</button>
		</template>

	</view>
</template>

<script setup lang="ts">
	import { HOST } from '../common/constant';
	import { reactive, defineProps, type PropType, defineEmits, ref, watch } from 'vue';
	import type { FavoriteDirectoryType, FavoriteMusicType } from '../types';
	import { getFavoriteDirectoryService, insertFavoriteDirectoryService, insertFavoriteDirectoryService } from '../service';
	import CreateFavoriteDirectoryComponent from './CreateFavoriteDirectoryComponent.vue';

	const favoriteDirectoryList = reactive<Array<FavoriteDirectoryType>>([]);
	const checkboxValue = reactive<Array<number>>([]);
	const showCreateFavorite = ref<boolean>(false);
	const isEnableCreate = ref<boolean>(false);
	const favoriteName = ref<string>('');
	
	const { musicId, isFavorite } = defineProps({
		isFavorite: {
			type: Boolean as PropType<boolean>,
			reqiure: true,
			default: false
		},
		musicId: {
			type: Number as PropType<number>,
			reqiure: true,
			default: -1
		}
	});

	const emit = defineEmits(['useFavorite']);

	/**
	* @description: 选择收藏夹
	* @date: 2024-06-29 14:21
	* @author wuwenqiang
	*/
	const useCheckChange = (e : EventHandler) => {
		checkboxValue.length = 0;
		checkboxValue.push(...e.detail.value);
	}

	/**
	 * @description: 添加收藏
	 * @date: 2024-06-29 14:20
	 * @author wuwenqiang
	 */
	const userAddFavorite = () => {
		const favoriteList : Array<FavoriteMusicType> = checkboxValue.map(item => {
			return { favoriteId: item } as FavoriteMusicType
		});
		insertFavoriteDirectoryService(musicId, favoriteList).then(res => {
			if (res.data > 0) {
				uni.showToast({
					duration: 2000,
					position: 'center',
					title: favoriteList.length == 0 ? '取消收藏成功' : '添加收藏成功'
				});
			}
			emit('useFavorite', favoriteList.length != 0);
		})
	}

	watch(() => favoriteName.value,
		(newVal) => {
			isEnableCreate.value = Boolean(newVal)
		}
	);

	/**
	 * @description: 创建音乐收藏夹
	 * @date: 2024-06-29 14:20
	 * @author wuwenqiang
	 */
	const useCreateFavorite = (favoriteDirectory:FavoriteDirectoryType) => {
		favoriteDirectoryList.unshift(favoriteDirectory);
	}

	getFavoriteDirectoryService(musicId).then(res => {
		res.data.forEach(item => {
			if (item.checked) {
				checkboxValue.push(item.id);
			}
			favoriteDirectoryList.push(item);
		})
	});
</script>


<style scoped lang="less">
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';

	.favorite-list-wrapper {
		height: 0;
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: @page-padding;

		.favorite-add {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.rectangle {
			width: calc(@middle-icon-size * 2);
			height: calc(@middle-icon-size * 2);
			display: flex;
			justify-content: center;
			align-items: center;
			background: @page-background-color;
			border-radius: @btn-border-radius;

			.icon-favorite-add {
				width: @middle-icon-size;
				height: @middle-icon-size;
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

		.btn-add-favorite {
			border: none;
			display: block;
			width: 100%;
			margin-top: @page-padding;
			background-color: @warn-color;
			color: @module-background-color;
			border-radius: @big-border-radius;
		}
	}
</style>