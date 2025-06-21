<template>
	<view class="page-wrapper">
		<view class="page-header">
			<image class="icon-back" @click="useBack" :src="icon_back"/>
			<text class="my-favorite">当前接入模型：{{ activeModel?.modelName }}</text>
			<view class="menu-wrapper">
				<image class="icon-small icon-record" @click="onShowMenu" :src="icon_menu"/>
				<template v-if="showMenu">
					<view class="menu-box" >
						<view class="menu-arrow"></view>
						<view class="menu-list">
							<view class="menu-item" @click="onUploadDoc">上传文档</view>
							<view class="menu-line"></view>
							<view class="menu-item" @click="onShowMyDoc">我的文档</view>
							<view class="menu-line"></view>
							<view class="menu-item" @click="onShowHistory">会话记录</view>
						</view>
					</view>
					<view class="menu-mask" @click="onHideMenu"></view>
				</template>
			</view>
			
		</view>
		<view class="page-body">
			<scroll-view class="scroll-view" scroll-y :show-scrollbar="false" :scroll-top="scrollTop" @scroll="onScroll">
				<view class="chat-list">
					<template v-for="item,index in chatList" :key="'chat'+index">
						<view class="chat-wrapper">
							<template v-if="item.position === PositionEnum.LEFT">
								<image :src="icon_ai" class="icon-middle"/>
								<view class="chat-text chat-prompt">
									<view class="icon-angle icon-angle-left"></view>
									<view  class="think-text" v-if="!item.thinkContent && !item.responseContent">
										<text>正在思考中</text>
									</view>
									<template v-else>
										<view class="think-text" v-if="item.thinkContent">
											<text>
												{{ item.thinkContent.replace(/^(<think>)[\s\s\n]?|(<\/think>[\s\S\n]?)$/gi,"") }}
											</text>
										</view>
									
										<!-- 正式回答黑色区块 -->
										<view class="response-box">
											<text>{{ item.responseContent }}</text>
										</view>
									</template>
								</view>
								
							</template>
							<template v-else>
								<view class="chat-prompt-wrapper">
									<view class="chat-prompt">
										<view class="icon-angle icon-angle-right"></view>
									<text>{{ item.text }}</text>
								</view>
								</view>
								
								<AvaterComponent/>
							</template>
						</view>
					</template>
					
				</view>
			</scroll-view>
		</view>
		<view class="input-wrapper">
			<image :src="icon_chat" class="icon-middle icon_send" @click="onCreateNewChat"/>
			<input class="chat-input" placeholder="有问题，尽管问" v-model="inputValue">
			<view class="icon-wrapper">
				<image v-show="isCompleted" :src="icon_send" class="icon-middle icon_send" @click="onSend"></image>
				<view class="icon-sending" v-show="!isCompleted"></view>
			</view>
		</view>
		<view class="side-wrapper" v-show="showHistory">
			<view class="history-wrapper">
				<scroll-view class="history-scroll-view" scroll-y :show-scrollbar="false" @scrolltolower="onScrolltolower">
					<view class="history-list">
						<view class="chat-item" :key="items.timeAgo" v-for="items in chatHistoryData">
							<text class="chat-time">{{ items.timeAgo }}</text>
							<text class="chat-content" @click="onChat(item)" :key="'chat-content'+index" v-for="item,index in items.list">{{ item[0].prompt }}</text>
						</view>
					</view>
				</scroll-view>
			</view>
			<view class="side-mask" @click="onClose"></view>
		</view>
	</view>
</template>

