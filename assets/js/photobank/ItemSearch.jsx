import React from 'react';

import {ItemQueryObject} from './services/ItemQueryObject';

export class ItemSearch extends React.Component{

  constructor(props){
    super(props);
    this.state={
      "query" : {},
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };

  handleChange(e){
    let field = e.target.name;
    let query = this.state.query;
    this.state.query[field] = e.target.value;
  }

  handleSubmit(){
    let newQuery = Object.assign({},this.state.query);
    this.props.searchQueryHandler(newQuery);
  }

  componentDidMount(){
    let queryObject = new ItemQueryObject();
    for(var i = 1; i<4; i++){
      let input = document.getElementById(this.props.filterid+"inpt"+i);
      input.addEventListener("keyup", (event)=> {
        event.preventDefault();
        if (event.keyCode === 13) {
          document.getElementById(this.props.filterid+"btn").click();
        }
      });
    }
    this.setState({
      "query":queryObject
    });
  }

  render(){
    return(
      <div className="item-search">
        <label htmlFor="name">Название</label>
      <input type="text" id={this.props.filterid+"inpt1"} name="name" placeholder="Название" onChange={this.handleChange}></input>
    <label htmlFor="parent_name">Раздел каталога</label>
    <input type="text" id={this.props.filterid+"inpt2"} name="parent_name" placeholder="Раздел каталога" onChange={this.handleChange}></input>
  <label htmlFor="code">Код 1С</label>
  <input type="text" id={this.props.filterid+"inpt3"} name="code" placeholder="Код 1С" onChange={this.handleChange}></input>
      <button type="button" id={this.props.filterid+"btn"} onClick={this.handleSubmit}><i className="fas fa-search"></i></button>
      </div>
    );
  }
}
