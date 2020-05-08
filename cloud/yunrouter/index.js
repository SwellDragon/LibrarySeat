// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router');
cloud.init()
const db = cloud.database();
const _ = db.command
const frienddb = db.collection('FriendMsg')
const teamdb = db.collection('TeamMsg')
const orderdb = db.collection('OrderMsg')
const userdb = db.collection('UserInfo')

// 云函数入口函数
exports.main = async(event, context) => {
  const app = new TcbRouter({
    event
  });
  const wxContext = cloud.getWXContext()
  app.router('openid', async(ctx) => {
    const wxContext = cloud.getWXContext()
    ctx.body = wxContext.OPENID;
  });
  app.router('HuoquFriends', async(ctx) => {
    try {
      ctx.body = await db.collection('user').where({
        _openid: event.openid
      }).get()
    } catch (e) {
      console.error(e)
    }
  });
  app.router('rejectpeopleadd', async(ctx) => {
    let detail = event.detail
    console.log("拒绝好友请求", detail)
    //修改数据库数据
    await db.collection('AddFriendMsg').doc(detail._id).update({
      data: {
        state: 2
      }
    })
  });


  app.router('confirmpeopleadd', async(ctx) => {
    let detail = event.detail
    console.log("接受好友请求", detail)
    //检查是否已经是好友
    await db.collection('FriendMsg').where({
      my_stuid: detail.friend_stuid,
      friend_stuid: detail.applicant_stuid
    }).get().then(async(res) => {
      console.log("检查是否已是好友", res)
      if (res.data.length == 0) { //不是好友
        await db.collection('FriendMsg').add({
          data: {
            friend_name: detail.friend_name,
            friend_stuid: detail.friend_stuid,
            my_name: detail.applicant_name,
            my_stuid: detail.applicant_stuid,
          }
        })
        await db.collection('FriendMsg').add({
          data: {
            friend_name: detail.applicant_name,
            friend_stuid: detail.applicant_stuid,
            my_name: detail.friend_name,
            my_stuid: detail.friend_stuid,
          }
        })
      }
      //修改添加数据库中得信息
      await db.collection('AddFriendMsg').doc(detail._id).update({
        data: {
          state: 1
        }
      })
    })
  });

  app.router('deletefriend', async(ctx) => {
    let detail = event.detail
    console.log("调用删除好友函数", event)
    await db.collection('FriendMsg').where(
      _.or([{
          my_stuid: detail.friend_stuid,
          friend_stuid: detail.my_stuid
        },
        {
          my_stuid: detail.my_stuid,
          friend_stuid: detail.friend_stuid
        }
      ])

    ).get().then(async(res) => {
      console.log("检查是否已是好友", res)
      if (res.data.length == 2) {
        let flag = true
        for (var i = 0; i < 2; i++) {
          await frienddb.doc(res.data[i]._id).remove().then((res) => {
            console.log("删除数据库", i, res)
            if (res.errMsg != 'document.remove:ok') {
              console.log("删除好友出错")
              flag = false
            }
          })
        }
        console.log(flag)
        if (flag) {

          ctx.body = {
            is_ok: true,
            msg: '删除好友成功'
          }
        } else {
          ctx.body = {
            is_ok: false,
            msg: '删除好友过程中出现未知错误，请联系管理员'
          }
        }

      } else {
        ctx.body = {
          is_ok: false,
          msg: "数据异常，不为双向好友，请联系管理员"
        }
      }
    })
  })
  app.router('creatTeam', async(ctx) => {
    let id = ""
    console.log("创建队伍", event)
    await orderdb.where({
      key: "team_num"
    }).get().then(async(res) => {
      console.log("当前team数 ", res.data[0].value)
      id = 'team_' + event.stuid + '_' + res.data[0].value
      console.log("team_id:", res.data[0].value)
      await orderdb.doc(res.data[0]._id).update({
        data: {
          value: _.inc(1)
        }
      })
      return teamdb.add({
        data: {
          team_name: id,
          team_id: id
        }
      })
    }).then(async(res) => {
      if (res.errMsg == "collection.add:ok") {
        console.log("创建队伍成功")
        await userdb.where({
          student_id: event.stuid
        }).update({
          data: {
            team_id: id
          }

        })
        ctx.body = {
          is_ok: true,
          team_id: id
        }
      } else {
        ctx.body = {
          is_ok: false,
        }
      }
    })
  })
  app.router('invitepeople', async(ctx) => {
    console.log(event)
    //查找这个人没有加入队伍
    await userdb.where({
      student_id: event.student_id,
      team_id: ""
    }).update({
      data: {
        team_id: event.team_id
      }
    }).then(async(res) => {
      console.log(res)
      if (res.stats.updated == 1) {
        console.log("已拉入队伍", res)
        ctx.body = {
          is_ok: true
        }
      } else if (res.stats.updated == 0) {
        console.log("该用户已经拥有了队伍", res)
        ctx.body = {
          is_ok: false,
          msg: "该用户已经拥有了队伍"
        }
      } else {
        console.log("加入队伍出现异常", res)
        ctx.body = {
          is_ok: false,
          msg: "加入队伍出现异常，请联系管理员"
        }
      }

    })
  })

  app.router('change_team_name', async(ctx) => {

    await teamdb.where({
      team_id: event.team_id
    }).update({
      data: {
        team_name: event.new_team_name
      }
    }).then((res) => {
      console.log(res)
      if (res.stats.updated == 1) {
        ctx.body = {
          is_ok: true
        }
      } else if (res.stats.updated == 0) {
        ctx.body = {
          is_ok: false,
          msg: "数据库更新失败"
        }
      } else {
        ctx.body = {
          is_ok: false,
          msg: "疑似出现重复team_id,请联系管理员"
        }
      }
    })
  })
  app.router('delete_team_member', async(ctx) => {
    await userdb.where({
      student_id: event.member_stuid,
      team_id: event.team_id
    }).update({
      data: {
        team_id: ""
      }
    }).then((res) => {
      console.log(res)
      if (res.stats.updated == 1) {
        ctx.body = {
          is_ok: true
        }
      } else if (res.stats.updated == 0) {
        ctx.body = {
          is_ok: false,
          msg: "用户不存在或者不是该队伍中人"
        }
      } else {
        ctx.body = {
          is_ok: false,
          msg: "出现奇怪的异常,更新数量大于1,请联系管理员"
        }
      }
    })
  })

  app.router('disband_team', async(ctx) => {
    console.log(event)
    await userdb.where({
      team_id: event.team_id
    }).update({
      data: {
        team_id: ""
      }
    }).then((res) => {
      console.log(res)
      if (res.stats.updated >0) {
        ctx.body = {
          is_ok: true
        }
      }else {
        ctx.body = {
          is_ok: false,
          msg: "数据库更新失败"
        }
      }
    })
  })

  return app.serve();
}

//用户获取openid