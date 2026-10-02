import { HOST } from "../common/constant";
import type { MusicType, ChatContentSegmentType } from "../types";
export const zerofull=(value:number):string|number=>{
    return value < 9 ? "0"+value:value
}

export const formatTime=(value:any):string=>{
    var date =new Date(value);
    var nowDate = new Date()
    let diff = Math.ceil((nowDate.getTime()-date.getTime())/1000);
    if(diff < 60){
        return "刚刚"
    }else if(diff < 60*60){
        return Math.ceil(diff/60) + "分前"
    }else if(diff < 60*60*24){
        return Math.ceil(diff/(60*60))+"小时前"
    }else if(diff < 60*60*24*30){
        return Math.ceil(diff/(60*60*24))+"天前"
    }else if(diff < 60*60*24*30*12){
        return Math.ceil(diff/(60*60*24*30))+"个月前"
    }
    const year = zerofull(date.getFullYear());
    const month = zerofull(date.getMonth()+1);
    const dates = zerofull(date.getDate());
    const hour = zerofull(date.getHours());
    const minutes = zerofull(date.getMinutes());
    const seconds = zerofull(date.getSeconds());
    return `${year}-${month}-${dates} ${hour}:${minutes}:${seconds}`
};

export const formatSecond=(value:number,showHour:boolean = false):string => {
	if(showHour){
		return `${zerofull(Math.floor(value / (60 * 60)))}:${zerofull(Math.floor(value % (60 * 60) / 60))}:${zerofull(Math.floor(value % (60 * 60) % 60))}`
	}else{
		return `${zerofull(Math.floor(value / 60))}:${zerofull(Math.floor(value % 60))}`
	}
};

export const getMusicCover = (cover:string) => /http[s]?:\/\//.test(cover) ? cover.replace('{size}', '480') : HOST + cover

/**
 * @description: 把 <music></music> 标签里的音乐列表字符串解析成音乐对象数组
 * @param {string} content 大模型返回的音乐列表字符串（JSON 数组，兼容单引号等非标准写法）
 * @return {Array<MusicType>} 音乐对象数组，解析失败时返回空数组
 * @date: 2026-09-30 22:00
 * @author wuwenqiang
 */
export const parseMusicList = (content:string):Array<MusicType> => {
	let text:string = (content || '').trim();
	// 去掉可能被 markdown 代码块包裹的标记
	text = text.replace(/^```[a-zA-Z]*\s*/, '').replace(/\s*```$/, '').trim();
	if(!text) return [];
	// 兼容单引号、python 的 True/False/None、尾随逗号这些非标准 JSON 写法
	const format = (value:string):string => value
		.replace(/'/g, '"')
		.replace(/\bTrue\b/g, 'true')
		.replace(/\bFalse\b/g, 'false')
		.replace(/\bNone\b/g, 'null')
		.replace(/,\s*([\]}])/g, '$1');
	let list:any = null;
	try{
		list = JSON.parse(text);
	}catch(e){
		try{
			list = JSON.parse(format(text));
		}catch(err){
			console.warn('音乐列表解析失败:', content);
			return [];
		}
	}
	// 兼容外层包裹了一层对象的情况，例如 { musicList: [...] }
	if(!Array.isArray(list) && list && typeof list === 'object'){
		const target:any = list.musicList || list.data || list.list;
		if(Array.isArray(target)) list = target;
	}
	if(!Array.isArray(list)) return [];
	// 过滤掉没有歌曲id的数据，避免播放、收藏、点赞时取不到歌曲；同时把 isLike、isFavorite 统一成 0/1 数字
	return list.filter((item:any) => item && item.id != null).map((item:any):MusicType => ({
		...item,
		isLike: item.isLike ? 1 : 0,
		isFavorite: item.isFavorite ? 1 : 0
	})) as Array<MusicType>;
}

/**
 * @description: 拆分大模型输出的正文，把 <music></music> 标签解析成音乐列表卡片片段，其余内容作为富文本片段
 * @param {string} content 大模型输出的正文
 * @param {boolean} isCompleted 该条消息是否已经生成完成：生成中不渲染未闭合的 <music>，避免露出半截 JSON
 * @return {Array<ChatContentSegmentType>} 拆分后的片段数组
 * @date: 2026-09-30 22:00
 * @author wuwenqiang
 */
export const parseChatContent = (content:string, isCompleted:boolean = true):Array<ChatContentSegmentType> => {
	const segments:Array<ChatContentSegmentType> = [];
	const text:string = content || '';
	const reg:RegExp = /<music\s*>([\s\S]*?)<\/music\s*>/gi;
	let lastIndex:number = 0;// 上一次匹配结束的位置
	let match:RegExpExecArray | null = null;
	while((match = reg.exec(text)) !== null){
		const prevText:string = text.slice(lastIndex, match.index);// <music> 标签前面的内容
		if(prevText.trim()) segments.push({ type:'text', content:prevText, musicList:[] });
		const musicList:Array<MusicType> = parseMusicList(match[1]);// 标签里的音乐列表
		if(musicList.length){
			segments.push({ type:'music', content:'', musicList });
		}else{
			segments.push({ type:'text', content:match[0], musicList:[] });// 解析失败时把原文展示出来，避免内容丢失
		}
		lastIndex = reg.lastIndex;
	}
	let rest:string = text.slice(lastIndex);// 剩余内容
	const unClosedIndex:number = rest.search(/<music\s*>/i);// 剩余内容里未闭合的 <music> 标签
	if(unClosedIndex !== -1 && !isCompleted) rest = rest.slice(0, unClosedIndex);// 生成中，丢弃半截音乐列表
	if(rest.trim()) segments.push({ type:'text', content:rest, musicList:[] });
	return segments;
}

export const generateSecureID = () => {
    const array = new Uint8Array(16); // 16 字节（128 位）
    window.crypto.getRandomValues(array); // 填充随机字节
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 32); // 截取前 32 位
  }

export const formatTimeAgo = (createTime:string)=> {
    // 获取当前时间和目标时间
    const now = new Date()
    const targetDate = new Date(createTime)
    
    // 计算时间差（毫秒）
    const diff = now.getTime() - targetDate.getTime();
    
    // 处理未来时间
    if (diff < 0) return '刚刚'
  
    // 计算各时间单位
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    // 计算精确的月份和年份差
    const targetYear = targetDate.getFullYear()
    const targetMonth = targetDate.getMonth()
    const targetDay = targetDate.getDate()
    const nowYear = now.getFullYear()
    const nowMonth = now.getMonth()
    const nowDay = now.getDate()
  
    let monthsDiff = (nowYear - targetYear) * 12 + (nowMonth - targetMonth)
    if (nowDay < targetDay) monthsDiff--
  
    let yearsDiff = nowYear - targetYear
    if (nowMonth < targetMonth || (nowMonth === targetMonth && nowDay < targetDay)) {
      yearsDiff--
    }
  
    // 判断并返回结果
    if (seconds < 60) {
      return '刚刚'
    } else if (minutes < 60) {
      return `${minutes}分钟前`
    } else if (hours < 24) {
      return `${hours}小时前`
    } else if (days <= 31) {
      return `${days}天前`
    } else if (monthsDiff < 12) {
      return `${monthsDiff}个月前`
    } else {
      return `${yearsDiff}年前`
    }
  }
  