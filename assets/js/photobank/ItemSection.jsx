import React from 'react';
// import $ from 'jquery';
import { hex_md5 } from '../vendor/md5';

export class ItemSection extends React.Component{
  constructor(props) {
    super(props);
    if(typeof window.resumableContainer[this.props.item_id] == 'undefined'){
      this.resumable = new Resumable({target: window.config.upload_target_url});
    } else {
      this.resumable = window.resumableContainer[this.props.item_id];
    }
    this.state={
      "resumable":this.resumable,
      "item_id":this.props.item_id,
      "item_code":this.props.item_code,
      "open":this.props.open_by_default,
      "ready":false,
      "uploads":[],
      "upload_list":[],
      "existing": [],
      "existingList": [],
      "unfinished":[],
      "main": null,
      "additional": [],
      "viewType": 0,
      "finished_presets": [],
      "preset_headers": []
    };
    this.containerViewClasses = ['item-view__inner--icons-lg ','item-view__inner--icons-sm ','item-view__inner--detailed '];
    this.fileViewClasses = ['file--icons-lg ','file--icons-sm ','file--detailed '];

    this.buildList = this.buildList.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.getHash = this.getHash.bind(this);
    this.resolveResumedUploads = this.resolveResumedUploads.bind(this);
    this.fetchExisting = this.fetchExisting.bind(this);
    this.fetchUnfinished = this.fetchUnfinished.bind(this);
    this.handleResourceUpdate = this.handleResourceUpdate.bind(this);
    this.removeUpload = this.removeUpload.bind(this);
    this.buildExisting = this.buildExisting.bind(this);
    this.sortList = this.sortList.bind(this);
    this.cleanUpDone = this.cleanUpDone.bind(this);
    this.handleViewChoice = this.handleViewChoice.bind(this);
    this.getFinishedPresets = this.getFinishedPresets.bind(this);
  }

  buildList() {
    if (typeof this.updateListTimer != 'undefined') {
      clearTimeout(this.updateListTimer);
    }
    this.updateListTimer = setTimeout(function() {
      this.state.uploads = [];
      for(var i = 0; i < this.state.unfinished.length; i++){
        let file = this.state.unfinished[i];
        let className = "--unfinished";
        this.state.uploads.push({"filename": file.filename, "filehash": file.filehash, "class": className, "ready": true, "uploading": false});
      }
      for (var i = 0; i < this.resumable.files.length; i++) {
        let file = this.resumable.files[i];
        let className = file.isComplete()?"--completed":"--pending";
        this.state.uploads.push({"filename": file.fileName, "filehash": file.uniqueIdentifier, "class": className, "ready": file.ready, "uploading":file.isUploading()});
      }
      this.cleanUpDone();
      this.resolveResumedUploads();
      this.sortList();
    }.bind(this), 300);
  }

  sortList(){
    let uploadList = this.state.uploads;
    let active = uploadList.filter((item)=>{return item.class != '--unfinished'});
    let unfinished = uploadList.filter((item)=>{return item.class == '--unfinished'});
    let pending = active.filter((item)=>{return item.ready == false});
    let ready = active.filter((item)=>{return item.ready == true && item.uploading == false});
    let uploading = active.filter((item)=>{return item.uploading == true});

    let uploadListMarkup = [pending.length>0?<h4>Обрабатываются...</h4>:""];
    uploadListMarkup = uploadListMarkup.concat(this.drawSegment(pending));
    uploadListMarkup.push(ready.length>0?<h4>Загрузки</h4>:"");
    uploadListMarkup = uploadListMarkup.concat(this.drawSegment(ready));
    uploadListMarkup.push(uploading.length>0?<h4>Загружаются...</h4>:"");
    uploadListMarkup = uploadListMarkup.concat(this.drawSegment(uploading));
    uploadListMarkup.push(unfinished.length>0?<h4>Незаконченные</h4>:"");
    uploadListMarkup = uploadListMarkup.concat(this.drawSegment(unfinished));
    this.setState({
      "upload_list":uploadListMarkup
    });
  }