<script setup lang="ts">
    import { reactive, ref, onBeforeUnmount, onMounted } from 'vue';
	import icon_back from '../../static/icon_back.png';
	import icon_send from '../../static/icon_send.png';
	import icon_menu from '../../static/icon_menu.png';
	import icon_ai from '../../static/icon_ai.png';
	import icon_chat from '../../static/icon_chat.png';
	import AvaterComponent from '../components/AvaterComponent.vue';
	import type { ChatHistoryType, ChatType, ChatStructure, ChatModelType, GroupedByChatIdType,FileType,FileItem,UploadFile,UploadResponse} from '../types';
    import { PositionEnum } from '../enum';
	import { formatTimeAgo, generateSecureID } from "../utils/util";
	import { HOST, PAGE_SIZE } from '../common/constant';
	import api from '@/api';
	import { getChatHistoryService, getModelListService, generateVectorService }from "../service";
	import { useStore } from "../stores/useStore";
	
	// 响应式状态
	let socketTask: UniApp.SocketTask | null = null; // WebSocket 实例
	const isCompleted = ref<boolean>(true);
	const chatHistoryData = reactive<Array<ChatStructure>>([]);
	const pageNum = ref<number>(1);
	const showHistory = ref<boolean>(false);
	const total = ref<number>(0);
	let chatId:string = ""
	const inputValue = ref<string>("");
	const store = useStore();
	const scrollTop = ref<number>(0);
	const activeModel = ref<ChatModelType|null>(null);
	const showMenu = ref<boolean>(false);
	const chatList = reactive<Array<ChatType>>([
		{
			responseContent:"你好，我是智能音乐助手小吴同学，请问有什么可以帮助您？",
			position: PositionEnum.LEFT
		}
	]);
	const chatModelList = reactive<Array<ChatModelType>>([]);
	const fileInput = ref<HTMLInputElement | null>(null)
	// 支持的MIME类型映射
    const supportedMimeTypes = {
      'txt': 'text/plain',
      'pdf': 'application/pdf'
    }
	// 支持的扩展名
	
    const supportedExtensions = Object.keys(supportedMimeTypes) as FileType[]
    /**
	 * @author: wuwenqiang
	 * @description: 获取模型列表
	 * @date: 2025-06-02 21:45
	 */
	getModelListService().then((res)=>{
		chatModelList.push(...res.data);
		activeModel.value = res.data[0];
	});

    /**
	 * @author: wuwenqiang
	 * @description: 发送
	 * @date: 2025-05-10 22:13
	 */
	const onSend = async() => {
		if(inputValue.value.trim()){
			chatList.push({
				text:inputValue.value.trim(),
				position:PositionEnum.RIGHT
			});
			if(!chatId)chatId = generateSecureID();
			const item:ChatType = {
				text:"",
				position:PositionEnum.LEFT,
				thinkContent:"",
				responseContent:"",
				start:false
			}
			chatList.push(item);
			const payload = {
				modelId: activeModel.value?.id,
				token: store.token, // 替换为实际用户ID
				chatId, // 替换为实际聊天ID
				prompt: inputValue.value.trim(),
				files: [] // 如果需要上传文件，请根据实际情况调整
			};
			if(!socketTask){
				await connectWebSocket();
			}
			socketTask?.send({
				data: JSON.stringify(payload),
				success: () => {
					console.log('消息发送成功');
					inputValue.value = "";
					isCompleted.value = false;
				},
				fail: (err) => {
					console.error('消息发送失败:', err);
				}
			});
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

	/**
	 * @description: 加载历史记录
	 * @date: 2024-05-10 22:10
	 * @author wuwenqiang
	 */
	const useChatHistory = () => {
		chatHistoryData.length = 0;
		getChatHistoryService(pageNum.value,PAGE_SIZE).then((res) => {
			total.value = res.total;
			const chatIdGroud:GroupedByChatIdType = {};
			res.data.forEach((item)=>{
				item.timeAgo = formatTimeAgo(item.createTime);
				if(!chatIdGroud[item.chatId]){
					chatIdGroud[item.chatId] = [];
				}
				chatIdGroud[item.chatId].push(item)
			});
			for(let key in chatIdGroud){
				chatIdGroud[key].reverse();
				const timeAgo:string = chatIdGroud[key][0].timeAgo;
				let items = chatHistoryData.find((item)=>item.timeAgo === timeAgo);
				if(!items){
					items = {
						timeAgo,
						list:[]
					}
					chatHistoryData.push(items)
				}
				items?.list.unshift(chatIdGroud[key])
			}
		});
	}

	/**
	 * @description: 展示历史记录
	 * @date: 2025-05-18 12:29
	 * @author wuwenqiang
	 */
	const onShowHistory = ()=>{
		showHistory.value = true;
		showMenu.value = false;
		pageNum.value = 1;
		useChatHistory();
	}

	/**
	 * @description: 展示菜单
	 * @date: 2025-06-21 12:56
	 * @author wuwenqiang
	 */
	const onShowMenu = () =>{
		showMenu.value = true;
	}

	/**
	 * @description: 展示菜单
	 * @date: 2025-06-21 12:56
	 * @author wuwenqiang
	 */
	const onHideMenu = () =>{
		showMenu.value = false;
	}

	/**
	 * @description: 滚动加载历史记录
	 * @date: 2024-05-18 12:29
	 * @author wuwenqiang
	 */
	const onScrolltolower = ()=>{
		if(total.value > pageNum.value * PAGE_SIZE){
			useChatHistory();
		}
	}

	/**
	 * @description: 滚动加载历史记录
	 * @date: 2024-05-18 12:29
	 * @author wuwenqiang
	 */
	const onChat = (chatHistoryList:Array<ChatHistoryType>)=>{
		chatList.length = 0;
		showHistory.value = false;
		chatId = chatHistoryList[0].chatId;
		chatHistoryList.forEach((item)=>{
			chatList.push({
				text:item.prompt,
				position:PositionEnum.RIGHT,
			});
			chatList.push({
				text:"",
				start:true,
				position:PositionEnum.LEFT,
				thinkContent: item.thinkContent,
				responseContent: item.responseContent
			});
		})
		console.log(JSON.parse(JSON.stringify(chatList)))
	}	

	const connectWebSocket = () => {
		return new Promise((resolve,reject)=>{
			socketTask = uni.connectSocket({
				url: `${HOST.replace(/http[s]?/,'ws')}${api.chatWs}`,
				success: (res) => {
					console.error('WebSocket 连接成功:', res);
					
				},
				fail: (err) => {
				console.error('WebSocket 连接失败:', err);
				}
			});

			socketTask.onOpen(() => {
				resolve(null)
				console.log('WebSocket 连接已建立');
			});

			socketTask.onMessage(({data}) => {
				if(data == "[completed]"){
					return isCompleted.value = true;
				}
				chatList[chatList.length - 1].start = true;
				// 匹配所有形式的 `<think>` 标签（包括属性和自闭合）
				const regex = /<think>([\s\S]*?)<\/think>/gi
				if(regex.test(chatList[chatList.length - 1].thinkContent || "")){
					chatList[chatList.length - 1].responseContent += data;
				}else{
					chatList[chatList.length - 1].thinkContent += data;
				}
				scrollTop.value+=10
			});

			socketTask.onError((err) => {
				console.error('WebSocket 错误:', err);
			});

			socketTask.onClose(() => {
				console.log('WebSocket 连接已关闭');
			});
		})
      
    };

	/**	
	 * @description: 创建新会话
	 * @date: 2025-06-21 12:19
	 * @author wuwenqiang
	 */	
	const onCreateNewChat = () => {
		chatList.length = 0;
		chatId = "";
		chatList.push({
			responseContent:"你好，我是智能音乐助手小吴同学，请问有什么可以帮助您？",
			position: PositionEnum.LEFT
		});
	}

	/**	
	 * @description: 上传文档
	 * @date: 2025-06-21 12:58
	 * @author wuwenqiang
	 */	
    const onUploadDoc = () => {
		uni.chooseFile({
			count: 9,
			type: 'file',
			extension: supportedExtensions,
			success: async (res: { tempFiles: UploadFile[] }) => {
			// 过滤出符合类型的文件
			const validFiles = res.tempFiles.filter(file => {
				const ext = file.name.split('.').pop()?.toLowerCase() as FileType | undefined;
				return ext && supportedExtensions.includes(ext);
			});

			if (validFiles.length === 0) {
				uni.showToast({
				icon: 'none',
				title: '未选择有效的txt或pdf文件',
				duration: 2000
				});
				return;
			}

			// 显示加载中
			uni.showLoading({
				title: '上传中...',
				mask: true
			});

			try {
				uni.addInterceptor('uploadFile', {
					invoke(options) {
						options.header = {
							...options.header,
							'Authorization': `Bearer ${store.token}`
						};
					}
				});
				// 使用Promise.all并行上传所有文件
				const uploadPromises = validFiles.map(file => {
					return new Promise<void>((resolve, reject) => {
						uni.uploadFile({
						url: HOST + api.generateVector, // 替换为你的上传接口URL
						filePath: file.path,
						name: 'file',
						formData: {
							filename: file.name
						},
						success: (uploadRes) => {
							try {
							const data: UploadResponse = JSON.parse(uploadRes.data);
							if (data.code !== 200) {
								reject(new Error(data.message || '上传失败'));
							} else {
								resolve();
							}
							} catch (e) {
								reject(new Error('解析响应数据失败'));
							}
						},
						fail: (err) => {
							reject(new Error(err.errMsg || '上传请求失败'));
						}
						});
					});
				});

				// 等待所有文件上传完成
				await Promise.all(uploadPromises);
				
				// 上传成功提示
				uni.showToast({
					title: `成功上传${validFiles.length}个文件`,
					icon: 'success',
					duration: 2000
				});
			} catch (error) {
				uni.showToast({
					title: error instanceof Error ? error.message : '上传过程中出错',
					icon: 'none',
					duration: 2000
				});
			} finally {
				uni.hideLoading();
			}
			},
			fail: (err) => {
				uni.showToast({
					duration: 2000,
					position: 'center',
					title: "上传文档失败",
					icon: 'none'
				});
			}
		});
		};


	/**
	 * 生成带格式的 Base64 编码数组
	 * @param files 文件列表
	 * @returns Promise<string[]> 每个元素是带格式的 Base64 字符串
	 */
	const generateBase64 = (files: FileItem[]): Promise<string[]> => {
		// 创建一个 Promise 数组，每个 Promise 处理一个文件
		const promises = files.map((file) => {
			return new Promise<string>((resolve, reject) => {
				// 在非 Web 平台（如小程序/App）中，使用 uni.getFileSystemManager
				console.log("file",file.file)
				if (uni.getFileSystemManager) {
					const fs = uni.getFileSystemManager();
					fs.readFile({
					filePath: file.path,
					encoding: 'base64',
					success: (res) => {
						// 手动拼接格式前缀（小程序可能无法获取 file.type，需根据扩展名推断）
						const mimeType = file.type || getMimeTypeFromExtension(file.name);
						const base64WithFormat = `data:${mimeType};base64,${res.data}`;
						resolve(base64WithFormat);
					},
					fail: (err) => {
						console.error(`读取文件 ${file.name} 失败:`, err);
						reject(err);
					}
					});
				} 
				// 在 Web 平台中，使用 FileReader API
				else if (typeof FileReader !== 'undefined') {
					const reader = new FileReader();
					reader.onload = (event) => {
					// 直接使用 readAsDataURL 生成的完整 Base64（带格式）
						const base64WithFormat = event.target?.result as string;
						resolve(base64WithFormat);
					};
					reader.onerror = (error) => {
						console.error(`读取文件 ${file.name} 失败:`, error);
						reject(error);
					};
					reader.readAsDataURL(file.file);
				} else {
					reject(new Error('不支持的平台或文件格式'));
				}
			});
		});

		return Promise.all(promises);
	};

	/**
	 * 根据文件名后缀推断 MIME 类型（用于小程序端）
	 * @param filename 文件名（如 "test.pdf"）
	 * @returns string MIME 类型（如 "application/pdf"）
	 */
	const getMimeTypeFromExtension = (filename: string): string => {
		const extension = filename.split('.').pop()?.toLowerCase();
		switch (extension) {
			case 'pdf':
				return 'application/pdf';
			case 'txt':
				return 'text/plain';
			default:
				return 'application/octet-stream'; // 默认二进制流
		}
	};

	/**	
	 * @description: 展示我的文档
	 * @date: 2025-06-21 12:58
	 * @author wuwenqiang
	 */
	const onShowMyDoc = () => {

	}

	const onClose = ()=>{
		showHistory.value = false;
	}

	const onScroll = (event : Event)=>{
		scrollTop.value = event.detail.scrollTop
	}

	// 在组件卸载前断开 WebSocket 连接
    onBeforeUnmount(() => {
      if (socketTask) {
        socketTask.close({
          success: () => {
            console.log('WebSocket 连接已关闭');
          }
        });
      }
    });

	/**	
	 * @description: web端文件选择
	 * @date: 2025-06-21 18:49
	 * @author wuwenqiang
	 */
	const onFileChange = async (event:Event)=>{
      const input = event.target as HTMLInputElement
      if (input.files && input.files.length > 0) {
        // 将FileList转换为数组
		const files = Array.from(input.files);
		
		// 生成Base64数组
		const base64Array = await Promise.all(
			files.map(file => readFileAsBase64(file))
		);

		generateVectorService(base64Array);
      }
	}
	
	/**	
	 * @description: web端将单个文件读取为Base64
	 * @date: 2025-06-21 18:47
	 * @author wuwenqiang
	 */
	const readFileAsBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		
		reader.onload = (event) => {
		// 移除可能的数据URL前缀（如"data:image/png;base64,"）
		const base64 = (event.target?.result as string).split(',')[1] || 
						(event.target?.result as string);
		resolve(base64);
		};
		
		reader.onerror = (error) => {
			reject(new Error(`读取文件 ${file.name} 失败`));
		};
		
		reader.readAsDataURL(file);
	});
	};

