const socket = io()

//Elements
const $messageform = document.querySelector('#message-form')
const $messageformtext = document.querySelector('#text');
const $messageformbutton = document.querySelector('#button');
const $geolocationbtn = document.querySelector('#send-location')
const $messages = document.querySelector("#messages");

//Templates
const messagetemplate = document.querySelector('#message-template').innerHTML
const locationtemplate = document.querySelector('#location-template').innerHTML
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


socket.on('message', (message) => {
    // console.log(message);
    const html = Mustache.render(messagetemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm:a")
    }) //message:message
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

$messageform.addEventListener('submit', (e) => {
    e.preventDefault()
    //disable
    $messageformbutton.setAttribute('disabled', 'disabled');
    const message = e.target.elements.message.value
    socket.emit('sendmessage', message, (ack) => {
        $messageformbutton.removeAttribute('disabled');
        $messageformtext.value = ''
        $messageformtext.focus()
        console.log(ack)
    });
    //enable


})

$geolocationbtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geoloaction is not supported')
    }
    $geolocationbtn.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('location', location, (ack) => {
            $geolocationbtn.removeAttribute('disabled')
            console.log(ack);
        })
    })
})

socket.on('locationmsg', (message) => {
    const html = Mustache.render(locationtemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format("h:mm:a")
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})


socket.on('roomdata', ({
    room,
    users
}) => {
    const html = Mustache.render(sidebartemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})