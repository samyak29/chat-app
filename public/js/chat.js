const socket = io()
//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('.chat__sidebar')

//templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const query = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = ()=>{
    const $newMessage = $messages.lastElementChild
    //new message height
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginTop)+parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop+$messages.offsetHeight
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}
const addMessageWithScroll = (messageHtml)=>{
    //checks if the user is viewing last message
    if($messages.scrollTop+$messages.offsetHeight>=$messages.scrollHeight){
        $messages.insertAdjacentHTML('beforeend',messageHtml)
        $messages.scrollTop = $messages.scrollHeight
    }else{
        $messages.insertAdjacentHTML('beforeend',messageHtml)
    }
}
//handles message event 
socket.on('message',(message)=>{
    const messageHtml = Mustache.render($messageTemplate,message)
    addMessageWithScroll(messageHtml)
    // $messages.insertAdjacentHTML('beforeend',messageHtml)
    // autoscroll()
})
//handles locationMessage event
socket.on('locationMessage',(message)=>{
    const messageHtml = Mustache.render($locationMessageTemplate,message)
    addMessageWithScroll(messageHtml)
    // $messages.insertAdjacentHTML('beforeend',messageHtml)
    // autoscroll()
})
//handles roomData event
socket.on('roomData',({room,users})=>{
    const html = Mustache.render($sidebarTemplate,{
        users,
        room
    })
    $sidebar.innerHTML = html
})
//emits a new user joining event
socket.emit('join',query,(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    const message = e.target.elements.message.value

    $messageFormInput.value = ''
    $messageFormInput.focus()
    $messageFormButton.setAttribute('disabled','true')

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        if(error){
            return console.log(error);
        }
        console.log('Message delivered')
    })
})
$sendLocationButton.addEventListener('click',()=>{
    $sendLocationButton.setAttribute('disabled','true')
    const geolocation = navigator.geolocation
    if(!geolocation){
        return alert('Current browser does not supports location')
    }
    geolocation.getCurrentPosition(({coords:{latitude,longitude}})=>{
        socket.emit('sendLocation', {latitude,longitude},(message)=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log(message);
        })
    })
})