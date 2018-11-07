import $ from 'jquery';
class UserService{

  __construct(){

  }

  static fetchUsers(){
    return new Promise((resolve,reject)=>{
      $.getJSON(window.config.user_get_url).done((data)=>{
        resolve(data);
      }).fail((e)=>{
        reject();
      });
    });
  }

  static submitUser(user){
    return new Promise((resolve, reject)=>{
      user.active = user.active?1:0;
      $.ajax({
        "url":window.config.user_set_url,
        "data":user,
        "method":"POST"
      }).done((data)=>{
        resolve(data);
      }).fail((e)=>{
        reject();
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
