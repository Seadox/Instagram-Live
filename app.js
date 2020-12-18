var express = require("express")
var app = express()
const path = require("path")
var http = require("http").createServer(app)
var io = require("socket.io")(http)

app.use(express.static(path.join(__dirname, "public")))

//Local
var client = require("./instagram/Client");
var globals = require("./instagram/Globals");
var live = require('./instagram/src/request/Live')

let broadcastId

app.get("/", (req, res) => {
    res.render("index.ejs");
  })

  io.on("connection", function (socket) {
    console.log(
        "[" +
          new Date().toISOString().replace(/T/, " ").replace(/\..+/, "") +
          "] " +
          "New connection from " +
          socket.request.connection.remoteAddress
      )

      if(globals.isLoggedIn)
        socket.emit('isLoggedIn', {status: true})

      socket.on('login', (data)=>{
        client.login(data.username, data.password, (data)=>{
          if(globals.isLoggedIn)
          {
            live.create("720", "1184", "", (data)=>{
              o = JSON.parse(data);

              broadcastId = o.broadcast_id

              live.start(broadcastId, (data)=>{
                if(globals.statusCode == 200){
                  socket.emit('login_success', {key: o.upload_url.split("/")[4], status: true})
                  get_updates(broadcastId)
                }
                else{
                  socket.emit('login_success', {status: "fail", message: 'Oops. Something wrong. try again later'})
                }
              })
            })
          }
          else{
            o = JSON.parse(globals.LastResponse)
            socket.emit('login_success', {status: "fail", message: o.message})
          }
        })
          
      })

      socket.on('logout', (res)=>{
        if(res){
          live.end(broadcastId, ()=>{
            client.logout();
            globals.isLoggedIn = false
            console.log('logout')
          })
        }
      })
      
      socket.on('comment', (data)=>{
        live.comment(broadcastId, data.comment, ()=>{
          console.log(globals.LastResponse)
        });
      })
  })

http.listen(8000, () => {
    console.log(
      "[" +
        new Date().toISOString().replace(/T/, " ").replace(/\..+/, "") +
        "] " +
        "Open http://127.0.0.1:8000"
    )
  })

get_updates = async (broadcastId)=>{
  let last_comment = 0
  while(globals.isLoggedIn){
    //Get comments
    live.getComments(broadcastId, last_comment, 3, (res)=>{
      o = JSON.parse(res);
      last_comment = o.comments[o.comments.length - 1].created_at
      for(comment in o.comments){
        io.sockets.emit("chat_get", {comment: o.comments[comment]})
      }
    });
    //Get views count
    live.getViewerList(broadcastId, (res)=>{
      o = JSON.parse(res)
      views_count = o.users.length
      io.sockets.emit('views_count', {count: views_count})
    })
    await new Promise(r => setTimeout(r, 1000))
  }
}
