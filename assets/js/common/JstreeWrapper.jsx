import React, {Component} from 'react';
import $ from 'jquery';
import 'jstree/dist/jstree.min';
import 'jstree/dist/themes/default/style.css';

class JSTree extends React.Component {

  constructor(props){
    super(props);
    this.baseSettings = { core: { data: [] }, 'selected':[]};
    this.state = {
      settings : this.baseSettings
    };
    this.treeContainer = React.createRef();
  }

  makeTree=()=>{
    if($(this.treeContainer).jstree(true)){$(this.treeContainer).jstree(true).destroy();}
    let treeData = this.populateTree();
    let settings=this.state.settings;
    settings = {...this.state.settings, ...treeData};
    settings.state =  {
       "key" : this.props.collection===0?"catalogue_tree":"garbage_tree",
    };
    if(this.props.crud_enabled){
      settings = this.configureCrud(settings);
    }else{
      settings.plugins = ["themes", "html_data", "state"];
    }
    $(this.treeContainer).jstree(settings);
    this.assignHandlers();
    $(this.treeContainer).jstree(true).refresh(true);
  }

  updateTree = ()=>{
    let treeData = this.populateTree();
    let settings = this.state.settings;
    $(this.treeContainer).jstree(true).settings.core.data = treeData.core.data;
    $(this.treeContainer).jstree(true).settings.selected = treeData.selected;
    $(this.treeContainer).jstree(true).refresh(true);
  }

  populateTree = ()=>{
    let settings = this.state.settings;
    let treeData = this.props.catalogue_data.map((item)=>{
      let node = {
        'text':item.name,
        'parent':item.parent||"#",
        'id':item.id,
        'li_attr':{class:item.deleted?"deleted":""},
        'state':{
          'selected':this.props.current_node===item.id,
          'opened':this.props.current_node===item.id||!!settings.core.data.find(op=>op.id===item.id&&op.state.opened),
        }
      };
      return node;
    });
    let nodeToOpen = treeData.find(item=>item.state.selected===true);
    if(!!nodeToOpen)settings.selected=[nodeToOpen.id];
    while(typeof nodeToOpen != "undefined"){
      nodeToOpen.state.opened = true;
      nodeToOpen = treeData.find((parent)=>{return parent.id === nodeToOpen.parent});
    }
    settings.core.data = treeData;
    return settings;
  }

  configureCrud = (settings)=>{
    settings.plugins = ['contextmenu', 'dnd', "themes", "html_data", "state"];
    settings.core.check_callback = true;
    settings.contextmenu = {
      show_at_node: true,
      select_node:false,
      items: (node)=>{
        let tree = $.jstree.reference($(this.treeContainer));
        return{
          "add": {
            "label": "Создать подкаталог...",
            "action": () => {
              tree.select_node(node);
              setTimeout(()=>{
                let newNode = tree.create_node(node.id, {id:"%", text:"Новая папка"});
                tree.edit(newNode);
              },500);
            }
          },
          "rename": {
            "label": "Переименовать...",
            "action": () => {
              tree.edit(node);
            }
          },
          "delete": {
            "label": "Удалить",
            "action": () => {
              this.handleDeleteNode(node.id,node.parent);
            }
          }
        };
      }
    };
    settings.dnd = {
      check_while_dragging:false,
      use_html5:true,
      is_draggable:()=>true,
      responsive:true
    };
    return settings;
  }

  handleRenameNode = (id,text,parent)=>{
    this.props.onRename(id,text,parent);
  }

  handleDeleteNode = (id,parent)=>{
    this.props.onDelete(id,parent);
  }

  handleAddNode = (parent, text)=>{
    this.props.onCreate(parent,text);
  }

  handleMoveNode = (id, parent)=>{
    this.props.onMove(id,parent);
  }

  handleSelectNode = (id)=>{
    if(this.props.current_node!==id)this.props.onSelect(id);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.current_node !== this.props.current_node ||  nextProps.catalogue_data !== this.props.catalogue_data;
  }

  assignHandlers = ()=>{
    $(this.treeContainer).on('move_node.jstree', (e, data) => {
      this.handleMoveNode(data.node.id, data.parent);
    });
    $(this.treeContainer).on('select_node.jstree', (e, data) => {
      let settings = data.instance.settings;
      this.handleSelectNode(data.node.id);
      this.setState({settings});
    });
    $(this.treeContainer).on('rename_node.jstree', (e, data) => {
      data.node.id === "%"
      ?this.handleAddNode(data.node.parent, data.text)
      :this.handleRenameNode(data.node.id, data.text, data.node.parent);
    });
    $(this.treeContainer).on('select_node.jstree after_open.jstree after_close.jstree', (e, data) => {
        data.instance.settings.core.data.find(item=>item.id===data.node.id).state.opened = data.node.state.opened;
        data.instance.refresh(true);
    });
  }

  componentDidMount() {
    let treeData = this.makeTree();
    this.assignHandlers();
  }

  componentDidUpdate(prevProps) {
    this.props.collection!==prevProps.collection?this.makeTree():this.updateTree();
  }

  render() {
    return (<div ref={div => this.treeContainer = div}/>);
  }
}

export default JSTree;
