import React from 'react';

import ItemSection from './ItemSection';
import { ListFilter } from './ListFilter';
import {NotificationService} from '../../services/NotificationService';

import {connect} from 'react-redux';

import selectors from '../selectors';
import {chooseListViewType, wasIsDoos} from '../actionCreator';


/**
 * Компонент работы с очередью отправки файлов на сервер
 */
export class UploadPool extends React.Component{

  /**
   * Конструктор компонента
   * collapse_all - Нужно ли свернуть все секции товаров в очереди
   */
  constructor(props){
    super(props);
    this.state = {
      collapse_all:true
    }
  };

  /**
   * Обработчик отправки всех файлов для активных товаров на сервер
   */
  handleSubmit=()=>{
    this.props.container.forEach(resumable=>resumable.instance.upload());
  }

  /**
   * Обработчик выбора типа представления для элементов списка
   * @param  {Number} type Тип представления
   */
   handleViewChoice =(type)=>{
     this.props.chooseListViewType(type);
   }

  /**
   * Обработчик сворачивания всех товаров в очереди
   */
  handleCollapseAll=()=>{
    this.setState({
      "collapse_all": !this.state.collapse_all
    });
  }

  render(){
    let pool = this.props.container.map(item=>{
      return(
      <div key={"pool-item" + item.id}>
        <ItemSection item_id={item.id} open_by_default={!this.state.collapse_all} render_existing={false}/>
      </div>
    )});
    return(
      <div className="upload-pool">
        <button type="button" className={"view-button"+(this.props.view==="0"?" view-button--active":"")} onClick={()=>{this.handleViewChoice("0")}}><i className="fas fa-th-large"></i></button>
      <button type="button" className={"view-button"+(this.props.view==="1"?" view-button--active":"")} onClick={()=>{this.handleViewChoice("1")}}><i className="fas fa-th"></i></button>
    <button type="button" className={"view-button"+(this.props.view==="2"?" view-button--active":"")} onClick={()=>{this.handleViewChoice("2")}}><i className="fas fa-list-ul"></i></button>
  <h2 className="upload-pool__component-title component-title">Загрузки<button type="button" onClick={this.handleCollapseAll} className="upload-pool__collapse-all">{this.state.collapse_all?"Развернуть все":"Свернуть все"}</button></h2>
    <ListFilter filterHandler={this.filterQueryHandler} filterid="poolsearch" placeholder="Фильтр по товару" /><button type="button" className="upload-pool__upload-all" onClick={this.handleSubmit}>Загрузить все</button>
        <div className="upload-pool__view-inner">
          {pool}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state,props) =>{
  return {
    container: selectors.upload.getResumableContainer(state,props),
    view: selectors.localstorage.getStoredListViewtype(state,props),
  }
}

const mapDispatchToProps = {
  chooseListViewType
}

export default connect(mapStateToProps, mapDispatchToProps)(UploadPool);
