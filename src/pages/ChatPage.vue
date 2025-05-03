<template>
	<view class="page-wrapper">
		<view class="page-header">
			<image class="icon-back" @click="useBack" :src="icon_back"/>
			<text class="my-favorite">deepseek-r1:7b</text>
			<view class="icon-back"/>
		</view>
		<view class="page-body">
			
		</view>
		<view class="input-wrapper">
			<input class="chat-input">
			<view class="icon-wrapper">
				<image :src="icon_send" class="icon-middle icon_send"></image>
			</view>
			
		</view>
	</view>
</template>

<script setup lang="ts">

    import { ref } from 'vue';
	import { sendEmailVertifyCodeService } from '../service';
	import { EMAIL_REG } from '../common/constant';
	import icon_back from '../../static/icon_back.png';
	import icon_send from '../../static/icon_send.png';
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
		}else if(!EMAIL_REG.test(email.value)){
			uni.showToast({
				title: '请输入正确的邮箱地址',
				icon: "none"
			});
		}else{
			if(loading)return;
			loading = true;
			uni.showLoading()
            sendEmailVertifyCodeService(email.value).then((res)=>{
				uni.showToast({
					title: res.msg,
					icon: "none"
				});
				uni.navigateTo({
					url: `../pages/ResetPasswordPage?email=${encodeURIComponent(email.value)}`
				})
			}).finally(()=>{
				loading = false;
				uni.hideLoading();
			})
		}	
	}

	/**
	 * @description: 返回按钮
	 * @date: 2024-05-10 22:10
	 * @author wuwenqiang
	 */
     const useBack = ()=>{
		uni.navigateBack()
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
		background-color: @page-background-color;
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
		.page-body{
			flex: 1;
			padding: 0 @page-padding @page-padding;
			.module-block{
				align-items: center;
				.row{
					width: 100%;
					display: flex;
					align-items: center;
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
		.input-wrapper{
			display: flex;
			gap:@page-padding;
			padding: @page-padding;
			background-color: @module-background-color;
			align-items: center;
			.chat-input{
				background-color: @page-background-color;
				flex: 1;
				height: @middle-avater;
				border-radius: @middle-avater;
			}
			.icon-wrapper{
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 50%;
				padding: @small-margin;
				background-color: @page-background-color;
			}
		}
	}
</style>
