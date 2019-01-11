import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import { getResourcesWithThumbnails } from '../selectors';
import { chooseResource, addResourceToPool } from '../actionCreator';
import {ModalImage} from '../../../common/ModalImage';

/**
 * Результаты поиска ресурсов
 */
export class ResourceSearchResults extends React.Component{
  /**
   * Конструктор компонента
   * @param {Object} props Входные данные из коннекта Redux
   */
  constructor(props){
    super(props);
    this.state={
      "modal_image_url":""
    };
  }

  /**
   * Обработчик добавления ресурса в список для создания группы ссылок
   * @param  {Event} e Событие клика на ресурс
   */
  handleAddResourceToPool = (e)=>{
    e.stopPropagation();
    this.props.addResourceToPool(parseInt(e.target.dataset['res'], 10));
  }

  /**
   * Обработчик добавления всех найденных в поиске ресурсов в список для создания группы ссылок
   * @param  {Event} e Событие клика
   */
  handleChooseAll = (e)=>{
    this.props.resources_found.forEach((resource)=>{
      this.props.addResourceToPool(parseInt(resource.id, 10));
    });
  }

  /**
   * Обработчик открытия модаьного окна с превью изображения ресурса
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

  render(){
    let tooManyResources = this.props.resources_found.length == 100;
    let resources = this.props.resources_found.map((resource)=>{
      let colorclass = this.props.resources_chosen.find((res)=>{return res.id === resource.id})?"selected":"default";
      let thumb_style = typeof resource.thumbnail === 'undefined'?{}:{backgroundImage:"url(/catalogue/node/item/resource/"+resource.thumbnail+".jpg)"};
      return(
        <div data-res={resource.id} key={"resource"+resource.id} className={"resource list-item "+colorclass} onClick={this.handleAddResourceToPool}>
          <span className={"resource-preview"+(typeof resource.thumbnail === 'undefined'?" resource-preview--loading":"")} style={thumb_style}  onClick={(e)=>{e.stopPropagation();this.handleModalImage("/catalogue/node/item/resource/"+resource.id+".jpg")}}></span>

        {resource.item.name+"("+resource.item.id+")"}
        {resource.size_px}
        </div>
      )
    });
    return (
      <div className={"resource-search-results" + (this.props.loading?" loading":"")}>
        {this.state.modal_image_url !== ""?<ModalImage image_url={this.state.modal_image_url} closeModalHandler={this.handleModalClose} />:null}
        <div className="component-header component-header--subcomponent">
          <h2 className="component-title">
            Результаты поиска
          </h2>
          {this.props.resources_found.length>0?<div className="button-block"><button className=" waves-effect hoverable waves-light btn" type="button" name="button" onClick={this.handleChooseAll}>Выбрать все</button></div>:null}
        </div>
        <div className="component-body component-body--subcomponent">
          {tooManyResources?(<div className="resource plaque warning"><i className="fas fa-times-circle left-icon"></i>Показаны не все результаты. Необходимо сузить критерии поиска.</div>):null}
          <div className="search-results">
          {this.props.resources_found.length==0?"Нет ресурсов":resources}
          </div>
        </div>
      </div>
    );
  }

}
const mapStateToProps = (state) =>{
  return {
    resources_found: getResourcesWithThumbnails(state),
    resources_chosen: state.resource.resource_chosen,
    loading: state.ui.loading.resource_search_results
  }
}

const mapDispatchToProps = {
  chooseResource,
  addResourceToPool
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceSearchResults);
