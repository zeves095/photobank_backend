import React, {PureComponent} from 'react';
import { ListFilter } from './ListFilter';
import {ItemService} from '../services/ItemService';

import {LocalStorageService} from '../services/LocalStorageService';
import {NotificationService} from '../../services/NotificationService';

import {chooseItem, fetchItems} from '../actionCreator';

import {connect} from 'react-redux';
import selectors from '../selectors';
/**
 * Компонент интерфейса для работы со списком товаров раздела каталога
 */
export class ItemList extends React.Component{
  /**
   * Конструктор компонента
   * node - текущий выбранный раздел каталога
   * node_items - Список товаров для текущего раздела каталога
   * node_items_filtered - Отфильтрованный список товаров текущего раздела каталога
   * filter_query - Строка для фильтрации товаров
   * current_item - Выбранный товар
   * previtem_id - Идентификатор предудущего товара
   * loading - Находится ли компонент в состоянии ожидания
   * need_refresh - Нуждается ли компонент в обновлении
   */
  constructor(props) {
    super(props);
  }

  /**
   * Обработчик клика по товару из списка
   * @param  {Event} e Событие клика
   */
  itemClickHandler=(itemId)=>{
    this.props.chooseItem(itemId);
  }

  render() {
    let nodeItemList = this.props.items_filtered.map((item)=>
      <div className={"list-item"+((this.props.current_item!=null&&item.id==this.props.current_item.id)?" list-item--active":"")} key={item.id} data-item={item.id} onClick={()=>{this.itemClickHandler(item.id)}}>
        <h4 data-item={item.id} onClick={()=>{this.itemClickHandler(item.id)}} title={item.node}><i className="fas fa-circle" style={{"fontSize":"7pt", "margin": "3px"}}></i>Товар №{item.itemCode} "{item.name}"</h4>
      </div>
    );
    let tooBroadMsg = this.props.items_filtered.length >= 100?"Показаны не все результаты. Необходимо сузить критерии поиска.":"";
    return (

      <div className={"view-inner__item-list"}>
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
