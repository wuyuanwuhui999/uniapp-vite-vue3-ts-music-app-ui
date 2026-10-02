<template>
	<view class="music-card module-block">
		<view class="music-list">
			<!-- 歌曲条目：左边歌曲封面，中间歌手-歌曲名称，右边播放、收藏、点赞 -->
			<view class="music-item" :key="item.id" v-for="(item, index) in musicList">
				<MusicAvaterComponent type="music" size="middle" :name="item.songName" :avater="item.cover" />
				<view class="music-info">
					<text class="music-name">{{ item.authorName }}-{{ item.songName }}</text>
				</view>
				<!-- 播放图标：正在播放当前歌曲时显示播放中的图标 -->
				<image class="icon-operation" @click.stop="usePlayMusic(item, index)"
					:src="isPlayingMusic(item) ? playingIcon : playIcon" />
				<!-- 收藏图标：根据歌曲的 isFavorite 字段显示是否已收藏 -->
				<image class="icon-operation" :class="{ 'icon-operation-active': item.isFavorite }"
					@click.stop="useShowFavorite(item)"
					:src="item.isFavorite ? favoriteActiveIcon : favoriteIcon" />
				<!-- 点赞图标：根据歌曲的 isLike 字段显示是否已点赞 -->
				<image class="icon-operation" :class="{ 'icon-operation-active': item.isLike }"
					@click.stop="useLike(item)" :src="item.isLike ? likeActiveIcon : likeIcon" />
			</view>
		</view>

		<!-- 音乐收藏弹窗：和播放页面复用同一个收藏夹组件和收藏接口 -->
		<DialogComponent @onClose="showFavoriteDialog = false" v-if="showFavoriteDialog">
			<template #header>
				<text class="favorite-header">收藏夹</text>
			</template>
			<template #content>
				<!-- useFavorite点击收藏之后执行的事件，musicId表示音乐的id，isFavorite表示音乐是否已经收藏过-->
				<FavoriteDirectoryComponent @useFavorite="useMusicFavorite"
					:isFavorite="currentFavorite" :musicId="currentMusic.id" />
			</template>
		</DialogComponent>
	</view>
</template>

