export default {
  login: '/service/user/login', //登录
  getUserData: '/service/user-getway/getUserData', // 获取用户信息
  updateUser: '/service/user-getway/updateUser',//更新用户信息
  register: '/service/user/register',//注册
  vertifyUser: '/service/user/vertifyUser',// 校验账号是否存在
  sendEmailVertifyCode: '/service/user/sendEmailVertifyCode',// 找回密码
  resetPassword: '/service/user/resetPassword',// 重置密码
  updateAvater:'/service/user-getway/updateAvater',//更新头像
  updatePassword: '/service/user-getway/updatePassword',//更新密码
  loginByEmail: '/service/user/loginByEmail',//邮箱登录
  getKeywordMusic: '/service/music/getKeywordMusic',//获取搜索关键词
  getMusicClassify: '/service/music/getMusicClassify',//获取分类歌曲
  getMusicListByClassifyId: '/service/music/getMusicListByClassifyId',//获取推荐音乐列表
  getMusicAuthorListByCategoryId: '/service/music/getMusicAuthorListByCategoryId',// 获取歌手列表
  getCircleListByType: '/service/circle/getCircleListByType',// 获取歌手列表
  getMusicPlayMenu: '/service/music/getMusicPlayMenu',// 获取我的歌单
  getFavoriteAuthor: '/service/music/getFavoriteAuthor',// 获取我关注的歌手
  insertFavoriteAuthor: '/service/music/insertFavoriteAuthor/',// 添加我关注的歌手
  deleteFavoriteAuthor: '/service/music/deleteFavoriteAuthor/',// 删除我关注的歌手
  getMusicRecord: '/service/music/getMusicRecord',// 获取播放记录
  insertMusicRecord: '/service/music/insertMusicRecord',// 记录播放日志
  insertMusicLike: '/service/music/insertMusicLike/',// 插入收藏
  deleteMusicLike: '/service/music/deleteMusicLike/',// 删除收藏
  getMusicLike: '/service/music/getMusicLike',// 查询我喜欢的歌曲
  searchMusic: '/service/music/searchMusic',// 音乐搜索
  getSingerCategory:'/service/music/getSingerCategory',// 获取歌手分类
  saveLike:'/service/social/saveLike',// 添加点赞
  deleteLike:'/service/social/deleteLike',// 删除点赞
  insertComment:'/service/social/insertComment',// 新增评论
  getTopCommentList:'/service/social/getTopCommentList',// 获取一级评论列表
  getCommentCount: '/service/social/getCommentCount',// 获取评论总数
  isMusicFavorite:'/service/music/isMusicFavorite/', // 查询音乐是否收藏
  getFavoriteDirectory:'/service/music/getFavoriteDirectory',// 查询收藏夹
  deleteFavoriteDirectory: '/service/music/deleteFavoriteDirectory/',// 删除收藏夹
  insertFavoriteDirectory:'/service/music/insertFavoriteDirectory',// 创建收藏夹
  insertMusicFavorite:'/service/music/insertMusicFavorite/',// 插入收藏夹
  insertCircle: '/service/circle/insertCircle',// 插入一条朋友圈说说
  getMusicListByFavoriteId:'/service/music/getMusicListByFavoriteId',// 按照收藏夹的id查询音乐列表
  getMusicAuthorCategory: '/service/music/getMusicAuthorCategory',// 获取歌手分类
  getMusicListByAuthorId: '/service/music/getMusicListByAuthorId',// 根据歌手id获取音乐列表
  circleWebsocket: '/service/circle/ws',// 音乐圈动态
  getCircleByLastUpdateTime:'/service/circle/getCircleByLastUpdateTime',// 音乐圈动态
  chat:"/service/ai/chat",// ai聊天
  getChatHistory: "/service/ai/getChatHistory",// ai聊天
  // chatWs: "/service/ai/ws/chat"// ai聊天
  chatWs: "/service/music/ws/chat",// ai聊天
  getModelList: "/service/music/getModelList"// ai聊天
};
