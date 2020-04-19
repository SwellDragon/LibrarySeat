// pages/test/test.js
var util = require("../../utils/util.js");
const db = wx.cloud.database()
const _ = db.command
const seatdb = db.collection('SeatMsg')
const latedb = db.collection('LateMsg')

// const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // const countResult = seatdb.count()
    // const total =  countResult.total
    // console.log(total)


    // let starttime = "6:00"
    // let time = starttime.split(':')
    // console.log(time)


    // var s = '{"addr":"老图","floor":"1","room":"101","row":"1","col":"1"}'
    // console.log(s);
    // var j = JSON.parse(s)
    // console.log(j);

    // let day = new Date()
    // let dateString = JSON.stringify(day)
    // console.log("json转换后",dateString)
    // day = new Date(JSON.parse(dateString))
    // console.log("转换回来后",day)

    // let day1 = new Date(1587308400000)
    // let day2 = new Date(1587308400000)
    // console.log(day1<=day2)

    let s = new Date("2020-04-20T15:00:00.000Z")
    console.log(new Date(s))
    
    // console.log("新建时间",day);
    // day = Date.parse(new Date());
    // console.log("解析时间获得时间戳",day);
    // day = new Date(day)
    // console.log("时间戳复原Date", day);
    // day = util.formatTime(day);
    // console.log("Date格式化", day);
   
    // console.log();
    // console.log(day);
    // day = Date(day)
    // console.log(day)

    // this.setData({
    //   date: day
    // })

    // latedb.add({
    //   data: {
    //     stuid: 2016210019,
    //     count: 1,
    //     details: [12345]
    //   }
    // }).then(res => {
    //   console.log("添加失约记录成功", res)
    // })


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