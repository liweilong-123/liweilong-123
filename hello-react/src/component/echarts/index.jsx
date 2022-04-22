import React, { createRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import XLSX from 'xlsx';
import { Button } from 'antd';

export default class TestEcharts extends React.Component {

  constructor(props) {
    super(props)
    this.leftYminValue = createRef();
    this.startTimeValue = createRef();
    this.endTimeValue = createRef();
    this.rightYminValue = createRef();

    this.state = {
      xAxisLable: [],
      yAxisData: [],
      yMinAndMax: { min: 0, max: 5 },
      echartData: [],
      rightXAxisLable: [],
      rightYAxisLable: []
    }
  }

  getOption = (type) => {
    const { xAxisLable, yAxisData, yMinAndMax, rightXAxisLable, rightYAxisLable } = this.state;
    let yValue = {};
    if (type === 'left') {
      yValue = xAxisLable.length === 0 
        ? yMinAndMax 
        : { min: this.leftYminValue.current.value 
          ? this.leftYminValue.current.value : 0};
    } else {
      yValue = rightXAxisLable.length === 0 
        ? yMinAndMax 
        : { min: this.rightYminValue.current.value ? this.rightYminValue.current.value : 0};
    }

    let option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: function(value, b) {
          let result = '';
          if (value) {
            for (const iterator of value) {
              const xTime = iterator.axisValue.split('\n').reverse().join(' ');
              result = "<div style='text-align: left'>x轴: " + xTime + '<br/>y轴: ' + iterator.data + '</div>'
            }
          }
          return result;
        }
      },
      grid: {
        top: 10
      },
      color:['#999999'],
      xAxis: [{
        type: 'category',
        position: 'bottom',
        boundaryGap: false,
        axisLabel: {
          interval: 179,
          showMaxLabel: true
        },
        axisTick: {
          show: true
        },
        data:  type === 'left' ? xAxisLable : rightXAxisLable
      },{
        type: 'category',
        position: 'bottom',
        boundaryGap: false,
        axisLabel: {
          interval: 29,
          show: false, 
        },
        axisTick: {
          show: true,
          length: 3,
          lineStyle: {
            length: 1
          }
        },
        data: type === 'left' ? xAxisLable : rightXAxisLable
      }],
      yAxis: {
        type: 'value',
        axisLine: {
          show: true
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: true,
          formatter: function(value) {
            return value.toFixed(2);
          }
        },
        minorTick: {
          show: true
        },
        axisTick: {
          show: true
        },
        ...yValue
      },
      series: [
        {
          data: type === 'left' ? yAxisData : rightYAxisLable,
          smooth: true,
          showSymbol: false,
          type: 'line',
        }
      ]
    };
    return option;
  }

  importExcel(e){
    var fileReader = new FileReader();
    fileReader.onload = function(ev) {
        try {
            var data = ev.target.result,
                workbook = XLSX.read(data, {type: 'binary'}),
                persons = []; // 存储获取到的数据
        } catch (e) {
            alert('文件类型不正确');
            return;
        }

        // 表格的表格范围，可用于判断表头是否数量是否正确
        // var fromTo = '';
        // 遍历每张表读取
        for (var sheet in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheet)) {
                // fromTo = workbook.Sheets[sheet]['!ref'];
                persons = persons.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                // break; // 如果只取第一张表，就取消注释这行
            }
        }
    };

    // 以二进制方式打开文件
    // fileReader.readAsBinaryString(files[0]);
  }

  _upFile = () => {
    let upimgs = document.getElementById("upfile")
    upimgs.click();
  }

  _upChange = (e)=>{
    let file = e.target.files[0]//获取第一个文件
    let reader = new FileReader()
    reader.readAsBinaryString(file)//读取这个文件
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, {type:'binary'});
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_csv(ws, {header:1});

      this.setState({ echartData: data})
      this.leftEchart(data);
      this.rightEchart(data);
    }
  }

  leftEchart = (data) => {
    let dataArr = data.split('\n');
    const heard = dataArr.shift();
    if (heard.split(',').length === 1) {
      this.oneHeader(dataArr, 'left')
    } else if (heard.split(',').length === 3) {
      this.threeHeader(dataArr, 'left')
    } else {
      alert('模板表头应为一列或者三列')
    }
  }

  rightEchart = (data) => {
    let dataArr = data.split('\n');
    const heard = dataArr.shift();
    if (heard.split(',').length === 1) {
      this.oneHeader(dataArr, 'right')
    } else if (heard.split(',').length === 3) {
      this.threeHeader(dataArr, 'right')
    } else {
      alert('模板表头应为一列或者三列')
    }
  }

  oneHeader = (dataArr, type) => {
    let xAxisLable = [];
    let yAxisData = [];
    let firstTime = 0;

    for (const iterator of dataArr) {
      const arr = iterator.split(";");
      let xt = '';
      if (arr[0]) {
        xt = arr[0].split(' ')[0].split('/').reverse().join('/') + (arr[0].split(' ')[1] ? (' ' + arr[0].split(' ')[1]) : '')
      }
      const xTime = new Date(xt).getTime();
      if (firstTime === 0) {
        firstTime = xTime;
      }
      if (type === 'left') {
        const yminValue = this.leftYminValue.current.value || 0;
        if (arr[1] <= parseInt(yminValue, 10)) {
          break;
        }
      } else {
        try {
          const startTime = this.startTimeValue.current.value;
          const endTime = this.endTimeValue.current.value;
          if (startTime && endTime && (xTime < new Date(startTime).getTime() || xTime > new Date(endTime).getTime())) {
            continue;
          }
          if (startTime && !endTime && xTime < new Date(startTime).getTime()) {
            continue;
          }
          if (!startTime && endTime && xTime > new Date(endTime).getTime()) {
            continue;
          }
        } catch (error) {
          continue;
        }
      }
      xAxisLable.push(xt.split(' ').reverse().join('\n'))
      yAxisData.push(arr[1] ? arr[1] : '')
    }
    const { dataX, dataY } = this.buquanXAxis(xAxisLable, yAxisData);
    if (type === 'left') {
      this.setState({ xAxisLable: dataX, yAxisData: dataY })
    } else {
      this.setState({ rightXAxisLable: dataX, rightYAxisLable: dataY })
    }
  }

  buquanXAxis = (xAxisLable, yAxisData) => {
    let dataX = xAxisLable;
    let dataY = yAxisData;
    const num = 180 - xAxisLable.length % 180 + 1;
    if (num !== 0) {
      for (let i = 0; i < num; i++) {
        dataX.push('');
        dataY.push('');
      }
    }
    return{ dataX, dataY };
  }

  threeHeader = (dataArr, type) => {
    let xAxisLable = [];
    let yAxisData = [];
    let firstTime = 0;

    for (const iterator of dataArr) {
      const arr = iterator.split(",");
      let xt = '';
      if (arr[0]) {
        xt = arr[0].split(' ')[0].split('/').reverse().join('/') + (arr[1] ? (' ' + arr[1]) : '')
      }
      const xTime = new Date(xt).getTime();
      if (firstTime === 0) {
        firstTime = xTime;
      }
      if (type === 'left') {
        const yminValue = this.leftYminValue.current.value || 0;
        if (arr[1] <= parseInt(yminValue, 10)) {
          break;
        }
      } else {
        try {
          const startTime = this.startTimeValue.current.value;
          const endTime = this.endTimeValue.current.value;
          if (startTime && endTime && (xTime < new Date(startTime).getTime() || xTime > new Date(endTime).getTime())) {
            continue;
          }
          if (startTime && !endTime && xTime < new Date(startTime).getTime()) {
            continue;
          }
          if (!startTime && endTime && xTime > new Date(endTime).getTime()) {
            continue;
          }
        } catch (error) {
          continue;
        }
      }
      xAxisLable.push(xt.split(' ').reverse().join('\n'))
      yAxisData.push(arr[2] ? arr[2] : '')

    }
    const { dataX, dataY } = this.buquanXAxis(xAxisLable, yAxisData);
    if (type === 'left') {
      this.setState({ xAxisLable: dataX, yAxisData: dataY })
    } else {
      this.setState({ rightXAxisLable: dataX, rightYAxisLable: dataY })
    }
  }

  downloadExcel = () => {
    // 显示在表格中数据
      let json = [];
      // let json = [
      //   { 姓名: "张三" },
      //   { 姓名: "李四" },
      //   { 姓名: "王五" },
      // ];
      let tmpData = json[0];
      json.unshift({});
      let keyMap = [];
      for (let k in tmpData) {
        keyMap.push(k);
        json[0][k] = k;
      }
      // 用来保存转换好的json
      tmpData = [];
      let arr = json.map((v, i) =>
        keyMap.map((k, j) =>
          Object.assign(
            {},
            {
              v: v[k],
              position:
                (j > 25 ? this.getCharCol(j) : String.fromCharCode(j + 65)) +
                (i + 1),
            }
          )
        )
      );
      let arr1 = [];
  
      arr.forEach((item1) => {
        item1.forEach((item2) => {
          arr1.push(item2);
        });
      });
      arr1.forEach((v, i) => {
        tmpData[v.position] = {
          v: v.v,
        };
      });
      // 设置表格区域
      let outPutArea = Object.keys(tmpData);
  
      let tmpWB = {
        SheetNames: ["sheet1"], // 表标题
        Sheets: {
          sheet1: Object.assign(
            {},
            tmpData, // 表数据
            {
              "!ref": outPutArea[0] + ":" + outPutArea[outPutArea.length - 1], // 设置填充区域
            }
          ),
        },
      };
      // 导出excel
      XLSX.writeFile(tmpWB, "模板.xlsx");
  };


  render() {
    const { echartData } = this.state;
    let  echartsOption = this.getOption('left');
    const rightEchartsOption = this.getOption('right');

    console.log(rightEchartsOption, 'xxxx')
    
    return (
      <div style={{ paddingTop: '20px'}}>
        <div style={{ width: '50%', display: 'inline-block' }}>
          <div style={{ paddingLeft: '100px', textAlign: 'left', marginBottom: '10px' }}>
            y轴最小值：<input ref={this.leftYminValue}></input>
            <br />
            <Button style={{ display: 'block', margin: '15px 0 0 0px' }} onClick={() => { this.leftEchart(echartData) }} type="primary">绘左侧图</Button>
          </div>
          <ReactEcharts
            style={{ height: '400px' }}
            option={echartsOption}
            notMerge={true} // 重新渲染数据的 重绘的,老坑了
          />
        </div>
        <div style={{ width: '50%', display: 'inline-block' }}>
          <div style={{ paddingLeft: '100px', textAlign: 'left', marginBottom: '10px'}}>
            <span style={{ width: '90px', display: 'inline-block', textAlign: 'right' }}>y轴最小值：</span>
            <input ref={this.rightYminValue} />
            <br/>
            <span style={{ width: '90px', display: 'inline-block', textAlign: 'right' }}>起始时间：</span>
            <input ref={this.startTimeValue} placeholder="2021/10/08 00:00:00" />
            <br/>
            <span style={{ width: '90px', display: 'inline-block', textAlign: 'right' }}>结束时间：</span>
            <input ref={this.endTimeValue} placeholder="2021/10/08 00:00:00" />
            <br />
            <Button  style={{ display: 'block', margin: '15px 0 0 0px' }} type="primary" onClick={() => { this.rightEchart(echartData) }}>绘右侧图</Button>
          </div>
          <ReactEcharts
            style={{ height: '400px' }}
            option={rightEchartsOption}
            notMerge={true} // 重新渲染数据的 重绘的,老坑了
          />
        </div>
        <hr/>
          <div>
            <Button onClick={this.downloadExcel} type="primary" style={{ marginRight: '5px'}}>下载excel表</Button>
            <Button className='btn btn-blue' type="primary" onClick={this._upFile}>上传文件</Button>
            <input id='upfile' type='file' style={{ display: 'none' }} accept='.xlsx' onChange={this._upChange} />
          </div>
      </div>
    )
  }
}