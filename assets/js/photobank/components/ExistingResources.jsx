import React from 'react';

import ExistingResource from './ExistingResource';
import { hex_md5 } from '../../vendor/md5';
import {ResourceService} from './../../services/ResourceService';
import {NotificationService} from '../../services/NotificationService';
import {LocalStorageService} from '../services/LocalStorageService';

import {connect} from 'react-redux';
import {fetchExisting, fetchPresets} from '../actionCreator';
import selectors from '../selectors';

/**
 * Компонент интерфейса для отображения существующих ресурсов для товара
 */
export class ExistingResources extends React.Component{
  /**
   * Конструктор компонента
   * existing - Массив существующих ресурсов товара
   * view_type - Текущий тип отображения
   * finished_presets - Массив обработаных пресетов ресурса
   * loading - Находится ли компонент в состоянии ожидания
   * pagination_start - Индекс первого элемента для пагинации
   * pagination_end - Индекс последнего элемента для пагинации
   * pagination_current_page - Номер текущей страницы пагинации
   * pagination_total_pages - Общее количество страниц пагинации
   * priority_active - Индекс ресурса, для которого в данный момент нужно отобразить окно выбора приоритета
   */
  constructor(props) {
    super(props);
    this.state={
      "view_type": this.props.default_view,
      "loading" : false,
      "pagination_start": 0,
      "pagination_limit": 20,
      "pagination_end": 20,
      "pagination_current_page": 1,
      "pagination_total_pages": 0,
    };
    this.containerViewClasses = ['item-view__inner--icons-lg ','item-view__inner--icons-sm ','item-view__inner--detailed '];
    this.paginationControls = "";

  }

  /**
   * Запрашивает список сгенерированных пресетов для ресурсов товара
   */
  fetchPresets = ()=>{
    this.props.fetchPresets({start:this.state.pagination_start, end:this.state.pagination_end}, this.props.existing);
  }

  /**
   * Обработчик событий пагинации. Определяет количество элементов на странице, текущую страницу.
   * Оставь надежду, всяк сюда входящий
   * @param  {Event} e Событие, по которому выполняется функция
   */
  handlePagination = (e)=>{
    let changed = false;
    let start = this.state.pagination_start;
    let limit = this.state.pagination_limit;
    let target = e.target;
    if(e.type == "click"){
      if(target.tagName != "BUTTON"){
        target = target.parentNode;
      }
      if(target.dataset.direction == 0){
        if((start-=limit) < 0){start=0};
        changed = true;
      }else{
        if(!(start+limit>this.props.existing.length)){start = parseInt(start+limit)};
        changed = true;
      }
    }else if(e.type = "keyUp"){
      switch(e.keyCode){
        case 13:
          if(target.name != "pagination_limit"){break;}
          limit = parseInt(target.value);
          start = start-(start%limit);
          if(limit!=this.state.pagination_limit){changed = true;}
          break;
        case 37:
          if((start-=limit) < 0){start=0;} else{changed = true;};
          break;
        case 39:
          if(!(start+limit > this.props.existing.length)){start = parseInt(start+limit);changed = true;};
          break;
      }
    }
    if(changed){
      LocalStorageService.set("pagination_limit", limit);
      this.setState({
        "pagination_start": start,
        "pagination_limit": limit,
        "pagination_end": parseInt(start, 10)+parseInt(limit, 10),
        "loading": true,
        "pagination_current_page": Math.floor(this.state.pagination_start/limit)+1,
        "pagination_total_pages": Math.ceil(this.props.existing.length/limit)
      });
    }
  }

