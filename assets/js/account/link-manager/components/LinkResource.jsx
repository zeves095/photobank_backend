import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getChosenResource} from '../selectors';
import { doAction } from '../actionCreator'

export class LinkResource extends React.Component{

  constructor(props){
    super(props);
    this.state={};
  }
  render(){
    let resource = typeof this.props.resource == 'undefined'
    ?(<div className="resource card-panel red lighten-1 white-text">Не выбран ресурс</div>)
    :(<div className="resource card-panel teal darken-1 white-text">
      <span className={"resource-preview"+(typeof this.props.resource.thumbnail === 'undefined'?" resource-preview--loading":"")} style={{backgroundImage:"url(/catalogue/node/item/resource/"+this.props.resource.thumbnail+".jpg)"}}></span>
      {this.props.resource.id}
    </div>);
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
    resource: getChosenResource(state)
  }
}

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(LinkResource);
