const socket = io()   // call I O to connect to these server right
//So we already had socket on the server when the new connection comes in on the client.
//When we initialize the connection we now also get access to socket.
//And this socket is going to allow us to send events and receive events from both the server and the client

//elements

const $messageForm = document.querySelector('#message-form')
const $messageFormButton = document.querySelector('button')
const $messageFormInput = document.querySelector('input')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

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

socket.on('message',(message) => {  //this message in arg is actually an object getting value in messages.js
    //to render msg
    const html = Mustache.render(messageTemplate,{   //script id is messagetemplate 
        username:message.username,
        message: message.text ,//to send it to index.html in div space
        createdAt:moment(message.createdAt).format("h:m:ss a")
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage',(message) => {
    //to render link
    const link = Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format("h:m:ss a")
    })
    $messages.insertAdjacentHTML('beforeend',link)
    autoScroll()
})

socket.on('roomData',({room,users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e) => {
    e.preventDefault()
    //disable
    $messageFormButton.setAttribute('disabled','disabled')

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

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }  
})