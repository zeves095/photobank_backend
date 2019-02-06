import React from 'react';

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
import { fetchUnfinished, getLocalStorage, getUserInfo, init } from '../actionCreator'
import selectors from '../selectors';

/**
 * Верхнеуровневый компонент интерфейса загрузки/выгрузки ресурсов
 */
export class PhotoBank extends React.Component {

  /**
   * Конструктор компонента
   */
  constructor(props) {
    super(props);
    this.state = {
      ready: false
    }
  }

  /**
   * Инициализирует конфигурацию, localstorage, получает список незаконченных загрузок
   */
  componentWillMount(){
    this.props.init().then(()=>{
      this.setState({
        ready:true
      });
    });
  }

  render() {
    if(this.props.catalogue_data == {} || !this.state.ready){return (<h1>ЗАГРУЗКА...</h1>)}
    return (
      <div className="photobank-main">
        <div id="notification-overlay"></div>
      <div className="photobank-main__main-block">
        <CatalogueTree />
        <Draggable box1=".catalogue-tree" box2=".node-viewer" id="1" />
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
    catalogue_data: selectors.catalogue.getCatalogueData(state,props),
  }
}

const mapDispatchToProps = {
  fetchUnfinished,
  getLocalStorage,
  getUserInfo,
  init
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotoBank);
