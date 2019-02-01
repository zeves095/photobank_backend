import React from 'react';
// import $ from 'jquery';

import CatalogueTree from './CatalogueTree';
import NodeViewer from './NodeViewer';
import { Draggable } from './../../common/Draggable';
import {ItemQueryObject} from '../services/ItemQueryObject';
import {ResourceService} from './../../services/ResourceService';
import {UploadService} from '../services/UploadService';
import {CatalogueService} from '../services/CatalogueService';
import {LocalStorageService} from '../services/LocalStorageService';
import {NotificationService} from '../../services/NotificationService';
import {UtilityService} from '../services/UtilityService';

import {connect} from 'react-redux';
import { fetchUnfinished, getLocalStorage, getUserInfo } from '../actionCreator'
import selectors from '../selectors';

/**
 * Верхнеуровневый компонент интерфейса загрузки/выгрузки ресурсов
 */
export class PhotoBank extends React.Component {

  /**
   * Конструктор компонента
   * crumb_string - Строка хлебных крошек, разделенная / для отображения в ItemSection
   * item_query_object - Объект поиска товаров
   * ls_node - Сохраненный в localstorage идентификатор выбранного раздела каталога
   * authorized - Имеет ли текущий пользователь права редактора
   */
  constructor(props) {
    super(props);
  }

  /**
   * Получает сохраненные значения из localstorage
   */
  componentWillMount(){
    this.props.fetchUnfinished();
    this.props.getLocalStorage();
    this.props.getUserInfo();
  }

  render() {
    if(this.props.catalogue_data == {}){return (<h1>ЗАГРУЗКА...</h1>)}
    return (
      <div className="photobank-main">
        <div id="notification-overlay"></div>
      <div className="photobank-main__main-block">
        <CatalogueTree />
      {$(".catalogue-tree").length>0?<Draggable box1=".catalogue-tree" box2=".node-viewer" id="1" />:null}
      {this.props.show_node_viewer == null?null:<NodeViewer />}
        </div>
        <div className="photobank-main__butt-wrapper">
        </div>
      </div>
    );
}
}

const mapStateToProps = (state,props) =>{
  return {
    show_node_viewer: state.catalogue.item_query_object==null,
    catalogue_data: selectors.catalogue.getCatalogueData(state,props)
  }
}

const mapDispatchToProps = {
  fetchUnfinished,
  getLocalStorage,
  getUserInfo
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotoBank);
