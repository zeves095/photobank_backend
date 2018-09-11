class CatalogueTree extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      "catalogue_data": this.props.catalogue_data,
      "catalogue_nodes": [],
      "catalogue_tree": []
    }
    this.parseCatalogueStructure = this.parseCatalogueStructure.bind(this);
    this.getNodeById = this.getNodeById.bind(this);
    this.getNodeParent = this.getNodeParent.bind(this);
    this.getNodeChildren = this.getNodeChildren.bind(this);
    this.getNodeLevel = this.getNodeLevel.bind(this);
    this.populateTree = this.populateTree.bind(this);
    this.getEntity = this.getEntity.bind(this);
  }

  parseCatalogueStructure(data){
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
    let catalogueTree = this.populateTree();
    this.setState({
      "catalogue_tree": catalogueTree
    });
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
        element.push(<li key={child.id}><b data-node={child.id} onClick={this.props.nodeChoiceHandler}>{child.name}</b><ul>{this.populateTree(child.id)}</ul></li>);
      } else {
        element.push(<li key={child.id}><b data-node={child.id} onClick={this.props.nodeChoiceHandler}>{child.name}</b></li>)  ;
      }
    }
    return element;
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

  componentDidMount(){
    if(this.state.catalogue_data.length>0){
      this.parseCatalogueStructure(this.props.catalogue_data);
    }
  }

  render() {
    return (
      <div className="catalogue_tree">
        <ul>
          {this.state.catalogue_tree}
        </ul>
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
        {this.state.node_items.map((item)=><div key={item.id}><h4>{item.name}</h4><ItemSection item_id={item.id} /></div>)}
      </div>
    );
  }
}

class ItemSection extends React.Component{
  constructor(props) {
    super(props);
    this.resumable = new Resumable({target: '/api/upload'});
  }
  componentDidMount(){
    this.resumable.assignBrowse(document.getElementById("browse" + this.props.item_id));
    this.resumable.assignDrop(document.getElementById('dropTarget'));
  }
  render() {
    return (
      <div className="item-view">
        <button type="button" id={"browse" + this.props.item_id}>browse</button>
        <button type="button" onclick={this.resumable.upload()} id={"submit" + this.props.item_id}>submit</button>
      </div>
    );
  }
}

class PhotoBank extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      "catalogue_data": []
    }

    this.handleNodeChoice = this.handleNodeChoice.bind(this);
  }

  handleNodeChoice(e){
    e.stopPropagation();
    let selectedNode = e.target.getAttribute('data-node');
    this.setState({
      "selected_node": selectedNode
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
      <div className="photobank-main">
        <CatalogueTree catalogue_data={this.state.catalogue_data} nodeChoiceHandler={this.handleNodeChoice} />
        <NodeViewer catalogue_data={this.state.catalogue_data} node={this.state.selected_node} />
      </div>
    );
  } else {return (<h1>LOADING</h1>)}
  }
}

if(typeof PhotoBank != 'undefined') ReactDOM.render(<PhotoBank />, document.getElementById('photobank-wrapper'));
