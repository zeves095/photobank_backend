import React from 'react';

export class UserEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      "user": this.props.current_user
    }
    this.updateUser = this.updateUser.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  updateUser(){
    this.props.userUpdateHandler(this.state.user);
  }

  handleSubmit(e){
    e.preventDefault();
    let newUser={
      "id":this.refs["id-input"].value,
      "password":this.refs["password-input"].value,
      "name":this.refs["name-input"].value,
      "role":this.refs["role-input"].value,
    }
    this.props.userUpdateHandler(newUser);
  }

  render() {
    if(this.props.user == null){return "Не выбран пользователь"}
    return(
      <div className="user-editor" key={"user"+this.props.user.id}>
      <h2>{this.props.user.name}</h2>
      <form onSubmit={this.handleSubmit}>
      <input defaultValue={this.props.user.id} type="hidden" ref="id-input" name="id"></input>
      <input defaultValue={this.props.user.name} type="text" ref="name-input" name="name"></input>
      <input defaultValue={this.props.user.password} type="password" ref="password-input" name="password"></input>
      <select defaultValue={this.props.user.role} ref="role-input" name="role">
        <option value="ROLE_USER">Пользователь</option>
        <option value="ROLE_WRITER">Редактор</option>
        <option value="ROLE_ADMIN">Администратор</option>
      </select>
      <button type="submit">Сохранить</button>
      </form>
      </div>
    );
  }
}
