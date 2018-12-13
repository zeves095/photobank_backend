import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {submitLink, updateLink} from '../actionCreator';
import FormWrapper from '../../../forms/FormWrapper';
import {getLinkTargets} from '../selectors';
import {Confirmator} from '../../../common/Confirmator';

export class LinkAddForm extends React.Component {

  constructor(props) {
    super(props);
    this.state={
      defaults:{},
      confirmatorQuestions:[
        "Вы уверены?"
      ]
    };
  }

  componentDidUpdate(prevProps){
    if(prevProps.resource_chosen !== this.props.resource_chosen){
      let defaults = this.state.defaults;
      let resources = this.props.resource_chosen.map((resource)=>{return resource.id}).join(',');
      defaults.resource = resources;
      this.setState({
        defaults
      });
    }
  }

  handleInputChange = (data)=>{
    let defaults = this.state.defaults;
    let confirmatorQuestions = this.state.confirmatorQuestions;
    defaults = data;
    if(typeof data.target !== "undefined"){
      if(this.props.targets.includes(data.target)){
        confirmatorQuestions[1] = "Группа с именем "+data.target+" уже существует. Все равно добавить?";
      }else{
        confirmatorQuestions.splice(1, 1);
      }
    }
    this.setState({
      defaults, confirmatorQuestions
    });
  }

  handleFormSubmit = (data) =>{
    this.props.submitLink(data);
  }

  handleFormError = (errors) =>{
  }

  render() {
    let confirmator = (<Confirmator questions={this.state.confirmatorQuestions} onConfirm={()=>{}} buttonTitle={"Добавить"} />);
    return (
      <div className={"link-add-form "+(this.props.resource_chosen.length>0?"open":"")}>
        <FormWrapper form="link-add" onChange={this.handleInputChange} onSubmit={this.handleFormSubmit} onError={this.handleFormError} defaults={this.state.defaults} submit={confirmator} />
      </div>);
  }

}

const mapStateToProps = (state) =>{
  return {
    link_editing: state.link.link_editing,
    link: state.link.link_editing_id,
    resource_chosen: state.resource.resource_chosen,
    targets: getLinkTargets(state)
  }
}

const mapDispatchToProps = {
  submitLink,
  updateLink
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkAddForm);
