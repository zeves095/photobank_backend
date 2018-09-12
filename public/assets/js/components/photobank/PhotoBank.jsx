class CatalogueTree extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      "catalogue_data": this.props.catalogue_data,
      "catalogue_nodes": [],
      "catalogue_tree": [],
      "current_node": 0,
      "crumbs": []
    }
    this.getCatalogueNodes = this.getCatalogueNodes.bind(this);
    this.getNodeById = this.getNodeById.bind(this);
    this.getNodeParent = this.getNodeParent.bind(this);
    this.getNodeChildren = this.getNodeChildren.bind(this);
    this.getNodeLevel = this.getNodeLevel.bind(this);
    this.populateTree = this.populateTree.bind(this);
    this.getEntity = this.getEntity.bind(this);
    this.getCrumbs = this.getCrumbs.bind(this);
    this.nodeChoiceHandler = this.nodeChoiceHandler.bind(this);
  }

  getCatalogueNodes(data){
    let nodes = this.getEntity("cnode", data);
    this.state.catalogue_nodes = nodes;
    let catalogueData = [];
    catalogueData = nodes.map((cnode)=>{
      cnode.hasChildren = this.getNodeChildren(cnode).length>0;
      cnode.catLevel = 0;
      cnode.level = this.getNodeLevel(cnode);
      return cnode;
    });
    this.setState({
      "catalogue_nodes": catalogueData
    });
    let catalogueTree = this.populateTree(this.state.current_node);
    this.setState({
      "catalogue_tree": catalogueTree
    });
    this.getCrumbs();
  }

  getEntity(type, src){
    let result = [];
    for(var i = 0; i<src.length; i++){
      if(src[i].type == type){
        result.push(src[i]);
      }
    }
    return result;
  }

  populateTree(baseParent=0){
    let element = [];
    let parent = this.getNodeById(baseParent);
    let children = this.getNodeChildren(parent);
    for(var i = 0; i<children.length; i++){
      let child = children[i];
      if(child.hasChildren){
        element.push(<span key={child.id} className="cat_item parent" onClick={this.nodeChoiceHandler} data-node={child.id}><b data-node={child.id}>{child.name}</b></span>);
      } else {
        element.push(<span key={child.id} className="cat_item child" onClick={this.nodeChoiceHandler} data-node={child.id}><b data-node={child.id}>{child.name}</b></span>)  ;
      }
    }
    return element;
  }

  getCrumbs(){
    let crumbs = [];
    let cur_node = this.getNodeById(this.state.current_node);
    cur_node.active = true;
    crumbs.push(cur_node);
    while(this.getNodeParent(cur_node) != cur_node && this.getNodeParent(cur_node)!= null){
      let parent = this.getNodeParent(cur_node);
      parent.active = false;
      crumbs.push(parent);
      cur_node = this.getNodeById(parent.id);
    }
    crumbs = crumbs.map((crumb)=><span key={crumb.name} data-node={crumb.id} className={crumb.active?"active":""} onClick={this.nodeChoiceHandler}>{crumb.name}</span>);
    crumbs.reverse();
    this.setState({
      "crumbs":crumbs
    });
  }

  getNodeParent(node){
    for(var i = 0; i<this.state.catalogue_nodes.length; i++){
      if(node.parent == this.state.catalogue_nodes[i].id){
        return this.state.catalogue_nodes[i];
      }
    }
    return null;
  }

  getNodeById(id){
    for(var i = 0; i<this.state.catalogue_nodes.length; i++){
      if(id == this.state.catalogue_nodes[i].id){
        return this.state.catalogue_nodes[i];
      }
    }
    return null;
  }

  getNodeChildren(node){
    let children = [];
    for(var i = 0; i<this.state.catalogue_nodes.length; i++){
      if(node.id == this.state.catalogue_nodes[i].parent && node.id !== this.state.catalogue_nodes[i].id){
        children.push(this.state.catalogue_nodes[i]);
      }
    }
    return children;
  }

  getNodeLevel(node){
    if(node.parent !== 0){
      return this.getNodeLevel(this.getNodeParent(node))+1;
    }
    return 0;
  }

  nodeChoiceHandler(e){
    e.stopPropagation();
    let curr_id = e.target.getAttribute('data-node');
    this.state.current_node = curr_id;
    this.getCatalogueNodes(this.props.catalogue_data);
    this.props.nodeChoiceHandler(curr_id);
  }

  componentDidMount(){
    this.getCatalogueNodes(this.props.catalogue_data);
  }

  render() {
    return (
      <div className="catalogue_tree">
        <h2 className="component_title">Каталог</h2>
        <div>
          <div className="crumbs">
            {this.state.crumbs}
          </div>
          <div className="catalogue_tree_inner">
          {this.state.catalogue_tree}
          </div>
        </div>
      </div>
    );
  }
}

