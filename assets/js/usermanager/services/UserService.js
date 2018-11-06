import $ from 'jquery';
class UserService{

  __construct(){

  }

  static fetchUsers(){
    console.log("FETCHING");
    return new Promise((resolve,reject)=>{
      $.getJSON(window.config.user_get_url).done((data)=>{
        console.log(data);
        resolve(data);
      });
      // let users = [
      //   {"id":"0", "password":"pass1","name":"admin", "role":"0"},
      //   {"id":"1", "password":"pass1","name":"user1", "role":"1"},
      //   {"id":"2", "password":"pass1","name":"user2", "role":"1"},
      //   {"id":"3", "password":"pass1","name":"user3", "role":"1"},
      //   {"id":"4", "password":"pass1","name":"user4", "role":"1"},
      //   {"id":"5", "password":"pass1","name":"user5", "role":"1"},
      //   {"id":"6", "password":"pass1","name":"user6", "role":"1"},
      // ];
      // resolve(users);
    });
  }

  static submitUser(user){
    return new Promise((resolve, reject)=>{
      console.log(user);
      $.ajax({
        "url":window.config.user_set_url,
        "data":user,
        "method":"POST"
      }).done((data)=>{
        console.log(data);
        resolve(data);
      });
    });
  }

  static getBlankUser(users){
    let id = users[users.length-1].id + 1;
    let blankUser = {"id":id, "password":"","name":"", "email":"", "active":true, "role":"ROLE_USER"};
    return blankUser;
  }


}

export {UserService};