  getFinishedPresets(resource){
    for(var preset in window.config['presets']){
      let presetId = window.config['presets'][preset]['id'];
      let resId = resource.id;
      let url = window.config.resource_url + resource.id + "/" + presetId;
      this.state.finished_presets = [];
      $.ajax({url: url, method: 'GET'}).done((data)=>{
        if(typeof data.id != "undefined"){
          this.state.finished_presets.push({
            'id': data.id,
            'resource' : data.gid,
            'preset' : data.preset
          });
          if (typeof this.finishedFilesTimer != 'undefined') {
            clearTimeout(this.finishedFilesTimer);
          }
          this.finishedFilesTimer = setTimeout(function() {
            this.buildExisting();
          }.bind(this), 100);
        }
      });
    }
  }

  fetchExisting(){
    $.getJSON(window.config.existing_uploads_url+this.state.item_id, (data)=>{
      for(var datum in data){
        this.getFinishedPresets(data[datum]);
      }
      this.state.existing = data;
      this.buildExisting();
    });
  }

  fetchUnfinished(){
    let unfinished = [];
    $.getJSON(window.config.unfinished_uploads_url, (data)=>{
      for (var i = 0; i < data.length; i++) {
        let unfinishedUpload = data[i];
        if(unfinishedUpload[[0]]==this.state.item_id){
          unfinished.push({'filename': unfinishedUpload[1], 'filehash': unfinishedUpload[2], 'class': "unfinished", "ready": true});
        }
      }
    });
    this.setState({
      "unfinished":unfinished
    });
  }

  resolveResumedUploads(){
    for (var i = 0; i < this.state.uploads.length; i++) {
      for (var j = 0; j < this.state.uploads.length; j++) {
        if (this.state.uploads[i]["class"] == "--unfinished" && i != j && this.state.uploads[i]["filename"] == this.state.uploads[j]["filename"] && this.state.uploads[i]["filehash"] == this.state.uploads[j]["filehash"]) {
          this.state.uploads.splice(i, 1);
          this.resolveResumedUploads();
        }
      }
    }
  }

  cleanUpDone(){
    for (var i = 0; i < this.state.uploads.length; i++) {
      let file = this.state.uploads[i];
      if(file.class=="--completed"){
        this.state.uploads.splice(i,1);
        this.removeUpload(file);
      }
    }
  }

  getHash(file) {
    let fileObj = file.file;
    let reader = new FileReader();
    reader.onload = function(e) {
      let hashable = e.target.result;
      hashable = new Uint8Array(hashable);
      hashable = CRC32.buf(hashable).toString();
      file.uniqueIdentifier = hex_md5(hashable+file.itemId + file.file.size);
      file.ready = true;
      this.commitUpload(file);
      this.buildList();
    }.bind(this);
    reader.readAsArrayBuffer(fileObj);
    this.buildList();
  }

  commitUpload(file){
    let obj = {
      'filehash': file.uniqueIdentifier,
      'filename': file.fileName,
      'itemid': file.itemId,
      'totalchuks': file.chunks.length
    }
    $.ajax({url: window.config.commit_upload_url, method: 'POST', data: obj});
  }

  removeUpload(upload){
    let obj = {
      'filehash': upload.filehash,
      'filename': upload.filename,
      'itemid': this.state.item_id
    }
    $.ajax({url: window.config.remove_upload_url, method: 'POST', data: obj});
  }

  handleDelete(e){
    let filehash = $(e.target).data("item");
    this.removeUpload(this.state.uploads.filter((upload)=>{return upload.filehash == filehash})[0]);
    for(var i = 0; i<this.resumable.files.length; i++){
      if(this.resumable.files[i].uniqueIdentifier == filehash){
        this.resumable.files.splice(i,1);
      }
    }
    this.fetchUnfinished();
    this.buildList();
  }

