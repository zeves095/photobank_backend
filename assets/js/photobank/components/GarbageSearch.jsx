import React from 'react';
import {connect} from 'react-redux';
import {searchGarbage} from '../actionCreator';
/**
 * Компонент интерфейса поиска товаров
 */
export class GarbageSearch extends React.Component {

  /**
   * Конструктор класса
   * query - ItemQueryObject объект поиска
   */
  constructor(props) {
    super(props);
    this.state = {
      "query": {}
    };
  };

  /**
   * Обработчик изменения значения полей формы
   * @param  {Event} e Событие
   */
  handleChange = (e)=>{
    let field = e.target.name;
    let query = this.state.query;
    if (e.target.type === "checkbox") {
      this.state.query[field] = e.target.checked ? 1 : 0;
    } else {
      this.state.query[field] = e.target.value;
    }
  }

  /**
   * Обработчик отправки формы поиска
   */
  handleSubmit=()=>{
    let newQuery = Object.assign({}, this.state.query);
    this.props.searchGarbage(newQuery);
  }

  /**
   * Определяет отслеживаемые события на странице
   */
  componentDidMount() {
    let queryObject = {};
    for (var i = 1; i < 3; i++) {
      let input = document.getElementById(this.props.filterid + "inpt" + i);
      input.addEventListener("keyup", (event) => {
        event.preventDefault();
        if (event.keyCode === 13) {
          document.getElementById(this.props.filterid + "btn").click();
        }
      });
    }
    this.setState({"query": queryObject});
  }

  render() {
    return (<div className="item-search">
      <label id={this.props.filterid + "inpt1"}>Название папки</label>
      <input type="text" id={this.props.filterid + "inpt1"} name="node_name" placeholder="Название" onChange={this.handleChange}></input>
      <label id={this.props.filterid + "inpt1"}>Название файла</label>
      <input type="text" id={this.props.filterid + "inpt2"} name="file_name" placeholder="Название" onChange={this.handleChange}></input>
    <button type="button" id={this.props.filterid + "btn"} onClick={this.handleSubmit}>
        <i className="fas fa-search"></i>
      </button>
    </div>);
  }
}

const mapStateToProps = (state,props) =>{
  return {
  }
}

const mapDispatchToProps = {
  searchGarbage
}

export default connect(mapStateToProps, mapDispatchToProps)(GarbageSearch);
