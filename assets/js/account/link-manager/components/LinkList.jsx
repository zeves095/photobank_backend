import React, {Component} from 'react';
import {connect} from 'react-redux';
import { getLinkTargets } from '../selectors';
import { chooseLink, addLink, fetchLinks, deleteLink, stopEditing } from '../actionCreator'
import {NotificationService} from '../../../services/NotificationService';
import {ModalImage} from '../../../common/ModalImage';
export class LinkList extends React.Component{

  constructor(props){
    super(props);
    this.state={
      target:"Все",
      modal_image_url:""
    };
  }

  componentDidMount(){
    this.props.fetchLinks();
  }

  // handleLinkClick = (e)=>{
  //   this.props.chooseLink(e.target.dataset['linkid']);
  // }

  handleLinkClick = (id)=>{
    //this.props.chooseLink(id);
  }

  handleLinkAdd = (e)=>{
    this.props.editing||this.props.adding?this.props.stopEditing():this.props.addLink();
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
      links.push('https://photobank.domfarfora.ru'+link.external_url);
    });
    if(typeof navigator.clipboard !== "undefined"){navigator.clipboard.writeText(links.join(",\n"))}else{NotificationService.throw('clipboard-error')};
    NotificationService.toast("link-copied");
  }

  handleGetTxt =()=>{
    let links = this.props.links
    .filter((link)=>{
        return link.target == this.state.target || this.state.target == "Все";
    })
    .map((link)=>{
        return(link.link_id);
      }
    );
    if(links.length === 0){NotificationService.toast("custom", "Нет ссылок"); return;}
    let linkTxtForm = document.createElement("form");
    linkTxtForm.target = "_blank";
    linkTxtForm.method = "POST";
    linkTxtForm.action = "/api/links/txt/";
    let linkTxtInput = document.createElement("input");
    linkTxtInput.type = "text";
    linkTxtInput.name = "links";
    linkTxtInput.value = links;
    linkTxtForm.appendChild(linkTxtInput);
    document.body.appendChild(linkTxtForm);
    linkTxtForm.submit();
    linkTxtForm.remove();
  }

  handleModalImage = (link)=>{
    this.setState({
      modal_image_url: link
    });
  }

  handleModalClose = ()=>{
    this.setState({
      modal_image_url: ""
    });
  }

  render(){
    let links = this.props.links.map(
      (link)=>{
        if(link.target !== this.state.target && this.state.target !== "Все"){return false;}
        let thumb = this.props.thumbs.find((thumb)=>thumb.id === link.resource_id);
        return(
          <div data-linkid={link.link_id} key={"link"+link.link_id} className="link " onClick={()=>{this.handleLinkClick(link.link_id)}}>
            <i className="fas fa-trash-alt delete-link" data-link={link.link_id} onClick={this.handleLinkDelete}></i>
            <div className="link-info">
            <div><b>Ссылка:</b><a href={'https://photobank.domfarfora.ru'+link.external_url}>{'https://photobank.domfarfora.ru'+link.external_url}</a></div>
          <div><b>Товар: </b>{link.item_name}({link.item_id})</div>
          </div>
        <span className={"resource-preview"+(typeof thumb === 'undefined'?" resource-preview--loading":"")} style={{backgroundImage:typeof thumb === 'undefined'?"none":"url(/catalogue/node/item/resource/"+thumb.thumb_id+".jpg)"}} onClick={()=>{this.handleModalImage("/catalogue/node/item/resource/"+thumb.id+".jpg")}}></span>
          </div>
        )
      }
    );
    let tabs = ["Все"].concat(this.props.targets).map((target)=>{
        return(
          <button className={(target===this.state.target?" active":"")} data-target={target} onClick={this.handleTargetChoice}>{target}</button>
        )
    })
    return(
      <div className={"link-list "+(this.props.adding||this.props.editing?"shrunk":"")}>
        {this.state.modal_image_url !== ""?<ModalImage image_url={this.state.modal_image_url} closeModalHandler={this.handleModalClose} />:null}
        <div className="component-header">
          <h2 className="component-title">
            Ссылки
          </h2>
        </div>
        <div className="component-body">
          <div className="component-body__top-section">
            <div className="button-block">
              <button onClick={this.handleLinkAdd} style={{float:"none"}} className=" waves-effect hoverable waves-light btn add-button" type="button">{this.props.adding||this.props.editing?(<span><i className="fas fa-ban"></i>Отмена</span>):(<span><i className="fas fa-plus-circle"></i>Добавить</span>)}</button>
              <button onClick={this.handleCopyAllToClipboard} style={{float:"none"}} className=" waves-effect hoverable waves-light btn add-button" type="button"><i className="fas fa-copy"></i>Скопировать все</button>
            <button onClick={this.handleGetTxt} style={{float:"none"}} className=" waves-effect hoverable waves-light btn add-button" type="button"><i className="fas fa-align-justify"></i>Скачать ссылки</button>
            </div>
            <div className="link-list__tabs button-block">
              {tabs}
            </div>
            {links.length==0?(<div className="resource plaque warning"><i className="fas fa-times-circle"></i>Нет ссылок</div>):links}
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
    deleteLink,
    stopEditing
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkList);
