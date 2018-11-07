import React from 'react';
// import $ from 'jquery';
import { hex_md5 } from '../vendor/md5';
import { UnfinishedUploads } from './UnfinishedUploads';
import { UploadService } from './services/UploadService';
import {NotificationService} from '../services/NotificationService';

export class Uploads extends React.Component{
  constructor(props) {
    super(props);
    this.state={
      "uploads":[],
      "busy" : false,
      "loading" : false,
      "need_refresh": false,
      "unfinished_need_refresh":false
    };
    this.fileViewClasses = ['file--icons-lg ','file--icons-sm ','file--detailed '];
    this.fileHashStack = [];
    this.removeUploadStack = [];
    this.uploadCommitQueue = [];
    this.uploadStatus = {
      "unfinished": "Прерван",
      "uploading": "Загружается",
      "unfinished": "Прерван",
      "resolved": "Готов к повторной загрузке",
      "pending": "Готов к загрузке",
      "processing": "Обрабатывается",
      "completed": "Загружен"
    };
    this.handleDelete = this.handleDelete.bind(this);
    this.processFile = this.processFile.bind(this);
    this.cleanUpDone = this.cleanUpDone.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClearUnfinished = this.handleClearUnfinished.bind(this);
  }

  cleanUpDone(){
    for (var i = 0; i < this.props.resumable.files.length; i++) {
      let file = this.props.resumable.files[i];
      if(file.isComplete()){
        this.props.resumable.files.splice(i,1);
        this.handleDelete(file.uniqueIdentifier);
        i--;
      }
      this.setState({"loading" : false});
    }
  }

  processFile(file) {
    this.fileHashStack.push(file);
    file.itemId = this.props.item.id;
    file.itemCode = this.props.item.itemCode;
    file.ready = false;
    let processResponse = UploadService.processFile(file, this.props.resumable.files);
    processResponse.then((response)=>{
      this.fileHashStack.splice(this.fileHashStack.indexOf(file), 1);
      if(this.fileHashStack.length == 0){
        NotificationService.toast("up-ready");
        this.setState({
          "need_refresh": true,
          "unfinished_need_refresh": true
        });
      }
    });
  }

  handleDelete(e){
    let filehash = "";
    if(e.target){filehash = $(e.target).data("item");}else{filehash = e}
    if(typeof this.removeUploadStack[filehash] == 'undefined'){
      this.removeUploadStack.push(filehash);
    }
    let deleteResponse = UploadService.deleteUpload(filehash,this.props.item.id);
    deleteResponse.then((response)=>{
      for(var i = 0; i<this.props.resumable.files.length; i++){
        if(this.props.resumable.files[i].uniqueIdentifier == filehash){
          this.props.resumable.files.splice(i,1);
        }
      }
      this.removeUploadStack.splice(this.removeUploadStack.indexOf(filehash),1);
      if(this.removeUploadStack.length == 0){
        this.setState({
          "need_refresh": true,
          "unfinished_need_refresh": true
        });
      }
    });
  }

  handleSubmit(){
    let ready = true;
    for(var i = 0; i< this.props.resumable.files.length; i++){
      if (!this.props.resumable.files[i].ready){
        ready = false;
      }
    }
    if (ready) {
      this.props.resumable.upload();
    }
  }

  handleClearUnfinished(){
    if(this.state.uploads.length == 0){
      delete window.resumableContainer[this.props.item_id];
      window.resumableContainer.splice(this.props.item_id,1);
    }
  }

  assignResumableEvents(){
    this.props.resumable.on('fileAdded', (file, event)=>{
      //this.fileAddQueue.push(file);
      this.setState({"loading" : true});
      this.processFile(file);
      if(window.resumableContainer[this.props.item.id] == undefined){
        window.resumableContainer[this.props.item.id] = this.props.resumable;
      }
      $("#drop_target" + this.props.item.id).removeClass('file-list__drop-target--active');
    });
    this.props.resumable.on('fileProgress', (file,event)=>{
      this.setState({
          "need_refresh":true
      });
    });
    this.props.resumable.on('uploadStart', (file,event)=>{
      this.state.busy = true;
    });
    this.props.resumable.on('complete', ()=>{
      this.state.busy = false;
      this.cleanUpDone();
      delete window.resumableContainer[this.props.item_id];
      window.resumableContainer.splice(this.props.item.id, 1);
      this.props.uploadCompleteHandler();
    });
    this.props.resumable.on('fileError', (file,message)=>{
      this.state.busy = false;
      if(message == "Unsupported media type"){NotificationService.throw("ext-not-supported");}else{
        NotificationService.throw("unknown-error");
      }
    });
  }