</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
	.page-wrapper{
		position: relative;
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
			.icon-record{
				opacity: 0.5;
			}
			.menu-wrapper{
				width: @small-icon-size;
				height: @small-icon-size;
				position: relative;
				.menu-box{
					position: absolute;
					z-index: 2;
					width: @popup-menu-width;
					background-color: @pop-background-color;
					right: -@arrow-size;
					top: calc(@small-icon-size + @arrow-size);
					border-radius: @module-border-radius;
					.menu-arrow{
						position: absolute;
						width: 0;
						height: 0;
						top: @arrow-size;
						border-top: @arrow-size solid transparent;   
						border-bottom: @arrow-size solid @pop-background-color; 
						border-right:@arrow-size solid transparent;;
						border-left:@arrow-size solid transparent;
						z-index: 1;
						right: calc(@arrow-size * 2);
						top: calc(@arrow-size * -2);
					}
					.menu-list{
						padding: @page-padding;
						display: flex;
						flex-direction: column;
						color:@white-background-color;
						gap:@page-padding;
						.menu-line{
							height: 1rpx;
							background-color: @pop-line-color;
						}
						.menu-item{

						}
					}
				}
				.menu-mask{
					width: 100vw;
					height: 100vh;
					z-index: 1;
					left: 0;
					top:0;
					position: fixed;
					background-color: transparent;
				}
			}
		}
		.page-body{
			flex: 1;
			height: 0;
			.scroll-view{
				height: 100%;
				.chat-list{
					display: flex;
					flex-direction: column;
					gap: @page-padding;
					padding: @page-padding;
					.chat-wrapper{
						display: flex;
						gap:@page-padding;	
						.chat-prompt-wrapper{
							flex: 1;
							display: flex;
							justify-content: flex-end;
							.chat-prompt{
								max-width: 100%;
								background-color: @module-background-color;
								padding: @page-padding;
								border-radius: @btn-border-radius;
								position: relative;
							}
						}
						.chat-text{
							flex: 1;
							background-color: @module-background-color;
							padding: @page-padding;
							border-radius: @btn-border-radius;
							position: relative;
							
							.think-text{
								color:@sub-title-color;
							}
						}
						.icon-angle{
							position: absolute;
							width: 0;
							height: 0;
							top: 15rpx;
							border-top: 15rpx solid transparent;   
							border-bottom: 15rpx solid transparent; 
							&.icon-angle-left{
								left: -15rpx;
								border-right: 15rpx solid @module-background-color;
							}
							&.icon-angle-right{
								right: -15rpx;
								border-left: 15rpx solid @module-background-color;
							}
						}
					}
				}
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
				padding-left: @page-padding;
				box-sizing: border-box;
			}
			.icon-wrapper{
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 50%;
				background-color: @page-background-color;
				width:  @middle-avater;
				height:  @middle-avater;
				.icon-sending{
					width: 35%;
					height: 35%;
					border-radius: @btn-border-radius;
					background-color: @sub-title-color;
				}
			}
		}
		.side-wrapper{
			height: 100vh;
			width: 100vw;
			position: absolute;
			display: flex;
			.history-wrapper{
				width: 70%;
				background-color: @module-background-color;
				.history-scroll-view{
					height: 100vh;
					.history-list{
						padding: @page-padding;
						display: flex;
						flex-direction: column;
						gap: calc(@page-padding * 2);
						.chat-item{
							display: flex;
							flex-direction: column;
							gap:  @page-padding;
							.chat-time{
								color: @sub-title-color;
							}
							.chat-content{
								display: block;
								width: 100%;
								overflow: hidden;
								text-overflow: ellipsis;
								white-space: nowrap;
							}
						}
						
					}
				}
			}
			.side-mask{
				flex: 1;
				background-color: @black-background-color;
				opacity: 0.5;
			}
		}
	}
</style>
