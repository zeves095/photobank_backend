import React from 'react';

/**
 * Компонент, который задает вопросы из разряда "Вы уверены?" перед отправкой формы
 */
export class Confirmator extends React.Component{

  /**
   * Конструктор компонента
   * step - шаг валидации
   * @param {Object} props Входные данные
   */
  constructor(props){
    super(props);
    this.state={
      step:0
    };
  };

  /**
   * Сбрасывает прогресс валидации
   */
  componentDidUpdate(){
    if(!this.props.active && this.state.step !== 0){
      this.setState({
          step:0
      });
    }
  }

  /**
   * Продвигает подтверждение отправки на шаг вперед
   * @param  {Event} e Событие клика
   */
  progress = (e)=>{
    this.props.prehook();
    if(this.state.step>=this.props.questions.length){
      this.props.onConfirm();
      this.cancel();
      return;
    }
    e.preventDefault();
    console.log(this.state.step+1);
    this.setState({
      step:this.state.step+1
    });
  }

  /**
   * Выполняет отмену отправки
   */
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
      <div className={"confirmator"+(typeof this.props.customClass === "undefined"?"":" "+this.props.customClass)}>
        {this.state.step>0?<div className={"confirmator-question"+(this.props.inline?"-inline":"")}>{this.props.questions[this.state.step-1]}</div>:null}
        {button}
        {this.state.step>0?cancelButton:null}
      </div>
    );
    return confirmator;
  }
}
