import {HOST} from '../common/constant';
import type { RequestTask } from '@dcloudio/types'
import axios from 'axios';
import type {ChatType} from '../types'; 
axios.defaults.responseType = 'text'; // 或者 'stream'，取决于你的后端如何处理流

enum StatusEnum {
    FAIL="FAIL",
    SUCCESS="SUCCESS",
}


/**
 * @description: HTTP请求方法枚举
 */
enum HttpMethod {
	GET = "GET",
	POST = "POST",
	OPTIONS = "OPTIONS",
	PUT = "PUT",
	DELETE = "DELETE"
}

/**
 * @description: HTTP请求配置
*/
interface RequestConfig {
	/** API路径 */
	url?: string
	/** Method类型 */
	method?: HttpMethod
	/** 接口返回数据 */
	data?: any
	/** Header头部 */
	header?: object
	/** 返回的数据格式 */
	dataType?: string
	/** 请求报错时，是否弹出message提示（默认弹出）*/
	noShowMsg?: boolean
	enableChunked?:boolean
}

/**
 * @description: 声明业务数据类型
*/
export type MyAwesomeData<T> = {
	data: T,
    token: string,
    status:string,
    msg:string,
    total:number
}

class HttpRequest {
    private static instance: HttpRequest;
    private token: string = '';
	private constructor() { }
	/** 请求函数(单例模式)
	*
	* **注意：**
	* `method`需使用`HttpMethod`枚举类，切勿自行定义
	*
	* **示例代码**
	* ```js
	 HttpRequest.getInstance().request({
		 url: "/Api",
		 method: HttpMethod.GET
	 })
	* ```
    */
    public setToken(token:string){
        this.token = token;
    }

	public getToken():string{
		return this.token;
	}

	public static getInstance(): HttpRequest {
		if (!this.instance) {
			this.instance = new HttpRequest()
		}
		return this.instance;
	}

	// 处理请求异常状态码
	private handerErrorStatus(statusCode: number, requestConfig: RequestConfig) {
		let msg = "服务找不到"
		if (statusCode === 502 || statusCode === 503) {
			msg = "服务器开小差了~"
		}
		!requestConfig.noShowMsg && uni.showToast({
			title: `${msg}，错误码：${statusCode}`,
			icon: "none"
		})
		return msg
	}

	// 处理请求异常
	private handerError(err: { errMsg: string }, requestConfig: RequestConfig) {
		let msg = `请求异常`
		if (/timeout/.test(err.errMsg)) {
			msg = "请求超时"
		}
		!requestConfig.noShowMsg && uni.showToast({
			title: msg,
			icon: "none"
		});
		return msg
	}

	// 服务器接口请求
	public request<T>(requestConfig: RequestConfig): Promise<MyAwesomeData<T>> {
		return new Promise((resolve, reject) => {
			// 默认header
			const header = {
                "content-type": "application/json",
                "Authorization": this.token
			}
			uni.request({
				method: requestConfig.method,
				url: HOST + requestConfig.url,
				data: requestConfig.data,
				header: Object.assign(header, requestConfig?.header),
				dataType: !requestConfig.dataType ? "json" : "其他",
				enableChunked: requestConfig.enableChunked,
				success:  (res) => {
					// console.log("发送返回:", res) //res:{cookies, data, header, statusCode}
					const code = res.statusCode || -404;
					const respond:MyAwesomeData<T> = res.data as MyAwesomeData<T>;
					/** 接口请求成功*/
					if (code == 200 && respond.status === StatusEnum.SUCCESS) {
						resolve(respond)
					} else if (code === 401) {
						// 未授权
						!requestConfig.noShowMsg && uni.showModal({
							title: "登录失效",
							content: "登录失效，请重新登录",
						}).then(resModa => {
							if (resModa.confirm) { }
						})
						reject({ code, msg: "未登录", data: res.data })
					} else {
						//非200及401状态码-数据处理
						const errMsg = this.handerErrorStatus(code, requestConfig)
						reject({ code, msg: respond.msg || errMsg || res.errMsg, data:res.data })
					}
				},
				fail: err => {
					let msg = this.handerError(err, requestConfig)
					reject({ msg })
				}
			})
		})
	}

