import {httpRequest} from '../utils/HttpUtils';
import type {MyAwesomeData} from '../utils/HttpUtils';
import api from '../api';
import type * as types from '../types';
import type {CommentEnum,CircleEnum} from '../common/enum';
import md5 from 'md5';
/**
 * @description: 根据token获取用户信息
 * @date: 2023-12-1 23:39
 * @author wuwenqiang
 */
export const getUserDataService = (token:string):Promise<MyAwesomeData<types.UserDataType>>=> {
	httpRequest.setToken(token);
	return httpRequest.get<types.UserDataType>(api.getUserData,{},{noShowMsg:true});
}

/**
 * @author: wuwenqiang
 * @description: 更新用户信息
 * @date: 2023-12-28 23:18
 */
export const updateUserDataService = (userData:types.UserDataType):Promise<MyAwesomeData<number>>=>{
    return httpRequest.put<number>(api.updateUser,userData)
};

/**
 * @description: 登录
 * @date: 2024-01-15 21:32
 * @author wuwenqiang
 */
export const loginService = (userAccount:string,password:string):Promise<MyAwesomeData<types.UserDataType>>=>{
	password = md5(password);
	return httpRequest.post<types.UserDataType>(api.login,{userAccount,password})
};


/**
 * @description: 注册
 * @date: 2024-01-19 23:51
 * @author wuwenqiang
 */
export const registerService = (userData:types.UserDataType):Promise<MyAwesomeData<types.UserDataType>>=>{
	userData.password = md5(userData.password);
	return httpRequest.post<types.UserDataType>(api.register,userData)
};

/**
 * @description: 校验账号和密码是否存在
 * @date: 2024-01-19 23:51
 * @author wuwenqiang
 */
export const vertifyUserService = (userData:types.UserDataType):Promise<MyAwesomeData<number>>=>{
	return httpRequest.post<number>(api.vertifyUser,userData)
};

/**
 * @description: 找回密码
 * @date: 2025-01-19 22:59
 * @author wuwenqiang
 */
export const sendEmailVertifyCodeService = (email:string):Promise<MyAwesomeData<number>>=>{
    return httpRequest.post<number>(api.sendEmailVertifyCode,{email})
}; 

export const resetPasswordService = (email:string,password:string,code:number):Promise<MyAwesomeData<types.UserDataType>>=>{
    password = md5(password);
    return httpRequest.post<types.UserDataType>(api.resetPassword,{email,password,code})
}; 

/**
 * @description: 更新密码
 * @date: 2025-01-28 14:22
 * @author wuwenqiang
 */
export const updatePasswordService = (oldPassword:string,newPassword:string):Promise<MyAwesomeData<number>>=>{
    oldPassword = md5(oldPassword);
    newPassword = md5(newPassword);
    return httpRequest.put<number>(api.updatePassword,{oldPassword,newPassword},{noShowMsg:true})
}; 

/**
 * @description: 邮箱验证码登录
 * @date: 2025-01-28 14:22
 * @author wuwenqiang
 */
export const loginByEmailService = (email:string,code:string):Promise<MyAwesomeData<types.UserDataType>>=>{
    return httpRequest.post<types.UserDataType>(api.loginByEmail,{email,code})
}; 

/**
 * @description: 获取推荐的音乐
 * @date: 2024-03-02 22:44
 * @author wuwenqiang
 */
export const getKeyWordMusicService = ():Promise<MyAwesomeData<types.MusicType>> => {
    return httpRequest.get<types.MusicType>(api.getKeywordMusic);
}

/**
 * @description: 获取模块分类
 * @date: 2024-03-02 22:44
 * @author wuwenqiang
 */
export const getMusicClassifyService = ():Promise<MyAwesomeData<Array<types.MusicClassifyType>>> => {
    return httpRequest.get<Array<types.MusicClassifyType>>(api.getMusicClassify);
}

/**
 * @description: 获取模块分类
 * @date: 2024-03-03 11:50
 * @author wuwenqiang
 */
export const getMusicListByClassifyIdService = (classifyId:number,pageNum:number,pageSize:number):Promise<MyAwesomeData<Array<types.MusicType>>> => {
    return httpRequest.get<Array<types.MusicType>>(`${api.getMusicListByClassifyId}?classifyId=${classifyId}&pageNum=${pageNum}&pageSize=${pageSize}`);
}

/**
 * @description: 获取推荐的歌手
 * @date: 2024-03-03 18:23
 * @author wuwenqiang
 */
