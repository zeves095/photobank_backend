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
      "unfinished":[],
      "main": null,
      "additional": [],
      "viewType": 0
    };

    this.viewClasses = ['item-view__inner--icons-lg ','item-view__inner--icons-sm ','item-view__inner--detailed '];

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
        console.warn(file.isUploading());
        this.state.uploads.push({"filename": file.fileName, "filehash": file.uniqueIdentifier, "class": className, "ready": file.ready, "uploading":file.isUploading()});
      }
      this.cleanUpDone();
      this.resolveResumedUploads();
      this.sortList();
    }.bind(this), 300);
  }

  sortList(){
    console.log(this.state.uploads);
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

  fetchExisting(){
    $.getJSON(window.config.existing_uploads_url+this.state.item_id, (data)=>{
      this.buildExisting(data);
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
      url: window.config.update_resource_url+data.id,
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
  }

  componentDidMount(){
    this.resumable.assignBrowse(document.getElementById("browse" + this.props.item_id));
    this.resumable.assignDrop(document.getElementById("drop_target" + this.props.item_id));
    this.resumable.on('fileAdded', function(file, event) {
      file.itemId = this.state.item_id;
      file.itemCode = this.state.item_code;
      file.ready = false;
      //this.hashPool.push(file);
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

  buildExisting(data){
    let maxMain = window.config.max_main_resources;
    let maxAdd = window.config.max_additional_resources;
    let currMain = data.filter((file)=>{return file.type == 1}).length;
    let currAdd = data.filter((file)=>{return file.type == 2}).length;
    let mainStatus = currMain+"/"+maxMain;
    let addStatus = currAdd+"/"+maxAdd;
    data = data.map((file)=>
    <div className="existing-files__file file" key={file.src_filename+file.filename}><a href={window.config.update_resource_url+file.id+".jpg"}>{file.src_filename}</a>
      <span className="file__edit-fields edit-fields">
        <span className="edit-fields__edit-input">
          <select onChange={this.handleResourceUpdate} name="type" defaultValue={file.type}>
            <option disabled={currMain>=maxMain?true:false} value="1">Основноe{mainStatus}</option>
          <option disabled={currAdd>=maxAdd?true:false} value="2">Дополнительное{addStatus}</option>
            <option value="3">Исходник</option>
          </select>
          <label htmlFor="type">Тип ресурса</label>
        </span>
        <span className="edit-fields__edit-input"><input onClick={this.handleResourceUpdate} type="checkbox" defaultChecked={file.is1c} name="1c"/><label htmlFor="1c">Использовать в 1С</label></span>
        <span className="edit-fields__edit-input"><input onClick={this.handleResourceUpdate} type="checkbox" defaultChecked={file.isDeleted} name="deleted"/><label htmlFor="deleted">Удален</label></span>
        <input type="hidden" name="id" value={file.id}/>
      </span>
      <div className="file__info info">
        <span className="info__info-field info__info-field--sizepx">
          {file.size_px}
        </span>
        <span className="info__info-field info__info-field--sizemb">
          {Math.round(file.size_bytes/(1024*1024), -2)}
        </span>
        <span className="info__info-field info__info-field--uploaddate">
          {file.created_on}
        </span>
        <span className="info__info-field info__info-field--username">
          {file.username}
        </span>
        <span className="info__info-field info__info-field--comment">
          {file.comment}
        </span>
      </div>
    </div>);
    this.setState({
      "existing": data
    });
  }

  drawSegment(list){
    return list.map((upload)=>
      <span key={upload.filename+upload.filehash} className={"file-list__file-item file-item file-item"+upload.class +" "+ (upload.ready? "": "file-item--processing")}>
        F: {upload.filename}
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
      <div className={"item-view__inner " + (this.state.open?"item-view__inner--open ":"item-view__inner--closed ") + this.viewClasses[this.state.viewType]}>
          <h4>Файлы товара</h4>
          <div className="item-view__file-list existing-files">{this.state.existing}</div>
          <h4>Загрузки</h4>
          <div className="item-view__file-list file-list" id={"file_list" + this.props.item_id}>{this.state.upload_list}</div>
          <div className="file-list__drop-target" id={"drop_target" + this.props.item_id}></div>
          <div className="file-list__button-block">
            <button type="button" id={"browse" + this.props.item_id}>Выбрать</button>
            <button type="button" onClick={this.handleSubmit} id={"submit" + this.props.item_id}>Загрузить</button>
          </div>
        </div>
      </div>
    );
  }
}
