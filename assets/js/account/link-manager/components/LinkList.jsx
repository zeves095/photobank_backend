import React, {Component} from 'react';
import {connect} from 'react-redux';
import { getLinkTargets } from '../selectors';
import { chooseLink, addLink, fetchLinks, deleteLink } from '../actionCreator'
import {NotificationService} from '../../../services/NotificationService';
export class LinkList extends React.Component{

  constructor(props){
    super(props);
    this.state={
      target:"Все"
    };
  }

  componentDidMount(){
    this.props.fetchLinks();
  }

  // handleLinkClick = (e)=>{
  //   this.props.chooseLink(e.target.dataset['linkid']);
  // }

  handleLinkClick = (id)=>{
    this.props.chooseLink(id);
  }

  handleLinkAdd = (e)=>{
    this.props.addLink();
  }

  handleTargetChoice = (e)=>{
    e.preventDefault();
    this.setState({
      target:e.target.dataset['target']
    });
  }

  handleLinkDelete = (e)=>{
    e.preventDefault();
    this.props.deleteLink(e.target.dataset['link']);
  }

  handleCopyAllToClipboard = ()=>{
    let links = [];
    this.props.links.forEach((link)=>{
      if(link.target !== this.state.target && this.state.target !== "Все"){return false;}
      links.push(link.external_url);
    });
    if(typeof navigator.clipboard !== "undefined"){navigator.clipboard.writeText(links.join(",\n"))}else{NotificationService.throw('clipboard-error')};
    NotificationService.toast("link-copied");
  }

  render(){
    let links = this.props.links.map(
      (link)=>{
        if(link.target !== this.state.target && this.state.target !== "Все"){return false;}
        let thumb = this.props.thumbs.find((thumb)=>thumb.id === link.resource);
        return(
          <div data-linkid={link.id} key={"link"+link.id} className="link card-panel blue-grey lighten-2 white-text" onClick={()=>{this.handleLinkClick(link.id)}}>
            <i className="fas fa-trash-alt delete-link" data-link={link.id} onClick={this.handleLinkDelete}></i>
            <div><b>Ссылка:</b>{link.external_url}</div>
          <div><b>Органичение по запросам: </b>{link.max_requests}<b> раз, ссылка запрошена </b>{link.done_requests} раз</div>
        <div><b>Срок действия: по </b>{link.expires_by}</div>
      <div><b>Комментарий: </b>{link.comment}</div>
    <span className={"resource-preview"+(typeof thumb === 'undefined'?" resource-preview--loading":"")} style={{backgroundImage:typeof thumb === 'undefined'?"none":"url(/catalogue/node/item/resource/"+thumb.thumb_id+".jpg)"}}></span>
          </div>
        )
      }
    );
    let tabs = ["Все"].concat(this.props.targets).map((target)=>{
        return(
          <span className={"waves-effect hoverable waves-light card-panel target-panel"+(target===this.state.target?" cyan accent-1 grey-text text-darken-2":" cyan darken-1 white-text")} data-target={target} onClick={this.handleTargetChoice}>{target}</span>
        )
    })
    return(
      <div className="link-list blue-grey lighten-5">
        <div className="component-header">
          <h2 className="component-title">
            Ссылки
          </h2>
        </div>
        <div className="component-body">
          <div className="component-body__top-section">
            <button onClick={this.handleLinkAdd} style={{float:"none"}} className="blue-grey waves-effect hoverable waves-light btn add-button" type="button"><i className="fas fa-plus-circle"></i>Добавить</button>
          <button onClick={this.handleCopyAllToClipboard} style={{float:"none"}} className="blue-grey waves-effect hoverable waves-light btn add-button" type="button"><i className="fas fa-copy"></i>Скопировать все</button>
            <div className="link-list__tabs col s12">
              {tabs}
            </div>
            {links.length==0?(<div className="resource card-panel red lighten-1 white-text">Нет ссылок</div>):links}
          </div>
        </div>
      </div>
    );
  }

}

const mapStateToProps = (state) =>{
  return {
    links: state.link.links_done,
    editing: state.link.link_editing,
    adding: state.link.link_adding,
    targets: getLinkTargets(state),
    thumbs: state.resource.resources_thumbnails
  }
}

const mapDispatchToProps = {
    chooseLink,
    addLink,
    fetchLinks,
    deleteLink
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkList);
