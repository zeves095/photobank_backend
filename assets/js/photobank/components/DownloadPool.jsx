import React from 'react';
import {connect} from 'react-redux';

import {ResourceService} from './../../services/ResourceService';
import {NotificationService} from '../../services/NotificationService';
import selectors from '../selectors';
import {clearDownloads, downloadResources, getDownloadResourceData, removeDownload} from '../actionCreator';
import utility from '../services/UtilityService';

/**
 * Компонент интерфейса bulk-загрузки файлов с сервера
 */
export class DownloadPool extends React.Component{

  /**
   * Конструктор компонента
   * downloads - Массив данных о готовых загрузках
   * loading - Находится ли компонент в состоянии ожидания
   */
  constructor(props){
    super(props);
    this.state = {
      "loading": false,
      "downloads": []
    }
  };

  /**
   * Обработчик начала загрузки файлов
   */
  handleDownload=()=>{
    this.props.downloadResources(this.props.resources);
  }

  /**
   * Обработчик удаления файла из очереди загрузок
   * @param  {Number} id Id файла
   */
  handleRemoveDownload=(id)=>{
    this.props.removeDownload(id);
  }

  componentDidMount(){
    this.props.getDownloadResourceData(this.props.resources);
  }

  componentDidUpdate(prevProps){
    this.props.resources!==prevProps.resources&&this.props.getDownloadResourceData(this.props.resources);
  }

  render(){
    if(0 === this.props.downloads.length){return "Нет загрузок"}
    let downloads = this.props.downloads.map((download)=>{
      return(
        <div key={"dl"+download.id} className="pending-download">
          <div className="download-thumbnail" style={{"backgroundImage":"url("+ResourceService._getLinkById(download.id)+")"}}></div>
        <div className="download-infofields">
          <div className="download-infofields__field name">
            Имя:{download.name}
          </div>
          <div className="download-infofields__field sizepx">
          Размер:{download.sizepx}
          </div>
          <button type="button" data-download={download.id} onClick={()=>{this.handleRemoveDownload(download.id)}}><i className="fas fa-trash-alt"></i>Отменить</button>
        </div>
        </div>
      )
    });
    return(
      <div className={(this.state.loading?"loading":"")}>
        {this.props.resources.length != 0?
        <div className="download-pool">
        <h2 className="download-pool__component-title component-title">Загрузки</h2>
        <button type="button" onClick={this.handleDownload}>Скачать все</button>
      <div className="download-pool__pending-wrapper">
        {downloads}
      </div>
        <button type="button" className="download-all-btn" onClick={this.handleDownload}>Скачать все</button>
    </div>
        :<h2>Нет загрузок</h2>}
      </div>
    );
  }
}

const mapStateToProps = (state,props) =>{
  return {
    resources: selectors.localstorage.getPendingDownloads(state,props),
    downloads: selectors.resource.getDownloadData(state,props),
  }
}

const mapDispatchToProps = {
  removeDownload,
  clearDownloads,
  downloadResources,
  getDownloadResourceData
}

export default connect(mapStateToProps, mapDispatchToProps)(DownloadPool);
