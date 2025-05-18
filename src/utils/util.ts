import { HOST } from "../common/constant";
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
  