import React from 'react';

export class Draggable extends React.Component{

  constructor(props){
    super(props);
    this.state={
      "id": this.props.id,
      "draggable":"",
      "box1": null,
      "box2": null,
      "parent": null,
      "boundrect": null,
      "mouseX": null,
      "dragging": false
    };

    this.handleDrag = this.handleDrag.bind(this);
    this.handleRelease = this.handleRelease.bind(this);
    this.calc = this.calc.bind(this);
  };

  handleDrag(e){
    this.state.box1 = $(this.props.box1);
    this.state.box2 = $(this.props.box2);
    console.log(this.state.box2);
    e.preventDefault();
    this.state.dragging = true;
  }

  handleRelease(){
    this.state.dragging = false;
  }

  calc(){
    this.state.boundrect = this.state.parent.get(0).getBoundingClientRect();
    let b1w = 100/(this.state.boundrect.width/(this.state.mouseX - this.state.boundrect.left));
    let b2w = 100-b1w;
    this.state.box1.css('width', b1w+'%');
    this.state.box2.css('width', b2w+'%');
  }

  componentDidMount(){
    this.state.box1 = $(this.props.box1);
    this.state.box2 = $(this.props.box2);
    this.state.parent = this.state.box1.parent();
    this.state.boundrect = this.state.parent.get(0).getBoundingClientRect();
    $(document).mousemove((e)=>{
        this.state.mouseX = e.pageX;
        if(this.state.dragging){this.calc()};
    });
    $(document).mouseup((e)=>{
        this.handleRelease();
    });
  }

  render(){
    return(
      <div className="draggable" onMouseDown={this.handleDrag} onMouseUp={this.handleRelease} id={"draggable-"+this.state.id}></div>
    );
  }
}
