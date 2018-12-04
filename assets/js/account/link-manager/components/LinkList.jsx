import React, {Component} from 'react';
import {connect} from 'react-redux';
import { getLinkTargets } from '../selectors';
import { chooseLink, addLink, fetchLinks } from '../actionCreator'

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

  handleLinkClick = (e)=>{
    this.props.chooseLink(e.target.dataset['linkid']);
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

  render(){
    let links = this.props.links.map(
      (link)=>{
        if(link.target !== this.state.target && this.state.target !== "Все"){return false;}
        return(
          <div data-linkid={link.id} key={"link"+link.id} className="link card-panel blue-grey lighten-2 white-text" onClick={this.handleLinkClick}>
            <div><b>Ссылка:</b>{link.external_url}</div>
          <div><b>Органичение по запросам: </b>{link.max_requests}<b> раз, ссылка запрошена </b>{link.done_requests} раз</div>
        <div><b>Срок действия: по </b>{link.expires_by}</div>
      <div><b>Комментарий: </b>{link.comment}</div>
          </div>
        )
      }
    );
    let tabs = ["Все"].concat(this.props.targets).map((target)=>{
        return(
          <span className="waves-effect waves-light card-panel teal white-text" data-target={target} onClick={this.handleTargetChoice}>{target}</span>
        )
    })
    return(
      <div className="link-list-inner">
        <div className="component-header">
          <h2 className="component-title">
            Ссылки
          </h2>
        </div>
        <div className="component-body">
          <div className="component-body__top-section">
            <button onClick={this.handleLinkAdd} style={{float:"none"}} className="waves-effect waves-light btn add-button" type="button">Добавить</button>
            <div className="link-list__tabs col s12">
              {tabs}
            </div>
            {links.length==0?"Нет ссылок":links}
          </div>
        </div>
      </div>
    );
  }

}

const mapStateToProps = (state) =>{
  return {
    links: state.link.links_done,
    targets: getLinkTargets(state)
  }
}

const mapDispatchToProps = {
    chooseLink,
    addLink,
    fetchLinks,
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkList);
