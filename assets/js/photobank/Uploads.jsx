import React from 'react';
// import $ from 'jquery';
import { hex_md5 } from '../vendor/md5';

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
    this.resolveResumedUploads = this.resolveResumedUploads.bind(this);
    this.fetchUnfinished = this.fetchUnfinished.bind(this);
    this.removeUpload = this.removeUpload.bind(this);
    this.cleanUpDone = this.cleanUpDone.bind(this);
    this.clearAllUnfinished = this.clearAllUnfinished.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.hideUnfinished = this.hideUnfinished.bind(this);
  }

  buildList() {
      this.state.uploads = [];
      for(var i = 0; i < this.state.unfinished.length; i++){
        let file = this.state.unfinished[i];
        let className = "--unfinished";
        let status = "unfinished";
        this.state.uploads.push({"filename": file.filename, "filehash": file.filehash, "class": className, "status":status, "ready": true, "uploading": false, "resumablekey": null, "progress": 0});
      }
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
      this.resolveResumedUploads();
      this.cleanUpDone();
      this.setState({
        "loading_uploads": false,
      });
  }

  fetchUnfinished(){
      this.setState({"loading_uploads" : true});
      let unfinished = [];
      $.getJSON(window.config.unfinished_uploads_url, (data)=>{
        for (var i = 0; i < data.length; i++) {
          let unfinishedUpload = data[i];
          if(unfinishedUpload[[0]]==this.props.item.id){
            if(this.state.uploads.filter((upload)=>{return upload.filehash == unfinishedUpload[2]}).length == 0){
              unfinished.push({'filename': unfinishedUpload[1], 'filehash': unfinishedUpload[2], 'class': "unfinished", "ready": true, "completed":false});
            }
          }
        }
        this.state.unfinished = unfinished;
        this.buildList();
      });
  }

  resolveResumedUploads(){
    this.state.uploads = this.state.uploads.filter(
      (upload)=>{
        for (var i = 0; i < this.state.uploads.length; i++) {
          if(
            this.state.uploads[i]["status"] != "completed" &&
            upload.status != this.state.uploads[i]["status"] &&
            upload.status == "unfinished" &&
            upload.filename == this.state.uploads[i]["filename"] &&
            upload.filehash == this.state.uploads[i]["filehash"]){
              this.state.unfinished = this.state.unfinished.map((upload)=>{if(this.state.uploads[i].filehash != upload.filehash){upload.completed = true;} return upload});
              this.state.uploads[i]["status"] = "resolved";
              return false;
            }
        }
        return true;
      }
    );
  }

  cleanUpDone(){
    let cleanedUp = false;
    for (var i = 0; i < this.state.uploads.length; i++) {
      let file = this.state.uploads[i];
      if(file.status=="completed"){
        this.state.uploads.splice(i,1);
        this.props.resumable.files.splice(file.resumablekey, 1);
        this.removeUpload(file);
        i--;
        cleanedUp = true;
      }
    }
    if(cleanedUp){this.fetchUnfinished()};
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

  removeUpload(upload){
    let obj = {
      'filehash': upload.filehash,
      'filename': upload.filename,
      'itemid': this.props.item.id
    }
    $.ajax({url: window.config.remove_upload_url, method: 'POST', data: obj}).done(()=>{
      this.removeUploadStack.splice(this.removeUploadStack.indexOf(upload.filehash));
      if(this.removeUploadStack.length == 0){
        this.fetchUnfinished();
      }
    });
  }

  handleDelete(e){
    let filehash = $(e.target).data("item");
    this.removeUpload(this.state.uploads.filter((upload)=>{return upload.filehash == filehash})[0]);
    for(var i = 0; i<this.props.resumable.files.length; i++){
      if(this.props.resumable.files[i].uniqueIdentifier == filehash){
        this.props.resumable.files.splice(i,1);
      }
    }
    this.fetchUnfinished();
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
      console.log("file added");
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
      console.log("upload start");
      this.state.busy = true;
      this.buildList();
    });
    this.props.resumable.on('complete', ()=>{
      console.log("upload complete");
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
    this.fetchUnfinished();
    this.assignResumableEvents();
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props != prevProps){
      console.log("uploads update");
      this.setState({
        "view_type": this.props.default_view,
        "open": this.props.open_by_default
      });
      this.buildList();
    }
    if(this.state.unfinished_hidden != prevState.unfinished_hidden){
      this.buildList();
    }
  }

  drawSegment(list, listid){
    let hide = listid==2&&this.state.unfinished_hidden?true:false;
    return list.map((upload)=>
      <div key={upload.filename+upload.filehash+listid} className={"file-list__file-item file-item " + "file-item"+upload.class +" "+ (upload.ready? "": "file-item--processing ")+ this.fileViewClasses[this.state.view_type] + (hide?"file-item--hidden":"")}>
        <i data-item={upload.filehash} onClick={this.handleDelete} className="fas fa-trash-alt file-item__delete-upload"></i><br />
      <span className="file-item__file-name">{upload.filename}</span>
      <span className="file-item__upload-status">{this.uploadStatus[upload.status]}</span>
      <span className="progress-bar" id={"progress_bar"+upload.filehash}>
        <div className="progress-bar__percentage">{upload.progress + "%"}</div>
      <div className="progress-bar__bar" style={{"width":upload.progress+"%"}}></div>
        </span>
      </div>);
  }

  clearAllUnfinished(){
    for(var id in this.state.unfinished){
      this.removeUploadStack.push(this.state.unfinished[id].filehash);
    }
    for(var id in this.state.unfinished){
      let unfinished = this.state.unfinished[id];
      let upload = this.state.uploads.filter((upload)=>{return upload.filehash == unfinished.filehash})[0];
      this.removeUpload(upload);
    }
  }

  hideUnfinished(){
    this.setState({
      "unfinished_hidden" : !this.state.unfinished_hidden
    });
  }

  componentWillUnmount(){
    this.props.resumable.events = [];
    $(document).off(".pagination");
  }

  render() {

    let uploadList = this.state.uploads;
    let active = uploadList.filter((item)=>{return item.status != 'unfinished'});
    let unfinished = uploadList.filter((item)=>{return item.status == 'unfinished' || item.status == 'resolved'});
    let uploadListMarkup = [active.length>0?<div key={this.props.item.id + "uploads"} className="item-view__subheader-wrapper"><h4 className="item-view__subheader">Загрузки</h4></div>:""];
    uploadListMarkup = uploadListMarkup.concat(this.drawSegment(active, 1));
    uploadListMarkup.push(unfinished.length>0?<div key={this.props.item.id + "unfinished"} className="item-view__subheader-wrapper">
      <h4 className="item-view__subheader">Незаконченные</h4>
      <div className="button-block">
        <button onClick={this.clearAllUnfinished} className="button-block__btn button-block__btn--clear"><i className="fas fa-trash-alt"></i>Очистить</button>
      <button onClick={this.hideUnfinished} className="button-block__btn button-block__btn--clear">{this.state.unfinished_hidden?<i className='fas fa-eye'></i>:<i className='fas fa-eye-slash'></i>}{this.state.unfinished_hidden?"Показать":"Скрыть"}</button>
      </div>
    </div>:"");
    uploadListMarkup = uploadListMarkup.concat(this.drawSegment(unfinished, 2));

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
      </div>
    </div>
    );
  }
}
