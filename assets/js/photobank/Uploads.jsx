import React from 'react';
// import $ from 'jquery';
import { hex_md5 } from '../vendor/md5';
import { UnfinishedUploads } from './UnfinishedUploads';

export class Uploads extends React.Component{
  constructor(props) {
    super(props);
    this.state={
      "uploads":[],
      "upload_list":[],
      "unfinished":[],
      "busy" : false,
      "loading_uploads" : false,
      "unfinished_hidden":false,
      "unfinished_need_refresh":false
    };
    this.containerViewClasses = ['item-view__inner--icons-lg ','item-view__inner--icons-sm ','item-view__inner--detailed '];
    this.fileViewClasses = ['file--icons-lg ','file--icons-sm ','file--detailed '];
    this.fileHashStack = [];
    this.removeUploadStack = [];
    this.uploadCommitQueue = [];
    this.paginationControls = "";
    this.uploadStatus = {
      "unfinished": "Прерван",
      "uploading": "Загружается",
      "unfinished": "Прерван",
      "resolved": "Готов к повторной загрузке",
      "pending": "Готов к загрузке",
      "processing": "Обрабатывается",
      "completed": "Загружен"
    };
    this.buildList = this.buildList.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.getHash = this.getHash.bind(this);
    this.cleanUpDone = this.cleanUpDone.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  buildList() {
      this.state.uploads = [];
      for (var i = 0; i < this.props.resumable.files.length; i++) {
        let file = this.props.resumable.files[i];
        let className = file.isComplete()?"--completed":"--pending";
        let status = "";
        if(file.isComplete()){
          status = "completed";
        }else{
          if(file.isUploading()){
            status = "uploading"
          }else{
            status = "pending";
          }
        }
        if(!file.ready){status = "processing";}
        this.state.uploads.push({"filename": file.fileName, "filehash": file.uniqueIdentifier, "class": className, "status":status, "ready": file.ready, "uploading":file.isUploading(),"resumablekey": i, "progress": 0});
      }
      if(this.state.uploads.length >0 && this.state.uploads.filter((upload)=>{return upload.status!="unfinished" || upload.ready==false}).length>0){
        this.state.ready = true;
      } else {
        this.state.ready = false;
      }
      this.cleanUpDone();
      this.setState({
        "loading_uploads": false,
      });
  }

  cleanUpDone(){
    let cleanedUp = false;
    for (var i = 0; i < this.state.uploads.length; i++) {
      let file = this.state.uploads[i];
      if(file.status=="completed"){
        this.state.uploads.splice(i,1);
        this.props.resumable.files.splice(file.resumablekey, 1);
        this.handleDelete(file.filehash);
        i--;
        cleanedUp = true;
      }
    }
  }

  getHash(file) {
    let fileObj = file.file;
    let reader = new FileReader();
    this.fileHashStack.push(file);
    reader.onload = function(e) {
      let hashable = e.target.result;
      hashable = new Uint8Array(hashable);
      hashable = CRC32.buf(hashable).toString();
      let identifier = hex_md5(hashable+file.itemId + file.file.size)
      file.uniqueIdentifier = identifier;
      let allowed = true;
      let self = this.props.resumable.files.indexOf(file);
      for(var existingUpload in this.props.resumable.files){
        if(this.props.resumable.files[existingUpload].uniqueIdentifier == identifier && existingUpload != self){
          allowed = false;
          this.props.resumable.files.splice(self, 1);
        }
      }
      if(allowed){
        file.ready = true;
        this.commitUpload(file);
      }
      this.fileHashStack.splice(this.fileHashStack.indexOf(file), 1);
      if(this.fileHashStack.length == 0){
        this.buildList();
        this.setState({
          "unfinished_need_refresh": true
        });
      }
    }.bind(this);
    reader.readAsArrayBuffer(fileObj);
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

  handleDelete(e){
    let filehash = "";
    if(e.target){filehash = $(e.target).data("item");}else{filehash = e}
    console.log(filehash);
    let obj = {
      'filehash': filehash,
      'itemid': this.props.item.id
    }
    $.ajax({url: window.config.remove_upload_url, method: 'POST', data: obj}).done(()=>{
      for(var i = 0; i<this.props.resumable.files.length; i++){
        if(this.props.resumable.files[i].uniqueIdentifier == filehash){
          this.props.resumable.files.splice(i,1);
        }
      }
      this.removeUploadStack.splice(this.removeUploadStack.indexOf(filehash),1);
      if(this.removeUploadStack.length == 0){
        this.setState({
          "unfinished_need_refresh": true
        });
        this.buildList();
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

  assignResumableEvents(){
    this.props.resumable.on('fileAdded', (file, event)=>{
      this.setState({"loading_uploads" : true});
      file.itemId = this.props.item.id;
      file.itemCode = this.props.item.itemCode;
      file.ready = false;
      this.getHash(file);
      if(window.resumableContainer[this.props.item.id] == undefined){
        window.resumableContainer[this.props.item.id] = this.props.resumable;
      }
      $("#drop_target" + this.props.item.id).removeClass('file-list__drop-target--active');
      this.buildList();
    });
    this.props.resumable.on('fileSuccess', (file,event)=>{
      this.buildList();
    });
    this.props.resumable.on('fileProgress', (file,event)=>{
      //$("#progress_bar"+file.uniqueIdentifier+">span").css('width', file.progress()*100+"%");
      let resumableKey = this.props.resumable.files.indexOf(file);
      let upload = this.state.uploads.filter((upload)=>{return upload.resumablekey == resumableKey});
      if(upload.length>0){
        upload[0].progress = Math.round(file.progress() * 100);
      }
      this.setState({
        "uploads":this.state.uploads,
      });
    });
    this.props.resumable.on('uploadStart', (file,event)=>{
      this.state.busy = true;
      this.buildList();
    });
    this.props.resumable.on('complete', ()=>{
      this.setState({"loading_uploads" : true});
      this.state.busy = false;
      this.buildList();
      this.props.uploadCompleteHandler();
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
      this.buildList();
    }
    if(this.state.unfinished_need_refresh){
      this.setState({
        "unfinished_need_refresh": false,
      });
    }
  }

  componentWillUnmount(){
    this.props.resumable.events = [];
  }

  render() {

    let uploadList = this.state.uploads;
    let active = uploadList.filter((item)=>{return item.status != 'unfinished'});
    let uploadListMarkup = [active.length>0?<div key={this.props.item.id + "uploads"} className="item-view__subheader-wrapper"><h4 className="item-view__subheader">Загрузки</h4></div>:""];
    let hide = false;
    for(var i = 0; i<active.length; i++){
      uploadListMarkup.push(
          <div key={active[i].filename+active[i].filehash+"pending"} className={"file-list__file-item file-item " + "file-item"+active[i].class +" "+ (active[i].ready? "": "file-item--processing ")+ this.fileViewClasses[this.state.view_type] + (hide?"file-item--hidden":"")}>
            <i data-item={active[i].filehash} onClick={this.handleDelete} className="fas fa-trash-alt file-item__delete-upload"></i><br />
          <span className="file-item__file-name">{active[i].filename}</span>
        <span className="file-item__upload-status">{this.uploadStatus[active[i].status]}</span>
      <span className="progress-bar" id={"progress_bar"+active[i].filehash}>
            <div className="progress-bar__percentage">{active[i].progress + "%"}</div>
          <div className="progress-bar__bar" style={{"width":active[i].progress+"%"}}></div>
            </span>
          </div>
      );
    }

    return (
      <div className={(this.state.loading_uploads?"loading ":"") + "item-view__file-list file-list"} id={"file_list" + this.props.item.id}>
          <div className="file-list__button-block">
            <button type="button" id={"browse" + this.props.item.id}><i className="fas fa-folder-open"></i>Выбрать файлы</button>
          <button type="button" disabled={!this.state.ready} onClick={this.handleSubmit} id={"submit" + this.props.item.id}><i className="fas fa-file-upload"></i>Загрузить выбранное</button>

          </div>
      <div className="item-uploads">
        <div className="item-view__table-header">
          <span className="info__info-field info__info-field--title info__info-field--sizepx">Имя файла</span>
          <span className="info__info-field info__info-field--title info__info-field--type">Статус</span>
          <span className="info__info-field info__info-field--title info__info-field--sizebytes">Прогресс</span>
        </div>
        {uploadListMarkup}
        <UnfinishedUploads item={this.props.item} uploads={this.state.uploads} deleteHandler={this.handleDelete} need_refresh={this.state.unfinished_need_refresh}/>
      </div>
    </div>
    );
  }
}
