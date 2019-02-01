import React from 'react';

import {connect} from 'react-redux';

/**
 * Компоент фильтра
 */
export class ListFilter extends React.Component{

  /**
   * Конструктор компонента
   * query - строка фильтрации
   */
  constructor(props){
    super(props);
    this.state={
      "query" : ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.filterTimeout = null;
  };

  /**
   * Обработчик изменения строки фильтрации
   * @param  {Event} e Событие
   */
  handleChange(e){
    let query = e.target.value;
    this.state.query = query;
    if(this.filterTimeout != null){
      clearTimeout(this.filterTimeout);
    }
    this.filterTimeout = setTimeout(this.handleSubmit, 400);
  }

  /**
   * Обработчик отправки строки фильтрации
   */
  handleSubmit(){
    this.props.filterHandler(this.state.query);
  }

  /**
   * Устанавливает слушателя на нажатие Enter
   */
  componentDidMount(){
    let input = document.getElementById(this.props.filterid+"inpt");
    input.addEventListener("keyup", (event)=> {
      event.preventDefault();
      if (event.keyCode === 13) {
        document.getElementById(this.props.filterid+"btn").click();
      }
    });
  }

  render(){
    return(
      <div className="list-filter">
        <input type="text" id={this.props.filterid+"inpt"} name="filter-query" placeholder={this.props.placeholder} onChange={this.handleChange}></input>
      <button type="button" id={this.props.filterid+"btn"} onClick={this.handleSubmit}><i className="fas fa-search"></i></button>
      </div>
    );
  }
}

const mapStateToProps = (state,props) =>{
  return {
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(ListFilter);
