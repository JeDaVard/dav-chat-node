const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messParent = document.querySelector('#messagesParent');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const anoMessageTemplate = document.querySelector('#anonymous-message-template').innerHTML;
const locMesTemplate = document.querySelector('#locMes-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const fixScroll = () => {
    $messParent.scrollTop = $messages.scrollHeight

    // //new message
    // const $newMessage = $messages.lastElementChild;
    //
    // //height of the new message
    // const newMessageStyles = getComputedStyle($newMessage);
    // const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    // const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    //
    // //visible height
    // const visibleHeight = $messages.offsetHeight;
    //
    // //height of messages container
    // const containerHeight = $messages.scrollHeight;
    //
    // //how far have I scrolled?
    // const scrollOffset = $messages.scrollTop + visibleHeight;
    //
    // if (containerHeight - newMessageHeight <= scrollOffset) {
    //     $messages.scrollTop = $messages.scrollHeight;
    // }
};

//Server messages from weather-app
socket.on('anoMessage', ({ text, createdAt }) => {
    const html = Mustache.render(anoMessageTemplate, {
        createdAt: moment(createdAt).format('HH:mm:ss'),
        text
    });
    $messages.insertAdjacentHTML('beforeend', html);
    fixScroll()
});
//User Messages from weather-app
socket.on('message', ({ text, createdAt, username, }) => {
    const html = Mustache.render(messageTemplate, {
        username,
        createdAt: moment(createdAt).format('HH:mm:ss'),
        text
    });
    $messages.insertAdjacentHTML('beforeend', html);
    fixScroll();
});
//Message data emit
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = e.target.elements.message.value.trim();
    if (message === '') {
        return;
    }

    socket.emit('sendMessage', message, (error) => {
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
});

//Location message from weather-app
socket.on('locationMessage', ({ url, createdAt, username }) => {
    const html = Mustache.render(locMesTemplate, {
        username,
        url,
        createdAt: moment(createdAt).format('HH:mm:ss'),
    });
    $messages.insertAdjacentHTML('beforeend', html);
    fixScroll();
});

// Geolocation data emit
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.firstElementChild.className = 'lds-dual-ring';

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.firstElementChild.className = 'send-loc';
            console.log('Location shared!')
        })
    })
});

//active users
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    $sidebar.innerHTML = html;
});

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true});

//
socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }
});