export const getMusicAuthorListByCategoryIdService = (categoryId:number,pageNum:number,pageSize:number):Promise<MyAwesomeData<Array<types.MusicAuthorType>>> => {
    return httpRequest.get<Array<types.MusicAuthorType>>(`${api.getMusicAuthorListByCategoryId}?categoryId=${categoryId}&pageNum=${pageNum}&pageSize=${pageSize}`);
}

/**
 * @description: 获取音乐圈数据
 * @date: 2024-03-03 18:23
 * @author wuwenqiang
 */
export const getCircleListByTypeService = (type:CircleEnum,pageNum:number,pageSize:number):Promise<MyAwesomeData<Array<types.CircleType>>> => {
    return httpRequest.get<Array<types.CircleType>>(`${api.getCircleListByType}?type=${type}&pageNum=${pageNum}&pageSize=${pageSize}`);
}

/**
 * @description: 点赞
 * @date: 2024-03-12 23:25
 * @author wuwenqiang
 */
export const saveLikeService = (likeItem:types.LikeType):Promise<MyAwesomeData<types.LikeType>> => {
    return httpRequest.post<types.LikeType>(api.saveLike,likeItem);
}

/**
 * @description: 删除点赞
 * @date: 2024-03-12 23:25
 * @author wuwenqiang
 */
export const deleteLikeService = (relationId:number,type:string):Promise<MyAwesomeData<number>> => {
    return httpRequest.delete<number>(`${api.deleteLike}?relationId=${relationId}&type=${type}`);
}

/**
 * @description: 获取我关注的歌手
 * @date: 2024-03-17 22:12
 * @author wuwenqiang
 */
export const getFavoriteAuthorService = (pageNum:number,pageSize:number):Promise<MyAwesomeData<Array<types.MusicAuthorType>>> => {
    return httpRequest.get<Array<types.MusicAuthorType>>(`${api.getFavoriteAuthor}?pageNum=${pageNum}&pageSize=${pageSize}`);
}

/**
 * @description: 获取播放记录
 * @date: 2024-03-17 22:12
 * @author wuwenqiang
 */
export const getMusicRecordService = (pageNum:number,pageSize:number):Promise<MyAwesomeData<Array<types.MusicType>>> => {
    return httpRequest.get<Array<types.MusicType>>(`${api.getMusicRecord}?pageNum=${pageNum}&pageSize=${pageSize}`);
}

/**
 * @description: 插入播放记录
 * @date: 2024-03-17 22:12
 * @author wuwenqiang
 */
export const insertMusicRecordService = (musicRecord:types.MusicRecordType):Promise<MyAwesomeData<number>> => {
    return httpRequest.post<number>(api.insertMusicRecord,musicRecord);
}

/**
 * @description: 添加收藏
 * @date: 2024-05-12 12:21
 * @author wuwenqiang
 */
export const insertMusicLikeService = (musicId:number):Promise<MyAwesomeData<number>> => {
    return httpRequest.post<number>(api.insertMusicLike + musicId);
}

/**
 * @description: 删除收藏
 * @date: 2024-05-12 12:21
 * @author wuwenqiang
 */
export const deleteMusicLikeService = (musicId:number):Promise<MyAwesomeData<number>> => {
    return httpRequest.delete<number>(api.deleteMusicLike + musicId);
}

/**
 * @description: 查询喜欢的歌曲
 * @date: 2024-05-12 12:21
 * @author wuwenqiang
 */
export const getMusicLikeService = (pageNum:number,pageSize:number):Promise<MyAwesomeData<Array<types.MusicType>>> => {
    return httpRequest.get<Array<types.MusicType>>(`${api.getMusicLike}?pageNum=${pageNum}&pageSize=${pageSize}`);
}


/**
 * @description: 获取一级评论
 * @date: 2024-05-12 12:21
 * @author wuwenqiang
 */
export const getTopCommentListService = (relationId:number,type:CommentEnum,pageNum:number,pageSize:number):Promise<MyAwesomeData<Array<types.CommentType>>> => {
    return httpRequest.get<Array<types.CommentType>>(`${api.getTopCommentList}?relationId=${relationId}&type=${type}&pageSize=${pageSize}&pageNum=${pageNum}`);
}

/**
 * @description: 删除收藏
 * @date: 2024-05-12 12:21
 * @author wuwenqiang
 */
export const getCommentCountService = (relationId:number,type:CommentEnum):Promise<MyAwesomeData<number>> => {
    return httpRequest.get<number>(`${api.getCommentCount}?relationId=${relationId}&type=${type}`);
}

/**
 * @description: 添加评论
 * @date: 2024-03-12 23:25
 * @author wuwenqiang
 */
export const insertCommentService = (commentItem:types.CommentType):Promise<MyAwesomeData<types.CommentType>> => {
  return httpRequest.post<types.CommentType>(api.insertComment,commentItem);
}

