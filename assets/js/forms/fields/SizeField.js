import React from 'react';
class SizeField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {...props.formData};
  }

  onChange(name) {
    return (event) => {
      let val = event.target.value;
      if(val.match(/(\d+)?/)){
        this.setState({
          [name]: parseFloat(val)
        }, () => this.props.onChange(this.state));
      }
    };
  }

  onBlur(name) {
    return (event) => {
      this.setState({
        [name]: parseFloat(event.target.value)
      }, () => this.props.onBlur(this.state));
    };
  }

  render() {
    const {width, height} = this.state;
    return (
      <div>
        <span className="input-half-width">
        <label className="control-label">
          Ширина
        <input type="number" value={width} onChange={this.onChange("width")} onBlur={this.onBlur("width")} />
        <div className="input-description">{this.props.schema.properties.width.description}</div>
        </label>
      </span>
      <span className="input-half-width">
      <label className="control-label">
        Высота
      <input type="number" value={height} onChange={this.onChange("height")} onBlur={this.onBlur("height")} />
        <div className="input-description">{this.props.schema.properties.height.description}</div>
      </label>
    </span>
      </div>

    );
  }
}

export {SizeField};
