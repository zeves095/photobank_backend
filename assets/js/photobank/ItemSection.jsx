import React from 'react';
// import $ from 'jquery';
import { hex_md5 } from '../vendor/md5';
import { ExistingResources } from './ExistingResources';
import { Uploads } from './Uploads';
import {ItemService} from './services/ItemService';
import {NotificationService} from './services/NotificationService';

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
      "open":this.props.open_by_default,
      "ready":false,
      "view_type": this.props.default_view,
      "need_refresh": false
    };
    this.containerViewClasses = ['item-view__inner--icons-lg ','item-view__inner--icons-sm ','item-view__inner--detailed '];
    this.fileViewClasses = ['file--icons-lg ','file--icons-sm ','file--detailed '];

    this.handleViewChoice = this.handleViewChoice.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  handleViewChoice(e){
    let viewBtn = $(e.target).is("button")?$(e.target):$(e.target).parent();
    let view = viewBtn.data("view");
    this.setState({"view_type": view});
    this.props.viewChoiceHandler(view);
  }

  componentWillMount(){
    ItemService.getIdentity(this.props.item_id).then((data)=>{
      this.setState({
        "item":data
      });
      if(typeof this.props.identityHandler != "undefined"){this.props.identityHandler(data.id,data.name,data.itemCode)};
    }).catch((error)=>{
      NotificationService.throw(error);
    });
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props != prevProps){
      this.setState({
        "view_type": this.props.default_view,
        "open": this.props.open_by_default
      });
    }
    if(this.state.need_refresh){
      this.setState({
        "need_refresh":false,
      });
    }
  }

  handleUpload(){
    NotificationService.toast("up-done");
    this.setState({
      "need_refresh": true
    });
  }

  render() {

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
          <button type="button" data-view="0" title="Большие иконки" className={this.state.view_type==0?"item-view__view-button--active item-view__view-button":"item-view__view-button"} onClick={this.handleViewChoice}>
            <i className="fas fa-th-large"></i>
          </button>
          <button type="button" data-view="1" title="Маленькие иконки" className={this.state.view_type==1?"item-view__view-button--active item-view__view-button":"item-view__view-button"} onClick={this.handleViewChoice}>
            <i className="fas fa-th"></i>
          </button>
          <button type="button" data-view="2" title="Таблица" className={this.state.view_type==2?"item-view__view-button--active item-view__view-button":"item-view__view-button"} onClick={this.handleViewChoice}>
            <i className="fas fa-list-ul"></i>
          </button>
          {this.props.render_existing?<ExistingResources authorized={this.props.authorized} item_id={this.state.item_id} addDownloadHandler={this.props.addDownloadHandler} need_refresh={this.state.need_refresh} default_view={this.state.view_type} />:null}
        {((typeof this.state.item=='undefined')||!this.props.authorized)?null:<h4 className="item-view__subheader">Загрузки</h4>}
      {((typeof this.state.item=='undefined')||!this.props.authorized)?null:<Uploads item={this.state.item} resumable={this.resumable} uploadCompleteHandler={this.handleUpload} />}
      </div> < /div>
    );
  }
}
