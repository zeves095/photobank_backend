import React from 'react';

export class ListFilter extends React.Component{

  constructor(props){
    super(props);
    this.state={
      "query" : ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.filterTimeout = null;
  };

  handleChange(e){
    let query = e.target.value;
    this.state.query = query;
    if(this.filterTimeout != null){
      clearTimeout(this.filterTimeout);
    }
    this.filterTimeout = setTimeout(this.handleSubmit, 400);
  }

  handleSubmit(){
    this.props.filterHandler(this.state.query);
  }

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
