var socket = io();

document.querySelector('form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const username = document.querySelector('#username').value
    const password = document.querySelector('#password').value

    if(username.length > 0 && password.length > 0)  socket.emit("login", {password: password, username: username}) 
    else    update_error("Please enter username and password")
})

document.querySelector('#chat_box').addEventListener("keyup", (e)=> {
    e.preventDefault();
    if (e.keyCode === 13) {
        send_comment()
    }
});

socket.on('isLoggedIn', (data)=>{
    if(data.status){
        document.querySelector('#_login').remove()
        document.querySelector('#title').remove()
        show_data(data.key)
        show_header()
    }
})

socket.on('login_success', (data)=>{
    if(data.status == true){
        document.querySelector('#_login').remove()
        document.querySelector('#title').remove()
        show_data(data.key)
        show_header()
    }
    else if(data.status == "fail"){
        update_error(data.message)
    }
})

socket.on('chat_get', (data)=>{
    add_comment(data.comment.user.profile_pic_url, data.comment.user.username, data.comment.text, data.comment.pk)
})

socket.on('views_count', (data)=>{
    update_views_count(data.count)
})

show_data = (key)=>{
    document.querySelector('#data').style = "display: flex;"
    document.querySelector('#_url').value = "rtmps://live-upload.instagram.com:443/rtmp/"
    document.querySelector('#_key').value = key

    document.querySelector('#show_chat_btn').addEventListener('click', ()=>{
        show_chat()
    })
}

show_header = ()=>{
    document.querySelector('#header').style = "display: flex;"
    document.querySelector('#logout_btn').addEventListener('click', (e)=>{
        e.preventDefault()
        socket.emit('logout', true)
    })
}

show_chat = ()=>{
    //show chat
    var chat = document.getElementById('chat-container')
    chat.style = "display: grid"

    //hide key
    document.getElementById('data').style = "display: none"
}

add_comment = (pic, name, text, pk)=>{
    var comment_html = `<div class="message-row other-message">
                            <div class="message-content" data-pk="${pk}">
                                <img src="${pic}" />
                                <div class="message-name">${name}</div>
                                <div class="message-text">${text}</div>                  
                            </div>
                        </div>`
    document.querySelector('.chat-message-list').insertAdjacentHTML('afterbegin', comment_html)
}

add_question = (pic, name, text, pk)=>{
    var question_html = `<div class="message-row you-message">
                            <div class="message-content">
                                <div class="message-name">${name}</div>
                                <div class="message-text">${text}</div>
                            </div>
                        </div>`
    document.querySelector('.chat-message-list').insertAdjacentHTML('afterbegin', question_html)
}

update_views_count = (views)=>{
    document.querySelector('#views_count').querySelector('span').innerHTML = views
}

update_error = (text)=>{
    var error = document.querySelector('#error')
    error.style = "display: inline;"
    error.innerHTML = text
}

send_comment = ()=>{
    var comment = document.querySelector('#chat_box')
    if(comment.value.length > 0){
        socket.emit("comment", {comment: comment.value})
        comment.value = ""
        comment.focus()
    }
}
