import React, {Component} from 'react';
import {connect} from 'react-redux';
import { getLinkTargets } from '../selectors';
import { chooseLink, addLink, fetchLinks, deleteLink, stopEditing } from '../actionCreator'
import {NotificationService} from '../../../services/NotificationService';
import {ModalImage} from '../../../common/ModalImage';
import {Confirmator} from '../../../common/Confirmator';
/**
 * Список существующих ссылок для текущего пользователя
 */
export class LinkList extends React.Component{
  /**
   * Конструктор компонента
   * links - Существующие ссылки для отображения
   * target - Целевая группа ссылок
   * modal_image_url - Ссылка на изображение для отображения в модальном окне предпросмотра
   * confirmatorQuestions - вопросы для компонента Confirmator
   * @param {Object} props Входные данные из коннекта Redux
   */
  constructor(props){
    super(props);
    this.state={
      links:[],
      target:"Все",
      modal_image_url:"",
      confirmatorQuestions:[
        "Вы уверены?"
      ],
    };
    this.eventHandler = {};
  }

  /**
   * Запрашивает существующие ссылки для текущего пользователя
   */
  componentDidMount(){
    this.props.fetchLinks();
  }

  /**
   * Фильтрует ссылки
   */
  componentDidUpdate(prevProps, prevState){
    if(prevProps.links !== this.props.links || prevState.f !== this.state.f ){
      this.setState({
        links:this.props.links.filter((item)=>{if(!this.state.f) return true; return JSON.stringify(item).includes(this.state.f);})
      });
    }
  }

  /**
   * Обработчик клика на ссылку. Пока не используется, в будущем планируется редактировать выбранную ссылку по клику
   * @param  {int} id Идентификатор ссылки
   */
  handleLinkClick = (id)=>{
    //this.props.chooseLink(id);
  }

  /**
   * Обработчик добавления новой ссылки
   * @param  {Event} e Событие клика
   */
  handleLinkAdd = (e)=>{
    this.props.editing||this.props.adding?this.props.stopEditing():this.props.addLink();
  }

  /**
   * Обработчик клика но группу ссылок
   * @param  {Event} e Событие клика
   */
  handleTargetChoice = (e)=>{
    e.preventDefault();
    this.setState({
      target:e.target.dataset['target']
    });
  }

  /**
   * Обработчик удаления ссылки
   * @param  {int} id Идентификатор ссылки для удаления
   */
  handleLinkDelete = (id)=>{
    this.props.deleteLink(id);
  }

  /**
   * Обработчик копирования всех отображаемых ссылок в буфер обмена
   */
  handleCopyAllToClipboard = ()=>{
    let links = [];
    this.state.links.forEach((link)=>{
      if(link.target !== this.state.target && this.state.target !== "Все"){return false;}
      links.push('https://photobank.domfarfora.ru'+link.external_url);
    });
    if(typeof navigator.clipboard !== "undefined"){navigator.clipboard.writeText(links.join(",\n"))}else{NotificationService.throw('clipboard-error')};
    NotificationService.toast("link-copied");
  }

