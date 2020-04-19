//index.js
//获取应用实例
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const seatdb = db.collection('SeatMsg')
const latedb = db.collection('LateMsg')
var util = require("../../utils/util.js");
let nowtime = new Date();
// const _this = this
let studata = []
let is_signdata = []
let is_latedata = []
let is_freedata = []
let is_canceldata = []
let can_signdata = []
let show_canceldata = []

function analysis(studata, _this) {
  console.log("调用analysis")
  // console.log("准备开始解析每条数据", studata.length, studata)
  for (let i = 0; i < studata.length; i++) { //解析具体数据
    console.log("开始解析每条数据", studata)
    //解析签到数据
    if (studata[i].is_sign == true) {
      is_signdata[i] = true
      can_signdata[i] = false
    } else {
      is_signdata[i] = false
      //判断是否可以签到
      console.log(Date.parse(studata[i].start_time), Date.parse(studata[i].start_time) - 15 * 60 * 1000, Date.parse(nowtime))
      if (Date.parse(studata[i].start_time) - 15 * 60 * 1000 <= Date.parse(nowtime)) { //开始时间前15分钟后可进行签到
        console.log("可签到")
        can_signdata[i] = true
      }
    }
    //解析迟到数据
    if (studata[i].is_late == true) {
      console.log("迟到")
      is_latedata[i] = true
    } else {
      is_latedata[i] = false
    }
    //解析空闲数据
    // console.log("解析空闲数据")
    if (studata[i].is_free == true) {
      is_freedata[i] = true
    } else {
      is_freedata[i] = false
    }
    //解析取消数据
    // console.log("解析取消数据")
    if (studata[i].is_cancel == true) {
      is_canceldata[i] = true
      show_canceldata[i] = false
    } else {
      is_canceldata[i] = false
      show_canceldata[i] = true
    }
    //修改每个时间数据
    studata[i].start_time = new Date(studata[i].start_time)
    studata[i].end_time = new Date(studata[i].end_time)
    studata[i].start_time = util.formatTime(studata[i].start_time)
    studata[i].end_time = util.formatTime(studata[i].end_time)
  }
  // console.log(res)
  _this.setData({
    seatmsg: studata,
    is_sign: is_signdata,
    is_late: is_latedata,
    is_free: is_freedata,
    is_cancel: is_canceldata,
    can_sign: can_signdata,
    show_cancel: show_canceldata
  })
};
Page({
  data: {
    seatmsg: [],
    msg: [],
    is_sign: [],
    is_late: [],
    is_free: [],
    is_cancel: [],
    can_sign: [],
    show_cancel: [],
    stuid: null,
    name: null,
    is_first:true
  },
  //事件处理函数
  sign(e) { //签到
    //扫码验证是否到了座位
    let _this = this
    let edata = e.target.dataset.item
    console.log(edata)
    wx.scanCode({
      scanType: ['qrCode'],
      onlyFromCamera: true,
      success(res) {
        console.log(res)
        // var s = res.result
        // console.log(s)
        var msg = JSON.parse(res.result.trim())
        console.log(msg)
        console.log(edata)
        if (edata.addr == msg.addr && edata.floor == msg.floor && edata.room == msg.room && edata.row == msg.row && edata.col == msg.col) { //已经到了座位
          //签到 上传数据库
          seatdb.doc(edata._id).update({
            data: {
              is_sign: true
            },
            success(res) {
              console.log("签到成功", res)
              wx.showModal({
                title: '提示',
                content: '签到成功',
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
              is_signdata[e.target.dataset.index] = true
              can_signdata[e.target.dataset.index] = false
              _this.setData({
                is_sign: is_signdata,
                can_sign: can_signdata
              })
            },
            fail(err) {
              console.log("签到失败", res)
              wx.showModal({
                title: '提示',
                content: '签到失败',
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
        } else {
          wx.showModal({
            title: '提示',
            content: '座位不符',
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
  cancel(e) {
    let _this = this
    console.log(e)
    wx.showModal({
      title: '提示',
      content: '是否取消预约',
      // showCancel: false,
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          seatdb.doc(e.target.dataset.item._id).update({
            data: {
              is_cancel: true
            },
            success(res) {
              console.log("取消预约成功", res)
              is_canceldata[e.target.dataset.index] = true
              show_canceldata[e.target.dataset.index] = false
              _this.setData({
                is_cancel: is_canceldata,
                show_cancel: show_canceldata
              })
            },
            fail(err) {
              console.log("失败！！！取消预约", )
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  onLoad: function() {
    let _this = this
    this.setData({
      name: app.globalData.name,
      stuid: app.globalData.stuid
    })
    //获取当前学生占座信息
    console.log(_this.data.stuid);
    seatdb.where({
      stuid: _this.data.stuid,
      is_complete: false
    }).get().then((res) => {
      //遍历所有数据
      console.log("获取当前学生占座数据成功", res)
      var mdata = res.data;
      var wait = true
      for (let i = 0; i < res.data.length; i++) { //遍历每个数据，处理违约及未完成数据，无异常则加入可显示数据
        //查询是否违约
        if (!mdata[i].is_sign && !mdata[i].is_late && !mdata[i].is_cancel && nowtime > mdata[i].start_time) { //若超过时间未签到且尚未标记违约，则违约
          console.log("违约!!!记录入违约表", _this.data.stuid);
          latedb.where({
            stuid: _this.data.stuid
          }).get().then((res) => {
            // console.log(i);
            let late = res.data
            console.log("失约记录：", res);
            //之前未有失约记录
            if (res.data.length == 0) { //无失约
              console.log("无失约")
              console.log(mdata, i)
              //新建数据
              latedb.add({
                data: {
                  stuid: _this.data.stuid,
                  count: 1,
                  details: [mdata[i]._id]
                }
              }).then(res => {
                console.log("添加失约记录成功", res)
              })
            } else { //若有失约记录，修改数据
              console.log("有失约", late[0]._id)
              latedb.doc(late[0]._id).update({
                data: {
                  count: _.inc(1),
                  details: _.push(mdata[i]._id)
                },
                success: function(res) {
                  console.log("修改失约记录成功", res)
                },
                fail(err) {
                  console.log("失败！！！修改失约记录", err)
                }
              })
            }
            //修改座位表信息
            if (nowtime > mdata[i].end_time) { //若已经结束了这个占座，将座位信息表违约、完成字段标为真
              seatdb.doc(mdata[i]._id).update({
                data: {
                  is_late: true,
                  is_complete: true
                },
                success(res) {
                  console.log("将座位信息表违约、完成字段标为真", res)
                },
                fail(err) {
                  console.log("失败！！！！将座位信息表违约、完成字段标为真", err)
                }
              })
              // if (i == res.data.length - 1) {
              //   analysis(studata, _this)
              // }

            } else { //若还在时间内，将座位信息表违约字段标为真,并显示
              mdata[i].is_late = true
              studata.push(mdata[i])
              console.log("修改失约后 仍加入信息", studata)
              seatdb.doc(mdata[i]._id).update({
                data: {
                  is_late: true,
                },
                success(res) {
                  console.log("将座位信息表违约字段标为真", res)
                },
                fail(err) {
                  console.log("失败！！！！将座位信息表违约字段标为真", err)
                }
              })

              // if (i == res.data.length - 1) {
              //   analysis(studata, _this)
              // }
            }
          })
        } else { //若未违约
          if (nowtime > mdata[i].end_time) { //若已经结束了这个占座，将座位信息表完成字段标为真

            seatdb.doc(mdata[i]._id).update({
              data: {
                is_complete: true
              },
              success(res) {
                console.log("将座位信息表完成字段标为真", res)
              },
              fail(err) {
                console.log("失败！！！！将座位信息表完成字段标为真", err)
              }
            })
            // if (i == res.data.length - 1) {
            //   analysis(studata, _this)
            // }
          } else { //情况正常，显示
            studata.push(mdata[i]);
            // if (i == res.data.length - 1) {
            //   analysis(studata, _this)
            // }
          }
        }
        if (i == res.data.length - 1 || res.data.length==0) {
          app.globalData.stuseatmsg = studata
          return studata
        }
      }
      
    }).then((res) => {
      console.log("预处理数据结束",res)
      analysis(studata, _this)
      _this.setData({
        is_first:false
      })
    })
  },
  onShow:function(){
    if(!this.data.is_first){
      let _this = this
      studata = app.globalData.stuseatmsg
      console.log("再次进入分析得studata",studata)
      analysis(studata, _this)
    }
    
  }
})