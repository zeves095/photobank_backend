class UserService{

  __construct(){

  }

  static fetchUsers(){
    return new Promise((resolve,reject)=>{
      let users = [
        {"id":"0", "password":"pass1","name":"admin", "role":"ROLE_ADMIN"},
        {"id":"1", "password":"pass1","name":"user1", "role":"ROLE_USER"},
        {"id":"2", "password":"pass1","name":"user2", "role":"ROLE_USER"},
        {"id":"3", "password":"pass1","name":"user3", "role":"ROLE_USER"},
        {"id":"4", "password":"pass1","name":"user4", "role":"ROLE_USER"},
        {"id":"5", "password":"pass1","name":"user5", "role":"ROLE_USER"},
        {"id":"6", "password":"pass1","name":"user6", "role":"ROLE_USER"},
      ];
      console.warn(users);
      resolve(users);
    });
  }

  static submitUser(user){
    console.log(user);
  }

  static getBlankUser(){
    let blankUser = {"id":"7", "password":"","name":"", "role":"ROLE_USER"};
    return blankUser;
  }


}

export {UserService};
