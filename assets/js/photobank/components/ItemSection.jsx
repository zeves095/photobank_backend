import React from 'react';
import { hex_md5 } from '../../vendor/md5';
import {connect} from 'react-redux';

import ExistingResources from './ExistingResources';
import Uploads from './Uploads';
import {ItemService} from '../services/ItemService';
import {NotificationService} from '../../services/NotificationService';
import selectors from '../selectors';
import {chooseListViewType, fetchItemData, pushResumable} from '../actionCreator';

/**
 * Компонент интерфейса работы с определенным товаром
 */
export class ItemSection extends React.Component{
  /**
   * Конструктор компонента
   * open - Открыт ли интерфейс
   */
  constructor(props) {
    super(props);
    this.containerViewClasses = ['item-view__inner--icons-lg ','item-view__inner--icons-sm ','item-view__inner--detailed '];
    this.fileViewClasses = ['file--icons-lg ','file--icons-sm ','file--detailed '];
    this.state = {
      open:this.props.open_by_default
    }
  }

  /**
   * Обработчик выбора типа представления для элементов списка
   * @param  {Event} e Событие клика
   */
  handleViewChoice =(type)=>{
    this.props.chooseListViewType(type);
  }

  componentWillMount(){
    this.props.item&&this.props.pushResumable(this.props.item.id, this.props.collection_type);
  }

  componentDidUpdate(prevProps){
    if(this.props.open_by_default!==prevProps.open_by_default)this.setState({open:this.props.open_by_default});
  }

  render() {
    if(!this.props.item){
      let id = this.props.item_id||this.props.stored_item_id;
      if(!id){return "Не выбран товар";}
      this.props.fetchItemData(id, this.props.collection_type);
      return null;
    }
    let render_upload = this.props.item&&this.props.resumable&&this.props.authorized;
    let viewBtn = (
      <div className="button-block">
        <button type="button" data-view="0" title="Большие иконки" className={this.props.view===0?"item-view__view-button--active item-view__view-button":"item-view__view-button"} onClick={()=>{this.handleViewChoice("0")}}>
          <i className="fas fa-th-large"></i>
        </button>
        <button type="button" data-view="1" title="Маленькие иконки" className={this.props.view===1?"item-view__view-button--active item-view__view-button":"item-view__view-button"} onClick={()=>{this.handleViewChoice("1")}}>
          <i className="fas fa-th"></i>
        </button>
        <button type="button" data-view="2" title="Таблица" className={this.props.view===2?"item-view__view-button--active item-view__view-button":"item-view__view-button"} onClick={()=>{this.handleViewChoice("2")}}>
          <i className="fas fa-list-ul"></i>
        </button>
      </div>
    )
    return (
      <div className = {"item-view"} >
      <div className="file-list__drop-target" id={"drop_target" + this.props.item.id}></div>
      {
        !this.props.render_existing
        ?<button type="button" className="item-view__collapse-button" onClick={()=>{this.setState({"open": !this.state.open})}}>
          {this.state.open? "Скрыть": "Показать"}
         </button>
        :null
      } {
          !!this.props.item
          ? <div className="item-view__item-title">{this.props.collection_type===0?("Товар #"+this.props.item.id):""}"{this.props.item.name}"</div>
          : null
      }<div className={"item-view__inner " + (
          this.state.open
          ? "item-view__inner--open "
          : "item-view__inner--closed ") + this.containerViewClasses[this.props.view]}>
          {this.props.render_existing&&viewBtn}
          {this.props.render_existing?<ExistingResources authorized={this.props.authorized} key={this.props.item.id} item_id={this.props.item.id} addDownloadHandler={this.props.addDownloadHandler} default_view={this.props.view} />:null}
        {!render_upload?null:<h4 className="item-view__subheader">Загрузки</h4>}
      {!render_upload?null:<Uploads key={"uploads"+this.props.item.id} item_id={this.props.item.id} item={this.props.item} collection_type={this.props.collection_type} />}
      </div> </div>
    );
  }
}

const mapStateToProps = (state, props) =>{
  return {
    stored_item_id: selectors.catalogue.getStoredItem(state,props),
    item: selectors.catalogue.getItemObject(state,props),
    view: selectors.localstorage.getStoredListViewtype(state,props),
    resumable: selectors.upload.getResumableInstance(state,props),
    render_existing: (typeof props.render_existing !== 'undefined')?props.render_existing:true,
    authorized: selectors.user.getAuthorized(state,props),
    open_by_default: (typeof props.open_by_default !== 'undefined')?props.open_by_default:true,
    collection_type: selectors.catalogue.getCollectionType(state,props),
  }
}

const mapDispatchToProps = {
  pushResumable,
  chooseListViewType,
  fetchItemData,
  pushResumable
}

export default connect(mapStateToProps, mapDispatchToProps)(ItemSection);
