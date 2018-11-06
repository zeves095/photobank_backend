import React from 'react';
// import $ from 'jquery';

import {UserList} from './UserList';
import {UserEditor} from './UserEditor';
import {UserService} from './services/UserService';

export class UserManager extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      "users": [],
      "current_user": null
    }
    this.fetchUsers = this.fetchUsers.bind(this);
    this.handleUserUpdate = this.handleUserUpdate.bind(this);
    this.handleUserChoice = this.handleUserChoice.bind(this);
  }

  fetchUsers(){
    UserService.fetchUsers().then((users)=>{
      console.log(users);
      this.setState({
          "users":users
      });
    });
  }

  handleUserUpdate(user){
    UserService.submitUser(user);
  }

  handleUserChoice(id){
    let user;
    if(typeof id == "undefined"){
      user = UserService.getBlankUser();
    }else{
      user = this.state.users.filter(u=>u.id==id)[0];
    }
    this.setState({
      "current_user": user
    });
  }

  componentWillMount(){
    this.fetchUsers();
  }

  render() {
    console.log(this.state.users);
    return(
      <div className="user-manager-main">
      <h1>Редактор пользователей</h1>
        <UserList users={this.state.users} userChoiceHandler={this.handleUserChoice} />
        <UserEditor user={this.state.current_user} userUpdateHandler={this.handleUserUpdate} />
      </div>
    );
  }
}
