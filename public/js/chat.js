const socket = io()   // call I O to connect to these server right
//So we already had socket on the server when the new connection comes in on the client.
//When we initialize the connection we now also get access to socket.
//And this socket is going to allow us to send events and receive events from both the server and the client
const data = []
const videos = ["kJQP7kiw5Fk","YCvAGO53wiQ","vt6fkq3Fxkg","wKuP5Hz30ws","XwNCyPF1nOE","J9svlv6_-eg"]
//elements

const $messageForm = document.querySelector('#message-form')
const $messageFormButton = document.querySelector('button')
const $messageFormInput = document.querySelector('input')
const $sendLocationButton = document.querySelector('#location-nav')
const $messages = document.querySelector('#messages')
const $musicNav = document.querySelector('#music-nav') 
//templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
//destructing object too

const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix: true})  //for removing question mark

const autoScroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new element
    const newMessageStyles = getComputedStyle($newMessage)       //as we shouldnot use css style as they can change later on
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)  //to convert margin value from string to no.
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height

    const visibleHeight = $messages.offsetHeight      //scrollbar height

    //Height of message container

    const containerHeight = $messages.scrollHeight    //total height we can be able to through

    //How far have i scrolled?

    const scrolloffset = $messages.scrollTop + visibleHeight    //scroll top will give us amt of no. we have scrolled to top

    if(containerHeight - newMessageHeight <= scrolloffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('notices',(message) => {
    data.push(message.text)
    const len= data.length
    if(len===4){
        document.getElementById("noticeList").innerHTML = (
            `<a href = "#">`+data[len-0]+`</a>`
            + `<a href = "#">`+data[len-1]+`</a>`
            + `<a href = "#">`+data[len-2]+`</a>`
            +`<a href = "#">`+data[len-3]+`</a>`)
    }
    if(len===3){
    document.getElementById("noticeList").innerHTML = (
        `<a href = "#">`+data[len-1]+`</a>`
        + `<a href = "#">`+data[len-2]+`</a>`
        +`<a href = "#">`+data[len-3]+`</a>`)
    }
    if(len==2){
        document.getElementById("noticeList").innerHTML = (
            `<a href = "#">`+data[len-1]+`</a>`
            + `<a href = "#">`+data[len-2]+`</a>`)
    }
    if(len==1){
        document.getElementById("noticeList").innerHTML = (
            `<a href = "#">`+data[len-1]+`</a>`)
    }
})

socket.on('message',(message) => {  //this message in arg is actually an object getting value in messages.js
    //to render msg
    const html = Mustache.render(messageTemplate,{   //script id is messagetemplate 
        username:message.username,
        message: message.text ,//to send it to index.html in div space
        createdAt:moment(message.createdAt).format("hh:mm:ss a")
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage',(message) => {
    //to render link
    const link = Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format("hh:mm:ss a")
    })
    $messages.insertAdjacentHTML('beforeend',link)
    autoScroll()
})

socket.on('roomData',({room,users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users  //array of user
    })
    console.log(users)
    document.querySelector('#sidebar').innerHTML = html
    autoScroll()
})

$messageForm.addEventListener('submit',(e) => {
    e.preventDefault()
    //disable
    $messageFormButton.setAttribute('disabled','disabled')
    //msg is the name we applied om chat.html
    //const msg = document.querySelector('input').value   otherwise if bottom not

    const msg = e.target.elements.msg.value   //we dont have id for input, e is event

    socket.emit('sendMessage' , msg , (error) => {
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message deliverd!')
    })
})

$musicNav.addEventListener('click',() => {
    const num = Math.floor(Math.random()*6)
    document.getElementById("embed-videos").innerHTML= (`<iframe width="460" height="215" src="https://www.youtube.com/embed/`+videos[num]+`" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`)
})

$sendLocationButton.addEventListener('click',() => {
    //every browser doesnt suppoert geo-location api
    if(!navigator.geolocation){
        return alert('Geolocation is not supported on your browser!')
    }
    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        } , () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('location shared')
        })
        
    })
})

socket.emit('join',{
    username,
    room
    // sno:order()
},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }  
})

var li = document.getElementsByClassName('li_tool');
function hov(){
    // console.log($(this)[0].li[1])
    for(var i=0;i<$(this)[0].li.length;i++){
        var x = $(this)[0].li[i].title

        if(!(x.includes("Joined"))){
            $(this)[0].li[i].setAttribute("title","Joined at "+x)
            }    
        }
    }
    



$("#option").click(function(){
    if($('#navbar_ul').css("display")==="none"){
        $('#navbar_ul').css("display","block")
    }else{
        $('#navbar_ul').css("display","none")
    }
  });

  
