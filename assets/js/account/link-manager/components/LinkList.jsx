import React, {Component} from 'react';
import {connect} from 'react-redux';

import { chooseLink, addLink, fetchLinks } from '../actionCreator'

export class LinkList extends React.Component{

  constructor(props){
    super(props);
    this.state={};
  }

  componentDidMount(){
    this.props.fetchLinks();
  }

  handleLinkClick = (e)=>{
    this.props.chooseLink(e.target.dataset['linkid']);
  }

  handleLinkAdd = (e)=>{
    this.props.addLink();
  }

  render(){
    let links = this.props.links.map(
      (link)=>{
        return(
          <div data-linkid={link.id} className="link card-panel blue-grey darken-1 white-text" onClick={this.handleLinkClick}>{link.id}:  {link.external_url}</div>
        )
      }
    );
    return(
      <div className="link-list">
        <div className="component-header">
          <h2 className="component-title">
            Ссылки
          </h2>
        </div>
        <div className="component-body">
          <div className="component-body__top-section">
            {links.length==0?"Нет ссылок":links}
          </div>
          <div className="component-body__bottom-section">
            <button onClick={this.handleLinkAdd} className="waves-effect waves-light btn add-button" type="button">Добавить</button>
          </div>
        </div>
      </div>
    );
  }

}

const mapStateToProps = (state) =>{
  return {
    links: state.link.links_done
  }
}

const mapDispatchToProps = {
    chooseLink,
    addLink,
    fetchLinks
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkList);
