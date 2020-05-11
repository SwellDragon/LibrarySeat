// pages/occupy/occupy.js
// const {
//   $Message
// } = require('../../dist/base/index');
const app = getApp()
function checktime(querydata) {
  let starttime = querydata.starttime.split(':')
  starttime[0] = parseInt(starttime[0])
  starttime[1] = parseInt(starttime[1])
  let endtime = querydata.endtime.split(':')
  endtime[0] = parseInt(endtime[0])
  endtime[1] = parseInt(endtime[1])
  console.log("获得时间", starttime, endtime)
  if (starttime[0] > endtime[0]) { //结束时间比开始时间早
    console.log("结束小时比开始小时早")
    return false
  }
  if (starttime[0] == endtime[0] && starttime[1] >= endtime[1]) {
    console.log("结束小时相同 结束分钟比开始分钟早")
    return false
  }
  //预约时间比当前时间早
  if (querydata.day == '今日') {
    //当前时间
    console.log("今天")
    let time = new Date()
    let hour = time.getHours()
    let min = time.getMinutes()
    console.log(hour, min)
    if (hour > starttime[0]) { //预约小时比当前时间早
      return false
    }
    if (hour == starttime[0] && min >= starttime[1]) { //小时相同,预约分钟比当前分钟小
      return false
    }
  }
  return true
}

