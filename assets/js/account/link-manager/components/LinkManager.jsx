import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {init} from '../actionCreator'
import LinkList from './LinkList';
import LinkAdder from './LinkAdder';

export class LinkManager extends React.Component{

  constructor(props){
    super(props);
    this.state={};
  }

  componentDidMount(){
    this.props.init();
  }

  render(){
    return(
      <div className="link-manager">
        <div id="notification-overlay">

        </div>
        <div className="flex-wrapper">
          {/*<div className="link-list">*/}
            <LinkList />
          {/*</div>*/}
          {/*<div className="link-adder">*/}
            <LinkAdder />
          {/*</div>*/}
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state) =>{
  return {
  }
}

const mapDispatchToProps = {
  init
}

export default connect(mapStateToProps,mapDispatchToProps)(LinkManager);
