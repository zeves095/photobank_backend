import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getChosenResource} from '../selectors';
import { removeResourceFromPool } from '../actionCreator'

export class LinkResource extends React.Component{

  constructor(props){
    super(props);
    this.state={};
  }

  handleRemoveChosenResource = (e)=>{
    this.props.removeResourceFromPool(e.target.dataset['res']);
  }

  render(){
    let resource = this.props.resources.length === 0
    ?(<div className="resource plaque warning"><i className="fas fa-times-circle left-icon"></i>Не выбран ресурс</div>)
    :this.props.resources.map((res)=>{
      return(
        <div className="resource">
          <i className="fas fa-minus-circle add-res" data-res={res.id} onClick={this.handleRemoveChosenResource}></i>
          <span className={"resource-preview"+(typeof res.thumbnail === 'undefined'?" resource-preview--loading":"")} style={{backgroundImage:"url(/catalogue/node/item/resource/"+res.thumbnail+".jpg)"}}></span>
            {res.item.name+"("+res.item.id+")"}
            {res.size_px}
        </div>
      );
    });
    return (
      <div className="link-resource">
        <div className="component-header component-header--subcomponent">
          <h2 className="component-title">
            Выбранный ресурс
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
    resources: state.resource.resource_chosen
  }
}

const mapDispatchToProps = {
  removeResourceFromPool
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkResource);
