// pages/occupy/occupy.js
// const {
//   $Message
// } = require('../../dist/base/index');

function checktime(querydata){
  let starttime = querydata.starttime.split(':')
  starttime[0] = parseInt(starttime[0])
  starttime[1] = parseInt(starttime[1])
  let endtime = querydata.endtime.split(':')
  endtime[0] = parseInt(endtime[0])
  endtime[1] = parseInt(endtime[1])
  console.log("获得时间",starttime,endtime)
  if (starttime[0] > endtime[0] ) {//结束时间比开始时间早
  console.log("结束小时比开始小时早")
    return false
  }
  if (starttime[0] == endtime[0] && starttime[1] >= endtime[1]  ){
    return false
  }
  //预约时间比当前时间早
  if (querydata.day == '今日') {
    //当前时间
    let hour = new Date().getHours
    let min = new Date().getMinutes
    if (hour < starttime[0]) { //预约小时比当前时间早
      return false
    }
    if (hour == starttime[0] && min>=starttime[1]) {//小时相同,预约分钟比当前分钟小
      return false
    }
  }
  return true
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
    endtime: '23:00'
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
  query(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value, this.data.multiArray[0][this.data.multiIndex[0]], this.data.multiArray[1][this.data.multiIndex[1]], this.data.multiArray[2][this.data.multiIndex[2]], this.data.multiArray[3][this.data.multiIndex[3]])
    let querydata = {}
    querydata.addr = this.data.multiArray[0][this.data.multiIndex[0]]
    querydata.floor = this.data.multiArray[1][this.data.multiIndex[1]]
    querydata.room = this.data.multiArray[2][this.data.multiIndex[2]]
    querydata.day = this.data.multiArray[3][this.data.multiIndex[3]]
    querydata.starttime = e.detail.value.starttime
    querydata.endtime = e.detail.value.endtime
    console.log("上传的数据",querydata)
    //校验时间合法性
    if(checktime(querydata)){
      console.log("时间合法")
      wx.cloud.callFunction({
        name: "querySeatMsg",
        data: {
          querydata: querydata
        },
        success(res) {
          console.log(res)
        }
      })
    }
    else{
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
    }

    

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  clickSeat: function(res) {

  },
})