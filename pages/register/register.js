// pages/register/register.js
const app = getApp();
const db = wx.cloud.database()
const userdb = db.collection('UserInfo')
const studb = db.collection('Student')

Page({

  register(event) {
    let _this = this
    //判断是否为空
    if (event.detail.value.username.length == 0 || event.detail.value.stuid.length == 0) {
      _this.setData({
        errmsg: "姓名或学号为空"
      });
    }
    //若不为空
    else {
      console.log("不为空", event.detail.value.stuid)
      //查询姓名和学号是否匹配
      wx.cloud.callFunction({
        name: "register",
        data:{
          detail:event,
          openid: app.globalData.userOpenId,
        },
        success(res){
          console.log(res)
          if (res.result.is_ok){
            app.globalData.name = event.detail.value.username
            app.globalData.stuid = event.detail.value.stuid
            wx.switchTab({
              url: '../index/index',
            })
          }
          else{
            _this.setData({
              errmsg:res.result.msg
            })
          }
        }
      })
    //console.log(event);
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    name: null,
    studentid: null,
    errmsg: " ",
    // isempty:false,
    // iserr:false,
    // isregister:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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