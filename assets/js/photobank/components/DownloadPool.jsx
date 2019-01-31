import React from 'react';
// import $ from 'jquery';
import {ResourceService} from './../../services/ResourceService';
import {NotificationService} from '../../services/NotificationService';

import {connect} from 'react-redux';
import selectors from '../selectors';

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
    ResourceService.downloadResource(this.props.resources);
  }

  /**
   * Обработчик удаления файла из очереди загрузок
   * @param  {Event} e Событие клика
   */
  handleRemoveDownload=(e)=>{
    let id = e.target.dataset["download"];
    this.props.removeDownloadHandler(id);
  }

  componentDidMount(){
    this.setState({
      "loading": true
    });
    this.populateDownloads();
  }

  componentDidUpdate(prevProps){
    if(prevProps != this.props){
      this.populateDownloads();
    }
  }

  /**
   * Создает массив данных о загрузках для отображения
   */
  populateDownloads=()=>{
    let downloads = [];
    ResourceService.getResource(this.props.resources).then((res)=>{
      for(var r in res){
        if(res[r] == ""){continue;}
        downloads.push({
          "id": res[r].id,
          "preset": Object.keys(window.config["presets"])[res[r].preset],
          "name": res[r].src_filename,
          "sizepx": res[r].size_px
        });
      }
      this.setState({
        "downloads": downloads,
        "loading":false
      });
    }).catch((error)=>{
      NotificationService.throw(error);
    });
  }

  render(){
    //if(this.props.downloads.length == 0){return "Нет загрузок"}
    let downloads = this.state.downloads.map((download)=>{
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
          <button type="button" data-download={download.id} onClick={this.handleRemoveDownload}><i className="fas fa-trash-alt"></i>Отменить</button>
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
        <button type="button" onClick={this.handleDownload}>Скачать все</button>
    </div>
        :<h2>Нет загрузок</h2>}
      </div>
    );
  }
}

const mapStateToProps = (state,props) =>{
  return {
    resources: selectors.localstorage.getPendingDownloads(state,props)
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(DownloadPool);
