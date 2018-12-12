import React from 'react';

export class ModalImage extends React.Component{

  constructor(props){
    super(props);
  };

  handleClose =()=>{
    this.props.closeModalHandler();
  }

  render(){
    if(this.props.image_url == ""){return null}
    let width = typeof this.props.width !== 'undefined'?this.props.width:"60vw";
    let height = typeof this.props.height !== 'undefined'?this.props.height:"60vh";
    let style = {
      width, height,
      backgroundImage: "url("+this.props.image_url+")",
      margin: "20vw auto"
    }
    console.warn(style);
    return (
      <div className="modal-image-wrapper">
        <div className="modal-image" style={style}>
          <i className="fas fa-times-circle close-modal" onClick={this.handleClose}></i>
        </div>
      </div>
    );
  }
}
