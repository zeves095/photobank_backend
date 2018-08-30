import React from 'react';
/**
 * Кастомное поле размера изображения для jsonschema-form
 */
class SizeField extends React.Component {

  constructor(props) {
    super(props);
    this.state = {...props.formData, hidden:true};
  }

  /**
   * Обработчик изменения данных в поле. Валидирует значение
   * @param  {String} name Имя конкретного поля
   */
  onChange(name) {
    return (event) => {
      let val = event.target.value;
      let intVal = parseInt(val, 10);
      if(val.match(/(\d+)?/)&&intVal!==this.state[name]){
        this.setState({
          [name]: !isNaN(intVal)?intVal:undefined
        }, () => this.props.onChange(this.state));
      }
    };
  }

  /**
   * Обработчик разфокуса поля формы
   * @param  {String} name Имя конкретного поля
   */
  onBlur(name) {
    return (event) => {
      this.props.onBlur(this.state);
    };
  }

  /**
   * Обработчик скрытия поля
   */
  handleHide=()=>{
    this.setState({
      hidden: !this.state.hidden,
      width: undefined,
      height: undefined,
    }, () => this.props.onChange(this.state));
  }

  render() {
    const {width, height} = this.state;
    return (
      <div className="size-field">
        <div className="button-block">
          <button type="button" onClick={this.handleHide}>{this.state.hidden?"Указать размер изображения":"Использовать размер исходника"}</button>
        </div>
        {!this.state.hidden?
          <React.Fragment>
          <span className="input-half-width">
          <label className="control-label">
            Ширина
          <input type="number" value={width} max={this.props.schema.properties.width.maximum} min={this.props.schema.properties.width.minimum} onChange={this.onChange("width")} onBlur={this.onBlur("width")} />
          <div className="input-description">{this.props.schema.properties.width.description}</div>
        {typeof this.props.errorSchema.width !== 'undefined'&&this.props.errorSchema.width.__errors.length>0?<div className="plaque warning"><i className="fas fa-times-circle left-icon"></i>{this.props.errorSchema.width.__errors[0]}</div>:null}
          </label>
        </span>
        <span className="input-half-width">
        <label className="control-label">
          Высота
        <input type="number" value={height} max={this.props.schema.properties.height.maximum} min={this.props.schema.properties.height.minimum} onChange={this.onChange("height")} onBlur={this.onBlur("height")} />
          <div className="input-description">{this.props.schema.properties.height.description}</div>
        {typeof this.props.errorSchema.height !== 'undefined'&&this.props.errorSchema.height.__errors.length>0?<div className="plaque warning"><i className="fas fa-times-circle left-icon"></i>{this.props.errorSchema.height.__errors[0]}</div>:null}
        </label>
      </span>
    </React.Fragment>
        :null}
      </div>

    );
  }
}

export {SizeField};
