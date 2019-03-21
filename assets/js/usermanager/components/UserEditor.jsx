import React from 'react';
import {connect} from 'react-redux';
import {submitUser} from '../actionCreator';
import selectors from '../selectors';
/**
 * Компонент для отображения интерфейса редактирования или создания пользователя
 */
export class UserEditor extends React.Component {

  /**
   * Конструктор компонента
   * user - Объект текущего пользователя
   * sent - Была ли отправлена форма с этими данными
   * hide_password - Отображать ли пароль как plaintext или скрывать
   */
  constructor(props) {
    super(props);
    this.state ={
      "sent": false,
      "hide_password": true
    }
  }

  /**
   * Обработчик отправки формы с данными пользователя
   * @param  {Event} e Событие клика
   */
  handleSubmit=(e)=>{
    e.preventDefault();
    let newUser={
      "id":this.refs["id-input"].value,
      "password":this.refs["password-input"].value,
      "email":this.refs["email-input"].value,
      "active":this.refs["active-input"].checked,
      "name":this.refs["name-input"].value,
      "role":this.refs["role-input"].value,
    }
    this.props.submitUser(newUser);
    this.setState({
      "sent":true
    });
  }

  /**
   * Скрывает/открывает поле пароль
   * @param  {Event} e Событие клика
   */
  hidePassword=(e)=>{
    e.preventDefault();
    this.setState({
      "hide_password": !this.state.hide_password
    });
  }

  componentDidUpdate(prevProps, prevState){
    if(prevState.sent == true && this.props.user.id != prevProps.user.id){
      this.setState({
        "sent":false
      });
    }
  }

  render() {
    if(this.props.user == null){return (
      <div className="user-editor col s8" key={"user"+0}>
        <h4>Не выбран пользователь</h4>
      </div>
    )}
    return(
      <div className="user-editor col s8" key={"user"+this.props.user.id}>
        <h4>{this.props.user.name.length>0?this.props.user.name:"Новый пользователь"}</h4>
        <form onSubmit={this.handleSubmit}>
          <input defaultValue={this.props.user.id} type="hidden" ref="id-input" name="id"></input>
          <label htmlFor="name">Имя пользователя</label>
          <input defaultValue={this.props.user.name} type="text" ref="name-input" name="name"></input>
          <label htmlFor="email">Email</label>
          <input defaultValue={this.props.user.email} type="text" ref="email-input" name="email"></input>
        <p><label><input defaultChecked={this.props.user.active} type="checkbox" ref="active-input" name="active" /><span className="user-active-checkbox-label">Активен</span></label></p>
          <label htmlFor="password">Пароль</label>
          <div className="password-field"><i className={this.state.hide_password?"fas fa-eye":"fas fa-eye-slash"} onClick={this.hidePassword}></i><input defaultValue={this.props.user.password} type={this.state.hide_password?"password":"text"} ref="password-input" name="password"></input></div>
          <label htmlFor="role">Уровень доступа</label>
          <select defaultValue={this.props.user.role} ref="role-input" name="role">
            <option value="3">Пользователь</option>
            <option value="2">Редактор</option>
            <option value="1">Модератор</option>
          <option value="4">Администратор свалки</option>
          </select>
          <button className="blue-grey waves-effect hoverable waves-light btn" type="submit">{this.state.sent?<i className="fas fa-check"></i>:<i className="fas fa-user-check"></i>}Сохранить</button>
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state,props)=>{
  return({
    user: selectors.user.getCurrentUser(state,props)
  })
}

const mapDispatchToProps = {
  submitUser
}

export default connect(mapStateToProps, mapDispatchToProps)(UserEditor);
