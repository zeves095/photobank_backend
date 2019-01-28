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
    this.state ={
      "node": this.props.node,
      "node_items": [],
      "node_items_filtered": [],
      "filter_query": "",
      "current_item": null,
      "previtem_id": this.props.item,
      "loading": false,
      "need_refresh": true
    }
  }

  /**
   * Обработчик клика по товару из списка
   * @param  {Event} e Событие клика
   */
  itemClickHandler=(e)=>{
    let itemId = "";
    if(e.target){
      itemId = e.target.dataset['item'];
    }else{
      itemId = e;
    }
    LocalStorageService.set("current_item", itemId);
    this.props.chooseItem(itemId);
  }

  componentDidMount(){
    this.itemClickHandler(this.props.item);
  }

  render() {
    let nodeItemList = this.props.current_node == null
    ?""
    :this.props.items_filtered.map((item)=>
      <div className={"list-item"+((this.props.current_item!=null&&item.id==this.props.current_item.id)?" list-item--active":"")} key={item.id} data-item={item.id} onClick={this.itemClickHandler}>
        <h4 data-item={item.id} onClick={this.itemClickHandler} title={item.node}><i className="fas fa-circle" style={{"fontSize":"7pt", "margin": "3px"}}></i>Товар №{item.itemCode} "{item.name}"</h4>
      </div>
    );
    let tooBroadMsg = this.props.items_filtered.length == 100?"Показаны не все результаты. Необходимо сузить критерии поиска.":"";
    return (

      <div className={"view-inner__item-list"}>
        <span className="titlefix"><h2 className="node-viewer__component-title component-title">Товары</h2></span>
      <div className={(this.state.loading?"loading ":"")+"view-inner__container inner-bump"}>
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

const mapStateToProps = (state) =>{
  return {
    current_node: selectors.catalogue.getCurrentNode(state),
    current_item: selectors.catalogue.getItemObject(state),
    items: selectors.catalogue.getNodeItems(state),
    items_filtered: selectors.catalogue.filterItems(state),
  }
}

const mapDispatchToProps = {
  chooseItem,
  fetchItems
}

export default connect(mapStateToProps, mapDispatchToProps)(ItemList);
