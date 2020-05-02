// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router');
cloud.init()
const db = cloud.database();
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
  app.router('rejectpeopleadd', async (ctx) => {
    let detail = event.detail
    console.log("拒绝好友请求",detail)
    //修改数据库数据
    await db.collection('AddFriendMsg').doc(detail._id).update({
      data: {
        state:2
      }
    })
  });
  app.router('confirmpeopleadd', async(ctx) => {
    let detail = event.detail
    console.log("接受好友请求", detail)
    //检查是否已经是好友
    await db.collection('FriendMsg').where({
      my_stuid:detail.friend_stuid,
      friend_stuid:detail.applicant_stuid
    }).get().then(async (res)=>{
      console.log("检查是否已是好友",res)
      if(res.data.length ==0 ){//不是好友
        await db.collection('FriendMsg').add({
          data:{
            friend_name:detail.friend_name,
            friend_stuid:detail.friend_stuid,
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
        data:{
          state:1
        }
      })
    })
    // try {
    //   await db.collection('addpeople').where({
    //     chatid: event.peopleconfim.chatid,
    //     status: 0
    //   }).update({
    //     data: {
    //       status: 1,
    //     }
    //   })
    //   await db.collection('user').where({
    //     _openid: event.peopleconfim.askpeopleid
    //   }).update({
    //     data: {
    //       friends: db.command.push([{
    //         id: event.peopleconfim.chatid,
    //         userInfo: event.peopleconfim.peopleadd,
    //         _openid: event.peopleconfim.addpeopleid,
    //         backgroundimage: ''
    //       }])
    //     }
    //   })
    //   await db.collection('user').where({
    //     _openid: event.peopleconfim.addpeopleid
    //   }).update({
    //     data: {
    //       friends: db.command.push([{
    //         id: event.peopleconfim.chatid,
    //         userInfo: event.peopleconfim.peopleask,
    //         _openid: event.peopleconfim.askpeopleid,
    //         backgroundimage: ''
    //       }])
    //     }
    //   })
    // } catch (e) {
    //   console.error(e)
    // }
  });

  return app.serve();
}

//用户获取openid