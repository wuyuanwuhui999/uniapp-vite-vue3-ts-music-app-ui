<template>
	<view class="page-wrapper">
        <NavigatorTitleComponent title="忘记密码"/>
		<view class="module-block module-block-column">
			<view class="row">
				<view class="title">
					<text class="require">*</text>
					<text>邮箱地址</text>
				</view>
				<input class="input" v-model="email" placeholder="请输入您的保密邮箱"/>
			</view>
		</view>
		<view class="login-btn" @click="useSumbit">提交</view>
	</view>
</template>

<script setup lang="ts">

    import { ref } from 'vue';
    import NavigatorTitleComponent from '../components/NavigatorTitleComponent.vue';

    const email = ref<string>("");
	let loading:boolean = false;

    /**
	 * @author: wuwenqiang
	 * @description: 注册
	 * @date: 2024-01-10 22:13
	 */
	const useSumbit = async() => {
		if(!email.value){
			uni.showToast({
				title: '请输入邮箱',
				icon: "none"
			});
		}else{
			if(loading)return;
			loading = true;
            
		}
	}
</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
	.page-wrapper{
		height: 100vh;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		padding: 0 @page-padding @page-padding;
		background-color: @page-background-color;
		.module-block{
			align-items: center;
			.row{
				width: 100%;
				display: flex;
				align-items: center;
				margin-top: @page-padding;
				.title{
					width: 25%;
					.require{
						color: @warn-color;
					}
				}
				.input{
					flex: 1;
					padding-left: @small-margin;
					height: @input-height
				}
				/deep/.icon-calendar{
					display: none;
				}
			}
		}
		.login-btn{
			text-align: center;
			width: 100%;
			padding: @page-padding;
			box-sizing: border-box;
			border-radius: @big-border-radius;
			margin-top:  @page-padding;
			background-color: @warn-color;
			color: @module-background-color;
			display: inline-block;
		}
	}
</style>
