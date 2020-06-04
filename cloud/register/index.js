// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const userdb = db.collection('UserInfo')
const studb = db.collection('Student')


// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  var openid = event.openid
  var event = event.detail
  var re 

  await studb.where({
    stu_id: event.detail.value.stuid
  }).get().then(async (res)=>{
    {
        //console.log( res)
        if (res.data.length != 0 && res.data[0].name == event.detail.value.username) {
          console.log("已匹配", res)
          console.log(event.detail)
          //查询是否已被注册
          await userdb.where({
            student_id: event.detail.value.stuid
          }).get().then(async (res)=>{
                //已被注册
                console.log("查询是否已被注册", res)
                if (res.data.length != 0) {
                  console.log("曾经被注册")
                  if (res.data[0].user_id == "") {
                    console.log("已注销")
                    //已注销
                    //修改数据！！！！！！！！！！！！！！！！！！！！！！！！！！
                    await userdb.doc(res.data[0]._id).update({
                      data: {
                        _openid: openid,
                        user_id: openid,
                      },
                    }).then(async (res) => {
                      console.log(res)
                      if (res.stats.updated == 1) {
                        re =  {
                          is_ok: true
                        }
                      } else {
                        re = {
                          is_ok: false,
                          msg: "曾经注销，修改数据失败"
                        }
                      }
                    })
                  }
                  else {
                    console.log("姓名和学号已被注册，请联系管理员")
                    re = {
                      is_ok: false,
                      msg: "姓名和学号已被注册，请联系管理员"
                    }
                  }

                }
                //未被注册
                else {
                  console.log("未被注册")
                  //添加数据！！！！！！！！！！！！！！！！！！！！！！！！！！
                  await userdb.add({
                    data: {
                      _openid: openid,
                      user_name: event.detail.value.username,
                      student_id: event.detail.value.stuid,
                      user_id: openid,
                      team_id: ""
                      //user_id: 123,
                    },
                  }).then(async(res) => {
                    console.log(res)
                    if (res.errMsg == "collection.add:ok") {
                      re =  {
                        is_ok: true
                      }
                    } else {
                      console.log("新用户，注册失败")
                      re =  {
                        is_ok: false,
                        msg: "新用户，注册失败"
                      }
                    }
                  })
                }
              
            
          })
        }
        //若不匹配
        else {
          console.log("不匹配");
          re =  {
            is_ok: false,
            msg: "姓名或学号不正确",
          }
        }
      // },
      // fail(err) {
      //   return {
      //     is_ok: false,
      //     msg: "姓名学号匹配查询失败",
      //     err: err
      //   }
      // }
    }
  })

  console.log("返回值",re)
  return re
}