  handleSubmit(){
    let ready = true;
    for(var i = 0; i< this.resumable.files.length; i++){
      if (!this.resumable.files[i].ready){
        ready = false;
      }
    }
    if (ready) {
      this.resumable.upload();
    }
  }

  handleResourceUpdate(e){
    let form = $(e.target).parent().parent();
    let data = {
      "id" : form.find("input[name='id']").val()
    };
    form.find(".edit-fields__edit-input").each(function(){
      let sel = $(this).find("select");
      let chk = $(this).find("input[type='checkbox']");
      let txt = $(this).find("input[type='text']");
      if(sel.length){data[sel.prop('name')]=sel.val()}
      if(chk.length){data[chk.prop('name')]=chk.prop("checked")}
      if(txt.length){data[txt.prop('name')]=txt.val()}
    });
    let dataJson = JSON.stringify(data);
    $.ajax({
      url: window.config.resource_url+data.id,
      method: 'PATCH',
      data: dataJson,
      contentType: "application/json; charset=utf-8",
      dataType: "json"
    });
    this.fetchExisting();
  }

  handleViewChoice(e){
    let viewBtn = $(e.target).is("button")?$(e.target):$(e.target).parent();
    let view = viewBtn.data("view");
    this.setState({"viewType":view});
    this.buildExisting();
  }

  componentDidMount(){
    let presets = [];
    for(var preset in window.config['presets']){
      presets.push(<span className="info-field__title info__info-field--preset">{preset}</span>);
    }
    this.setState({
      "preset_headers":presets
    });
    this.resumable.assignBrowse(document.getElementById("browse" + this.props.item_id+this.props.section_type));
    this.resumable.assignDrop(document.getElementById("drop_target" + this.props.item_id));
    this.resumable.on('fileAdded', function(file, event) {
      file.itemId = this.state.item_id;
      file.itemCode = this.state.item_code;
      file.ready = false;
      this.getHash(file);
      if(window.resumableContainer[this.state.item_id] == undefined){
        window.resumableContainer[this.props.item_id] = this.resumable;
      }
    }.bind(this));
    this.resumable.on('fileSuccess', function(file,event){
      this.fetchExisting();
      this.buildList();
    }.bind(this));
    this.resumable.on('fileProgress', function(file,event){
      $("#progress_bar"+file.uniqueIdentifier+">span").css('width', file.progress()*100+"%");
    }.bind(this));
    this.resumable.on('uploadStart', function(file,event){
      this.buildList();
    }.bind(this));
    this.fetchUnfinished();
    this.fetchExisting();
    this.buildList();
  }