	/**
	 * @description: get请求函数
	 * @param {string} url 请求地址
	 * @param {Object} data 请求参数
	 * @param {RequestConfig} OtherConfig request其他配置
	 * @return {*}
	 */
	public get<T>(url: string, data?: Object, OtherConfig?: RequestConfig):Promise<MyAwesomeData<T>> {
		return this.request<T>({ method: HttpMethod.GET, url, data, ...OtherConfig })
	}

	/**
	 * @description: post请求函数
	 * @param {string} url 请求地址
	 * @param {Object} data 请求参数
	 * @param {RequestConfig} OtherConfig request其他配置
	 * @return {*}
	 */
	public post<T>(url: string, data?: Object|Array<any>, OtherConfig?: RequestConfig) {
		return this.request<T>({ method: HttpMethod.POST, url, data, ...OtherConfig })
	}

	/**
	 * @description: delete请求函数
	 * @param {string} url 请求地址
	 * @param {Object} data 请求参数
	 * @param {RequestConfig} OtherConfig request其他配置
	 * @return {*}
	 */
	public delete<T>(url: string, data?: Object, OtherConfig?: RequestConfig):Promise<MyAwesomeData<T>> {
		return this.request<T>({ method: HttpMethod.DELETE, url, data, ...OtherConfig })
	}

	/**
	 * @description: put请求函数
	 * @param {string} url 请求地址
	 * @param {Object} data 请求参数
	 * @param {RequestConfig} OtherConfig request其他配置
	 * @return {*}
	 */
	public put<T>(url: string, data?: Object|Array<any>, OtherConfig?: RequestConfig):Promise<MyAwesomeData<T>> {
		return this.request<T>({ method: HttpMethod.PUT, url, data, ...OtherConfig })
	}
}

export const httpRequest = HttpRequest.getInstance()

// 封装流式请求函数
export const streamRequest = (url:string):RequestTask<string> => {
	// return new Promise((resolve, reject) => {
		// const requestTask = uni.request({
		// url,
		// method: "GET",
		// header: {
		// 	"Content-Type": "application/json",
		// 	"Accept": "text/event-stream", // 声明接受流式响应
		// 	"Authorization": `Bearer ${httpRequest.getToken()}`
		// },
		// responseType: "text", // 或 "arraybuffer" 处理二进制流
		// enableChunked: true, // 开启分块传输
		// success: (res) => resolve(res),
		// fail: (err) => reject(err)
		// });

		// // 监听分块数据到达事件
		// requestTask.onChunkReceived((res) => {
		// 	console.log("接收分块数据:", res);
		// 	// 处理数据（如追加到页面）
		// });

		// // 监听请求头接收完成事件
		// requestTask.onHeadersReceived((headers) => {
		// 	console.log("响应头:", headers);
		// });
		return uni.request({
			url, // 替换为你的实际接口地址
			method: 'GET', // Spring接口默认使用GET，如需POST需修改
			enableChunked: true,
			header: {
				"Accept": "text/event-stream", // 声明接受流式响应
			  'Authorization':  `Bearer ${httpRequest.getToken()}`, // 添加Bearer认证头
			  'Content-Type': 'application/json' // 根据实际情况设置
			},

			fail: (err) => {
			  reject(err);
			}
		  });
	// });
};

export const fetchApi = (url:string,chatItem:ChatType)=>{ 
	return axios.get(url, {
		responseType: 'text', // 或者 'stream'，具体取决于你的后端实现
		headers: {
			'Accept': 'text/event-stream', // 对于 SSE (Server-Sent Events) 流
			'Authorization':  `Bearer ${httpRequest.getToken()}`, // 添加Bearer认证头
		},
		onDownloadProgress: (progressEvent) => {
			// 处理流式数据，例如更新UI显示接收到的文本
			const data = progressEvent.target.response;
			if (data) {
				// 处理数据，例如解析事件流中的消息
				const lines = data.split('\n\n'); // SSE通常以双换行符分隔事件
				lines.forEach((line) => {
					console.log(line);
					chatItem.responseContent = line;
					if (line.trim() !== '') {
						// const event = JSON.parse(`{${line.split('\n').slice(1).join('')}}`); // 解析事件数据
						// console.log(event.data); // 输出或处理数据内容
						// 更新UI等操作
					}
				});
			}
		}
	}).then(response => {
		// 完整的响应处理（如果有的话）
		console.log("response",response)
	}).catch(error => {
		console.error('Error during request:', error);
	});
	
}
