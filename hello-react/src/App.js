// import logo from './logo.svg';
import './App.css';
// import TestEcharts from './component/echarts';
import { View1 } from './app/view1'
import { View2 } from './app/view2'

import { Tabs } from 'antd';

const { TabPane } = Tabs;

function App() {
  return (
    <div className="App">
      <Tabs tabPosition={'left'}>
          <TabPane tab="题目一" key="1">
            <View1 />
          </TabPane>
          <TabPane tab="题目二" key="2">
            <View2 />
          </TabPane>
        </Tabs>
      {/* <TestEcharts /> */}
    </div>
  );
}

export default App;
