import React from 'react';
// import $ from 'jquery';
import { hex_md5 } from '../vendor/md5';

export class ItemSection extends React.Component{
  constructor(props) {
    super(props);
    if(typeof window.resumableContainer[this.props.item_id] == 'undefined'){
      this.resumable = new Resumable({target: '/api/upload/'});
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
      "unfinished":[]
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
  }

  buildList() {
    if (typeof this.updateListTimer != 'undefined') {
      clearTimeout(this.updateListTimer);
    }
    this.updateListTimer = setTimeout(function() {
      this.state.uploads = [];
      for(var i = 0; i < this.state.unfinished.length; i++){
        let className = "unfinished";
        this.state.uploads.push({"filename": this.state.unfinished[i].filename, "filehash": this.state.unfinished[i].filehash, "class": className, "ready": true});
      }
      for (var i = 0; i < this.resumable.files.length; i++) {
        let className = this.resumable.files[i].isComplete()?"completed":"pending";
        this.state.uploads.push({"filename": this.resumable.files[i].fileName, "filehash": this.resumable.files[i].uniqueIdentifier, "class": className, "ready": this.resumable.files[i].ready});
      }
      this.resolveResumedUploads();
      let uploadList = this.state.uploads;
      uploadList = uploadList.map((upload)=><span key={upload.filename+upload.filehash} className={upload.class + (upload.ready? "": " processing")}>F: {upload.filename}<span className="delete_upload" data-item={upload.filehash} onClick={this.handleDelete}>X</span><span className="progress_bar" id={"progress_bar"+upload.filehash}><span></span></span></span>);
      this.setState({
        "upload_list":uploadList
      });
    }.bind(this), 300);
  }

  fetchExisting(){
    $.getJSON("/catalogue/node/item/resources/"+this.state.item_id, (data)=>{
      data = data.map((file)=>
      <span key={file.src_filename+file.filename}><a href={"/catalogue/node/item/resource/"+file.id+".jpg"}>{file.src_filename}</a>
        <span className="edit_fields">
          <span className="edit_input"><input type="text" name="priority" defaultValue={file.priority} /><label htmlFor="priority">Приоритет 1С</label></span>
          <span className="edit_input"><input type="checkbox" defaultChecked={file.is1c} name="1c"/><label htmlFor="1c">Использовать в 1С</label></span>
          <span className="edit_input"><input type="checkbox" defaultChecked={file.isDeleted} name="deleted"/><label htmlFor="deleted">Удален</label></span>
          <span className="edit_input"><input type="checkbox" defaultChecked={file.isDefault} name="default"/><label htmlFor="default">По умолчанию</label></span>
          <input type="hidden" name="id" value={file.id}/>
          <button onClick={this.handleResourceUpdate}>Обновить</button>
        </span>
      </span>);
      this.setState({
        "existing": data
      });
    });
  }

  fetchUnfinished(){
    let unfinished = [];
    $.getJSON("/api/upload/unfinished/", (data)=>{
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
    console.log(this.state.uploads);
    for (var i = 0; i < this.state.uploads.length; i++) {
      for (var j = 0; j < this.state.uploads.length; j++) {
        if (this.state.uploads[i]["class"] == "unfinished" && i != j && this.state.uploads[i]["filename"] == this.state.uploads[j]["filename"] && this.state.uploads[i]["filehash"] == this.state.uploads[j]["filehash"]) {
          this.state.uploads.splice(i, 1);
          this.resolveResumedUploads();
        }
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
    $.ajax({url: '/api/upload/commit', method: 'POST', data: obj});
  }

  removeUpload(upload){
    let obj = {
      'filehash': upload.filehash,
      'filename': upload.filename,
      'itemid': this.state.item_id
    }
    $.ajax({url: '/api/upload/remove', method: 'POST', data: obj});
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
    form.find(".edit_input").each(function(){
      let chk = $(this).find("input[type='checkbox']");
      let txt = $(this).find("input[type='text']");
      if(chk.length){data[chk.prop('name')]=chk.prop("checked")}
      if(txt.length){data[txt.prop('name')]=txt.val()}
    });
    let dataJson = JSON.stringify(data);
    $.ajax({
      url: '/catalogue/node/item/resource/'+data.id,
      method: 'PATCH',
      data: dataJson,
      contentType: "application/json; charset=utf-8",
      dataType: "json"
    });
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
    this.fetchUnfinished();
    this.fetchExisting();
    this.buildList();
  }

  render() {
    return (
      <div className="item_view">
        <button type="button" onClick={()=>{this.setState({"open":!this.state.open})}}>{this.state.open?"Скрыть":"Показать"}</button>
        <div className={this.state.open?"item_view_inner open":"item_view_inner"}>
        <h4>Файлы товара</h4>
        <div className="file_list">{this.state.existing}</div>
        <h4>Загрузки</h4>
      <div className="file_list" id={"file_list" + this.props.item_id}>{this.state.upload_list}</div>
        <div className="drop_target" id={"drop_target" + this.props.item_id}></div>
        <div className="button_block">
          <button type="button" id={"browse" + this.props.item_id}>Выбрать</button>
          <button type="button" onClick={this.handleSubmit} id={"submit" + this.props.item_id}>Загрузить</button>
        </div>
        </div>
      </div>
    );
  }
}
