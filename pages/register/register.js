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
      studb.where({
        stu_id: event.detail.value.stuid
      }).get({
        success(res) {
          //若匹配
          //console.log( res)
          if (res.data.length != 0 && res.data[0].name == event.detail.value.username) {
            console.log("已匹配", res)
            //查询是否已被注册
            userdb.where({
              student_id: event.detail.value.stuid
            }).get({
              success(res) {
                //已被注册
                if (res.data.length != 0) {
                  console.log("被注册")
                  _this.setData({
                    errmsg: "姓名和学号已被注册，请联系管理员"
                  })
                }
                //未被注册
                else {
                  //console.log("未被注册")
                  //添加数据！！！！！！！！！！！！！！！！！！！！！！！！！！
                  userdb.add({
                    data: {
                      user_name: event.detail.value.username,
                      student_id: event.detail.value.stuid,
                      user_id: app.globalData.userOpenId,
                      //user_id: 123,
                    },
                    // success(res){
                    //   console("注册成功",res)
                    //   wx.redirectTo({
                    //     url: '../index/index',
                    //   })
                    // },fail(err){
                    //   console.log("注册失败",err)
                    // }
                  }).then(res => {
                    if (res.errMsg == "collection.add:ok") {
                      app.globalData.name = event.detail.value.username
                      app.globalData.stuid = event.detail.value.stuid
                      wx.switchTab({
                        url: '../index/index',
                      })
                    } else {
                      console.log("注册失败", res)
                    }
                  })
                }
              },
              fail(err) {
                console.log("查询是否已注册失败", err)
              }
            })
          }
          //若不匹配
          else {
            //console.log("不匹配");
            _this.setData({
              errmsg: "姓名或学号不正确"
            });
          }
        },
        fail(err) {
          console.log("姓名学号匹配查询失败", err)
        }
      })
    }
    //console.log(event);
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