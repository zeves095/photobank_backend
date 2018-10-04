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
      "existing_list_total_pages": 0
    };
    this.containerViewClasses = ['item-view__inner--icons-lg ','item-view__inner--icons-sm ','item-view__inner--detailed '];
    this.fileViewClasses = ['file--icons-lg ','file--icons-sm ','file--detailed '];
    this.timers = [];
    this.finishedPresetRequestStack = [];
    this.fileHashStack = [];
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
    this.handlePagination = this.handlePagination.bind(this);
    this.getFinishedPresets = this.getFinishedPresets.bind(this);
    this.assignResumableEvents = this.assignResumableEvents.bind(this);
    this.fetchPresets = this.fetchPresets.bind(this);
  }

  buildList() {
    console.log("bl");
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

  getFinishedPresets(resource, id){
    if(this.state.busy || !this.props.render_existing || typeof this.state.existing[id] == 'undefined'){return}
    for(var preset in window.config['presets']){
      this.finishedPresetRequestStack.push(id+"-"+preset);
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
        }
        this.finishedPresetRequestStack.splice(this.finishedPresetRequestStack.indexOf(id+"-"+preset), 1);
        if(this.finishedPresetRequestStack.length == 0){
          this.setState({"loading_existing" : false})
        }
      });
    }
  }

  fetchExisting(){
    if(this.props.render_existing){
      this.setState({"loading_existing" : true});
      $.getJSON(window.config.existing_uploads_url+this.state.item_id, (data)=>{
        this.state.existing = data;
        this.setState({
          "existing_list_total_pages": Math.ceil(this.state.existing.length/this.state.existing_list_limit),
        });
        this.fetchPresets();
      });
    }
  }

  fetchPresets(){
    if(this.state.existing.length==0){this.setState({"loading_existing" : false}); return;}
    for(var i = this.state.existing_list_start; i<this.state.existing_list_end; i++){
      this.getFinishedPresets(this.state.existing[i], i);
    }
  }

  fetchUnfinished(){
      this.setState({"loading_uploads" : true});
      let unfinished = [];
      $.getJSON(window.config.unfinished_uploads_url, (data)=>{
        for (var i = 0; i < data.length; i++) {
          let unfinishedUpload = data[i];
          if(unfinishedUpload[[0]]==this.state.item_id){
            unfinished.push({'filename': unfinishedUpload[1], 'filehash': unfinishedUpload[2], 'class': "unfinished", "ready": true, "completed":false});
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

  handlePagination(e){
    e.preventDefault();
    let changed = false;
    let target = e.target;
    if(target.tagName != "BUTTON" && target.tagName != "INPUT"){
      target = target.parentNode;
    }
    let start = this.state.existing_list_start;
    let limit = this.state.existing_list_limit;
    if(e.type == "click"){
      if(target.dataset.direction == 0){
        if((start-=limit)<0){start=0};
        changed = true;
      }else{
        if(!(start+limit>this.state.existing.length)){start = parseInt(start+limit)};
        changed = true;
      }
    }else if(e.type = "keyUp"){
      if(e.key=='Enter'){
        limit = parseInt(target.value);
        start = start-(start%limit);
        changed = true;
      }
    }
    console.log(start+" "+limit+" "+(start+limit));
    if(changed){
      this.setState({
        "existing_list_start": start,
        "existing_list_limit": limit,
        "existing_list_end": start+limit,
        "loading_existing": true,
        "existing_list_current_page": Math.floor(start/limit)+1,
        "existing_list_total_pages": Math.ceil(this.state.existing.length/limit)
      });
    }
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
    let presets = [];
    for(var preset in window.config['presets']){
      presets.push(<span key={this.state.item_id + preset} className="info__info-field info__info-field--title info__info-field--preset">{preset}</span>);
    }
    this.setState({
      "preset_headers":presets
    });

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
  }

  drawSegment(list, listid){
    return list.map((upload)=>
      <div key={upload.filename+upload.filehash+listid} className={"file-list__file-item file-item " + "file-item"+upload.class +" "+ (upload.ready? "": "file-item--processing ")+ this.fileViewClasses[this.state.view_type]}>
        <span className="file-item__file-name">{upload.filename}<i data-item={upload.filehash} onClick={this.handleDelete} className="fas fa-trash-alt file-item__delete-upload"></i></span>
      <span className="file-item__upload-status">{this.uploadStatus[upload.status]}</span>
      <span className="progress-bar" id={"progress_bar"+upload.filehash}>
        <div className="progress-bar__percentage">{upload.progress + "%"}</div>
      <div className="progress-bar__bar" style={{"width":upload.progress+"%"}}></div>
        </span>
      </div>);
  }

  render() {

    let maxMain = window.config.max_main_resources;
    let maxAdd = window.config.max_additional_resources;
    let currMain = this.state.existing.filter((file)=>{return file.type == 1}).length;
    let currAdd = this.state.existing.filter((file)=>{return file.type == 2}).length;
    let mainStatus = currMain+"/"+maxMain;
    let addStatus = currAdd+"/"+maxAdd;
    let existingListMarkupData = [];
    for(var i = this.state.existing_list_start; i<this.state.existing_list_end; i++){
      if(typeof this.state.existing[i]=='undefined'){break};
      let file = this.state.existing[i];
      let presets = [];
      let presetLinks = [];
      for(var preset in window.config['presets']){
        let presetId = window.config['presets'][preset]['id'];
        let finishedPreset = this.state.finished_presets.filter((preset)=>{return (preset.resource==file.id && preset.preset == presetId)})[0];
        let finished = typeof finishedPreset != "undefined";
        presetLinks.push(window.config['resource_url']+ (finished?finishedPreset.id:"0")+".jpg");
        presets.push(
          <span key={file.id+"-"+presetId} className={"info__info-field info__info-field--preset "+finished?"info__info-field--preset-done":"info__info-field--preset-not-done"}>
            {finished
              ?<a href={window.config['resource_url']+finishedPreset.id+".jpg"} target="_blank">{window.config['presets'][preset]['width']+'/'+window.config['presets'][preset]['height']}</a>
              :"Не обработан"
            }
          </span>);
      }
      existingListMarkupData.push(

        <div className={"existing-files__file file "+this.fileViewClasses[this.state.view_type]} key={file.src_filename+file.filename}>
          <div className="file__thumbnail" style={{"backgroundImage":"url("+presetLinks[0]+")"}}></div>
        <a href={window.config.resource_url+file.id+".jpg"}>{file.src_filename}</a>
      {/* <div className="file__edit-fields edit-fields"> */}
          <div className="edit-input">
            <select onChange={this.handleResourceUpdate} name="type" defaultValue={file.type}>
              <option disabled={currMain>=maxMain?true:false} value="1">Основноe{mainStatus}</option>
            <option disabled={currAdd>=maxAdd?true:false} value="2">Дополнительное{addStatus}</option>
              <option value="3">Исходник</option>
            </select>
          </div>
          {/* <span className="edit-input"><input onClick={this.handleResourceUpdate} type="checkbox" defaultChecked={file.isDeleted} name="deleted"/><label htmlFor="deleted">Удален</label></span> */}
          <input type="hidden" name="id" value={file.id}/>
      {/* </div> */}
        {/* <div className="file__info info"> */}
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
        {/* </div> */}
      </div>)
    }

    let paginationControls = this.state.existing.length!=0?(
      <div className="item-view__pagination-controls pagination-controls">
          <button onClick={this.handlePagination} className="pagination-controls__btn pagination-controls__btn--bck-btn" data-direction="0" type="button" disabled={this.state.existing_list_start==0}><i className="fas fa-arrow-left"></i></button>
        <input onKeyUp={this.handlePagination} type="text" defaultValue={this.state.existing_list_limit}></input>
      <button onClick={this.handlePagination} className="pagination-controls__btn pagination-controls__btn--bck-btn" data-direction="1" type="button" disabled={this.state.existing_list_end>=this.state.existing.length}><i className="fas fa-arrow-right"></i></button>
    <p>{this.state.existing_list_current_page}/{this.state.existing_list_total_pages}</p>
        </div>
    ):null;

    let uploadList = this.state.uploads;
    let active = uploadList.filter((item)=>{return item.status != 'unfinished'});
    let unfinished = uploadList.filter((item)=>{return item.status == 'unfinished' || item.status == 'resolved'});
    let uploadListMarkup = [active.length>0?<div key={this.state.item_id + "uploads"} className="item-view__subheader-wrapper"><h4 className="item-view__subheader">Загрузки</h4></div>:""];
    uploadListMarkup = uploadListMarkup.concat(this.drawSegment(active, 1));
    uploadListMarkup.push(unfinished.length>0?<div key={this.state.item_id + "unfinished"} className="item-view__subheader-wrapper"><h4 className="item-view__subheader">Незаконченные</h4></div>:"");
    uploadListMarkup = uploadListMarkup.concat(this.drawSegment(unfinished, 2));

    return (
      <div className = {
        "item-view"
      } >
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
        {
          this.props.render_existing
            ? <div className="item-view__existing">
                <button type="button" data-view="0" className={this.state.view_type==0?"item-view__view-button--active item-view__view-button":"item-view__view-button"} onClick={this.handleViewChoice}>
                  <i className="fas fa-th-large"></i>
                </button>
                <button type="button" data-view="1" className={this.state.view_type==1?"item-view__view-button--active item-view__view-button":"item-view__view-button"} onClick={this.handleViewChoice}>
                  <i className="fas fa-th"></i>
                </button>
                <button type="button" data-view="2" className={this.state.view_type==2?"item-view__view-button--active item-view__view-button":"item-view__view-button"} onClick={this.handleViewChoice}>
                  <i className="fas fa-list-ul"></i>
                </button>
                <h4 className="item-view__subheader">Файлы товара</h4>
              {paginationControls}
              {this.state.existing.length==0?"Нет загруженных файлов":null}
              <div className={(this.state.loading_existing?"loading ":"") + "item-resources"}>
                  <div className="item-view__file-list existing-files">
                    <div className="item-view__table-header">
                      <span className="info__info-field info__info-field--title info__info-field--sizepx">Имя файла</span>
                    <span className="info__info-field info__info-field--title info__info-field--type">Тип ресурса</span>
                  <span className="info__info-field info__info-field--title info__info-field--sizebytes">Размер изображения</span>
                <span className="info__info-field info__info-field--title info__info-field--sizemb">Размер файла</span>
              <span className="info__info-field info__info-field--title info__info-field--uploaddate">Дата создания</span>
            <span className="info__info-field info__info-field--title info__info-field--username">Пользователь</span>
          <span className="info__info-field info__info-field--title info__info-field--comment">Комментарий</span>
                      {this.state.preset_headers}
                    </div>
                    {existingListMarkupData}
                  </div>
                </div>
              </div>
            : null
        }
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