class NodeViewer extends React.Component{
  constructor(props) {
    super(props);
    this.state ={
      "catalogue_data": this.props.catalogue_data,
      "node": this.props.node,
      "node_items": []
    }
    this.getItems = this.getItems.bind(this);
  }

  componentDidUpdate(prevProps){
    if(this.props.node !== prevProps.node){
      this.setState({
        "catalogue_data": this.props.catalogue_data,
        "node": this.props.node,
        "node_items": this.getItems(this.props.node)
      });
    }
  }

  componentDidMount(){
    this.setState({
      "node_items": this.getItems()
    });
  }

  getItems(nodeId = this.state.node){
    let items = [];
    for(var i = 0; i<this.state.catalogue_data.length; i++){
      let item = this.state.catalogue_data[i];
      if(item.type == "item" && item.parent == nodeId){
        items.push(item);
      }
    }
    return items
  }

  render() {
    return (
      <div className="node_viewer">
        <h2 className="component_title">Просмотр категории</h2>
        <div className="node_viewer_inner">
        {this.state.node_items.map((item)=><div key={item.id}><ItemSection item_id={item.id} open_by_default={false}/></div>)}
        </div>
      </div>
    );
  }
}

class ItemSection extends React.Component{
  constructor(props) {
    super(props);
    if(typeof window.resumableContainer[this.props.item_id] == 'undefined'){
      this.resumable = new Resumable({target: '/api/upload/'});
    } else {
      this.resumable = window.resumableContainer[this.props.item_id];
    }
    this.state={
      "resumable":this.resumable,
      "item_id":this.props.item_id,
      "open":this.props.open_by_default,
      "ready":false
    };
    this.hashPool = [];
    this.uploads = [];

    this.buildList = this.buildList.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.getHash = this.getHash.bind(this);
    this.resolveResumedUploads = this.resolveResumedUploads.bind(this);
  }

  buildList() {
    if (typeof this.updateListTimer != 'undefined') {
      clearTimeout(this.updateListTimer);
    }
    this.updateListTimer = setTimeout(function() {
      let unfinishedUploads = $("#unfinished_uploads").val().split("|");

      this.uploads = [];

      if (unfinishedUploads !== "") {
        for (var i = 0; i < unfinishedUploads.length; i++) {
          let unfinishedParts = unfinishedUploads[i].split(',');
          if(unfinishedParts[0]==this.state.item_id){
            this.uploads.push({'filename': unfinishedParts[1], 'filehash': unfinishedParts[2], 'class': "unfinished", "ready": true});
          }
        }
      }

      for (var i = 0; i < this.resumable.files.length; i++) {
        let className = this.resumable.files[i].isComplete()?"completed":"pending";
        this.uploads.push({"filename": this.resumable.files[i].fileName, "filehash": this.resumable.files[i].uniqueIdentifier, "class": className, "ready": this.resumable.files[i].ready});
      }

      this.resolveResumedUploads();

      let uploads = this.uploads.map((upload)=><span key={upload.filename+upload.filehash} className={upload.class + (upload.ready? "": " processing")}>F: {upload.filename}<span className="delete_upload" data-item={upload.filehash} onClick={this.handleDelete}>X</span></span>);
      this.setState({
        "uploads":uploads
      });
    }.bind(this), 300);
  }

  resolveResumedUploads(){
    for (var i = 0; i < this.uploads.length; i++) {
      for (var j = 0; j < this.uploads.length; j++) {
        if (this.uploads[i]["class"] == "unfinished" && i != j && this.uploads[i]["filename"] == this.uploads[j]["filename"] && this.uploads[i]["itemId"] == this.uploads[j]["itemId"] && this.uploads[i]["filehash"] == this.uploads[j]["filehash"]) {
          this.uploads.splice(i, 1);
          this.resolveResumedUploads();
        }
      }
    }
  }

  getHash(file) {
    let fileObj = file.file;
    let reader = new FileReader();
    reader.onload = function(e) {
      let hashable = e.target.result;
      hashable = new Uint8Array(hashable);
      hashable = CRC32.buf(hashable).toString();
      file.uniqueIdentifier = hex_md5(hashable+file.itemId + file.file.size);
      file.ready = true;
      this.buildList();
    }.bind(this);
    reader.readAsArrayBuffer(fileObj);
    this.buildList();
  }

  handleSubmit(){
    let ready = true;
    for(var i = 0; i< this.resumable.files.length; i++){
      if (!this.resumable.files[i].ready){
        ready = false;
      }
    }
    console.log(ready);
    if (ready) {
      let uploadData = {};
      for (var i = 0; i < this.resumable.files.length; i++) {
        let obj = {
          'filehash': this.resumable.files[i].uniqueIdentifier,
          'filename': this.resumable.files[i].fileName,
          'itemid': this.resumable.files[i].itemId,
          'totalchuks': this.resumable.files[i].chunks.length
        }
        uploadData[i] = obj;
      }
      $.ajax({url: '/api/upload/commit', method: 'POST', data: uploadData})
      this.resumable.upload();
    }
  }

