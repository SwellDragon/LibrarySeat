// pages/test/test.js
var util = require("../../utils/util.js");
const db = wx.cloud.database()
const _ = db.command
const seatdb = db.collection('SeatMsg')
const latedb = db.collection('LateMsg')
const app = getApp()

// const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date:null
  },

  mergeCommonCriteria(criteria) {
    return {
      //groupId是你这个聊天室的名字，
      //自己可以利用Id给每个卖家创建一下之类的，用id当名字
      //同一个卖家的大家都进到这个聊天室中

      //或者商品一开始上传的时候给他带一个属性就是聊太的属性就行，正好也可以当作评论的属性
      // groupId: this.data.groupId,
      groupId:"20152101592016210019",

      ...criteria,
    }
  },
  async test(){
    const { data: initList } = await db.collection('ChatRecord').where({
      groupId: "20152101592016210019"
    }).get()

    console.log('init query chats', initList)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let a={
      b:1,
      c:2,
    }
    console.log(a)
    a.d = 2
    console.log(a)
    // let s = "team_2016210019_0"
    // let ss = s.split('_')
    // console.log(ss)
    // this.test()
    // seatdb.where({
    //   stuid: submitdata.stuid,
    //   addr: submitdata.addr,
    //   floor: submitdata.floor,
    //   room: submitdata.room,
    //   row: submitdata.row,
    //   col: submitdata.col,
    //   is_cancel: false,
    //   is_complete: false,
    // }).get().then((res)=>{
    //   console.log(res)
    // })

    // wx.getUserInfo({
    //   success: res => {
    //     // 可以将 res 发送给后台解码出 unionId
    //     app.globalData.userInfo = res.userInfo
    //     console.log(res)

    //     // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //     // 所以此处加入 callback 以防止这种情况
       
    //   }
    // })
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

    // let s = new Date("2020-04-20T15:00:00.000Z")
    // console.log(new Date(s))
    
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