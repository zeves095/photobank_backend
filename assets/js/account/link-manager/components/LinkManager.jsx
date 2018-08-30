import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {init} from '../actionCreator'
import LinkList from './LinkList';
import LinkAdder from './LinkAdder';

/**
 * Приложение для менеджмента ссылок для внешнего доступа
 */
export class LinkManager extends React.Component{
  /**
   * Конструктор компонента
   * @param {Object} props Входные данные из коннекта Redux
   */
  constructor(props){
    super(props);
    this.state={};
  }

  /**
   * Запрашивает доступные типы файлов, пресетов и информацию о текущем пользователе с сервера
   * @return {[type]} [description]
   */
  componentDidMount(){
    this.props.init();
  }

  render(){
    return(
      <div className="link-manager">
        <div id="notification-overlay">

        </div>
        <div className="flex-wrapper">
            <LinkList />
            <LinkAdder />
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state) =>{
  return {
  }
}

const mapDispatchToProps = {
  init
}

export default connect(mapStateToProps,mapDispatchToProps)(LinkManager);
