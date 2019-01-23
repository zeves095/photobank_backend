import React, {PureComponent} from 'react';
import { ListFilter } from './ListFilter';
import {ItemService} from '../services/ItemService';

import {LocalStorageService} from '../services/LocalStorageService';
import {NotificationService} from '../../services/NotificationService';

import {chooseItem, fetchItems} from '../actionCreator';

import {connect} from 'react-redux';
import {filterItems} from '../selectors';
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
    this.getItems = this.getItems.bind(this);
    this.itemClickHandler = this.itemClickHandler.bind(this);
    this.filterQueryHandler = this.filterQueryHandler.bind(this);
  }

  /**
   * Запрашивает список товаров для текущего раздела каталога
   */
  getItems(){
    ItemService.fetchItems(this.props.query).then((data)=>{
      this.setState({
        "node_items": data[0],
        "node_items_filtered" : data[1],
      });
    }).catch((error)=>{
      if(error == "none-found"){
        //NotificationService.toast(error);
        this.setState({
          "node_items": [],
          "node_items_filtered" : [],
        });
      }else{
        NotificationService.throw(error);
      }
    });
  }

  /**
   * Обработчик фильтрации товаров
   * @param  {String} query Строка фильтрации
   */
  filterQueryHandler(query){
    this.setState({
      "filter_query" : query
    });
  }

  /**
   * Обработчик клика по товару из списка
   * @param  {Event} e Событие клика
   */
  itemClickHandler(e){
    let itemId = "";
    if(e.target){
      itemId = $(e.target).attr("data-item");
    }else{
      itemId = e;
    }
    LocalStorageService.set("current_item", itemId);
    let currItem = this.props.items_filtered.filter((item)=>{return item.id == itemId})[0];
    this.setState({
      'current_item': currItem,
    });
    this.props.chooseItem(currItem);
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.node !== prevProps.node || this.props.query !== prevProps.query){
      this.setState({
        "node": this.props.node,
        "node_items":[],
        "need_refresh":true
      });
    }
    if(this.state.filter_query != prevState.filter_query || this.state.need_refresh){
      this.setState({
        "need_refresh":false
      });
      this.getItems();
    }
    // if(this.props.node == prevProps.node && prevState.node_items_filtered.length == 0 && this.props.items_filtered.length>0){
    //   this.itemClickHandler(this.props.item);
    // }
  }

  componentWillMount(){
    this.getItems();
  }

  componentDidMount(){
    this.itemClickHandler(this.props.item);
  }

  render() {

    let nodeItemList = this.props.items_filtered.map((item)=>
      <div className={"list-item"+((this.state.current_item!=null&&item.id==this.state.current_item.id)?" list-item--active":"")} key={item.id} data-item={item.id} onClick={this.itemClickHandler}>
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
    items: state.catalogue.items,
    items_filtered: filterItems(state),
  }
}

const mapDispatchToProps = {
  chooseItem,
  fetchItems
}

export default connect(mapStateToProps, mapDispatchToProps)(ItemList);
