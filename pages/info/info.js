// pages/info/info.js
const app=getApp()
const db = wx.cloud.database()
const userdb = db.collection('UserInfo')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stuid: null,
    name: null
  },

  unbind(e){
    console.log("点击unbind")
    wx.showModal({
      title: '提示',
      content: '是否要解除该账号绑定',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          userdb.where({
            student_id: app.globalData.stuid
          }).update({
            data:{
              user_id:""
            }
          }).then(()=>{
            // app.globalData.name= null 
            //  app.globalData.stuid = null
            app.globalData = {
              userInfo: null,
              userOpenId: null,
              stuid: null, //学号
              name: null, //姓名
              // stuid: '2016210019', //学号
              // name: '陈伟龙',  //姓名
              stuseatmsg: [], //当前占用座位信息
              team_id: "", //所属队伍id
              friends: [],
              teammsg: null
            }
            wx.reLaunch({
              url:'../checkuser/checkuser'
            })
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      name: app.globalData.name,
      stuid: app.globalData.stuid
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})