  buildExisting(){
    let maxMain = window.config.max_main_resources;
    let maxAdd = window.config.max_additional_resources;
    let currMain = this.state.existing.filter((file)=>{return file.type == 1}).length;
    let currAdd = this.state.existing.filter((file)=>{return file.type == 2}).length;
    let mainStatus = currMain+"/"+maxMain;
    let addStatus = currAdd+"/"+maxAdd;
    let markupData = [];
    for(var existingFile in this.state.existing){
      let file = this.state.existing[existingFile];
      let presets = [];
      for(var preset in window.config['presets']){
        let presetId = window.config['presets'][preset]['id'];
        let finishedPreset = this.state.finished_presets.filter((preset)=>{return (preset.resource==file.id && preset.preset == presetId)})[0];
        let finished = typeof finishedPreset != "undefined";
        presets.push(
          <span key={file.id+"-"+presetId} className={"info__info-field info__info-field--preset "+finished?"info__info-field--preset-done":"info__info-field--preset-not-done"}>
            {finished
              ?<a href={window.config['resource_url']+finishedPreset.id+".jpg"} target="_blank">{window.config['presets'][preset]['width']+'/'+window.config['presets'][preset]['height']}</a>
              :"Не обработан"
            }
          </span>);
      }
      markupData.push(
        <div className={"existing-files__file file "+this.fileViewClasses[this.state.viewType]} key={file.src_filename+file.filename}><a href={window.config.resource_url+file.id+".jpg"}>{file.src_filename}</a>
        <span className="file__edit-fields edit-fields">
          <span className="edit-fields__edit-input">
            <select onChange={this.handleResourceUpdate} name="type" defaultValue={file.type}>
              <option disabled={currMain>=maxMain?true:false} value="1">Основноe{mainStatus}</option>
            <option disabled={currAdd>=maxAdd?true:false} value="2">Дополнительное{addStatus}</option>
              <option value="3">Исходник</option>
            </select>
          </span>
          <span className="edit-fields__edit-input"><input onClick={this.handleResourceUpdate} type="checkbox" defaultChecked={file.isDeleted} name="deleted"/><label htmlFor="deleted">Удален</label></span>
          <input type="hidden" name="id" value={file.id}/>
        </span>
        <div className="file__info info">
          <span className="info__info-field info-field info__info-field--sizepx">
            {file.size_px}
          </span>
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
            {presets}
        </div>
      </div>)
    }
    this.setState({
      "existingList": markupData
    });
  }

  drawSegment(list){
    return list.map((upload)=>
      <span key={upload.filename+upload.filehash} className={"file-list__file-item file-item " + "file-item"+upload.class +" "+ (upload.ready? "": "file-item--processing ")+ this.fileViewClasses[this.state.viewType]}>
        {upload.filename}
        <span className="file-item__delete-upload" data-item={upload.filehash} onClick={this.handleDelete}>X</span>
        <span className="file-item__progress-bar" id={"progress_bar"+upload.filehash}>
        <span></span>
        </span>
      </span>);
  }

  render() {
    return (
      <div className={"item-view"}>
        <button type="button" onClick={()=>{this.setState({"open":!this.state.open})}}>{this.state.open?"Скрыть":"Показать"}</button>
        <button type="button" data-view="0" onClick={this.handleViewChoice}><i className="fas fa-th-large"></i></button>
        <button type="button" data-view="1" onClick={this.handleViewChoice}><i className="fas fa-th"></i></button>
        <button type="button" data-view="2" onClick={this.handleViewChoice}><i className="fas fa-list-ul"></i></button>
      <div className={"item-view__inner " + (this.state.open?"item-view__inner--open ":"item-view__inner--closed ") + this.containerViewClasses[this.state.viewType]}>
          {this.props.render_existing
            ?<div className="item-view__existing">
          <h4>Файлы товара</h4>
          <div className="item-view__table-header">
            <span className="info-field__title info__info-field--sizepx">Имя файла</span>
          <span className="info-field__title info__info-field--sizepx">Тип ресурса</span>
            <span className="info-field__title info__info-field--sizepx">Размер изображения</span>
            <span className="info-field__title info__info-field--sizemb">Размер файла</span>
            <span className="info-field__title info__info-field--uploaddate">Дата создания</span>
            <span className="info-field__title info__info-field--username">Пользователь</span>
            <span className="info-field__title info__info-field--comment">Комментарий</span>
          {this.state.preset_headers}
          </div>
          <div className="item-view__file-list existing-files">{this.state.existingList}</div>
          </div>
            :null}
          <h4>Загрузки</h4>
          <div className="item-view__file-list file-list" id={"file_list" + this.props.item_id}>{this.state.upload_list}</div>
          <div className="file-list__drop-target" id={"drop_target" + this.props.item_id}></div>
          <div className="file-list__button-block">
            <button type="button" id={"browse" + this.props.item_id + this.props.section_type}>Выбрать</button>
            <button type="button" onClick={this.handleSubmit} id={"submit" + this.props.item_id}>Загрузить</button>
          </div>
        </div>
      </div>
    );
  }
}
