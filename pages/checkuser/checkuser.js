// pages/checkuser/checkuser.js
const app = getApp()
const db = wx.cloud.database()
const userdb = db.collection('UserInfo')
Page({

  retrunUserInfo(res) {
    console.log(res)
  },
  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //是否以获取数据获取
    console.log(app.globalData.name, app.globalData.stuid)
    if (app.globalData.name == null || app.globalData.stuid == null) {
      //获取openid 查看是否注册
      wx.cloud.callFunction({
        name: "getUserInfo",
        success(res) {
          console.log(res.result.openid)
          app.globalData.userOpenId = res.result.openid
          userdb.where({
            user_id: res.result.openid
          }).get({
            success(res) {
              // console.log(res)
              //若已注册
              if (res.data.length != 0) {
                app.globalData.name = res.data[0].user_name
                app.globalData.stuid = res.data[0].student_id
                wx.switchTab({
                  url: '../index/index',
                })
              }
              //若未注册
              else {
                wx.redirectTo({
                  url: '../register/register',
                })
              }
            },
            fail(err) {
              console.log(err)
            }

          })

        },
        fail(err) {
          console.log(err)
        }
      })
    } else{
      wx.switchTab({
        url: '../index/index',
      })
    } 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})