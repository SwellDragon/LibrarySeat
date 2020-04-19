// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const seatdb = db.collection('SeatMsg')
// 云函数入口函数
exports.main = async(event, context) => {
  let _this = this
  let count = 0
  let submitdata = event.submitdata
  // console.log(submitdata)
  submitdata.starttime = new Date(submitdata.starttime)
  submitdata.endtime = new Date(submitdata.endtime)
  console.log("submitdata", submitdata)
  let day = new Date()
  let _id =null
  await seatdb.add({
    data: {
      _openid: submitdata._openid,
      stuid: submitdata.stuid,
      addr: submitdata.addr,
      floor: submitdata.floor,
      room: submitdata.room,
      start_time: submitdata.starttime,
      end_time: submitdata.endtime,
      row: submitdata.row,
      col: submitdata.col,
      free_start: day,
      free_end: day,
      is_cancel: false,
      is_complete: false,
      is_free: false,
      is_late: false,
      is_sign: false
    }
  }).then((res) => {
    
    // console.log(submitdata)
    _id = res._id
    console.log("添加之后", res,_id)
    //检查是否存在冲突
    return seatdb.where({
      stuid: submitdata.stuid,
      addr: submitdata.addr,
      floor: submitdata.floor,
      room: submitdata.room,
      row: submitdata.row,
      col: submitdata.col,
      is_cancel: false,
      is_complete: false,
    }).get()
  }).then((res) => {

    console.log("冲突查询", res)
    let seatmsg = res.data
    let date = submitdata

    console.log("冲突查询元数据", date, seatmsg)
    for (var i = 0; i < seatmsg.length; i++) {
      //查看是否冲突

      if (date.starttime >= seatmsg[i].start_time && date.starttime <= seatmsg[i].end_time ||
        date.endtime >= seatmsg[i].start_time && date.endtime <= seatmsg[i].end_time ||
        date.starttime <= seatmsg[i].start_time && date.endtime >= seatmsg[i].end_time
      ) {
        //标定不可用
        console.log("不可用")
        count++;
      }
    }
  })
  if (count > 1) { //产生冲突,删除刚才添加得数据
    console.log("产生冲突", count)
    seatdb.doc(_id).remove().then((res) => {
      console.log("删除成功", res.data)
    })
    return {
      is_ok:false
    }
  } else {
    return{
      is_ok:true,
      msg:{
        _openid: submitdata._openid,
        stuid: submitdata.stuid,
        addr: submitdata.addr,
        floor: submitdata.floor,
        room: submitdata.room,
        start_time: submitdata.starttime,
        end_time: submitdata.endtime,
        row: submitdata.row,
        col: submitdata.col,
        free_start: day,
        free_end: day,
        is_cancel: false,
        is_complete: false,
        is_free: false,
        is_late: false,
        is_sign: false
      }
    }
    return true
  }
  // const wxContext = cloud.getWXContext()

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }

}