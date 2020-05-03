// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
const seatdb = db.collection('SeatMsg')
const roomdb = db.collection('RoomMsg')
const MAX_LIMIT = 100

//查询已经占用的座位情况
async function queryseat(querydata) {
  const countResult = await seatdb.where({
    addr: querydata.addr,
    floor: querydata.floor,
    room: querydata.room,
    is_complete:false,
    is_cancel:false
  }).count()
  console.log(countResult)
  const total = countResult.total
  if(total==0){
    console.log("查询已经占用的座位情况，空房间")
    return{
      nohavedata:true
    } 
  }
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = seatdb.where({
      addr: querydata.addr,
      floor: querydata.floor,
      room: querydata.room,
      is_complete: false,
      is_cancel: false
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  //等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      
      nohavedata:false,
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}
//查询房间行列数
async function queryroom(querydata) {
  let roommsg = await roomdb.where({
    addr: querydata.addr,
    floor: querydata.floor,
    room: querydata.room
  }).get()
  return roommsg
}
//获取申请的起始时间与结束时间
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

// 云函数入口函数
exports.main = async(event, context) => {
  console.log(event)
  let querydata = event.querydata
  console.log("申请占座数据", querydata)
  //查询数据库，这间房间已经占用的相关信息
  let seatmsg = await queryseat(querydata)
  console.log("当前座位占用信息，seatmsg", seatmsg)
  //查询当前房间行列
  let roommsg = await queryroom(querydata)
  roommsg = roommsg.data[0]
  console.log("roommsg", roommsg)
  let room = new Array(roommsg.row)
  //初始化房间矩阵 1为可用 0为不可用
  for (var i = 0; i < roommsg.row; i++) {
    room[i] = new Array(roommsg.col)
    for (var j = 0; j < roommsg.col; j++) {
      room[i][j] = 1
    }
  }
  console.log("room", room)
  if(seatmsg.nohavedata){
    return {
      is_ok: true,
      msg: "查询成功,空房间",
      room: room
    }
  }
  seatmsg = seatmsg.data

  //获取起始时间与结束时间
  let date = getdate(querydata)
  console.log("date", date, new Date())
  //处理信息
  for (var i = 0; i < seatmsg.length; i++) {
    //待预约起始时间或结束时间在已预约起始时间和结束时间中间的座位不可用 或待预约开始时间比已预约开始时间早且其带预约结束时间比已预约结束时间晚不可用，其余可用
    console.log(seatmsg[i])
    console.log("尝试", date.startdate, seatmsg[i].end_time, date.startdate < seatmsg[i].end_time)
    if (date.startdate >= seatmsg[i].start_time && date.startdate <= seatmsg[i].end_time ||
      date.enddate >= seatmsg[i].start_time && date.enddate <= seatmsg[i].end_time ||
      date.startdate <= seatmsg[i].start_time && date.enddate >= seatmsg[i].end_time
    ) {
      //标定不可用
      if(seatmsg[i].stuid==event.stuid){
        console.log("学号相同")
        return{
          is_ok: false,
          msg: "这段时间内已占有座位",
        }
      }
      console.log(seatmsg[i].row + "行" + seatmsg[i].col +"列该座位不可用")
      room[seatmsg[i].row - 1][seatmsg[i].col - 1] = 0
    }
  }
  //返回信息
  return {
   is_ok:true,
   msg:"查询成功,不是空房间",
   room: room
  }
  // return {
  //   event,
  //   context,
  // openid: wxContext.OPENID,
  // appid: wxContext.APPID,
  // unionid: wxContext.UNIONID,
  // }
}