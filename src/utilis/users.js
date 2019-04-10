const users = []

//addUser , removeUser , getUser , getUsersInRoom
const getUser= (id) => {
     return users.find((user)=> user.id===id)  //argument me har user aayega fir uska id ko id se ccompare kia jayega,agar same aya to true return hga
    }

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter( (user) => user.room === room)
}


const removeUser = (id) => {
    const index =  users.findIndex((user)=>{
        return user.id === id
    })
 
    if(index!==-1){
        return users.splice(index,1)[0]   //as it is an array of all removed result
    }
 }
 

const addUser = ({id , username , room, createdAt}) =>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()


    if(!username || !room){
        return {
            error:'Username and room are required!'
        }
    }

    //check for existing user

    const existingUser = users.find((user) => {
        return /*true if*/ user.room === room && user.username === username
    })

    //so now validate userName as its a problem

    if(existingUser){
        return {
            error:'Username is already taken in this room'
        }
    }

    //store user
    const user = {id,username,room,createdAt}   //es6 feature
    users.push(user)
    return {user}

}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}