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
   * catalogue_data - Данные каталога
   * node - Теккущий раздел каталога
   * prev_node_id - Идентификатор предыдущего выбранного раздлела каталога
   * node_items - Список товаров для данного раздела каталога
   * node_items_filtered - Отфильтрованный список товаров для данного раздела каталога
   * filter_query - Строка фильтрации
   * current_item - Идентификатор текущего выбранного товара каталога
   * view_pool - Показывать ли очередь загрузки/выгрузки
   * view_type - Тип представления элементов списка
   * product_crumbs - Хлебные крошки, соответствующие данному товару
   * loading - Находтся ли компонент в состоянии ожидания
   * downloads - Список ресурсов в очереди загрузок
   * query - Поисковый объект для списка товаров
   */
  constructor(props) {
    super(props);
    this.state ={
      "catalogue_data": this.props.catalogue_data,
      "node": this.props.node,
      "prev_node_id": 1,
      "node_items": [],
      "node_items_filtered": [],
      "filter_query": "",
      "current_item": null,
      "view_pool": 0,
      "view_type": this.props.default_view,
      "product_crumbs": this.props.crumb_string,
      "loading": false,
      "downloads": [],
      "query": this.props.query
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

  /**
   * Обрабочик добавления ресурса в очерез выгрузки
   * @param  {Number} id Идентификатор ресурса
   */
  handleAddToDownloads=(id)=>{
    if(this.state.downloads.indexOf(id)==-1){
      let downloads = this.state.downloads.slice(0);
      downloads.push(id);
      LocalStorageService.addTo("pending_downloads", id);
      this.setState({
        "downloads": downloads
      });
    }
  }

  /**
   * Обработчик удаления ресурса из очереди выгрузки
   * @param  {Number} id Идентификатор ресурса
   */
  handleRemoveDownload=(id)=>{
    let downloads = this.state.downloads.slice(0);
    let index = downloads.indexOf(id);
    LocalStorageService.removeFrom("pending_downloads", id);
    if(index!=-1){
      downloads.splice(index,1);
      this.setState({
        "downloads": downloads
      });
    }
  }

  /**
   * Обработчик начала выгрузки
   */
  handleDownload=()=>{
    for(var dl in this.state.downloads){
      this.handleRemoveDownload(this.state.downloads[dl]);
    }
    NotificationService.toast("dl-done");
    this.setState({
      "downloads": []
    })
  }

  /**
   * Получает список ресурсов для выгрузки из localstorage
   */
  componentDidMount(){
    let downloads = LocalStorageService.getList("pending_downloads");
    this.setState({
      "query":this.props.query,
      "downloads":downloads
    });
  }

  componentDidUpdate(prevProps,prevState){
    if(this.props.node == prevState.node && this.props.node != this.props.node){
      this.setState({
        "node":this.props.node
      });
    }
    if(this.props.query != prevProps.query){
      this.setState({
        "query":this.props.query
      });
    }
  }

  render() {
    let itemSection = this.props.current_item!=null?(<ItemSection item_id={this.props.stored_item_id} />):"Не выбран товар";

    let section = "";
    switch(parseInt(this.state.view_pool)){
      case 0:
        section = itemSection;
        break;
      case 1:
        section = <DownloadPool resources={this.state.downloads} removeDownloadHandler={this.handleRemoveDownload} addDownloadHandler={this.handleDownload} />
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
          {$(".view-inner__item-section").length>0?<Draggable box1=".view-inner__item-list" box2=".view-inner__item-section" id="2" />:null}
          <div className="view-inner__item-section" key={this.props.current_item!=null?this.props.current_item.id:""}>
            <span className="titlefix"><h2 className="node-viewer__component-title component-title">Файлы <i className="crumb-string">{this.state.product_crumbs}</i></h2></span>
          <div className="view-switcher-button-block">
            <button type="button" className="item-section-switcher" data-pool="1" onClick={this.handlePoolClick}>{this.state.view_pool==1?"К последнему товару":"Выгрузка"}</button>
          {this.props.authorized?<button type="button" className="item-section-switcher" data-pool="2" onClick={this.handlePoolClick}>{this.state.view_pool==2?"К последнему товару":"Загрузка"}</button>:null}
          </div>
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
    stored_item_id: selectors.localstorage.getStoredItemId(state,props)
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeViewer);
