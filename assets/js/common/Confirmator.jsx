import React from 'react';

export class Confirmator extends React.Component{

  constructor(props){
    super(props);
    this.state={
      step:0
    };
  };

  componentDidUpdate(){
    if(!this.props.active && this.state.step !== 0){
      this.setState({
          step:0
      });
    }
  }

  progress = (e)=>{
    this.props.prehook();
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
    let button_content = this.state.step>0?"Да":this.props.buttonTitle;
    let button = (<button type="submit" disabled={this.props.disabled} onClick={this.progress} className="confirmator-button">{button_content}</button>);
    let cancelButton = (<button onClick={this.cancel} className="confirmator-button-cancel"><i className="fas fa-times-circle"></i></button>);
    let confirmator = (
      <div className={"confirmator "+this.props.customClass}>
        {this.state.step>0?<div className={"confirmator-question"+(this.props.inline?"-inline":"")}>{this.props.questions[this.state.step-1]}</div>:null}
        {button}
        {this.state.step>0?cancelButton:null}
      </div>
    );
    return confirmator;
  }
}
