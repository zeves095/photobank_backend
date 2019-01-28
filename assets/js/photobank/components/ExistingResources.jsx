import React from 'react';
// import $ from 'jquery';
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
      "existing": [],
      "view_type": this.props.default_view,
      "finished_presets": [],
      "loading" : false,
      "pagination_start": 0,
      "pagination_limit": 20,
      "pagination_end": 20,
      "pagination_current_page": 1,
      "pagination_total_pages": 0,
      "priority_active":null
    };
    this.containerViewClasses = ['item-view__inner--icons-lg ','item-view__inner--icons-sm ','item-view__inner--detailed '];
    this.fileViewClasses = ['file--icons-lg ','file--icons-sm ','file--detailed '];
    this.finishedPresetRequestStack = [];
    this.paginationControls = "";
    this.preset_headers = [];

    this.presetCache = [];

  }

  /**
   * Запрашивает список сгенерированных пресетов для ресурсов товара
   */
  fetchPresets = ()=>{
    this.props.fetchPresets({start:this.state.pagination_start, end:this.state.pagination_end}, this.props.existing);
  }

  /**
   * Обработчик обновления данных о ресурсе
   * @param  {Event} e Событие клика
   * @param  {Number} [id=null] Опциональный идентификатор ресурса для обновления. Если не указан, будет взят из элемента, по которому кликнул пользователь
   */
  handleResourceUpdate = (e, id=null)=>{
    if(!this.props.authorized){return}
    let form = {};
    if(id==null){
      form = $(e.target).closest(".existing-files__file.file");
    }else{
      form = $(".existing-files__file.file").filter(function(){
        return $(this).find("input[name=id]").val() == id;
      });
    }
    ResourceService.updateResource(form).then((data)=>{
      this.key++;
      this.props.fetchExisting(this.props.item_id);
    }).catch((error)=>{
      NotificationService.throw(error);
    });
  }

  /**
   * Обработчик событий пагинации. Определяет количество элементов на странице, текущую страницу
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
        "pagination_end": start+limit,
        "loading": true,
        "pagination_current_page": Math.floor(this.state.pagination_start/limit)+1,
        "pagination_total_pages": Math.ceil(this.props.existing.length/limit)
      });
    }
  }

  /**
   * Обработчик копирования ссылки для авторизованных пользователей в буфер обмена
   * @param  {Event} e Событие клика
   */
  handleCopyToClipboard = (e)=>{
    e.preventDefault();
    let resource = e.target.dataset["resource"];
    ResourceService.copyLinkToClipboard(resource);
    NotificationService.toast("link-copied");
  }

  /**
   * Обработчик открытия изображения в новой вкладке
   * @param  {Event} e Событие клика
   */
  handleOpenInTab = (e)=>{
    e.preventDefault();
    let resource = e.target.dataset["resource"];
    ResourceService.openInTab(resource);
  }

  /**
   * Обработчик скачивания изображения ресурса
   * @param  {[type]} e Событие клика
   */
  handleDownloadResource = (e)=>{
    e.preventDefault();
    let resource = e.target.dataset["resource"];
    ResourceService.downloadResource(resource);
  }

  /**
   * Обработчик добавления изображения в очередь загрузок
   * @param  {[type]} e Событие клика
   */
  handleAddToDownloads = (e)=>{
    e.preventDefault();
    let resource = e.target.dataset["resource"];
    this.props.addDownloadHandler(resource);
    NotificationService.toast("dl-queued");
  }

  /**
   * Обработчик начала установки приоритета ресурса
   * @param  {[type]} e Событие клика
   */
  handlePriority = (e)=>{
    if(!this.props.authorized){return}
    let file = e.target.dataset["file"];
    if(this.state.priority_active == file){file = null}
    this.setState({
      "priority_active": file
    });
  }

  /**
   * Обработчик начала установки приоритета ресурса
   * @param  {[type]} e Событие клика
   */
  handlePriorityUpdate = (e)=>{
    if(!this.props.authorized){return}
    let priority = e.target.dataset["priority"];
    let form = $(e.target).closest(".existing-files__file.file");
    let input = form.find("input[name='priority']");
    let id = form.find("input[name='id']").val();
    input.val(priority);
    this.handleResourceUpdate(e, id)
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
    let maxMain = window.config.max_main_resources;
    let maxAdd = window.config.max_additional_resources;
    let mainFiles = this.props.existing.filter((file)=>{return file.type == 1});
    let addFiles = this.props.existing.filter((file)=>{return file.type == 2});
    let origFiles = this.props.existing.filter((file)=>{return file.type == 3});
    let fileList = mainFiles.concat(addFiles.concat(origFiles));

    let currMain = mainFiles.length;
    let currAdd = addFiles.length;
    let mainStatus = currMain+"/"+maxMain;
    let addStatus = currAdd+"/"+maxAdd;

    let existingListMarkupData = [];

    for(var i = this.state.pagination_start; i<this.state.pagination_end; i++){
      if(typeof fileList[i]=='undefined'){continue};
      let file = fileList[i];
      let presets = [];
      let presetLinks = [];
      for(var preset in window.config['presets']){
        let presetId = window.config['presets'][preset]['id'];
        let finishedPreset = this.props.finished_presets.filter((preset)=>{return (preset.resource==file.id && preset.preset == presetId)})[0];
        let finished = typeof finishedPreset != "undefined";
        presetLinks.push(window.config['resource_url']+ (finished?finishedPreset.id:"0")+".jpg");
        presets.push(
          <span key={file.id+"-"+presetId} className={"info__info-field info__info-field--preset "+finished?"info__info-field--preset-done":"info__info-field--preset-not-done"}>
            {finished
              //?<span className="existing-preset"><a href={window.config['resource_url']+finishedPreset.id+".jpg"} target="_blank">{window.config['presets'][preset]['width']+'/'+window.config['presets'][preset]['height']}</a></span>
              ?<span className="existing-download">
                <span className="existing-download-controls">
                  <i onClick={this.handleCopyToClipboard} title="Скопировать ссылку" data-resource={finishedPreset.id} className="fas fa-link get-url"></i>
                <i onClick={this.handleOpenInTab} title="Открыть в новой вкладке" data-resource={finishedPreset.id} className="fas fa-external-link-square-alt open-in-tab"></i>
              <i onClick={this.handleDownloadResource} title="Скачать файл" data-resource={finishedPreset.id} className="fas fa-arrow-alt-circle-down dl-now"></i>
            <i onClick={this.handleAddToDownloads} title="Добавить в загрузки" data-resource={finishedPreset.id} className="fas fa-plus-circle dl-cart-add"></i>
                </span>
                <a href={window.config['resource_url']+finishedPreset.id+".jpg"} target="_blank">{window.config['presets'][preset]['width']+'/'+window.config['presets'][preset]['height']}</a>
              </span>
              :"Не обработан"
            }
          </span>);
      }
      let dlControls = [

        <span key={"dlcontrols"+file.id} className="existing-download-controls">
          <i onClick={this.handleCopyToClipboard} title="Скопировать ссылку" data-resource={file.id} className="fas fa-link get-url"></i>
          <i onClick={this.handleOpenInTab} title="Открыть в новой вкладке" data-resource={file.id} className="fas fa-external-link-square-alt open-in-tab"></i>
          <i onClick={this.handleDownloadResource} title="Скачать файл" data-resource={file.id} className="fas fa-arrow-alt-circle-down dl-now"></i>
          <i onClick={this.handleAddToDownloads} title="Добавить в загрузки" data-resource={file.id} className="fas fa-plus-circle dl-cart-add"></i>
        </span>
      ];
      let priorityStack = [];
      let priorityCtx = "";
      if(this.state.priority_active == file.id){
        for(var j=0; j<maxAdd; j++){
          priorityStack.push(<div className={"item " + (file.priority == j?"active":"")} onClick={this.handlePriorityUpdate} data-priority={j}>{j}</div>);
        }
        priorityCtx = [
          <div className="edit-input__context-menu context-menu"><div className="context-menu__inner">{priorityStack}</div></div>
        ];
      }

      existingListMarkupData.push(

        <div className={"existing-files__file file "+this.fileViewClasses[this.state.view_type]} key={file.src_filename+file.filename}>
          <a className="file__file-name" href={window.config.resource_url+file.id+".jpg"} target="_blank">
          <div className="file__thumbnail" style={{"backgroundImage":"url("+presetLinks[0]+")"}}></div>
        {this.state.view_type != 2?dlControls:null}
          {file.src_filename}
        </a>
      {/* <div className="file__edit-fields edit-fields"> */}
          <div className={"edit-input " + (file.type=="2"?"edit-input--add-file":"")}>
            <select onChange={this.handleResourceUpdate} name="type" defaultValue={file.type} disabled={!this.props.authorized}>
              <option disabled={currMain>=maxMain?true:false} value="1">Основноe{mainStatus}</option>
            <option disabled={currAdd>=maxAdd?true:false} value="2">Доп.{addStatus}</option>
              <option value="3">Исходник</option>
            </select>
            {file.type=="2"?<span className="edit-input__priority-btn" data-file={file.id} onClick={this.handlePriority}>{file.priority}{priorityCtx}</span>:null}
            <input type="hidden" name="priority" defaultValue={file.priority} onChange={this.handleResourceUpdate}></input>
          </div>
          {/* <span className="edit-input"><input onClick={this.handleResourceUpdate} type="checkbox" defaultChecked={file.isDeleted} name="deleted"/><label htmlFor="deleted">Удален</label></span> */}
          <input type="hidden" name="id" value={file.id}/>
      {/* </div> */}
        {/* <div className="file__info info"> */}
          <span className="info__info-field info-field info__info-field--sizemb">
            {Math.round((file.size_bytes/(1024*1024))*100)/100 + "MB"}
          </span>
          <span className="info__info-field info-field info__info-field--uploaddate">
            {file.created_on}
          </span>
          <span className="info__info-field info-field info__info-field--username">
            {file.username}
          </span>
          <span className="info__info-field info-field info__info-field--comment">
            {file.comment}
          </span>
          <span className="info__info-field info-field info__info-field--sizepx">
            <a className="file__file-src" href={window.config.resource_url+file.id+".jpg"} target="_blank">
              {dlControls}
              {file.size_px}
            </a>
          </span>
            {presets}
        {/* </div> */}
      </div>)
    }

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
        <div className={(this.state.loading?"loading ":"") + "item-resources"}>
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
            {existingListMarkupData}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) =>{
  return {
    existing: selectors.resource.getExisting(state),
    finished_presets: selectors.resource.getFinishedPresets(state)
  }
}

const mapDispatchToProps = {
  fetchExisting,
  fetchPresets
}

export default connect(mapStateToProps, mapDispatchToProps)(ExistingResources);
