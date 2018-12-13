import React, { Component } from 'react';
import {connect} from 'react-redux';
import Form from "react-jsonschema-form";
import {LinkAddFormSchema, ResourceSearchFormSchema} from './schema';

class FormWrapper extends Component {

  constructor(props){
    super(props);
    this.state = {
      formSchema: {},
      formUiSchema: {},
      defaults: {},
      submit: ""
    }
  }

  handleInputChange = (data)=>{
    this.props.onChange(data.formData);
  }

  handleSubmit = (data)=>{
    this.props.onSubmit(data.formData);
  }

  handleError = (data)=>{
    this.props.onError(data.errors);
  }

  componentWillMount(){
    let formSchema, formUiSchema, submit;
    switch(this.props.form){
      case "link-add":
        formSchema = LinkAddFormSchema['schema'];
        formUiSchema = LinkAddFormSchema['uiSchema'+(this.props.isAdmin?"_admin":"")];
        submit = (<span><i className="fas fa-check"></i>Добавить</span>);
        break;
      case "resource-search":
        formSchema = ResourceSearchFormSchema['schema'];
        formUiSchema = ResourceSearchFormSchema['uiSchema'+(this.props.isAdmin?"_admin":"")];
        submit = (<span><i className="fas fa-search"></i>Поиск</span>);
        break;
      default:
        formSchema = {}
        break;
    }
    this.setState({
      formSchema,
      formUiSchema,
      submit
    });
  }

  render(){
    let submit = (typeof this.props.submit !== 'undefined'?this.props.submit:<button type="submit">{this.state.submit}</button>);
    return (
      <div className="form-wrapper">
      {this.state.formSchema!={}?<Form
        schema={this.state.formSchema}
        uiSchema={this.state.formUiSchema}
        onChange={this.handleInputChange}
        onSubmit={this.handleSubmit}
        onError={this.handleError}
        formData={this.props.defaults}
      >
      <div className="button-block">
        {submit}
      </div>
    </Form>
      :null}
    </div>
    );
  }

}

const mapStateToProps = (state)=>{
  return {
    isAdmin: state.user.isAdmin
  };
}

export default connect(mapStateToProps)(FormWrapper);
