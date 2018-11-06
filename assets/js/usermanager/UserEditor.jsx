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
    console.warn(this.refs["active-input"].checked);
    let newUser={
      "id":this.refs["id-input"].value,
      "password":this.refs["password-input"].value,
      "email":this.refs["email-input"].value,
      "active":this.refs["active-input"].checked,
      "name":this.refs["name-input"].value,
      "role":this.refs["role-input"].value,
    }
    this.props.userUpdateHandler(newUser);
  }

  render() {
    if(this.props.user == null){return "Не выбран пользователь"}
    return(
      <div className="user-editor col s8" key={"user"+this.props.user.id}>
      <h4>{this.props.user.name}</h4>
      <form onSubmit={this.handleSubmit}>
      <input defaultValue={this.props.user.id} type="hidden" ref="id-input" name="id"></input>
    <label htmlFor="name">Имя пользователя</label>
    <input defaultValue={this.props.user.name} type="text" ref="name-input" name="name"></input>
  <label htmlFor="email">Email</label>
    <input defaultValue={this.props.user.email} type="text" ref="email-input" name="email"></input>
  <label htmlFor="active">Активен</label>
<input defaultChecked={this.props.user.active} type="checkbox" ref="active-input" name="active"></input>
  <label htmlFor="password">Пароль</label>
    <input defaultValue={this.props.user.password} type="password" ref="password-input" name="password"></input>
  <label htmlFor="role">Уровень доступа</label>
    <select defaultValue={this.props.user.role} ref="role-input" name="role">
      <option value="3">Пользователь</option>
      <option value="2">Редактор</option>
    <option value="1">Модератор</option>
      </select>
      <button type="submit">Сохранить</button>
      </form>
      </div>
    );
  }
}