  componentDidMount(){
    this.props.resumable.assignBrowse(document.getElementById("browse" + this.props.item.id));
    this.props.resumable.assignDrop(document.getElementById("drop_target" + this.props.item.id));
    var dragTimer;
    $(".item-view").on('dragover', (e)=>{
      var dt = e.originalEvent.dataTransfer;
      if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('Files'))) {
        $("#drop_target" + this.props.item.id).addClass('file-list__drop-target--active');
        window.clearTimeout(dragTimer);
      }
    });
    $("#drop_target" + this.props.item.id).on('dragleave', (e)=>{
      dragTimer = window.setTimeout(()=>{
        $("#drop_target" + this.props.item.id).removeClass('file-list__drop-target--active');
      }, 100);
    });
    this.assignResumableEvents();
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props != prevProps){
      this.setState({
        "view_type": this.props.default_view,
        "open": this.props.open_by_default
      });
    }
    if(this.state.unfinished_need_refresh || this.state.need_refresh){
      this.setState({
        "need_refresh": false,
        "unfinished_need_refresh": false,
        "loading": false,
      });
    }
    if(this.props.resumable.files.length >0 && this.props.resumable.files.filter((upload)=>{return upload.ready==false}).length==0){
      this.state.ready = true;
    } else {
      this.state.ready = false;
    }
  }

  componentWillUnmount(){
    this.props.resumable.events = [];
  }

  render() {

    let uploads = this.props.resumable.files;
    let uploadsMarkup = [];
    for(var i = 0; i<uploads.length; i++){
      let status = "";
      if(uploads[i].isComplete()){
        status = "completed";
      }else{
        if(uploads[i].isUploading()){
          status = "uploading";
        }else if(!uploads[i].ready){
          status = "processing";
        }else{
          status = "pending";
        }
      }
      uploadsMarkup.push(
          <div key={uploads[i].fileName+uploads[i].uniqueIdentifier+"pending"} className={"file-list__file-item file-item " + "file-item"+(uploads[i].isComplete()?"--completed":"--pending") +" "+ (uploads[i].ready? "": "file-item--processing ")+ this.fileViewClasses[this.state.view_type]}>
            <i data-item={uploads[i].uniqueIdentifier} onClick={this.handleDelete} className="fas fa-trash-alt file-item__delete-upload"></i><br />
          <span className="file-item__file-name">{uploads[i].fileName}</span>
        <span className="file-item__upload-status">{this.uploadStatus[status]}</span>
      <span className="progress-bar" id={"progress_bar"+uploads[i].uniqueIdentifier}>
            <div className="progress-bar__percentage">{Math.round(uploads[i].progress() * 100) + "%"}</div>
          <div className="progress-bar__bar" style={{"width":Math.round(uploads[i].progress() * 100) + "%"}}></div>
            </span>
          </div>
      );
    }

    return (
      <div className={"item-view__file-list file-list"} id={"file_list" + this.props.item.id}>
          <div className="file-list__button-block">
            <button type="button" id={"browse" + this.props.item.id}><i className="fas fa-folder-open"></i>Выбрать файлы</button>
          <button type="button" disabled={!this.state.ready} onClick={this.handleSubmit} id={"submit" + this.props.item.id}><i className="fas fa-file-upload"></i>Загрузить выбранное</button>

          </div>
      <div className="item-uploads">
        {uploads.length>0?<div key={this.props.item.id + "uploads"} className="item-view__subheader-wrapper"><h4 className="item-view__subheader">Загрузки</h4></div>:""}
        {uploads.length>0?<div className={"item-uploads__upload-wrapper "+(this.state.loading?"loading ":"")}>
        <div className="item-view__table-header">
          <span className="info__info-field info__info-field--title info__info-field--blank"></span>
          <span className="info__info-field info__info-field--title info__info-field--sizepx">Имя файла</span>
          <span className="info__info-field info__info-field--title info__info-field--type">Статус</span>
          <span className="info__info-field info__info-field--title info__info-field--sizebytes">Прогресс</span>
        </div>
        {uploadsMarkup}
      </div>:null}
        <UnfinishedUploads item={this.props.item} uploads={uploads} deleteHandler={this.handleDelete} clearAllHandler={this.handleClearUnfinished} need_refresh={this.state.unfinished_need_refresh}/>
      </div>
    </div>
    );
  }
}
