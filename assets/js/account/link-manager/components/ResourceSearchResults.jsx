import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import { getResourcesWithThumbnails } from '../selectors';
import { chooseResource, addResourceToPool } from '../actionCreator';
import {ModalImage} from '../../../common/ModalImage';

export class ResourceSearchResults extends React.Component{

  constructor(props){
    super(props);
    this.state={
      "modal_image_url":""
    };
  }

  handleResourceChoice = (e)=>{
    //this.props.chooseResource(parseInt(e.target.dataset['res'], 10));
  }

  handleAddResourceToPool = (e)=>{
    e.stopPropagation();
    this.props.addResourceToPool(parseInt(e.target.dataset['res'], 10));
  }

  handleChooseAll = (e)=>{
    this.props.resources_found.forEach((resource)=>{
      this.props.addResourceToPool(parseInt(resource.id, 10));
    });
  }

  handleModalImage = (link)=>{
    this.setState({
      modal_image_url: link
    });
  }

  handleModalClose = ()=>{
    this.setState({
      modal_image_url: ""
    });
  }

  render(){
    let tooManyResources = this.props.resources_found.length == 100;
    let resources = this.props.resources_found.map((resource)=>{
      return(
        <div data-res={resource.id} key={"resource"+resource.id} className="resource list-item" onClick={this.handleResourceChoice}>
          <span className={"resource-preview"+(typeof resource.thumbnail === 'undefined'?" resource-preview--loading":"")} style={{backgroundImage:"url(/catalogue/node/item/resource/"+resource.thumbnail+".jpg)"}} onClick={()=>{this.handleModalImage("/catalogue/node/item/resource/"+resource.thumbnail+".jpg")}}></span>
        <i className="fas fa-plus-circle add-res" data-res={resource.id} onClick={this.handleAddResourceToPool}></i>
        {resource.item.name+"("+resource.item.id+")"}
        {resource.size_px}
        </div>
      )
    });
    return (
      <div className="resource-search-results">
        {this.state.modal_image_url !== ""?<ModalImage image_url={this.state.modal_image_url} closeModalHandler={this.handleModalClose} width={320} height={180}/>:null}
        <div className="component-header component-header--subcomponent">
          <h2 className="component-title">
            Результаты поиска
          </h2>
          <div className="button-block"><button className=" waves-effect hoverable waves-light btn" type="button" name="button" onClick={this.handleChooseAll}>Выбрать все</button></div>
        </div>
        <div className="component-body component-body--subcomponent">
          {tooManyResources?(<div className="resource plaque warning"><i className="fas fa-times-circle left-icon"></i>Показаны не все результаты. Необходимо сузить критерии поиска.</div>):null}
          {this.props.resources_found.length==0?"Нет ресурсов":resources}
        </div>
      </div>
    );
  }

}
const mapStateToProps = (state) =>{
  return {
    resources_found: getResourcesWithThumbnails(state)
  }
}

const mapDispatchToProps = {
  chooseResource,
  addResourceToPool
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceSearchResults);
