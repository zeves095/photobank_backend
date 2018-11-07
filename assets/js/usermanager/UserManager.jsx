import React from 'react';
// import $ from 'jquery';

import {UserList} from './UserList';
import {UserEditor} from './UserEditor';
import {UserService} from './services/UserService';
import {NotificationService} from '../services/NotificationService';

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
      this.setState({
          "users":users
      });
    }).catch((e)=>{
      NotificationService.throw("user-list");
    });
  }

  handleUserUpdate(user){
    UserService.submitUser(user).then(()=>{
      this.fetchUsers();
      //this.handleUserChoice(user.id);
      NotificationService.toast("user-success");
    }).catch((e)=>{
      NotificationService.throw("user-update-failed");
    });
  }

  handleUserChoice(id){
    let user;
    if(typeof id == "undefined"){
      user = UserService.getBlankUser(this.state.users);
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
    return(
      <div className="user-manager-main row">
        <div id="notification-overlay">

        </div>
      <nav className="nav-wrapper blue-grey darken-2">
        <div class="brand-logo"><i className="fas fa-camera"></i>PhotoBank - Редактор пользователей</div>
        </nav>
        <UserList users={this.state.users} userChoiceHandler={this.handleUserChoice} />
        <UserEditor user={this.state.current_user} userUpdateHandler={this.handleUserUpdate} />
      </div>
    );
  }
}
