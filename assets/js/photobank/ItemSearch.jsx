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
    let input = document.getElementById(this.props.filterid+"inpt");
    input.addEventListener("keyup", (event)=> {
      event.preventDefault();
      if (event.keyCode === 13) {
        document.getElementById(this.props.filterid+"btn").click();
      }
    });
    this.setState({
      "query":queryObject
    });
  }

  render(){
    return(
      <div className="list-filter">
        <input type="text" id={this.props.filterid+"inpt"} name="name" placeholder="nodeId" onChange={this.handleChange}></input>
      <input type="text" id={this.props.filterid+"inpt"} name="parent_name" placeholder="parent_name" onChange={this.handleChange}></input>
    <input type="text" id={this.props.filterid+"inpt"} name="code" placeholder="code" onChange={this.handleChange}></input>
      <button type="button" id={this.props.filterid+"btn"} onClick={this.handleSubmit}><i className="fas fa-search"></i></button>
      </div>
    );
  }
}
