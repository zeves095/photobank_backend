import React from 'react';
import { UserEditor } from '../../usermanager/UserEditor';
import { UserManager } from '../../usermanager/UserManager';
import { UserList } from '../../usermanager/UserList';
import Enzyme, {render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({adapter: new Adapter()});

describe('snapshot testing', ()=>{
    it('UserEditor рендерится правильно', () => {
      const tree = render(<UserEditor />).html();
      expect(tree).toMatchSnapshot();
    });
    it('UserManager рендерится правильно', () => {
      const tree = render(<UserManager />).html();
      expect(tree).toMatchSnapshot();
    });
    it('UserList рендерится правильно', () => {
      const tree = render(<UserList users={[]} />).html();
      expect(tree).toMatchSnapshot();
    });
  }
)
