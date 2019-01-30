import React from 'react';
import {connect} from 'react-redux';
import selectors from '../selectors';
import {ResourceService,NotificationService} from '../services';
import {addResourceToDownloads} from '../actionCreator';

export class ExistingResource extends React.Component {

  constructor(props) {
    super(props);
    this.state={
      priority_active:false
    }
    this.fileViewClasses = ['file--icons-lg ','file--icons-sm ','file--detailed '];
  }

  /**
   * Обработчик копирования ссылки для авторизованных пользователей в буфер обмена
   * @param  {Event} e Событие клика
   */
  handleCopyToClipboard = (id, e)=>{
    e.stopPropagation();
    e.preventDefault();
    ResourceService.copyLinkToClipboard(id);
    NotificationService.toast("link-copied");
  }

  /**
   * Обработчик открытия изображения в новой вкладке
   * @param  {Event} e Событие клика
   */
  handleOpenInTab = (id, e)=>{
    e.stopPropagation();
    e.preventDefault();
    ResourceService.openInTab(id);
  }

  /**
   * Обработчик скачивания изображения ресурса
   * @param  {[type]} e Событие клика
   */
  handleDownloadResource = (id, e)=>{
    e.stopPropagation();
    e.preventDefault();
    ResourceService.downloadResource(id);
  }

  /**
   * Обработчик добавления изображения в очередь загрузок
   * @param  {[type]} e Событие клика
   */
  handleAddToDownloads = (id, e)=>{
    e.stopPropagation();
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

  render() {

    let presets = [];

    for(var preset in window.config['presets']){
      let presetId = window.config['presets'][preset]['id'];
      let finished = this.props.finished_presets.find(preset=>preset.gid===this.props.file.id);
      presets.push(
        <span key={this.props.file.id+"-"+presetId} className={"info__info-field info__info-field--preset "+finished?"info__info-field--preset-done":"info__info-field--preset-not-done"}>
          {finished
            ?<span className="existing-download">
              <span className="existing-download-controls">
                <i onClick={(e)=>{this.handleCopyToClipboard(finishedPreset.id, e)}} title="Скопировать ссылку" data-resource={finishedPreset.id} className="fas fa-link get-url"></i>
              <i onClick={(e)=>{this.handleOpenInTab(finishedPreset.id, e)}} title="Открыть в новой вкладке" data-resource={finishedPreset.id} className="fas fa-external-link-square-alt open-in-tab"></i>
            <i onClick={(e)=>{this.handleDownloadResource(finishedPreset.id, e)}} title="Скачать файл" data-resource={finishedPreset.id} className="fas fa-arrow-alt-circle-down dl-now"></i>
          <i onClick={(e)=>{this.handleAddToDownloads(finishedPreset.id, e)}} title="Добавить в загрузки" data-resource={finishedPreset.id} className="fas fa-plus-circle dl-cart-add"></i>
              </span>
              <a href={window.config['resource_url']+finishedPreset.id+".jpg"} target="_blank">{window.config['presets'][preset]['width']+'/'+window.config['presets'][preset]['height']}</a>
            </span>
            :"Не обработан"
          }
        </span>);
    }

    let dlControls = (
      <span key={"dlcontrols"+this.props.file.id} className="existing-download-controls">
        <i onClick={(e)=>{this.handleCopyToClipboard(this.props.file.id, e)}} title="Скопировать ссылку" data-resource={this.props.file.id} className="fas fa-link get-url"></i>
        <i onClick={(e)=>{this.handleOpenInTab(this.props.file.id, e)}} title="Открыть в новой вкладке" data-resource={this.props.file.id} className="fas fa-external-link-square-alt open-in-tab"></i>
        <i onClick={(e)=>{this.handleDownloadResource(this.props.file.id, e)}} title="Скачать файл" data-resource={this.props.file.id} className="fas fa-arrow-alt-circle-down dl-now"></i>
        <i onClick={(e)=>{this.handleAddToDownloads(this.props.file.id, e)}} title="Добавить в загрузки" data-resource={this.props.file.id} className="fas fa-plus-circle dl-cart-add"></i>
      </span>
    );
    let priorityStack = [];
    let priorityCtx = "";
    if(this.state.priority_active == this.props.file.id){
      for(var j=0; j<maxAdd; j++){
        priorityStack.push(<div className={"item " + (this.props.file.priority == j?"active":"")} onClick={this.handlePriorityUpdate} data-priority={j}>{j}</div>);
      }
      priorityCtx = [
        <div className="edit-input__context-menu context-menu"><div className="context-menu__inner">{priorityStack}</div></div>
      ];
    }

    return ((<div className={"existing-files__file file " + this.fileViewClasses[this.props.view]} key={this.props.file.src_filename + this.props.file.filename}>
      <a className="file__file-name" href={window.config.resource_url + this.props.file.id + ".jpg"} target="_blank">
        <div className="file__thumbnail" style={{"backgroundImage" : "url(" + (this.props.finished_presets.length?this.props.finished_presets[0].link:"") + ")"}}></div>
        {this.props.view != 2 ? dlControls : null}
        {this.props.file.src_filename}
      </a>
      <div className={"edit-input " + (this.props.file.type == "2"?"edit-input--add-file":"")}>
        <select onChange={this.handleResourceUpdate} name="type" defaultValue={this.props.file.type} disabled={!this.props.authorized}>
          <option disabled={this.props.current_main >= this.props.max_main?true:false} value="1">Основноe{this.props.current_main+"/"+this.props.max_main}</option>
            <option disabled={this.props.current_add >= this.props.max_add?true:false} value="2">Доп.{this.props.current_add+"/"+this.props.max_add}</option>
          <option value="3">Исходник</option>
        </select>
        {this.props.file.type == "2"
            ? <span className="edit-input__priority-btn" data-file={this.props.file.id} onClick={this.handlePriority}>{this.props.file.priority}{priorityCtx}</span>
            : null
        }
        <input type="hidden" name="priority" defaultValue={this.props.file.priority} onChange={this.handleResourceUpdate}></input>
      </div>
      <input type="hidden" name="id" value={this.props.file.id}/>
      <span className="info__info-field info-field info__info-field--sizemb">{Math.round((this.props.file.size_bytes / (1024 * 1024)) * 100) / 100 + "MB"}</span>
      <span className="info__info-field info-field info__info-field--uploaddate">{this.props.file.created_on}</span>
      <span className="info__info-field info-field info__info-field--username">{this.props.file.username}</span>
      <span className="info__info-field info-field info__info-field--comment">{this.props.file.comment}</span>
      <span className="info__info-field info-field info__info-field--sizepx">
        <a className="file__file-src" href={window.config.resource_url + this.props.file.id + ".jpg"} target="_blank">
          {dlControls}
          {this.props.file.size_px}
        </a>
      </span>
      {presets}
    </div>));
  }

}

const mapStateToProps = (store,props)=>{
  return {
    finished_presets: selectors.resource.getFinishedPresets(store,props),
    max_main: selectors.resource.getMaxMainResources(store,props),
    max_add: selectors.resource.getMaxAddResources(store,props),
    current_main: selectors.resource.getCurrentMainResources(store,props),
    current_add: selectors.resource.getCurrentAddResources(store,props),
  }
}

const mapDispatchToProps = {
  addResourceToDownloads,
}

export default connect(mapStateToProps, mapDispatchToProps)(ExistingResource)
