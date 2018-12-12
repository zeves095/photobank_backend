import React from 'react';
import ReactDOM from 'react-dom';
import LinkManagerWrapper from './components/LinkManagerWrapper';
//import {AccountInfo} from '../AccountInfo.jsx';
var wrapper = document.getElementById('link-manager-wrapper');
if(typeof LinkManagerWrapper != 'undefined') ReactDOM.render(<LinkManagerWrapper />, wrapper);
