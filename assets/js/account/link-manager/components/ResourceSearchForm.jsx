import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getChosenResource, resourceArr} from '../selectors';
import {searchResources} from '../actionCreator';
import FormWrapper from '../../../forms/FormWrapper';
//import  M  from 'materialize-css';

/**
 * Форма для поиска ресурсов
 */
export class ResourceSearchForm extends React.Component {
  /**
   * Конструктор компонента
   * defaults - Данные по умолчанию для отображения в форме
   * @param {Object} props Входные данные из коннекта Redux
   */
  constructor(props) {
    super(props);
    this.state={
      defaults:{
        "item_search_search_nested":true,
        "resource_search_preset":0,
        "resource_search_type": 1,
      }
    };
  }

  /**
   * Создает варианты для селекта типа и пресета ресурса в поиске
   */
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
    this.props.searchResources(data);
  }
  /**
   * Обработчик ошибок формы.
   * @param  {string[]} errors [description]
   */
  handleFormError = (errors) =>{
  }
  /**
   * Обработчик потери фокуса формы. Сейчас не испоьзуется, но пусть будет пока.
   * @param  {Object} data Данные формы
   */
  handleFormBlur = (data)=>{

  }

  render() {
    return (<div className="resource-search-form">
      <FormWrapper form="resource-search" validate={(formData, errors)=>{return errors}} onChange={this.handleInputChange} onBlur={this.handleFormBlur}  onSubmit={this.handleFormSubmit} onError={this.handleFormError} defaults={this.state.defaults} />
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
