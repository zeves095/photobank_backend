import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getChosenResource} from '../selectors';
import { removeResourceFromPool, removeAllFromPool } from '../actionCreator';
import {ModalImage} from '../../../common/ModalImage';

export class LinkResource extends React.Component{

  constructor(props){
    super(props);
    this.state={
      modal_image_url:""
    };
  }

  handleRemoveChosenResource = (id)=>{
        //this.props.removeResourceFromPool(e.target.dataset['res']);
    this.props.removeResourceFromPool(id);
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

  handleRemoveAll = ()=>{
    this.props.removeAllFromPool();
  }

  render(){
    let resource = this.props.resources.length === 0
    ?(<div className="resource plaque warning"><i className="fas fa-times-circle left-icon"></i>Не выбран ресурс</div>)
    :this.props.resources.map((res)=>{
      return(
        <div className={"resource list-item"} onClick={()=>{this.handleRemoveChosenResource(res.id)}}>

        <span className={"resource-preview"+(typeof res.thumbnail === 'undefined'?" resource-preview--loading":"")} style={{backgroundImage:"url(/catalogue/node/item/resource/"+res.thumbnail+".jpg)"}} onClick={(e)=>{e.stopPropagation();this.handleModalImage("/catalogue/node/item/resource/"+res.id+".jpg")}}></span>
      {(res.link_exists?<i className="fas fa-check-circle link-exists"></i>:null)}
        {res.item.name+"("+res.item.id+")"}
            {res.size_px}
        </div>
      );
    });
    return (
      <div className="link-resource">
        {this.state.modal_image_url !== ""?<ModalImage image_url={this.state.modal_image_url} closeModalHandler={this.handleModalClose} />:null}
        <div className="component-header component-header--subcomponent">
          <h2 className="component-title">
            Выбранные ресурсы
            {this.props.resources.length>0?<div className="button-block"><button className="remove-all-resources" onClick={this.handleRemoveAll}>Удалить все</button></div>:null}
          </h2>
        </div>
        <div className="component-body component-body--subcomponent">
            {resource}
        </div>
      </div>
    );
  }

}

const mapStateToProps = (state) =>{
  return {
    //resources: getChosenResource(state)
    resources: getChosenResource(state),
  }
}

const mapDispatchToProps = {
  removeResourceFromPool,
  removeAllFromPool
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkResource);