  /**
   * Собирает список доступных пресетов и получает существующие ресурсы для товара
   */
  componentDidMount(){
    let presets = [];
    for(var preset in window.config['presets']){
      presets.push(<span key={"preset"+preset} className="info__info-field info__info-field--title info__info-field--preset">{preset}</span>);
    }
    this.preset_headers = presets;
    $(document).on("keyup.pagination", (e)=>{
      this.handlePagination(e);
    });
    this.props.fetchExisting(this.props.item_id);
    this.setState({
      "pagination_limit": LocalStorageService.get("pagination_limit"),
      "pagination_end": LocalStorageService.get("pagination_limit"),
    });
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props != prevProps){
      this.setState({
        "view_type": this.props.default_view,
      });
      if(this.props.need_refresh){
        this.props.fetchExisting(this.props.item_id);
      }
    }
    if(this.props.existing != prevProps.existing){
      this.setState({
        "pagination_total_pages": Math.ceil(this.props.existing.length/this.state.pagination_limit),
        "pagination_current_page": Math.floor(this.state.pagination_start/this.state.pagination_limit)+1,
        "pagination_total_pages": Math.ceil(this.props.existing.length/this.state.pagination_limit)
      });
      this.fetchPresets();
    }
    if(prevState.pagination_start != this.state.pagination_start || prevState.pagination_limit != this.state.pagination_limit){
      this.fetchPresets();
      this.setState({
        "pagination_current_page": Math.floor(this.state.pagination_start/this.state.pagination_limit)+1,
      });
    }
  }

  componentWillUnmount(){
    $(document).off(".pagination");
  }

  render() {

    let files = this.props.existing.slice(this.state.pagination_start, this.state.pagination_end).map(file=>{
      return <ExistingResource file={file} item_id={this.props.item_id} key={"existing_resource_"+file.id} />
    });

    let paginationControls = this.props.existing.length!=0?(
      <div className="item-view__pagination-controls pagination-controls">
          <button onClick={this.handlePagination} className="pagination-controls__btn pagination-controls__btn--bck-btn" data-direction="0" type="button" disabled={this.state.pagination_start==0}><i className="fas fa-arrow-left"></i></button>
        <p>{this.state.pagination_current_page}/{this.state.pagination_total_pages}</p>
      <button onClick={this.handlePagination} className="pagination-controls__btn pagination-controls__btn--bck-btn" data-direction="1" type="button" disabled={this.state.pagination_end>=this.props.existing.length}><i className="fas fa-arrow-right"></i></button>
    <p>На странице:</p><input onKeyUp={this.handlePagination} type="text" name="pagination_limit" defaultValue={this.state.pagination_limit}></input>
</div>
    ):null;

    return (
      <div className="item-view__existing">
        <h4 className="item-view__subheader">Файлы товара<div className="button-block"><button type="button" onClick={()=>{this.props.fetchExisting(this.props.item_id);this.fetchPresets();}}><i className="fas fa-redo-alt"></i>Обновить</button></div></h4>
        {paginationControls}
        {this.props.existing.length==0?"Нет загруженных файлов":null}
        <div className={(this.props.loading?"loading ":"") + "item-resources"}>
          <div className="item-view__file-list existing-files">
            <div className="item-view__table-header">
              <span className="info__info-field info__info-field--title info__info-field--sizepx">Имя файла</span>
              <span className="info__info-field info__info-field--title info__info-field--type">Тип ресурса</span>
              <span className="info__info-field info__info-field--title info__info-field--sizebytes">Размер изображения</span>
              <span className="info__info-field info__info-field--title info__info-field--uploaddate">Дата создания</span>
              <span className="info__info-field info__info-field--title info__info-field--username">Пользователь</span>
              <span className="info__info-field info__info-field--title info__info-field--comment">Комментарий</span>
            <span className="info__info-field info__info-field--title info__info-field--sizemb">original</span>
              {this.preset_headers}
            </div>
            {files}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state,props) =>{
  return {
    existing: selectors.resource.getExisting(state,props),
    loading: selectors.resource.getLoadingPresets(state,props)||selectors.resource.getLoadingResources(state,props),
  }
}

const mapDispatchToProps = {
  fetchExisting,
  fetchPresets
}

export default connect(mapStateToProps, mapDispatchToProps)(ExistingResources);
