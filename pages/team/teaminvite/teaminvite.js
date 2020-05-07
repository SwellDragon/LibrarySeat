// pages/team/teaminvite/teaminvite.js
const app = getApp()
const db = wx.cloud.database()
const userdb = db.collection('UserInfo')
const _ = db.command
const state = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputVal: '', // 搜索框输入的内容
  },
  clearInput() {
    this.setData({
      inputVal: "",
      inputShowed: false,
      searchResult: []
    })
    wx.hideKeyboard() //强行隐藏键盘
  },
  inputTyping(e) {
    this.setData({
      inputVal: e.detail.value
    }, () => {
      this.searchpeople(this.data.inputVal)
    })
  },
  searchpeople(e) {
    //查找好友
    userdb.where(
      _.or([
        {
          user_name: e,
          team_id:""
        }, {
          student_id: e,
          team_id:""
        }
      ])
    ).get().then((res) => {
      console.log(e, res)
      
      for(let i=0;i<res.data.length;i++){
        state[i] = "拉入队伍"
      }
      this.setData({
        peopledetail: res.data,
        state: state
      })
    })
  },
  showInput() {
    this.setData({
      inputShowed: true
    })
  },
  getheight() {
    const that = this;
    setTimeout(() => {
      wx.getSystemInfo({
        success: function (res) {
          let winHeight = res.windowHeight
          let barHeight = winHeight - res.windowWidth / 750 * 204
          that.setData({
            winHeight: winHeight,
            indexBarHeight: barHeight,
            indexBarItemHeight: barHeight / 25,
            titleHeight: res.windowWidth / 750 * 132,
          })
        }
      })
    }, 50)

  },
  invitepeople(e){
    let _this = this
    console.log(e)
    //呼叫云函数 先检查是否加入 然后拉入，否则提示已经有队伍了
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: 'invitepeople',
        team_id: app.globalData.team_id,
        student_id:e.target.dataset.detail.student_id
      }, success(res){
        console.log("云函数返回",res)
        if(res.result.is_ok){
          console.log("拉入成功")
          wx.showToast({
            title: '已拉入',
            icon: 'none',
            duration: 1000,
          })
          state[e.target.dataset.index] = "已加入"
          _this.setData({
            state: state
          })
        }
        else{
          wx.showModal({
            title: '提示',
            content: res.result.msg,
            showCancel: false,
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
        
      }
    })
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("队伍ID", app.globalData.team_id)
    this.getheight()
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