/**
 * @description: 查询音乐是否已经收藏
 * @date: 2024-06-25 22:02
 * @author wuwenqiang
 */
export const isMusicFavoriteService = (musicId:number):Promise<MyAwesomeData<number>> => {
    return httpRequest.get<number>(api.isMusicFavorite + musicId);
}

/**
 * @description: 查询音乐是否已经收藏
 * @date: 2024-06-25 22:02
 * @author wuwenqiang
 */
export const getFavoriteDirectoryService = (musicId:number):Promise<MyAwesomeData<Array<types.FavoriteDirectoryType>>> => {
    return httpRequest.get<Array<types.FavoriteDirectoryType>>(`${api.getFavoriteDirectory}?musicId=${musicId}`);
}

/**
 * @description: 插入音乐收藏
 * @date: 2024-06-29 11:26
 * @author wuwenqiang
 */
export const insertMusicFavoriteService = (musicId:number,favoriteList:Array<types.FavoriteMusicType>):Promise<MyAwesomeData<number>> => {
    return httpRequest.post<number>(api.insertMusicFavorite + musicId,favoriteList);
}

/**
 * @description: 创建音乐收藏夹
 * @date: 2024-06-29 11:26
 * @author wuwenqiang
 */
export const insertFavoriteDirectoryService = (favoriteDirectory:types.FavoriteDirectoryType):Promise<MyAwesomeData<number>> => {
    return httpRequest.post<number>(api.insertFavoriteDirectory,favoriteDirectory);
}

/**
 * @description: 删除音乐收藏
 * @date: 2025-03-03 23:11
 * @author wuwenqiang
 */
export const deleteFavoriteDirectoryService = (favoriteId:number):Promise<MyAwesomeData<number>> => {
    return httpRequest.delete<number>(api.deleteFavoriteDirectory + favoriteId);
}

/**
 * @description: 音乐搜索
 * @date: 2024-07-08 23:05
 * @author wuwenqiang
 */
export const searchMusicService = (keyword:string,pageNum:number,pageSize:number):Promise<MyAwesomeData<Array<types.MusicType>>> => {
    return httpRequest.get<Array<types.MusicType>>(`${api.searchMusic}?keyword=${keyword}&pageNum=${pageNum}&pageSize=${pageSize}`);
}

/**
 * @description: 插入一条说说
 * @date: 2024-07-08 23:05
 * @author wuwenqiang
 */
export const saveCircleService = (circle:types.CircleType):Promise<MyAwesomeData<Array<number>>> => {
    return httpRequest.post<Array<number>>(api.insertCircle,circle);
}

/**
 * @description: 根据收藏夹id查询音乐列表
 * @date: 2024-07-16 23:39
 * @author wuwenqiang
 */
export const getMusicListByFavoriteIdService = (favoriteId:number,pageNum:number,pageSize:number):Promise<MyAwesomeData<Array<types.MusicType>>> => {
    return httpRequest.get<Array<types.MusicType>>(`${api.getMusicListByFavoriteId}?favoriteId=${favoriteId}&pageNum=${pageNum}&pageSize=${pageSize}`);
}

/**
 * @description: 获取歌手分类
 * @date: 2024-08-26 21:43
 * @author wuwenqiang
 */
export const getMusicAuthorCategoryService = ():Promise<MyAwesomeData<Array<types.MusicAuthorCategoryType>>> => {
    return httpRequest.get<Array<types.MusicAuthorCategoryType>>(api.getMusicAuthorCategory);
}

/**
 * @description: 新增我关注的歌手
 * @date: 2024-08-27 21:43
 * @author wuwenqiang
 */
export const insertFavoriteAuthorService = (authorId:number):Promise<MyAwesomeData<number>> => {
    return httpRequest.post<number>(`${api.insertFavoriteAuthor}${authorId}`);
}

/**
 * @description: 新增我关注的歌手
 * @date: 2024-08-27 21:43
 * @author wuwenqiang
 */
export const deleteFavoriteAuthorService = (authorId:number):Promise<MyAwesomeData<number>> => {
    return httpRequest.delete<number>(`${api.deleteFavoriteAuthor}${authorId}`);
}

/**
 * @description: 根据歌手id获取歌手
 * @date: 2024-08-27 23:01
 * @author wuwenqiang
 */
export const getMusicListByAuthorIdService = (authorId:number,pageNum:number,pageSize:number):Promise<MyAwesomeData<Array<types.MusicType>>> => {
    return httpRequest.get<Array<types.MusicType>>(`${api.getMusicListByAuthorId}?authorId=${authorId}&pageNum=${pageNum}&pageSize=${pageSize}`);
}