  /**
   * Обработчик скачивания txt-файла с текстом всех отображаемых ссылок
   */
  handleGetTxt =()=>{
    let links = this.state.links
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

  /**
   * Обработчик открытия модального окна с превью изображения ресурса
   * @param  {int} link Идентификатор ссылки
   */
  handleModalImage = (link)=>{
    this.setState({
      modal_image_url: link
    });
  }

  /**
   * Обработчик закрытия модального окна
   */
  handleModalClose = ()=>{
    this.setState({
      modal_image_url: ""
    });
  }

  /**
   * Подписчик на события на странице для отлавливания комбинаций клавиш
   * @param  {Event} e Событие
   */
  listener = (e)=>{
    e = e || window.event;
    var key = e.which || e.keyCode; // keyCode detection
    var ctrl = e.ctrlKey ? e.ctrlKey : ((key === 17) ? true : false); // ctrl detection

    if ( key == 67 && ctrl ) {
        this.handleCopyAllToClipboard();
      }else if ( key == 83 && ctrl ) {
        e.preventDefault();
        this.handleGetTxt();
        return false;
      }
  }

  /**
   * Обработчик появления курсора мыши на области компонента, для ограничения событий нажатия клавиатурных сокращений
   */
  handleFocus = ()=>{
    document.body.addEventListener("keydown",this.listener);
  }

  /**
   * Обработчик исчезновения курсора мыши с области компонента, для ограничения событий нажатия клавиатурных сокращений
   */
  handleBlur = ()=>{
    document.body.removeEventListener('keydown', this.listener);
  }

  render(){
    let filter = <input type="search" className="link-filter" onChange={(e)=>{this.setState({f : e.target.value})}}  placeholder="Фильтр"/>
    let links = this.state.links.map(
      (link)=>{
        if(link.target !== this.state.target && this.state.target !== "Все"){return false;}
        let delete_btn = <i className="fas fa-trash-alt"></i>;
        let thumb = this.props.thumbs.find((thumb)=>thumb.id === link.resource_id);
        return(
          <div data-linkid={link.link_id} key={"link"+link.link_id} className="link " onClick={()=>{this.handleLinkClick(link.link_id)}}>
            <Confirmator questions={this.state.confirmatorQuestions} prehook={()=>{}} active={true} onConfirm={()=>{this.handleLinkDelete(link.link_id)}} inline={true} customClass={"delete-link"} disabled={false} buttonTitle={delete_btn} />
            <div className="link-info">
            <div><b>Ссылка:</b><a href={'https://photobank.domfarfora.ru'+link.external_url} target="_blank" >{'https://photobank.domfarfora.ru'+link.external_url}</a></div>
          <div><b>Товар: </b>{link.item_name}({link.item_id})</div>
          </div>
        <span className={"resource-preview"+(typeof thumb === 'undefined'?" resource-preview--loading":"")} style={{backgroundImage:typeof thumb === 'undefined'?"none":"url(/catalogue/node/item/resource/"+thumb.thumb_id+".jpg)"}} onClick={(e)=>{e.stopPropagation();this.handleModalImage("/catalogue/node/item/resource/"+thumb.id+".jpg")}}></span>
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
      <div className={"link-list "+(this.props.adding||this.props.editing?"shrunk":"")} onMouseEnter={this.handleFocus} onMouseLeave={this.handleBlur}>
        {this.state.modal_image_url !== ""?<ModalImage image_url={this.state.modal_image_url} closeModalHandler={this.handleModalClose} />:null}
        <div className="component-header">
          <h2 className="component-title">
            Ссылки
          </h2>
          {filter}
        </div>
        <div className={"component-body" + (this.props.loading?" loading":"")}>
          <div className="component-body__top-section">
            <div className="button-block">
              <button onClick={this.handleLinkAdd} style={{float:"none"}} className=" waves-effect hoverable waves-light btn add-button" type="button">{this.props.adding||this.props.editing?(<span><i className="fas fa-ban"></i>Отмена</span>):(<span><i className="fas fa-plus-circle"></i>Добавить</span>)}</button>
            <button onClick={this.handleCopyAllToClipboard} style={{float:"none"}} className=" waves-effect hoverable waves-light btn add-button" type="button"><i className="fas fa-copy"></i>Скопировать в буфер {!this.props.adding&&!this.props.editing&&(<span className="help-text">&lt;Ctrl&gt;+&lt;C&gt;</span>)}</button>
          <button onClick={this.handleGetTxt} style={{float:"none"}} className=" waves-effect hoverable waves-light btn add-button" type="button"><i className="fas fa-align-justify"></i>Скачать ссылки {!this.props.adding&&!this.props.editing&&(<span className="help-text">&lt;Ctrl&gt;+&lt;S&gt;</span>)}</button>
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
    thumbs: state.resource.resources_thumbnails,
    loading: state.ui.loading.link_list
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
