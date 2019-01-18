import React, { Component } from 'react';
import {connect} from 'react-redux';
import Form from "react-jsonschema-form";
import {LinkAddFormSchema, ResourceSearchFormSchema} from './schema';

/**
 * Обертка над jsonschema-form. Предназначена для простоты изменения компонента, генерирующего форму, при необходимости
 */
export class FormWrapper extends Component {

  /**
   * Конструктор класса
   * formSchema - Json-схема формы
   * formUiSchema - Ui-схема для отрисовки формы
   * formFields - Кастомные поля формы
   * formWidgets - Кастомные виджеты формы
   * defaults - Данные формы по умолчанию
   * submit - Текст/элемент кнопки отправки формы
   * formData - Данные формы
   */
  constructor(props){
    super(props);
    this.state = {
      formSchema: {},
      formUiSchema: {},
      formFields: {},
      formWidgets: {},
      defaults: {},
      submit: "",
      formData:{}
    }
  }

  /**
   * Обработчик изменения данных формы.
   * @param  {Object} data Данные из компонента react-jsonschema-form
   */
  handleInputChange = (data)=>{
    this.props.onError(data.errors);
    this.props.onChange(data.formData);
    if(data.formData !== this.state.formData){
      this.setState({
        formData: data.formData
      });
    }
  }

  /**
   * Обработчик отправки формы
   * @param  {Object} data Данные из компонента react-jsonschema-form
   */
  handleSubmit = (data)=>{
    this.props.onSubmit(data.formData);
  }
  /**
   * Обработчик ошибок формы
   * @param  {Object} data Данные из компонента react-jsonschema-form
   */
  handleError = (data)=>{
    this.props.onError(data.errors);
  }
  /**
   * Обработчик потери фокуса формы
   * @param  {Object} data Данные из компонента react-jsonschema-form
   */
  handleBlur = (data)=>{
    this.props.onBlur(this.state.formData);
  }

  /**
   * Подставляет нужную JSON-схему для формы по ключу
   */
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
        formSchema = null
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
      {this.state.formSchema!=null?<Form
        schema={this.state.formSchema}
        uiSchema={this.state.formUiSchema}
        onChange={this.handleInputChange}
        onSubmit={this.handleSubmit}
        onError={this.handleError}
        onBlur={this.handleBlur}
        formData={this.props.defaults}
        validate={this.props.validate}
        liveValidate={true}
        showErrorList={false}
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
