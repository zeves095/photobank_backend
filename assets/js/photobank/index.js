import React from 'react';
import ReactDOM from 'react-dom';

import { PhotoBank } from './PhotoBank';

var resumableContainer = [];
global.resumableContainer = resumableContainer;

if(typeof PhotoBank != 'undefined') ReactDOM.render(<PhotoBank />, document.getElementById('photobank-wrapper'));
