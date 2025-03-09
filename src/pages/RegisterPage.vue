<template>
	<view class="page-wrapper">
		<NavigatorTitleComponent title="注册"/>
		<scroll-view scroll-y show-scrollbar="false" class="scroll-view">
			<view class="module-block module-block-column">
				<view class="row">
					<view class="title">
						<text class="require">*</text>
						<text>账号</text>
					</view>
					<input @blur="vertify('userAccount')" class="input" v-model="userData.userAccount" placeholder="请输入账号名称"/>
				</view>
				<view class="row">
					<view class="title">
						<text class="require">*</text>
						<text>密码</text>
					</view>
					<input type="password" class="input" @blur="vertify('password')" v-model="userData.password" placeholder="请输入6-18位的密码"/>
				</view>
				<view class="row">
					<view class="title">
						<text class="require">*</text>
						<text>确认密码</text>
					</view>
					<input type="password" @blur="vertify('confirmPassowrd')" v-model="confirmPassowrd" class="input" placeholder="请输入6-18位的确认密码"/>
				</view>
				<view class="row">
					<view class="title">
						<text class="require">*</text>
						<text>昵称</text>
					</view>
					<input class="input" v-model="userData.username" @blur="vertify('username')" placeholder="请输入昵称"/>
				</view>
				<view class="row">
					<view class="title">
						<text class="require">*</text>
						<text>邮箱</text>
					</view>
					<input class="input" @blur="vertify('email')" v-model="userData.email" placeholder="请输入邮箱"/>
				</view>
				<view class="row">
					<view class="title">
						<text>区域</text>
					</view>
					<input class="input" v-model="userData.region" placeholder="请输入区域"/>
				</view>
				<view class="row">
					<view class="title">
						<text>个性签名</text>
					</view>
					<input class="input" v-model="userData.sign" placeholder="请输入个性签名"/>
				</view>
			</view>

			<view class="login-btn" @click="useRegister">注册</view>
		</scroll-view>
		<OptionsDialog ref="sexOptionsDialog" @onCheck= "useCheckSex" :options="[{value:0,text:'男'},{value:1,text:'女'}]"/>
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive } from 'vue';
	import type { UserDataType } from '../types';
	import { registerService, vertifyUserService } from '../service';
	import OptionsDialog from '../components/OptionsDialog.vue';
	import { EMAIL_REG } from "../common/constant";
 	import { useStore } from '../stores/useStore'
	import {httpRequest} from '../utils/HttpUtils';
	import NavigatorTitleComponent from '../components/NavigatorTitleComponent.vue';

	const store = useStore();
	let loading:boolean = false;

	const sexOptionsDialog = ref<null | InstanceType<typeof OptionsDialog>>(null);
	// 用户信息
	const userData = reactive<UserDataType>({
		userAccount: '',
		username: '',
		telephone: '',
		email: '',
		birthday: '',
		sex: 0,
		password: '',
		sign: '',
		region: ''
	});
	const confirmPassowrd = ref<string>('');// 企鹅人密码


	/**
	 * @author: wuwenqiang
	 * @description: 性别选择
	 * @date: 2024-01-19 23:20
	 */
	const useEditSex = () => {
		sexOptionsDialog.value?.$refs.popup.open('top')
	}

	/**
	 * @author: wuwenqiang
	 * @description: 性别选择
	 * @date: 2024-01-16 22:49
	 */
	const useCheckSex = (sex:number) => {
		userData.sex = sex
	}

	/**
	 * @author: wuwenqiang
	 * @description: 校验账号和密码
	 * @date: 2024-01-20 00:17
	 */
	const useCheckUser = (): Promise<boolean> => {
		return vertifyUserService(userData).then((res)=>{
			if(res.data > 0){
				uni.showToast({
					title: res.msg,
					icon: "none"
				});
				return false;
			}
			return true;
		});
	}

	/**
	 * @author: wuwenqiang
	 * @description: 校验账号和密码
	 * @date: 2025-01-22 21:49
	 */
	const vertify = (field:string)=>{
		if(field == "userAccount" && userData.userAccount.trim() === ""){
			uni.showToast({
				title: '账号不能为空',
				icon: "none"
			});
		}else if(field == "userAccount" && userData.userAccount.trim() !== ""){
			useCheckUser();
		}else if(field === "password" && userData.password.trim() === "" ){
			uni.showToast({
				title: '请输入密码',
				icon: "none"
			});
		}else if(field === "password" && userData.password.trim().length < 6){
			uni.showToast({
				title: '密码长度不能小于6位数',
				icon: "none"
			});
		}else if(field === "comfirmPassword" && confirmPassowrd.value.trim() === "" ){
			uni.showToast({
				title: '确认密码不能为空',
				icon: "none"
			});
		}else if(field === "comfirmPassword" && confirmPassowrd.value.trim() !== userData.password.trim() ){
			uni.showToast({
				title: '密码和确认密码不一致',
				icon: "none"
			});		
		}else if(field === "username" && userData.username.trim() === "" ){
			uni.showToast({
				title: '用户名不能为空',
				icon: "none"
			});
		}else if(field === "email" && userData.email.trim() === "" ){
			uni.showToast({
				title: '邮箱不能为空',
				icon: "none"
			});
		}else if(field === "email" && !EMAIL_REG.test(userData.email.trim())){
			uni.showToast({
				title: '邮箱格式错误',
				icon: "none"
			});
		}
	}

	/**
	 * @author: wuwenqiang
	 * @description: 注册
	 * @date: 2024-01-10 22:13
	 */
	const useRegister = async() => {
		if(!userData.userAccount){
			uni.showToast({
				title: '请输入账号',
				icon: "none"
			});
		}else if(!userData.password){
			uni.showToast({
				title: '请输入6-18位数字或者字母的密码',
				icon: "none"
			});
		}else if(!confirmPassowrd.value){
			uni.showToast({
				title: '请输入确认密码',
				icon: "none"
			});
		}else if(!userData.username){
			uni.showToast({
				title: '请输入昵称',
				icon: "none"
			});
		}else if(!userData.email){
			uni.showToast({
				title: '请输入邮箱',
				icon: "none"
			});
		}else if(userData.password !== confirmPassowrd.value){
			uni.showToast({
				title: '确认密码错误',
				icon: "none"
			});
		}else{
			if(loading)return;
			loading = true;
			const verify = await useCheckUser();
			if(verify){
				await registerService({...userData}).then((res)=>{
					store.setUserData(res.data)
					store.setToken(res.token)
					uni.setStorage({key:'token',data:res.token});
					httpRequest.setToken(res.token);
					uni.redirectTo({url: '../pages/MusicIndexPage'})
					uni.showToast({
						duration:2000,
						position:'center',
						title:'注册成功'
					})
				})
			}
			loading = false;
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
		background-color: @page-background-color;
		.scroll-view{
			flex: 1;
			padding: 0 @page-padding;
			box-sizing: border-box;
			/deep/.uni-scroll-view-content {
				height: auto;
				&::-webkit-scrollbar {
					display: none;
				}
			}
			.module-block{
				align-items: center;
				.row{
					width: 100%;
					display: flex;
					align-items: center;
					margin-top: @page-padding;
					border-bottom: 1rpx solid @page-background-color;
					&:first-child{
						margin-top:0;
					}
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
				margin:  @page-padding 0;
				background-color: @warn-color;
				color: @module-background-color;
				display: inline-block;
			}
		}
		
	}
</style>
