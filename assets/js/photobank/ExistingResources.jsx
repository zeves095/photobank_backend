import React from 'react';
// import $ from 'jquery';
import { hex_md5 } from '../vendor/md5';

export class ExistingResources extends React.Component{
  constructor(props) {
    super(props);
    this.state={
      "existing": [],
      "view_type": this.props.default_view,
      "finished_presets": [],
      "busy" : false,
      "loading_existing" : true,
      "list_start": 0,
      "list_limit": 20,
      "list_end": 20,
      "list_current_page": 1,
      "list_total_pages": 0,
    };
    this.containerViewClasses = ['item-view__inner--icons-lg ','item-view__inner--icons-sm ','item-view__inner--detailed '];
    this.fileViewClasses = ['file--icons-lg ','file--icons-sm ','file--detailed '];
    this.finishedPresetRequestStack = [];
    this.paginationControls = "";
    this.preset_headers = [];

    this.presetCache = [];

    this.handleResourceUpdate = this.handleResourceUpdate.bind(this);
    this.handlePagination = this.handlePagination.bind(this);
    this.getFinishedPresets = this.getFinishedPresets.bind(this);
    this.fetchExisting = this.fetchExisting.bind(this);
  }

  fetchExisting(){
    console.log("fetching ex");
    $.getJSON(window.config.existing_uploads_url+this.props.item_id, (data)=>{
      this.setState({
        "existing": data,
      });
    });
  }

  getFinishedPresets(resource, id){
    if(this.state.busy || typeof this.state.existing[id] == 'undefined'){return}
    for(var preset in window.config['presets']){
      if(this.state.finished_presets.filter((fin_preset)=>{return fin_preset.resource==resource.id&&window.config['presets'][preset]['id']==fin_preset.preset}).length == 0){
        console.log("preset not found");
        this.finishedPresetRequestStack.push(id+"-"+preset);
        let presetId = window.config['presets'][preset]['id'];
        let resId = resource.id;
        let url = window.config.resource_url + resource.id + "/" + presetId;
        // this.state.finished_presets = [];
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
  }

  fetchPresets(){
    if(this.state.existing.length==0){console.log("nothing to fetch");this.setState({"loading_existing":false});return;}
    for(var i = this.state.list_start; i<this.state.list_end; i++){
      this.getFinishedPresets(this.state.existing[i], i);
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

  handlePagination(e){
    let changed = false;
    let start = this.state.list_start;
    let limit = this.state.list_limit;
    let target = e.target;
    if(e.type == "click"){
      if(target.tagName != "BUTTON"){
        target = target.parentNode;
      }
      if(target.dataset.direction == 0){
        if((start-=limit)<0){start=0};
        changed = true;
      }else{
        if(!(start+limit>this.state.existing.length)){start = parseInt(start+limit)};
        changed = true;
      }
    }else if(e.type = "keyUp"){
      switch(e.keyCode){
        case 13:
          if(target.name != "pagination_limit"){break;}
          limit = parseInt(target.value);
          start = start-(start%limit);
          if(limit!=this.state.list_limit){changed = true;}
          break;
        case 37:
          if((start-=limit)<0){start=0;}else{changed = true;};
          break;
        case 39:
          if(!(start+limit>this.state.existing.length)){start = parseInt(start+limit);changed = true;};
          break;
      }
    }
    if(changed){
      this.setState({
        "list_start": start,
        "list_limit": limit,
        "list_end": start+limit,
        "loading_existing": true,
        "list_current_page": Math.floor(this.state.list_start/this.state.list_limit)+1,
        "list_total_pages": Math.ceil(this.state.existing.length/this.state.list_limit)
      });
    }
  }

  componentDidMount(){
    let presets = [];
    for(var preset in window.config['presets']){
      presets.push(<span key={"preset"+preset} className="info__info-field info__info-field--title info__info-field--preset">{preset}</span>);
    }
    this.preset_headers = presets;
    $(document).on("keyup.pagination", (e)=>{
      this.handlePagination(e);
    });
    this.fetchExisting();
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props != prevProps){
      this.setState({
        "view_type": this.props.default_view,
      });
      if(this.props.need_refresh){
        this.fetchExisting();
      }
    }
    if(this.state.existing != prevState.existing){
      console.log("changed existing" + this.state.existing.length);
      this.setState({
        "loading_existing": true,
        "list_total_pages": Math.ceil(this.state.existing.length/this.state.list_limit),
        "list_current_page": Math.floor(this.state.list_start/this.state.list_limit)+1,
        "list_total_pages": Math.ceil(this.state.existing.length/this.state.list_limit)
      });
      this.fetchPresets();
    }
    if(prevState.list_start != this.state.list_start || prevState.list_limit != this.state.list_limit){
      console.log("changed pagination");
      this.fetchPresets();
      this.setState({
        "loading_existing": true,
        "list_current_page": Math.floor(this.state.list_start/this.state.list_limit)+1,
      });
    }
  }

  componentWillUnmount(){
    $(document).off(".pagination");
  }

  render() {
    let maxMain = window.config.max_main_resources;
    let maxAdd = window.config.max_additional_resources;
    let currMain = this.state.existing.filter((file)=>{return file.type == 1}).length;
    let currAdd = this.state.existing.filter((file)=>{return file.type == 2}).length;
    let mainStatus = currMain+"/"+maxMain;
    let addStatus = currAdd+"/"+maxAdd;
    let existingListMarkupData = [];
    for(var i = this.state.list_start; i<this.state.list_end; i++){
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
        <a className="file__file-name" href={window.config.resource_url+file.id+".jpg"} target="_blank"><div className="file__thumbnail" style={{"backgroundImage":"url("+presetLinks[0]+")"}}></div>{file.src_filename}</a>
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
          <button onClick={this.handlePagination} className="pagination-controls__btn pagination-controls__btn--bck-btn" data-direction="0" type="button" disabled={this.state.list_start==0}><i className="fas fa-arrow-left"></i></button>
        <p>{this.state.list_current_page}/{this.state.list_total_pages}</p>
      <button onClick={this.handlePagination} className="pagination-controls__btn pagination-controls__btn--bck-btn" data-direction="1" type="button" disabled={this.state.list_end>=this.state.existing.length}><i className="fas fa-arrow-right"></i></button>
    <p>На странице:</p><input onKeyUp={this.handlePagination} type="text" name="pagination_limit" defaultValue={this.state.list_limit}></input>
        </div>
    ):null;

    return (
      <div className="item-view__existing">
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
              {this.preset_headers}
            </div>
            {existingListMarkupData}
          </div>
        </div>
      </div>
    );
  }
}
