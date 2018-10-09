import React from 'react';
// import $ from 'jquery';
import { hex_md5 } from '../vendor/md5';

export class UnfinishedUploads extends React.Component{
  constructor(props) {
    super(props);
    this.state={
      "uploads":[],
      "unfinished":[],
      "busy" : false,
      "loading_uploads" : false,
      "unfinished_hidden":false
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
      "resolved": "Готов к повторной загрузке"
    };
    this.buildList = this.buildList.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.resolveResumedUploads = this.resolveResumedUploads.bind(this);
    this.fetchUnfinished = this.fetchUnfinished.bind(this);
    this.clearAllUnfinished = this.clearAllUnfinished.bind(this);
    this.hideUnfinished = this.hideUnfinished.bind(this);
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
      this.resolveResumedUploads();
      this.setState({
        "loading_uploads": false,
      });
  }

  fetchUnfinished(){
    console.log("fu");
      this.setState({"loading_uploads" : true});
      let unfinished = [];
      $.getJSON(window.config.unfinished_uploads_url, (data)=>{
        for (var i = 0; i < data.length; i++) {
          let unfinishedUpload = data[i];
          if(unfinishedUpload[[0]]==this.props.item.id){
            if(this.props.uploads.filter((upload)=>{return upload.filehash == unfinishedUpload[2]}).length == 0){
              unfinished.push({'filename': unfinishedUpload[1], 'filehash': unfinishedUpload[2], 'class': "unfinished", "ready": true, "completed":false});
            }
          }
        }
        this.setState({
          "unfinished" : unfinished,
        });
      });
  }

  resolveResumedUploads(){
    for (var i = 0; i < this.state.uploads.length; i++) {
        for (var j = 0; j < this.props.uploads.length; j++) {
          if(
            this.state.uploads[i].filename == this.props.uploads[j]["filename"] &&
            this.state.uploads[i].filehash == this.props.uploads[j]["filehash"]){
              this.state.uploads.splice(i,1);
            }
        }
    }
  }

  handleDelete(e){
    let filehash = $(e.target).data("item");
    this.props.deleteHandler(filehash);
  }

  componentDidMount(){
    this.fetchUnfinished();
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props != prevProps){
      this.setState({
        "view_type": this.props.default_view,
        "open": this.props.open_by_default
      });
      this.buildList();
    }
    if(this.state.unfinished != prevState.unfinished){
      this.buildList();
    }
    if(this.props.need_refresh){
      console.log("need refresh");
      this.fetchUnfinished();
    }
  }

  clearAllUnfinished(){
    for(var id in this.state.unfinished){
      this.removeUploadStack.push(this.state.unfinished[id].filehash);
    }
    for(var id in this.state.unfinished){
      let unfinished = this.state.unfinished[id];
      let upload = this.state.uploads.filter((upload)=>{return upload.filehash == unfinished.filehash})[0];
      this.props.deleteHandler(upload.filehash);
    }
  }

  hideUnfinished(){
    this.setState({
      "unfinished_hidden" : !this.state.unfinished_hidden
    });
  }

  render() {
    let unfinished_uploads = this.state.uploads.map((upload)=>
      <div key={upload.filename+upload.filehash+"unfinished"} className={"file-list__file-item file-item " + "file-item"+upload.class +" "+ (upload.ready? "": "file-item--processing ")+ this.fileViewClasses[this.state.view_type] + (this.state.unfinished_hidden?"file-item--hidden":"")}>
        <i data-item={upload.filehash} onClick={this.handleDelete} className="fas fa-trash-alt file-item__delete-upload"></i><br />
      <span className="file-item__file-name">{upload.filename}</span>
      <span className="file-item__upload-status">{this.uploadStatus[upload.status]}</span>
      <span className="progress-bar" id={"progress_bar"+upload.filehash}>
        <div className="progress-bar__percentage">{upload.progress + "%"}</div>
        </span>
      </div>);

    return (
      <div className="item-uploads__unfinished">
        <div key={this.props.item.id + "unfinished"} className="item-view__subheader-wrapper">
          <h4 className="item-view__subheader">Незаконченные</h4>
          <div className="button-block">
            <button onClick={this.clearAllUnfinished} className="button-block__btn button-block__btn--clear"><i className="fas fa-trash-alt"></i>Очистить</button>
          <button onClick={this.hideUnfinished} className="button-block__btn button-block__btn--clear">{this.state.unfinished_hidden?<i className='fas fa-eye'></i>:<i className='fas fa-eye-slash'></i>}{this.state.unfinished_hidden?"Показать":"Скрыть"}</button>
          </div>
        </div>
        {unfinished_uploads}
      </div>
    );
  }
}
