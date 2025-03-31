<template>
	<view class="page-wrapper">
		<NavigatorTitleComponent title="重置密码"/>
		<view class="page-body">
			<view class="module-block module-block-column">

				<view class="login-input-wrapper">
					<image :src="icon_user_active" class="icon-login"/>
					<input type="text" v-model="code" class="login-input" placeholder="请输入验证码"/>
				</view>

				<view class="login-input-wrapper">
					<image :src="icon_password" class="icon-login"/>
					<input type="password" v-model="password" class="login-input" placeholder="请输入密码"/>
				</view>

				<view class="login-input-wrapper">
					<image :src="icon_password" class="icon-login"/>
					<input type="password" v-model="confirmPassword" class="login-input" placeholder="请输入确定密码"/>
				</view>


				</view>
				<view class="login-btn" @click="useSumbit">提交</view>
		</view>
		
	</view>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import NavigatorTitleComponent from '../components/NavigatorTitleComponent.vue';
	import { resetPasswordService } from '../service';
	import { useStore } from '../stores/useStore'
	import {httpRequest} from '../utils/HttpUtils';
	import icon_user_active from "../../static/icon_user_active.png";
	import icon_password from "../../static/icon_password.png"
	import { onLoad } from '@dcloudio/uni-app'; 

	const password = ref<string>("")
	const confirmPassword = ref<string>("");
	const code = ref<number>();

	const store = useStore()
	let email:string = ""

	onLoad((option)=>{
		email = decodeURIComponent(option!.email) as string
	})

	const useSumbit = () => {
		if(!code.value){
			uni.showToast({
				duration:2000,
				position:'center',
				title:'请输入验证码'
			})
		}else if(!password.value.trim()){
			uni.showToast({
				duration:2000,
				position:'center',
				title:'密码不能为空'
			})
		}else if(!confirmPassword.value.trim()){
			uni.showToast({
				duration:2000,
				position:'center',
				title:'确定密码不能为空'
			})
		}else if(password.value != confirmPassword.value){
			uni.showToast({
				duration:2000,
				position:'center',
				title:'密码和确定密码不一致'
			})
		}else{
			// 重置密码，email:邮箱，password:新密码，code:验证码
			resetPasswordService(email,password.value,code.value).then((res)=>{
				if(res.data !== null){// 重置密码成功
					uni.showToast({// 弹出提示
						duration:2000,
						position:'center',
						title:'重置密码成功'
					});
					store.setUserData(res.data);// 把用户信息保存到全局状态管理器中
					store.setToken(res.token);// 把token保存到全局状态管理器中
					uni.setStorage({key:'token',data:res.token});// 把token保存到缓存中
					httpRequest.setToken(res.token);// 设置请求头的token值
					uni.redirectTo({url: '../pages/MusicIndexPage'});// 重定向到首页
				}else{// 重置密码失败
					uni.showToast({
						duration:2000,
						position:'center',
						title:'重置密码失败'
					});
				}
			})
		}
	}
</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
	.page-wrapper{
		.page-body{
			padding: 0 @page-padding;
		}
		.module-block{
			align-items: center;
			.login-input-wrapper{
				margin-top: @page-padding;
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
</style>
