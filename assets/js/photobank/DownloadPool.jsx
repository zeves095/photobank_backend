import React from 'react';
// import $ from 'jquery';
import {ResourceService} from './services/ResourceService';

export class DownloadPool extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      "downloads": [],
    }
    this.handleDownload = this.handleDownload.bind(this);
    this.handleRemoveDownload = this.handleRemoveDownload.bind(this);
    this.populateDownloads = this.populateDownloads.bind(this);
  };

  handleDownload(){
    ResourceService.downloadResource(this.props.resources);
    this.props.addDownloadHandler();
  }

  handleRemoveDownload(e){
    let id = e.target.dataset["download"];
    this.props.removeDownloadHandler(id);
  }

  componentDidMount(){
    this.populateDownloads();
  }

  componentDidUpdate(prevProps){
    if(prevProps != this.props){
      this.populateDownloads();
    }
  }

  populateDownloads(){
    let downloads = [];
    ResourceService.getResource(this.props.resources).then((res)=>{
      for(var r in res){
        downloads.push({
          "id": res[r].id,
          "preset": Object.keys(window.config["presets"])[res[r].preset],
          "name": res[r].src_filename,
          "sizepx": res[r].size_px
        });
      }
      this.setState({
        "downloads": downloads
      });
    });
  }

  render(){
    if(this.state.downloads.length == 0){return null}
    let downloads = this.state.downloads.map((download)=>{
      return(
        <div key={"dl"+download.id} className="pending-download">
          <div className="download-thumbnail" style={{"backgroundImage":"url("+ResourceService._getLinkById(download.id)+")"}}></div>
        <div className="download-infofields">
          <div className="download-infofields__field">
            Имя:{download.name}
          </div>
          <div className="download-infofields__field">
          Размер:{download.sizepx}
        </div>
          <div className="download-infofields__field">
          Тип:{download.preset}
          </div>
          <button type="button" data-download={download.id} onClick={this.handleRemoveDownload}><i className="fas fa-trash-alt"></i>Отменить</button>
        </div>
        </div>
      )
    });
    return(
      <div className="download-pool">
        <h2 className="download-pool__component-title component-title">Загрузки</h2>
        <button type="button" onClick={this.handleDownload}>Скачать все</button>
        {downloads}
        <button type="button" onClick={this.handleDownload}>Скачать все</button>
      </div>
    );
  }
}
