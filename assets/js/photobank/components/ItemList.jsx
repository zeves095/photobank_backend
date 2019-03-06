import React, {PureComponent} from 'react';
import {connect} from 'react-redux';

import { ListFilter } from './ListFilter';
import {ItemService} from '../services/ItemService';
import {LocalStorageService} from '../services/LocalStorageService';
import {NotificationService} from '../../services/NotificationService';
import {chooseItem, fetchItems} from '../actionCreator';
import selectors from '../selectors';
/**
 * Компонент интерфейса для работы со списком товаров раздела каталога
 */
export class ItemList extends React.Component{
  /**
   * Конструктор компонента
   * filter_query - Строка для фильтрации товаров
   */
  constructor(props) {
    super(props);
    this.state={
      filter_query:""
    }
  }

  /**
   * Обработчик клика по товару из списка
   * @param  {String} itemId Код 1С товара
   */
  itemClickHandler=(itemId)=>{
    this.props.chooseItem(itemId);
  }

  /**
   * Обработчик установки строки фильтрации
   * @param  {String} filter_query Строка фильтрации
   */
  filterQueryHandler =(filter_query)=>{
    this.setState({
      filter_query
    });
  }

  render() {
    let nodeItemList = this.props.items.filter((item)=>{if(!this.state.filter_query) return true; return JSON.stringify(item).toLowerCase().includes(this.state.filter_query.toLowerCase());})
    .map((item)=>
      <div className={"list-item"+((this.props.current_item!=null&&item.id===this.props.current_item.id)?" list-item--active":"")} key={item.id} data-item={item.id} onClick={()=>{this.itemClickHandler(item.id)}}>
        <h4 className={"list-item__title"} data-item={item.id} onClick={()=>{this.itemClickHandler(item.id)}} title={item.node}><i className="fas fa-circle" style={{"fontSize":"7pt", "margin": "3px"}}></i>Товар №{item.itemCode} "{item.name}"</h4>
      </div>
    );
    let tooBroadMsg = this.props.items_filtered.length >= 100?"Показаны не все результаты. Необходимо сузить критерии поиска.":"";
    return (

      <div className={"item-list"}>
        <span className="titlefix"><h2 className="node-viewer__component-title component-title">Товары</h2></span>
      <div className={(this.props.loading?"loading ":"")+"view-inner__container inner-bump"}>
        <ListFilter filterHandler={this.filterQueryHandler} filterid="nodesearch" placeholder="Фильтр по выбранному" />
      {this.props.items_filtered.length>0?null:"Нет товаров в выбранной категории"}
        {tooBroadMsg}
        {nodeItemList}
        {tooBroadMsg}
      </div>
      </div>
    );
  }
}

const mapStateToProps = (state,props) =>{
  return {
    current_node: selectors.catalogue.getCurrentNode(state,props),
    current_item: selectors.catalogue.getItemObject(state,props)||selectors.localstorage.getStoredItem(state,props),
    items: selectors.catalogue.getNodeItems(state,props),
    items_filtered: selectors.catalogue.filterItems(state,props),
    loading: selectors.catalogue.getLoadingItems(state,props),
  }
}

const mapDispatchToProps = {
  chooseItem,
  fetchItems
}

export default connect(mapStateToProps, mapDispatchToProps)(ItemList);
