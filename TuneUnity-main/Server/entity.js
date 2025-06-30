let users = [];

const addUsers = (id, name, room) => {
  name = name.trim();
  console.log("🔥 addUsers called with:", { id, name, room }); // Make sur
  const existing = users.find(u => u.room === room && u.name === name);
  if (existing) return { error: "User already exists in this room" };
  const user = { id, name, room };
  users.push(user);
  console.log("bangalore",users)
  return { user };

};


const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];  
  }
};

const getUser = (id) => users.find(u => u.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {
  addUsers,
  removeUser,
  getUser,
  getUsersInRoom 
};
