import React from 'react';
import { ItemSection } from './ItemSection';
import { ItemList } from './ItemList';
import { ListFilter } from './ListFilter';
import { UploadPool } from './UploadPool';
import { DownloadPool } from './DownloadPool';
import { Draggable } from './Draggable';
import {LocalStorageService} from './services/LocalStorageService';
import {NotificationService} from '../services/NotificationService';

export class NodeViewer extends React.Component{
  constructor(props) {
    super(props);
    this.state ={
      "catalogue_data": this.props.catalogue_data,
      "node": this.props.node,
      "prev_node_id": 1,
      "node_items": [],
      "node_items_filtered": [],
      "filter_query": "",
      "current_item": null,
      "item_section": "Не выбран товар",
      "view_pool": 0,
      "view_type": this.props.default_view,
      "product_crumbs": this.props.crumb_string,
      "loading": false,
      "downloads": [],
      "query": this.props.query
    }
    this.handleItemChoice = this.handleItemChoice.bind(this);
    this.handlePoolClick = this.handlePoolClick.bind(this);
    this.handleViewChoice = this.handleViewChoice.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
    this.handleRemoveDownload= this.handleRemoveDownload.bind(this);
    this.handleAddToDownloads = this.handleAddToDownloads.bind(this);
  }

  handlePoolClick(e){
    let poolVal = '';
    poolVal = this.state.view_pool == e.target.dataset["pool"]?0:e.target.dataset["pool"];
    this.setState({
      "view_pool" : poolVal
    })
  }

  handleViewChoice(view){
    LocalStorageService.set("list_view_type", view);
    this.setState({
      "view_type":view
    });
  }

  handleItemChoice(item){
    this.setState({
      'view_pool':0,
      'current_item': item,
      'product_crumbs': this.props.crumb_string
    });
  }

  handleAddToDownloads(id){
    if(this.state.downloads.indexOf(id)==-1){
      let downloads = this.state.downloads.slice(0);
      downloads.push(id);
      LocalStorageService.addTo("pending_downloads", id);
      this.setState({
        "downloads": downloads
      });
    }
  }

  handleRemoveDownload(id){
    let downloads = this.state.downloads.slice(0);
    let index = downloads.indexOf(id);
    LocalStorageService.removeFrom("pending_downloads", id);
    if(index!=-1){
      downloads.splice(index,1);
      this.setState({
        "downloads": downloads
      });
    }
  }

  handleDownload(){
    for(var dl in this.state.downloads){
      this.handleRemoveDownload(this.state.downloads[dl]);
    }
    NotificationService.toast("dl-done");
    this.setState({
      "downloads": []
    })
  }

  componentDidMount(){
    let downloads = LocalStorageService.getList("pending_downloads");
    this.setState({
      "query":this.props.query,
      "downloads":downloads
    });
  }

  componentDidUpdate(prevProps,prevState){
    if(this.state.node == prevState.node && this.props.node != this.state.node){
      this.setState({
        "node":this.props.node
      });
    }
    if(this.props.query != prevProps.query){
      this.setState({
        "query":this.props.query
      });
    }
  }

  render() {
    let nodeItemList = this.state.node_items_filtered.map((item)=>
      <div className={"list-item"+((this.state.current_item!=null&&item.id==this.state.current_item.id)?" list-item--active":"")} key={item.id} data-item={item.id} onClick={this.itemClickHandler}>
        <h4 data-item={item.id} onClick={this.itemClickHandler}><i className="fas fa-circle" style={{"fontSize":"7pt", "margin": "3px"}}></i>Товар №{item.itemCode} "{item.name}"</h4>
      </div>
    );

    let itemSection = this.state.current_item!=null?(<ItemSection authorized={this.props.authorized} viewChoiceHandler={this.handleViewChoice} addDownloadHandler={this.handleAddToDownloads} render_existing={true} item_id={this.state.current_item.id} open_by_default={true} section_type="nv" crumb_string={this.props.crumb_string} default_view={this.state.view_type} />):"Не выбран товар";

    let section = "";
    switch(parseInt(this.state.view_pool)){
      case 0:
        section = itemSection;
        break;
      case 1:
        section = <DownloadPool resources={this.state.downloads} removeDownloadHandler={this.handleRemoveDownload} addDownloadHandler={this.handleDownload} />
        break;
      case 2:
        section = <UploadPool viewChoiceHandler={this.handleViewChoice} default_view={this.state.view_type} />
        break;
      default:
        section = itemSection;
        break;
    }
    return (

      <div className="node-viewer">
        <div className="node-viewer__view-inner view-inner">
          <ItemList node={this.state.node} query={this.state.query} itemChoiceHandler={this.handleItemChoice} item={this.props.item} />
          {$(".view-inner__item-section").length>0?<Draggable box1=".view-inner__item-list" box2=".view-inner__item-section" id="2" />:null}
          <div className="view-inner__item-section" key={this.state.current_item!=null?this.state.current_item.id:""}>
            <h2 className="node-viewer__component-title component-title">Файлы <i className="crumb-string">{this.state.product_crumbs}</i></h2>
          <div className="view-switcher-button-block">
            <button type="button" className="item-section-switcher" data-pool="1" onClick={this.handlePoolClick}>{this.state.view_pool==1?"К последнему товару":"Выгрузка"}</button>
          {this.props.authorized?<button type="button" className="item-section-switcher" data-pool="2" onClick={this.handlePoolClick}>{this.state.view_pool==2?"К последнему товару":"Загрузка"}</button>:null}
          </div>
          <div className="view-inner__container">
            {section}
          </div>
          </div>
        </div>
      </div>
    );
  }
}
