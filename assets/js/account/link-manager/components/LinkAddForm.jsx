import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {submitLink, updateLink} from '../actionCreator';
import FormWrapper from '../../../forms/FormWrapper';
import {getLinkTargets, getChosenResource} from '../selectors';
import {Confirmator} from '../../../common/Confirmator';
import {validateLinkAddForm} from '../../../common/utils/validation';

/**
 * Форма для добавления ссылки
 */
export class LinkAddForm extends React.Component {
  /**
   * Конструктор компонента
   * form_error - Текст ошибки формы
   * defaults - Данные формы по умолчанию
   * confirmatorQuestions - вопросы для компонента Confirmator
   *
   * @param {Object} props Входные данные из коннекта Redux
   */
  constructor(props) {
    super(props);
    this.state={
      form_error: false,
      defaults:{},
      confirmatorQuestions:[
        "Вы уверены?"
      ]
    };
  }

  /**
   * Делает проверку на факт существования выбранного ресурса на момент маунта выбранного ресурса
   */
  componentDidMount(){
    if(this.props.resource_chosen !== null){
      this.handleSetResource();
    }
  }

  /**
   * Делает проверку на факт изменения выбранного ресурса
   */
  componentDidUpdate(prevProps){
    if(prevProps.resource_chosen !== this.props.resource_chosen){
      this.handleSetResource();
    }
  }

  /**
   * Проставляет поле resource для формы из данных redux
   */
  handleSetResource = ()=>{
    let defaults = this.state.defaults;
    let resources = this.props.resource_chosen.map((resource)=>{return resource.id}).join(',');
    defaults.resource = resources;
    this.setState({
      defaults
    });
  }

  /**
   * Обработчик изменений формы. Обновляет состояние формы после изменения поля
   * @param  {Object} data Данные формы
   */
  handleInputChange = (data)=>{
    this.setState({
      defaults:data
    });
  }

  /**
   * Обработчик отправки формы. Отправляет action с данными формы для создания ссылки
   * @param  {Object} data Данные формы
   */
  handleFormSubmit = (data) =>{
    this.props.submitLink(data);
  }

  /**
   * Обработчик ошибок формы.
   * @param  {string[]} errors [description]
   */
  handleFormError = (errors) =>{
    this.setState({
      form_error: errors.length>0
    });
  }

  /**
   * Создает список вопросов для подтвердждения в компоненте Confirmator. Проверяет, пытается ли юзер создать ссылки для ресурсов, у которых уже есть ссылки, либо добавить ссылки в уже существующую группу
   */
  getConfirmatorQuestions= ()=>{
    let defaults = this.state.defaults;
    let confirmatorQuestions = this.state.confirmatorQuestions;
    if(typeof defaults.target !== "undefined"){
      if(this.props.targets.includes(defaults.target)){
        let existing = this.props.resource_chosen.filter((res)=>{return typeof res.link_exists !== 'undefined' && res.link_exists && res.link_targets.includes(defaults.target)});
        if(existing.length>0){
          confirmatorQuestions[2] = existing.length+" ресурсов уже имеют ссылки. Все равно продолжить?";
        }else{

          confirmatorQuestions.splice(2, 1);
        }
        confirmatorQuestions[1] = "Группа с именем "+defaults.target+" уже существует. Все равно добавить?";
      }else{
        confirmatorQuestions.splice(1, 1);
        confirmatorQuestions.splice(2, 1);
      }
    }
    this.setState({
      confirmatorQuestions
    });
  }

  render() {
    let confirmator = (<Confirmator active={this.props.resource_chosen.length>0} questions={this.state.confirmatorQuestions} prehook={this.getConfirmatorQuestions} onConfirm={()=>{}} inline={false} disabled={this.state.form_error} buttonTitle={"Добавить"} />);
    return (
      <div className={"link-add-form "+(this.props.resource_chosen.length>0?"open":"")}>
        {this.props.form_error !== null?<div className="form-error">{this.props.form_error}</div>:null}
        <FormWrapper form="link-add" onChange={this.handleInputChange} validate={validateLinkAddForm} onBlur={this.handleFormBlur} onSubmit={this.handleFormSubmit} onError={this.handleFormError} defaults={this.state.defaults} submit={confirmator} />
      </div>);
  }

}

const mapStateToProps = (state) =>{
  return {
    link_editing: state.link.link_editing,
    link: state.link.link_editing_id,
    resource_chosen: getChosenResource(state),
    targets: getLinkTargets(state),
    form_error: state.ui.form.link_add.error
  }
}

const mapDispatchToProps = {
  submitLink,
  updateLink,
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkAddForm);
