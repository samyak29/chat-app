const users = []

const addUser = (user)=>{
    let {id,username,room} = user
    //check if empty
    if(!username || !room){
        return {
            error:'Empty username or room'
        }
    }
    //normalize values
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase() 
    //check if already present
    const exisitingUser = users.find((user)=>user.username===username&&user.room===room)
    if(exisitingUser){
        return {
            error:'User already present'
        }
    }
    users.push(user)
    return {user}
}

const removeUser = (id)=>{
    const userIndex = users.findIndex((user)=>user.id===id)
    if(userIndex!=-1){
        return users.splice(userIndex,1)[0]
    }
}

const getUser = (id)=> users.find((user)=> user.id===id)

const getUsersInRoom = (room)=> users.filter((user)=> user.room===room)

 module.exports = {
     addUser,
     removeUser,
     getUser,
     getUsersInRoom
 }