function getdate(querydata) {
  let starttime = querydata.starttime.split(':')
  starttime[0] = parseInt(starttime[0])
  starttime[1] = parseInt(starttime[1])
  let endtime = querydata.endtime.split(':')
  endtime[0] = parseInt(endtime[0])
  endtime[1] = parseInt(endtime[1])
  let startdate = new Date()
  let enddate = new Date
  startdate.setHours(starttime[0])
  startdate.setMinutes(starttime[1])
  startdate.setSeconds(0)
  enddate.setHours(endtime[0])
  enddate.setMinutes(endtime[1])
  enddate.setSeconds(0)
  if (querydata.day == '明日') {
    startdate = new Date(Date.parse(startdate) + 24 * 60 * 60 * 1000)
    enddate = new Date(Date.parse(enddate) + 24 * 60 * 60 * 1000)
  }
  return {
    startdate: startdate,
    enddate: enddate
  }
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    multiArray: [
      ['数字图书馆', '老图书馆', ],
      ['一层', '二层', '三层'],
      ['101（报刊阅览室）', '102（图书阅览室）'],
      ['今日', '明日']
    ],
    multiIndex: [0, 0, 0, 0],
    starttime: '6:00',
    endtime: '23:00',
    row : [],
    col : [],
    selectseat:[0,0],
    isquery:false,
    querydata:null
  },

  //事件处理函数
  bindMultiPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange: function(e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0: //修改第一列
        switch (data.multiIndex[0]) {
          case 0: //数图
            data.multiArray[1] = ['一层', '二层', '三层'];
            data.multiArray[2] = ['101（报刊阅览室）', '102（图书阅览室）'];
            break;
          case 1: //老图
            data.multiArray[1] = ['二层', '三层', '四层'];
            data.multiArray[2] = ['201（图书阅览室）', '202(法学阅览室)'];
            break;
        }
        data.multiIndex[1] = 0;
        data.multiIndex[2] = 0;
        break;
      case 1: //修改第二列
        switch (data.multiIndex[0]) { //查询第一列内容
          case 0: //是数图
            switch (data.multiIndex[1]) { //查看数图楼层
              case 0: //数图一楼
                data.multiArray[2] = ['101（报刊阅览室）', '102（图书阅览室）'];
                break;
              case 1: //数图二楼
                data.multiArray[2] = ['201（图书阅览室）', '202（电子阅览室）'];
                break;
              case 2: //数图三楼
                data.multiArray[2] = ['301A', '301B'];
                break;
                // case 3:
                //   data.multiArray[2] = ['河蚌', '蜗牛', '蛞蝓'];
                //   break;
                // case 4:
                //   data.multiArray[2] = ['昆虫', '甲壳动物', '蛛形动物', '多足动物'];
                //   break;
            }
            break;
          case 1: //是老图
            switch (data.multiIndex[1]) { //查看老图楼层
              case 0: //老图二楼
                data.multiArray[2] = ['201（图书阅览室）', '202(法学阅览室)'];
                break;
              case 1: //老图三楼
                data.multiArray[2] = ['301', '302'];
                break;
              case 2: //老图四楼
                data.multiArray[2] = ['401A', '401B'];
                break;
            }
            break;
        }
        data.multiIndex[2] = 0;
        console.log(data.multiIndex);
        break;
    }
    this.setData(data);
  },
  startTimeChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      starttime: e.detail.value
    })
  },
  endTimeChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      endtime: e.detail.value
    })
  },
  //查询
  query(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value, this.data.multiArray[0][this.data.multiIndex[0]], this.data.multiArray[1][this.data.multiIndex[1]], this.data.multiArray[2][this.data.multiIndex[2]], this.data.multiArray[3][this.data.multiIndex[3]])
    let querydata = {}
    querydata.addr = this.data.multiArray[0][this.data.multiIndex[0]]
    querydata.floor = this.data.multiArray[1][this.data.multiIndex[1]]
    querydata.room = this.data.multiArray[2][this.data.multiIndex[2]]
    querydata.day = this.data.multiArray[3][this.data.multiIndex[3]]
    querydata.starttime = e.detail.value.starttime
    querydata.endtime = e.detail.value.endtime
    console.log("上传的数据", querydata)
    //校验时间合法性
    if (checktime(querydata)) {
      console.log("时间合法")
      let stuid = app.globalData.stuid
      wx.cloud.callFunction({
        name: "querySeatMsg",
        data: {
          stuid: stuid,
          querydata: querydata
        }
      }).then((res) => {
        
        console.log("座位可用数据", res)
        if (res.result.is_ok) { //能在这个时间段占座位
          
          let rowarry = [[0]]
          for (var i = 0; i < res.result.room.length; i++) { //行
            rowarry[i + 1] = i + 1
          }
          let colarry = [[0]]
          for (var i = 0; i < res.result.room[0].length; i++) { //行
            colarry[i + 1] = i + 1
          }
          this.setData({
            seatmsg: res.result.room,
            row: rowarry,
            col: colarry,
            isquery: true,
            querydata: querydata,
            selectseat:[0,0]
          })}else{
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
          this.setData({
            isquery: false
          })
          }
        
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '时间不合法，请检查',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      this.setData({
        isquery:false
      })
    }

  },
  clickseat(e){
    let _this = this
    console.log("点击座位",e)
    let col = e.target.dataset.col
    let row = e.target.dataset.row
    if(_this.data.seatmsg[row-1][col-1]==1){//当前座位未被占用
      if (this.data.selectseat[0] == 0 && this.data.selectseat[1] == 0) {//当前未选择座位
        this.setData({
          selectseat: [row, col]
        })
      }
      else { //已选择座位
        if (this.data.selectseat[0] == row && this.data.selectseat[1] == col) { //如果被选中座位再次被点 取消
          this.setData({
            selectseat: [0, 0]
          })
        }
        else {
          wx.showToast({
            title: '你已选择其他座位',
            icon: 'none',
            duration: 1000,
            // mask: true
          })
        }
      }
    }else{
      wx.showToast({
        title: '当前座位已被占用',
        icon: 'none',
        duration: 1000,
        // mask: true
      })
    }

    
  },
  submit(e){
    if (this.data.selectseat[0] == 0 && this.data.selectseat[1] == 0) {//当前未选择座位
      wx.showToast({
        title: '你未选择座位',
        icon: 'none',
        duration: 1000,
        // mask: true
      })
    }else{
      let submitdata = JSON.parse(JSON.stringify(this.data.querydata))//深度克隆
      let time = getdate(this.data.querydata)
      // console.log("submit", querydata)
      submitdata.starttime = Date.parse(time.startdate)
      submitdata.endtime = Date.parse(time.enddate)
      submitdata.row = this.data.selectseat[0]
      submitdata.col = this.data.selectseat[1]
      submitdata.stuid = app.globalData.stuid
      submitdata._openid = app.globalData.userOpenId
      console.log("submit", submitdata)
      wx.cloud.callFunction({
        name: "submitSeatMsg",
        data: {
          submitdata: submitdata
        }
      }).then((res) => {
        console.log("调用submitseatmsg", res)
        if(res.result.is_ok){
          wx.showModal({
            title: '提示',
            content: '占座成功',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
          res.result.msg.start_time = new Date(res.result.msg.start_time)
          res.result.msg.end_time = new Date(res.result.msg.end_time)
          app.globalData.stuseatmsg.push(res.result.msg)
          this.setData({
            isquery: false
          })
        }else{
          wx.showModal({
            title: '提示',
            content: '占座失败',
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
      })
    }
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let startime = new Date(Date.parse(new Date())+15*60*1000)
    let starttime = startime.getHours() + ":" + startime.getMinutes()
    // console.log(startime, starttime)
    this.setData({
      starttime: starttime
    })
  },
  clickSeat: function(res) {

  },
})