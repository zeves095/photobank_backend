import React from 'react';
// import $ from 'jquery';
import { hex_md5 } from '../vendor/md5';
import { ExistingResources } from './ExistingResources';

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
      "item":{},
      "open":this.props.open_by_default,
      "ready":false,
      "uploads":[],
      "upload_list":[],
      "existing": [],
      "existingList": [],
      "unfinished":[],
      "main": null,
      "additional": [],
      "view_type": this.props.default_view,
      "finished_presets": [],
      "busy" : false,
      "loading_existing" : false,
      "loading_uploads" : false,
      "existing_list_start": 0,
      "existing_list_limit": 20,
      "existing_list_end": 20,
      "existing_list_current_page": 1,
      "existing_list_total_pages": 0,
      "unfinished_hidden":false,
    };
    this.containerViewClasses = ['item-view__inner--icons-lg ','item-view__inner--icons-sm ','item-view__inner--detailed '];
    this.fileViewClasses = ['file--icons-lg ','file--icons-sm ','file--detailed '];
    this.timers = [];
    this.finishedPresetRequestStack = [];
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
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.getHash = this.getHash.bind(this);
    this.resolveResumedUploads = this.resolveResumedUploads.bind(this);
    this.fetchExisting = this.fetchExisting.bind(this);
    this.fetchUnfinished = this.fetchUnfinished.bind(this);
    this.handleResourceUpdate = this.handleResourceUpdate.bind(this);
    this.removeUpload = this.removeUpload.bind(this);
    this.cleanUpDone = this.cleanUpDone.bind(this);
    this.handleViewChoice = this.handleViewChoice.bind(this);
    this.assignResumableEvents = this.assignResumableEvents.bind(this);
    this.clearAllUnfinished = this.clearAllUnfinished.bind(this);
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
      for (var i = 0; i < this.resumable.files.length; i++) {
        let file = this.resumable.files[i];
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

  fetchExisting(){
    if(this.props.render_existing){
      $.getJSON(window.config.existing_uploads_url+this.state.item_id, (data)=>{
        this.setState({
          "existing": data,
        });
      });
    }
  }

  fetchUnfinished(){
      this.setState({"loading_uploads" : true});
      let unfinished = [];
      $.getJSON(window.config.unfinished_uploads_url, (data)=>{
        for (var i = 0; i < data.length; i++) {
          let unfinishedUpload = data[i];
          if(unfinishedUpload[[0]]==this.state.item_id){
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
        this.state.resumable.files.splice(file.resumablekey, 1);
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
      let self = this.resumable.files.indexOf(file);
      for(var existingUpload in this.state.resumable.files){
        if(this.state.resumable.files[existingUpload].uniqueIdentifier == identifier && existingUpload != self){
          allowed = false;
          this.state.resumable.files.splice(self, 1);
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
      'itemid': this.state.item_id
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
    for(var i = 0; i<this.resumable.files.length; i++){
      if(this.resumable.files[i].uniqueIdentifier == filehash){
        this.resumable.files.splice(i,1);
      }
    }
    this.fetchUnfinished();
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
    let sel = form.find("select");
    let chk = form.find("input[type='checkbox']");
    let txt = form.find("input[type='text']");
    if(sel.length){data[sel.prop('name')]=sel.val()}
    if(chk.length){data[chk.prop('name')]=chk.prop("checked")}
    if(txt.length){data[txt.prop('name')]=txt.val()}
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
    this.setState({"view_type": view});
    this.props.viewChoiceHandler(view);
  }

  componentWillMount(){
    $.ajax({url: window.config['item_url']+this.props.item_id, method: 'GET'}).done((data)=>{
      this.setState({
        "item":data
      });
      if(typeof this.props.identityHandler != "undefined"){this.props.identityHandler(data.id,data.name,data.itemCode)};
    });
  }

  componentDidMount(){
    this.resumable.assignBrowse(document.getElementById("browse" + this.props.item_id+this.props.section_type));
    this.resumable.assignDrop(document.getElementById("drop_target" + this.props.item_id));
    var dragTimer;
    $(".item-view").on('dragover', (e)=>{
      var dt = e.originalEvent.dataTransfer;
      if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('Files'))) {
        $("#drop_target" + this.props.item_id).addClass('file-list__drop-target--active');
        window.clearTimeout(dragTimer);
      }
    });
    $("#drop_target" + this.props.item_id).on('dragleave', (e)=>{
      dragTimer = window.setTimeout(()=>{
        $("#drop_target" + this.props.item_id).removeClass('file-list__drop-target--active');
      }, 100);
    });
    this.assignResumableEvents();
    this.fetchUnfinished();
    this.fetchExisting();
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props != prevProps){
      this.setState({
        "view_type": this.props.default_view,
        "open": this.props.open_by_default
      });
    }
    if(prevState.existing_list_start != this.state.existing_list_start || prevState.existing_list_limit != this.state.existing_list_limit){
      this.fetchPresets();
    }
  }

  assignResumableEvents(){
    this.resumable.on('fileAdded', (file, event)=>{
      this.setState({"loading_uploads" : true});
      file.itemId = this.state.item_id;
      file.itemCode = this.state.item.itemCode;
      file.ready = false;
      this.getHash(file);
      if(window.resumableContainer[this.state.item_id] == undefined){
        window.resumableContainer[this.props.item_id] = this.resumable;
      }
      $("#drop_target" + this.props.item_id).removeClass('file-list__drop-target--active');
    });
    this.resumable.on('fileSuccess', (file,event)=>{
      this.fetchExisting();
      this.buildList();
    });
    this.resumable.on('fileProgress', (file,event)=>{
      //$("#progress_bar"+file.uniqueIdentifier+">span").css('width', file.progress()*100+"%");
      let resumableKey = this.state.resumable.files.indexOf(file);
      let upload = this.state.uploads.filter((upload)=>{return upload.resumablekey == resumableKey});
      if(upload.length>0){
        upload[0].progress = Math.round(file.progress() * 100);
      }
      this.setState({
        "uploads":this.state.uploads,
      });
    });
    this.resumable.on('uploadStart', (file,event)=>{
      this.state.busy = true;
      this.buildList();
    });
    this.resumable.on('complete', ()=>{
      this.setState({"loading_uploads" : true});
      this.state.busy = false;
      this.buildList();
    });
  }

  componentWillUnmount(){
    this.state.resumable.events = [];
    $(document).off(".pagination");
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

  render() {
    let uploadList = this.state.uploads;
    let active = uploadList.filter((item)=>{return item.status != 'unfinished'});
    let unfinished = uploadList.filter((item)=>{return item.status == 'unfinished' || item.status == 'resolved'});
    let uploadListMarkup = [active.length>0?<div key={this.state.item_id + "uploads"} className="item-view__subheader-wrapper"><h4 className="item-view__subheader">Загрузки</h4></div>:""];
    uploadListMarkup = uploadListMarkup.concat(this.drawSegment(active, 1));
    uploadListMarkup.push(unfinished.length>0?<div key={this.state.item_id + "unfinished"} className="item-view__subheader-wrapper">
      <h4 className="item-view__subheader">Незаконченные</h4>
      <div className="button-block">
        <button onClick={this.clearAllUnfinished} className="button-block__btn button-block__btn--clear"><i className="fas fa-trash-alt"></i>Очистить</button>
      <button onClick={this.hideUnfinished} className="button-block__btn button-block__btn--clear">{this.state.unfinished_hidden?<i className='fas fa-eye'></i>:<i className='fas fa-eye-slash'></i>}{this.state.unfinished_hidden?"Показать":"Скрыть"}</button>
      </div>
    </div>:"");
    uploadListMarkup = uploadListMarkup.concat(this.drawSegment(unfinished, 2));

    return (
      <div className = {"item-view"} >
      <div className="file-list__drop-target" id={"drop_target" + this.props.item_id}></div>
      {
        !this.props.render_existing
          ? <button type="button" className="item-view__collapse-button" onClick={() => {
                this.setState({
                  "open": !this.state.open
                })
              }}>{
                this.state.open
                  ? "Скрыть"
                  : "Показать"
              }</button>
            : null
      } {
        typeof this.state.item != "undefined"
          ? <div className="item-view__item-title">Товар #{this.state.item.itemCode}
              "{this.state.item.name}"</div>
          : null
      }<div className={"item-view__inner " + (
          this.state.open
          ? "item-view__inner--open "
          : "item-view__inner--closed ") + this.containerViewClasses[this.state.view_type]}>
          <button type="button" data-view="0" className={this.state.view_type==0?"item-view__view-button--active item-view__view-button":"item-view__view-button"} onClick={this.handleViewChoice}>
            <i className="fas fa-th-large"></i>
          </button>
          <button type="button" data-view="1" className={this.state.view_type==1?"item-view__view-button--active item-view__view-button":"item-view__view-button"} onClick={this.handleViewChoice}>
            <i className="fas fa-th"></i>
          </button>
          <button type="button" data-view="2" className={this.state.view_type==2?"item-view__view-button--active item-view__view-button":"item-view__view-button"} onClick={this.handleViewChoice}>
            <i className="fas fa-list-ul"></i>
          </button>
          {this.props.render_existing?<ExistingResources resources={this.state.existing} />:null}
        <h4 className="item-view__subheader">Загрузки</h4>
      <div className={(this.state.loading_uploads?"loading ":"") + "item-view__file-list file-list"} id={"file_list" + this.props.item_id}>
          <div className="file-list__button-block">
            <button type="button" id={"browse" + this.props.item_id + this.props.section_type}><i className="fas fa-folder-open"></i>Выбрать файлы</button>
          <button type="button" disabled={!this.state.ready} onClick={this.handleSubmit} id={"submit" + this.props.item_id}><i className="fas fa-file-upload"></i>Загрузить выбранное</button>

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
      </div> < /div>
    );
  }
}
