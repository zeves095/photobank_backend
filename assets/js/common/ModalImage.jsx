import React from 'react';
/**
 * Простой компонент для отображения изображения в модальном окне
 */
export class ModalImage extends React.Component{

  constructor(props){
    super(props);
  };

  /**
   * Обработчик закрытия модального окна
   */
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
      margin: "20vw auto",
      pointerEvents: "none",
      backgroundSize: "contain",
      margin: "10vw auto",
      pointerEvents: "none",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
    }
    return (
      <div className="modal-image-wrapper" onClick={this.handleClose}>
        <div className="modal-image" style={style}>
          <i className="fas fa-times-circle close-modal" onClick={this.handleClose}></i>
        </div>
      </div>
    );
  }
}
