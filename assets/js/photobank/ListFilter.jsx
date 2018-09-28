import React from 'react';

export class ListFilter extends React.Component{

  constructor(props){
    super(props);
    this.state={
      "query" : ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };

  handleChange(e){
    let query = e.target.value;
    this.state.query = query;
  }

  handleSubmit(){
    this.props.filterHandler(this.state.query);
  }

  render(){
    return(
      <div className="list-filter">
        <input type="text" name="filter-query" placeholder="Фильтр" onBlur={this.handleChange}></input>
      <button type="button" onClick={this.handleSubmit}><i className="fas fa-arrow-alt-circle-right"></i></button>
      </div>
    );
  }
}