  componentDidMount(){
    this.resumable.assignBrowse(document.getElementById("browse" + this.props.item_id));
    this.resumable.assignDrop(document.getElementById("drop_target" + this.props.item_id));
    this.resumable.on('fileAdded', function(file, event) {
      file.itemId = this.state.item_id;
      file.ready = false;
      //this.hashPool.push(file);
      this.getHash(file);
      if(window.resumableContainer[this.state.item_id] == undefined){
        window.resumableContainer[this.props.item_id] = this.resumable;
      }
    }.bind(this));
    this.resumable.on('fileSuccess', function(file,event){
      this.buildList();
    }.bind(this));
    this.buildList();
  }

  handleDelete(e){
    let filehash = $(e.target).data("item");
    for(var i = 0; i<this.resumable.files.length; i++){
      console.log(this.resumable.files[i].uniqueIdentifier);
      console.log(filehash);
      console.log(this.resumable.files[i].uniqueIdentifier == filehash);
      if(this.resumable.files[i].uniqueIdentifier == filehash){
        this.resumable.files.splice(i,1);
        this.buildList();
      }
    }
  }

  render() {
    return (
      <div className="item_view">
        <h4 onClick={()=>{this.setState({"open":!this.state.open})}}>{this.state.item_id}</h4>
        <div className={this.state.open?"item_view_inner open":"item_view_inner"}>
        <div className="file_list" id={"file_list" + this.props.item_id}>{this.state.uploads}</div>
        <div className="drop_target" id={"drop_target" + this.props.item_id}></div>
        <div className="button_block">
          <button type="button" id={"browse" + this.props.item_id}>Выбрать</button>
          <button type="button" onClick={this.handleSubmit} id={"submit" + this.props.item_id}>Загрузить</button>
        </div>
        </div>
      </div>
    );
  }
}

class UploadPool extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      "resumable_container": window.resumableContainer,
      "pool":[]
    }
    this.getResumableList = this.getResumableList.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };

  getResumableList(){
    let resumables = [];
    let res_container = this.state.resumable_container;
    for(var itemId in res_container){
      resumables.push(<ItemSection key={itemId} item_id={itemId} open_by_default={true} />);
    }
    this.setState({
      "pool":resumables
    });
  }

  componentDidMount(){
    let container = window.resumableContainer;
    this.state.resumable_container = container;
    this.getResumableList();
  }

  handleSubmit(){
    for(var res in this.state.resumable_container){
      this.state.resumable_container[res].upload();
    }
  }

  render(){
    return(
      <div className="upload_pool">
        <h2 className="component_title">Загрузки</h2>
        <div className="upload_pool_inner">
          {this.state.pool}
          <button type="button" onClick={this.handleSubmit}>Загрузить</button>
        </div>
      </div>
    );
  }
}

class PhotoBank extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      "catalogue_data": [],
      "view_pool": false
    }
    this.fetchUnfinished();
    this.handleNodeChoice = this.handleNodeChoice.bind(this);
  }

  fetchUnfinished(){
    let unfinishedUploads = $("#unfinished_uploads").val().split("|");
    if (unfinishedUploads[0] !== "") {
      for (var i = 0; i < unfinishedUploads.length; i++) {
        let unfinishedParts = unfinishedUploads[i].split(',');
        if(typeof window.resumableContainer[unfinishedParts[0]] == 'undefined'){
          window.resumableContainer[unfinishedParts[0]]=new Resumable({target: '/api/upload/'});
        }
        if(unfinishedParts[0]==this.state.item_id){
          this.uploads.push({'filename': unfinishedParts[1], 'filehash': unfinishedParts[2], 'class': "unfinished", "ready": true});
        }
      }
    }
  }

  handleNodeChoice(id){
    this.setState({
      "selected_node": id
    });
  }

  componentWillMount(){
    $.getJSON("/assets/js/components/photobank/dummy_data1.json", (data)=>{
      this.setState({
        "catalogue_data":data,
        "selected_node":0
      });
    });
  }

  render() {
    if(this.state.catalogue_data.length>0){
    return (
      <div className="photobank_main">
      <div className="main_block">
        <CatalogueTree catalogue_data={this.state.catalogue_data} nodeChoiceHandler={this.handleNodeChoice} />
        <NodeViewer catalogue_data={this.state.catalogue_data} node={this.state.selected_node} />
        </div>
        {this.state.view_pool?<UploadPool />:""}
        <div className="butt-wrapper">
        <button type="button" className=" large_btn" onClick={()=>{this.setState({"view_pool":!this.state.view_pool})}}>{this.state.view_pool?"Скрыть":"Загрузки"}</button>
        </div>
      </div>
    );
  } else {return (<h1>ЗАГРУЗКА...</h1>)}
  }
}

if(typeof PhotoBank != 'undefined') ReactDOM.render(<PhotoBank />, document.getElementById('photobank-wrapper'));
