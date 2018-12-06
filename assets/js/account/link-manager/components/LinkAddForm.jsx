import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import  M  from 'materialize-css';
import {submitLink} from '../actionCreator';
import {getLinkTargets} from '../selectors';

export class LinkAddForm extends React.Component {

  constructor(props) {
    super(props);
    this.state={
      form:{
        access:'',
        target:'',
        expires_by:'',
        comment:'',
        max_requests:'',
        resource:this.props.resource_chosen,
        custom_size:'',
      }
    };
    this.datePickerRef = React.createRef();
    this.autoCompleteRef = React.createRef();
    this.datePickerOpts = {
      onSelect:this.handleInputChange
    };
  }

  componentDidUpdate(prevProps){
   //M.Datepicker.init(this.datePickerRef.current, this.datePickerOpts);
   if(this.props.resource_chosen != prevProps.resource_chosen){
     let form = this.state.form;
     form.resource = this.props.resource_chosen;
     this.setState({
       form: form
     });
   }
  }

  componentDidMount(){
    M.Datepicker.init(this.datePickerRef.current, this.datePickerOpts);
    let targs = this.props.targets;
    let auto = {};
    targs.forEach((target)=>auto[target]=null);
    let autoCompleteOpts = {
      data: auto
    };
    M.Autocomplete.init(this.autoCompleteRef.current, autoCompleteOpts);
    this.autocomplete = M.Autocomplete.getInstance(this.autoCompleteRef.current);
  }

  validateField = (target)=>{
    switch(target.name){
      case 'custom_size':
        if(!target.value.match(/^[0-9]{0,4}\/?[0-9]{0,4}$/)){return false;}
        return true;
      case 'resource':
        if(!target.value.match(/^[0-9]{0,10}$/)){return false;}
        return true;
      case 'access':
      //TODO fix regex
        //if(!target.value.match(/^\b((\d{1,3}\.){0,3}(\d{1,3})?\b[ ,;]{0,2})+$/)){return false;}
        //if(!target.value.match(/^(((\d{1,3}\.){0,3}(\d{0,3})[ ,;]{0,2})?)+$/)){return false;}
        if(!target.value.match(/((^|[ ,;])((\d{1,3}\.){0,3}(\d{0,3})?))+$/)){return false;}
        return true;
      default:
        return true;
    }

  }

  handleInputChange = (e)=>{
    let form = this.state.form;
    if(typeof e.getMonth === 'function'){
      form['expires_by']= e.getFullYear()+"-"+parseInt(e.getMonth()+1, 10)+-+e.getDate();
    }else{
      if(!this.validateField(e.target)){return false;}
      form[e.target.name]= e.target.value;
    }
    this.setState({
      form: form
    });
  }

  handleFormSubmit = (e) =>{
    this.props.submitLink(this.state.form);
  }

  handleFormKeyup = (e) => {
    if(e.target.classList.contains("autocomplete")){return false;}
    if (e.keyCode === 13) {
      this.handleFormSubmit();
    }
  }

  render() {
    return (<div className="link-add-form">
      <div className="component-header component-header--subcomponent">
        <h2 className="component-title">
          Опции
        </h2>
      </div>
      <div className="component-body component-body--subcomponent card-panel link-add-form__form row">
        <form className="col s12 row" onSubmit={this.handleSubmitForm} onKeyUp={this.handleFormKeyup}>
          <div className="input-field col s12 m6 l6">
            <input onChange={this.handleInputChange} type="text" name="custom_size" id="custom_size" value={this.state.form['custom_size']}/>
          <label htmlFor="custom_size">Размер изображения</label>
          </div>
          <div className="input-field col s12 m6 l6">
            <input onChange={this.handleInputChange} type="text" className="datepicker" name="expires_by" id="expires_by" ref={this.datePickerRef} value={this.state.form['expires_by']}/>
          <label htmlFor="expires_by">Срок действия</label>
          </div>
          <div className="input-field col s12 m6 l6">
            <input onChange={this.handleInputChange} type="text" name="comment" id="comment" value={this.state.form['comment']}/>
          <label htmlFor="comment">Комментарий</label>
          </div>
          <div className="input-field col s12 m6 l6">
            <input onChange={this.handleInputChange} className="autocomplete" ref={this.autoCompleteRef} type="text" name="target" id="target" value={this.state.form['target']}/>
          <label htmlFor="target">Группа</label>
          </div>
          {/* <input type="hidden" name="target" value></input> */}
          <div className="input-field col s12 m6 l6">
            <input onChange={this.handleInputChange} type="text" name="access" id="access" value={this.state.form['access']}/>
          <label htmlFor="access">Ограничение по IP</label>
          </div>
          <div className="input-field col s12 m6 l6">
            <input onChange={this.handleInputChange} type="number" name="max_requests" id="max_requests" value={this.state.form['max_requests']} required />
          <label htmlFor="max_requests">Максимальное число запросов</label>
          </div>
          <input type="hidden" value={this.props.resource_chosen} required></input>
        <button className="blue-grey waves-effect hoverable waves-light btn" type="button" onClick={this.handleFormSubmit}><i className="fas fa-arrow-alt-circle-down"></i>Сохранить</button>
        </form>
      </div>
    </div>);
  }

}

const mapStateToProps = (state) =>{
  return {
    link_editing: state.link.link_editing,
    resource_chosen: state.resource.resource_chosen,
    targets: getLinkTargets(state)
  }
}

const mapDispatchToProps = {
  submitLink
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkAddForm);