<script setup lang="ts">
	import { ref, watch, defineProps, type PropType } from 'vue';
	import type { MusicType } from '../types';
	import { insertMusicLikeService, deleteMusicLikeService } from '../service';
	import { useStore } from "../stores/useStore";
	import { CHAT_MUSIC_CLASSIFY_NAME } from '../common/constant';
	import MusicAvaterComponent from './MusicAvaterComponent.vue';
	import DialogComponent from './DialogComponent.vue';
	import FavoriteDirectoryComponent from './FavoriteDirectoryComponent.vue';
	import playIcon from '../../static/icon_music_play.png';
	import playingIcon from '../../static/icon_music_playing_grey.png';
	import favoriteActiveIcon from '../../static/icon_full_star.png';
	import favoriteIcon from '../../static/icon_favorite_gray.png';
	import likeActiveIcon from '../../static/icon_like_active.png';
	import likeIcon from '../../static/icon_like.png';

	const props = defineProps({
		musicList: {
			type: Array as PropType<Array<MusicType>>,
			require: true,
			default: () => []
		}
	});

	const store = useStore();
	// 大模型返回的歌曲列表里对象是普通对象，这里转成响应式副本，点赞、收藏后图标才能实时变化
	const musicList = ref<Array<MusicType>>([]);
	const currentMusic = ref<MusicType>({} as MusicType);// 当前点击收藏的歌曲
	const currentFavorite = ref<boolean>(false);// 当前点击收藏的歌曲是否已经收藏
	const showFavoriteDialog = ref<boolean>(false);// 显示音乐收藏弹窗
	let loading: boolean = false;// 点赞请求中，防止重复点击

	// 大模型返回的歌曲列表变化（流式输出会不断刷新）时，同步响应式副本
	watch(() => props.musicList,
		(newVal) => {
			musicList.value = (newVal || []).map((item) => ({ ...item }));
		},
		{ immediate: true }
	);

	/**
	 * @description: 当前歌曲是否正在播放
	 * @param {MusicType} musicItem 歌曲
	 * @return {boolean} 是否正在播放
	 * @date: 2026-09-30 22:00
	 * @author wuwenqiang
	 */
	const isPlayingMusic = (musicItem: MusicType): boolean => Boolean(store.isPlaying && store.musicItem?.id === musicItem.id);

	/**
	 * @description: 播放歌曲，把卡片里的歌曲作为播放列表进入播放页面
	 * @param {MusicType} musicItem 歌曲
	 * @param {number} index 歌曲在列表中的下标
	 * @date: 2026-09-30 22:00
	 * @author wuwenqiang
	 */
	const usePlayMusic = (musicItem: MusicType, index: number) => {
		if (store.musicItem?.id !== musicItem.id) {// 不是当前播放的歌曲，才重新设置播放列表和播放地址
			store.setClassifyMusic(musicList.value, musicItem, index, CHAT_MUSIC_CLASSIFY_NAME);
		}
		uni.navigateTo({ url: `../pages/MusicPlayerPage` });
	}

	/**
	 * @description: 添加或者取消点赞，和播放页面复用同一个点赞接口
	 * @param {MusicType} musicItem 歌曲
	 * @date: 2026-09-30 22:00
	 * @author wuwenqiang
	 */
	const useLike = (musicItem: MusicType) => {
		if (loading) return;
		loading = true;
		if (musicItem.isLike) {// 已经点赞，取消点赞
			deleteMusicLikeService(musicItem.id).then((res) => {
				if (res.data > 0) {
					musicItem.isLike = 0;
					uni.showToast({
						duration: 2000,
						position: 'center',
						title: '取消点赞成功'
					})
				}
			}).finally(() => loading = false)
		} else {// 未点赞，添加点赞
			insertMusicLikeService(musicItem.id).then((res) => {
				if (res.data > 0) {
					musicItem.isLike = 1;
					uni.showToast({
						duration: 2000,
						position: 'center',
						title: '点赞成功'
					})
				}
			}).finally(() => loading = false)
		}
	}

	/**
	 * @description: 打开收藏夹弹窗（复用播放页面的收藏功能）
	 * @param {MusicType} musicItem 歌曲
	 * @date: 2026-09-30 22:00
	 * @author wuwenqiang
	 */
	const useShowFavorite = (musicItem: MusicType) => {
		currentMusic.value = musicItem;
		currentFavorite.value = Boolean(musicItem.isFavorite);
		showFavoriteDialog.value = true;
	}

	/**
	 * @description: 音乐收藏或取消收藏（收藏夹组件回调，和播放页面逻辑一致）
	 * @param {boolean} isMusicFavorite 是否收藏成功
	 * @date: 2026-09-30 22:00
	 * @author wuwenqiang
	 */
	const useMusicFavorite = (isMusicFavorite: boolean) => {
		currentFavorite.value = isMusicFavorite;// 当前歌曲的收藏状态
		currentMusic.value.isFavorite = isMusicFavorite ? 1 : 0;// 音乐添加收藏或者取消收藏标志
		showFavoriteDialog.value = false;// 关闭音乐收藏弹窗
	}
</script>

<style scoped lang="less">
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';

	.music-card {
		margin-top: @md-padding; // 和上方回答内容的间距
		border: 1rpx solid @gray-color; // 卡片是白色背景，加一条浅边框，在回答气泡里也能看出卡片边界

		.music-list {
			display: flex;
			flex-direction: column;
			gap: @md-padding;
		}

		.music-item {
			display: flex;
			align-items: center;
			gap: @md-padding;

			.music-info {
				display: flex;
				flex-direction: column;
				flex: 1;
				font-size: @normal-font-size;
			}

			.icon-operation {
				width: @md-icon-size;
				height: @md-icon-size;
				opacity: 0.5; // 未选中状态的图标透明度

				&.icon-operation-active {
					opacity: 1; // 已点赞、已收藏的图标不透明
				}
			}
		}

		.favorite-header {
			font-size: @big-font-size;
		}
	}
</style>
