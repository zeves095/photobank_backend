import React from 'react';
import ItemSection from './ItemSection';
import ItemList from './ItemList';
import ListFilter from './ListFilter';
import UploadPool from './UploadPool';
import DownloadPool from './DownloadPool';
import {Draggable} from './../../common/Draggable';
import {LocalStorageService} from '../services/LocalStorageService';
import {NotificationService} from '../../services/NotificationService';

import {connect} from 'react-redux';
import selectors from '../selectors';

/**
 * Компонент интерфейса работы с конкретным разделом каталога (ItemList+ItemSection)
 */
export class NodeViewer extends React.Component{
  /**
   * Конструктор компонента
   * view_pool - Показывать ли очередь загрузки/выгрузки
   */
  constructor(props) {
    super(props);
    this.state ={
      "view_pool": 0,
    }

  }

  /**
   * Обработчик открытия интерфейса очереди загрузки/выгрузки
   * @param  {Event} e Событие клика
   */
  handlePoolClick = (e)=>{
    let poolVal = '';
    poolVal = this.state.view_pool == e.target.dataset["pool"]?0:e.target.dataset["pool"];
    this.setState({
      "view_pool" : poolVal
    })
  }

  /**
   * Обработчик выбора типа представления элементов списка
   * @param  {Number} view Идентификатор представления
   */
  handleViewChoice = (view)=>{
    LocalStorageService.set("list_view_type", view);
    this.setState({
      "view_type":view
    });
  }

  render() {
    let itemSection = this.props.current_item!=null?(<ItemSection item_id={this.props.stored_item_id} />):"Не выбран товар";

    let section = "";
    switch(parseInt(this.state.view_pool)){
      case 0:
        section = itemSection;
        break;
      case 1:
        section = <DownloadPool />
        break;
      case 2:
        section = <UploadPool />
        break;
      default:
        section = itemSection;
        break;
    }
    return (

      <div className="node-viewer">
        <div className="node-viewer__view-inner view-inner">
          <ItemList />
          <Draggable box1=".view-inner__item-list" box2=".view-inner__item-section" id="2" />
          <div className="view-inner__item-section" key={this.props.current_item!=null?this.props.current_item.id:""}>
            <span className="titlefix">
              <h2 className="node-viewer__component-title component-title">
                <p>Файлы</p>
                <i className="crumb-string">{this.props.crumbs}</i>
                <div className="view-switcher-button-block">
                  <button type="button" className="item-section-switcher" data-pool="1" onClick={this.handlePoolClick}>{this.state.view_pool==1?"К последнему товару":"Выгрузка"}</button>
                  {this.props.authorized?<button type="button" className="item-section-switcher" data-pool="2" onClick={this.handlePoolClick}>{this.state.view_pool==2?"К последнему товару":"Загрузка"}</button>:null}
                </div>
              </h2>
        </span>
          <div className="view-inner__container inner-bump">
            {section}
          </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state,props) =>{
  return {
    node: state.catalogue.current_node,
    item_query_object: state.catalogue.item_query_object,
    current_item: selectors.catalogue.getItemObject(state,props)||selectors.localstorage.getStoredItem(state,props),
    stored_item_id: selectors.localstorage.getStoredItemId(state,props),
    crumbs: selectors.catalogue.getCrumbString(state,props),
    authorized: selectors.user.getAuthorized(state,props)
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeViewer);
