<template>
	<view class="page-wrapper">
		<NavigatorTitleComponent title="修改密码"/>
		<view class="module-block module-block-column">

			<view class="login-input-wrapper">
				<image :src="icon_password" class="icon-login"/>
				<input type="password" v-model="oldPassword" class="login-input" placeholder="请输入旧密码"/>
			</view>

			<view class="login-input-wrapper">
				<image :src="icon_password" class="icon-login"/>
				<input type="password" v-model="newPassword" class="login-input" placeholder="请输入新密码"/>
			</view>

			<view class="login-input-wrapper">
				<image :src="icon_password" class="icon-login"/>
				<input type="password" v-model="newConfirmPassword" class="login-input" placeholder="请输入新确定密码"/>
			</view>
		</view>
		<view class="login-btn" @click="useSumbit">提交</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import NavigatorTitleComponent from '../components/NavigatorTitleComponent.vue';
	import { updatePasswordService } from '../service';
	import icon_password from "../../static/icon_password.png";

	const newPassword = ref<string>("")
	const newConfirmPassword = ref<string>("");
	const oldPassword = ref<string>("");

	let loading:boolean = false;

	const useSumbit = () => {
		if(!newPassword.value){
			uni.showToast({
				duration:2000,
				position:'center',
				title:'请输入旧密码'
			})
		}else if(!newPassword.value.trim()){
			uni.showToast({
				duration:2000,
				position:'center',
				title:'新密码不能为空'
			})
		}else if(!newConfirmPassword.value.trim()){
			uni.showToast({
				duration:2000,
				position:'center',
				title:'确定密码不能为空'
			})
		}else{
			if(loading)return;
			uni.showLoading();
			//修改密码，oldPassword表示旧密码，newPassword表示新密码
			updatePasswordService(oldPassword.value,newPassword.value).then((res)=>{
				if(res.data > 0 ){// 修改密码成功，弹出提示
					uni.showToast({
						duration:2000,
						position:'center',
						title:'修改密码成功'
					});
					uni.navigateBack();// 返回上一层
				}else{
					uni.showToast({
						duration:2000,
						position:'center',
						title:'修改密码失败'
					});
				}
			}).catch((err)=>{// 修改密码失败
				uni.showToast({
					duration:2000,
					position:'center',
					title: err.msg
				});
			}).finally(()=>{
				loading = false;
				uni.hideLoading();
			})
		}
	}
</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
	.page-wrapper{
		.module-block{
			align-items: center;
			margin: @page-padding @page-padding 0;
			gap:@page-padding;
			.login-input-wrapper{
				display: flex;
				align-items: center;
				width: 100%;
				border: 1rpx solid @disable-text-color;
				padding: @page-padding;
				box-sizing: border-box;
				border-radius: @big-border-radius;
				.icon-login{
					width: @small-icon-size;
					height: @middle-icon-size;
				}
				.login-input{
					flex: 1;
					margin-left: @page-padding;
				}
			}

			.register-btn{
				text-align: center;
				width: 100%;
				border: 1rpx solid @disable-text-color;
				padding: @page-padding;
				box-sizing: border-box;
				border-radius: @big-border-radius;
				margin-top:  @page-padding;
				display: inline-block;
				background-color: transparent;
			}
		}
		.login-btn{
			text-align: center;
			margin: @page-padding;
			padding: @page-padding;
			box-sizing: border-box;
			border-radius: @big-border-radius;
			background-color: @warn-color;
			color: @module-background-color;
			display: inline-block;
		}
	}
</style>
