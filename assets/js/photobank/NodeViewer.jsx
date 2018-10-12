import React from 'react';
import { ItemSection } from './ItemSection';
import { ItemList } from './ItemList';
import { ListFilter } from './ListFilter';
import { UploadPool } from './UploadPool';
import { DownloadPool } from './DownloadPool';
import { Draggable } from './Draggable';

export class NodeViewer extends React.Component{
  constructor(props) {
    super(props);
    this.state ={
      "catalogue_data": this.props.catalogue_data,
      "node": this.props.node,
      "node_items": [],
      "node_items_filtered": [],
      "filter_query": "",
      "current_item": null,
      "item_section": "Не выбран товар",
      "view_pool": 0,
      "view_type": 1,
      "product_crumbs": this.props.crumb_string,
      "loading": false,
      "downloads": []
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
    this.setState({
      "view_type":view
    });
  }

  handleItemChoice(itemId){
    this.setState({
      'view_pool':0,
      'current_item': itemId,
      'product_crumbs': this.props.crumb_string
    });
  }

  handleAddToDownloads(id){
    console.warn("DLS")
    console.warn(this.state.downloads)
    if(this.state.downloads.indexOf(id)==-1){
      let downloads = this.state.downloads.slice(0);
      downloads.push(id);
      this.setState({
        "downloads": downloads
      });
    }
  }

  handleRemoveDownload(id){
    console.warn("DLS -R"+id);
    let downloads = this.state.downloads.slice(0);
    console.log(downloads.indexOf(id));
    let index = downloads.indexOf(id);
    if(index!=-1){
      console.log(index);
      downloads.splice(index,1);
      console.log(downloads);
      this.setState({
        "downloads": downloads
      });
    }
  }

  handleDownload(){
    this.setState({
      "downloads": []
    })
  }

  render() {

    let nodeItemList = this.state.node_items_filtered.map((item)=>
      <div className={"list-item"+((this.state.current_item!=null&&item.id==this.state.current_item.id)?" list-item--active":"")} key={item.id} data-item={item.id} onClick={this.itemClickHandler}>
        <h4 data-item={item.id} onClick={this.itemClickHandler}><i className="fas fa-circle" style={{"fontSize":"7pt", "margin": "3px"}}></i>Товар №{item.itemCode} "{item.name}"</h4>
      </div>
    );

    let itemSection = this.state.current_item!=null?(<ItemSection viewChoiceHandler={this.handleViewChoice} addDownloadHandler={this.handleAddToDownloads} render_existing={true} item_id={this.state.current_item.id} open_by_default={true} section_type="nv" crumb_string={this.props.crumb_string} default_view={this.state.view_type} />):"Не выбран товар";

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
          <ItemList node={this.props.node} query={this.props.query} itemChoiceHandler={this.handleItemChoice} />
          {$(".view-inner__item-section").length>0?<Draggable box1=".view-inner__item-list" box2=".view-inner__item-section" id="2" />:null}
          <div className="view-inner__item-section" key={this.state.current_item!=null?this.state.current_item.id:""}>
            <h2 className="node-viewer__component-title component-title">Файлы <i className="crumb-string">{this.state.product_crumbs}</i></h2>
          <div className="view-switcher-button-block">
            <button type="button" className="item-section-switcher" data-pool="1" onClick={this.handlePoolClick}>{this.state.view_pool==1?"К последнему товару":"Загрузки"}</button>
          <button type="button" className="item-section-switcher" data-pool="2" onClick={this.handlePoolClick}>{this.state.view_pool==2?"К последнему товару":"Корзина товаров"}</button>
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
