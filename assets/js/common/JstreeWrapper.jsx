import React, {Component} from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import 'jstree/dist/jstree.min';
import 'jstree/dist/themes/default/style.css';

class TreeView extends Component {

  constructor(props){
    super(props);
    this.state = {
      settings : {}
    }
  }

  shouldComponentUpdate(nextProps) {
    console.log(nextProps, this.props);
    return nextProps.selected !== this.props.selected;
  }

  componentDidMount() {
    console.log('DID MOUNT')
    const {treeData} = this.props;
    if (treeData) {
      treeData.plugins = ['contextmenu', 'dnd', "themes", "html_data"];
      treeData.core.check_callback = true;
      treeData.dnd = {
          check_while_dragging:false,
          use_html5:true,
          is_draggable:()=>true,
          responsive:true
      };
        $(this.treeContainer).jstree(treeData);
        $(this.treeContainer).on('changed.jstree', (e, data) => {
          console.log("CHONG",e,data);
          this.props.onChange(e, data);
          this.setState({settings:Object.assign(this.state.settings, {data})});
        });
        $(this.treeContainer).on('move_node.jstree', (e, data) => {
          console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAA",e, data);
        });
        $(this.treeContainer).on('ready.jstree', (e, data) => {
          console.log("RDEEE",e, data);
          this.setState({settings:Object.assign(this.state.settings, {data})});
        });
        $(this.treeContainer).on('select_node.jstree', (e, data) => {
          console.log("SLEC",e, data);
          this.setState({settings:Object.assign(this.state.settings, {data})});
        });
        this.setState({settings:treeData});
    }
  }

  componentDidUpdate() {
    console.log('DID UPDATE')
    const {treeData} = this.props;
    if (treeData) {
      // treeData.plugins = ['contextmenu', 'dnd', "themes", "html_data"];
      // treeData.core.check_callback = true;
      // treeData.contextmenu = {
      //   show_at_node: true,
      //   items: {
      //     "a": {
      //       "label": "asdasd",
      //       "action": (obj, a) => {
      //         console.log(obj, a,1)
      //       }
      //     },
      //     "b": {
      //       "label": "Rendddddddame",
      //       "action": (obj) => {
      //         console.log(obj,2)
      //       }
      //     }
      //   }};
      //   treeData.dnd = {
      //       check_while_dragging:false,
      //     use_html5:true,
      //     is_draggable:()=>true,
      //     responsive:true
      //   };
        let settings = Object.assign(this.state.settings, treeData);
      $(this.treeContainer).jstree(true).settings = settings;
      $(this.treeContainer).jstree(true).refresh();
      this.setState({settings});
    }
  }

  render() {
    return (<div ref={div => this.treeContainer = div}/>);
  }
}

export default TreeView;
