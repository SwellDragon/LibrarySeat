//app.js

App({
  onLaunch: function() {
    //云开发环境初始化

    wx.cloud.init()
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // console.log("用户信息", res)
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  uploadavatar() {
    const db = wx.cloud.database()
    const _ = db.command
    const userdb = db.collection('UserInfo')
    let _this = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          console.log("正在上传头像")
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          userdb.where({
            student_id: _this.globalData.stuid
          }).update({
            data:{
              avatarUrl: _this.globalData.userInfo.avatarUrl
            }
          }).then((res)=>{
            console.log("上传头像",res)
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    userOpenId: null,
    stuid: null, //学号
    name: null, //姓名
    // stuid: '2016210019', //学号
    // name: '陈伟龙',  //姓名
    stuseatmsg: null, //当前占用座位信息
    team_id: "", //所属队伍id
    friends: [],
    teammsg: null
  }
})