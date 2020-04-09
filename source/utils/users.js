const users = [];

//add User ,remove user, get user and get users in room


const addUser = ({
    id,
    username,
    room
}) => {
    //Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase()

    //validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    //Check for existing user
    const existinguser = users.find((user) => {
        return user.room === room && user.username === username
    })
    //validate username
    if (existinguser) {
        return {
            error: "Username is in use"
        }

    }

    //Store user
    const user = {
        id,
        username,
        room
    };
    users.push(user)
    return {
        user
    }

}


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}



const getUser = (id) => {
    return users.find((user) => user.id === id)
}


const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

// adduser({
//     id: 234,
//     username: 'ashish ',
//     room: 'Bhagwan'
// })

// const res = adduser({
//     id: 333,
//     username: 'ashish',
//     room: 'Bhagwan2'

// })
// console.log(users)
// console.log(res)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}