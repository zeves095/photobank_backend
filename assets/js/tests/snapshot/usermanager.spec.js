import React from 'react';
import { UserEditor } from '../../usermanager/components/UserEditor';
import { UserManager } from '../../usermanager/components/UserManager';
import { UserList } from '../../usermanager/components/UserList';
import Enzyme, {render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {store} from '../../usermanager/store/';
import {Provider} from 'react-redux';

Enzyme.configure({adapter: new Adapter()});

describe('snapshot testing', ()=>{
    it('UserEditor рендерится правильно', () => {
      const tree = render(<Provider store={store}><UserEditor /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('UserManager рендерится правильно', () => {
      const tree = render(<Provider store={store}><UserManager fetchUsers={()=>{}} /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
    it('UserList рендерится правильно', () => {
      const tree = render(<Provider store={store}><UserList users_active={[]} users_inactive={[]} /></Provider>).html();
      expect(tree).toMatchSnapshot();
    });
  }
)
