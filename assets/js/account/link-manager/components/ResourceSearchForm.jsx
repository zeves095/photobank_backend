import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getChosenResource, resourceArr} from '../selectors';
import {searchResources} from '../actionCreator';
import FormWrapper from '../../../forms/FormWrapper';
import  M  from 'materialize-css';

export class ResourceSearchForm extends React.Component {

  constructor(props) {
    super(props);
    this.state={
      defaults:{
        "item_search_search_nested":true,
        "resource_search_preset":1,
        "resource_search_type": 1,
      }
    };
    console.log(this.state);
  }

  componentDidMount(){
    let presets = Object.keys(this.props.resource_presets).map((key)=>{
      return(
        <option value={this.props.resource_presets[key].id}>{this.props.resource_presets[key].name}</option>
      );
    })
    let types = Object.keys(this.props.resource_types).map((key)=>{
      return(
        <option value={key}>{this.props.resource_types[key]}</option>
      );
    })
  }

  handleInputChange = (data)=>{
    this.setState({
      defaults:data
    });
  }

  handleFormSubmit = (data) =>{
    this.props.searchResources(data);
  }

  handleFormError = (errors) =>{
    console.log(errors);
  }

  render() {
    return (<div className="resource-search-form">
      <FormWrapper form="resource-search" onChange={this.handleInputChange} onSubmit={this.handleFormSubmit} onError={this.handleFormError} defaults={this.state.defaults} />
    </div>);
  }

}
const mapStateToProps = (state, ownProps) => {
  return {
    resources_found: resourceArr(state),
    resource_chosen: getChosenResource(state),
    resource_presets: state.resource.resource_presets,
    resource_types: state.resource.resource_types,
  }
}
const mapDispatchToProps = {
  searchResources
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceSearchForm);
