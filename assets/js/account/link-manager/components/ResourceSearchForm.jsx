import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getChosenResource, resourceArr} from '../selectors';
import {searchResources} from '../actionCreator';
import  M  from 'materialize-css';

export class ResourceSearchForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      form: {
        item_search_name: "",
        item_search_parent_name: "",
        item_search_search_nested: "",
        item_search_code: "",
        resource_search_id: "",
        resource_search_preset: "",
        resource_search_type: ""
      }
    };
  }

  handleFormKeyup = (e) => {
    e.preventDefault();
    if (e.keyCode === 13) {
      this.handleFormSubmit();
    }
  }

  handleFormSubmit = () => {
    this.props.searchResources(this.state.form);
  }

  handleInputChange = (e) => {
    let form = this.state.form;
    let name = e.target.name;
    let value = e.target.value;
    form[name] = value;
    this.setState({form: form});
  }

  render() {
    return (<div className="resource-search-form">
      <div className="component-body component-body--subcomponent">
        <form className="col s12 row" onKeyUp={this.handleFormKeyup}>
          <div className="input-field col s12 m6">
            <input type="text" id="item_search_name" name="item_search_name" onChange={this.handleInputChange} value={this.state.form.item_search_name}></input>
            <label htmlFor="item_search_name">Название товара</label>
          </div>
          <div className="input-field col s12 m6">
            <input type="text" id="item_search_parent_name" name="item_search_parent_name" onChange={this.handleInputChange} value={this.state.form.item_search_parent_name}></input>
            <label htmlFor="item_search_parent_name">Раздел каталога</label>
            <div className="subinput">
              <label htmlFor="item_search_search_nested" className="subinput">
              <input type="checkbox" id="item_search_search_nested" name="item_search_search_nested" onChange={this.handleInputChange} value={this.state.form.item_search_search_nested}></input>
              <span>Искать во вложенных разделах</span>
              </label>
            </div>
          </div>
          <div className="input-field col s12 m6">
            <input type="text" id="item_search_code" name="item_search_code" onChange={this.handleInputChange} value={this.state.form.item_search_code}></input>
            <label htmlFor="item_search_code">Код 1С товара</label>
          </div>
          <div className="input-field col s12 m6">
            <input type="text" name="resource_search_id" id="resource_search_id" onChange={this.handleInputChange} value={this.state.form.resource_search_id}/>
          <label htmlFor="resource_search_id">ID ресурса</label>
          </div>
          <div className="input-field col s12 m6">
            <input type="text" name="resource_search_preset" id="resource_search_preset" onChange={this.handleInputChange} value={this.state.form.resource_search_preset}/>
          <label htmlFor="resource_search_preset">Пресет</label>
          </div>
          <div className="input-field col s12 m6">
            <input type="text" name="resource_search_type" id="resource_search_type" onChange={this.handleInputChange} value={this.state.form.resource_search_type}/>
          <label htmlFor="resource_search_type">Тип ресурса</label>
          </div>
          <button className="waves-effect waves-light btn" type="button" name="button" onClick={this.handleFormSubmit}>Поиск</button>
        </form>
      </div>
    </div>);
  }

}
const mapStateToProps = (state, ownProps) => {
  return {resources_found: resourceArr(state), resource_chosen: getChosenResource(state)}
}
const mapDispatchToProps = {
  searchResources
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceSearchForm);