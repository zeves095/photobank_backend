import React from 'react';

export class Confirmator extends React.Component{

  constructor(props){
    super(props);
    this.state={
      step:0
    };
  };

  progress = (e)=>{
    if(this.state.step>=this.props.questions.length){
      this.props.onConfirm();
      this.cancel();
      return;
    }
    e.preventDefault();
    this.setState({
      step:this.state.step+1
    });
  }

  cancel = ()=>{
    this.setState({
      step:0
    });
  }

  render(){
    let button = (<button type="submit" onClick={this.progress} className="confirmator-button">{this.props.buttonTitle}</button>);
    let cancelButton = (<button onClick={this.cancel} className="confirmator-button-cancel"><i className="fas fa-times-circle"></i></button>);
    let confirmator = (
      <div className="confirmator">
        {this.state.step>0?<div className="confirmator-question">{this.props.questions[this.state.step-1]}</div>:null}
        {button}
        {this.state.step>0?cancelButton:null}
      </div>
    );
    return confirmator;
  }
}
