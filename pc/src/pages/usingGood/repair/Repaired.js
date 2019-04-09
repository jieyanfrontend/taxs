import React, { Component, Fragment } from 'react';
import { Table, Input, Select, DatePicker, Button, Card } from 'antd';
import { observer } from 'mobx-react';
import store from './store';
import request from '../../../helpers/request';
import Append from './modal/append';
import { withRouter } from "react-router-dom";
import nextStore from './Progress/store';
import exportFile from '../../../helpers/request';
import moment from 'moment';



const { RangePicker } = DatePicker;
const Option = Select.Option;
const _status = {
  '-1': '不通过',
  '0': '保存中',
  '1': '流程中',
  '2': '通过'
}

@observer
class Repaired extends Component {
  columns = [
    {
      title: '日期',
      dataIndex: 'create_time'
    },
    {
      title: '报修人',
      dataIndex: 'username'
    },
    {
      title: '部门',
      dataIndex: 'department'
    },
    {
      title: '物品名称',
      dataIndex: 'name'
    },
    {
      title: '具体门牌位置',
      dataIndex: 'address'
    },
    {
      title: '详细描述',
      dataIndex: 'remark'
    },
    // {
    //   title: '报修类别',
    //   dataIndex: 'wf_type'
    // },
    {
      title: '反馈说明',
      dataIndex: 'feedback'
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (text) => (<span>{_status[text]}</span>)
    },
    {
      title: '操作',
      render: (text, record, index) => <span><a onClick={() => { this.goDetail(record) }}>查看进度</a></span>
    }
  ]
  render() {
    let { department,  status, dataSource, time_begin, time_end, addParams, total, current } = store;
    let { globalStore } = this.props;
    let { departmentList } = globalStore;
    return (
      <Fragment>
        <Card>
          <div>
            <span>日期：</span><RangePicker style={{ width: 250, marginRight: 10 }} defaultValue={[time_begin, time_end]} onChange={(d, t) => { store.time_begin = t[0]; store.time_end = t[1]; }} />
            <span>部门：</span>
            <Select defaultValue={department} onChange={(v) => { store.department = v }} style={{ width: 150, marginRight: 10 }}>
              <Option value={'全部'}>全部</Option>
              {departmentList.map(e => <Option value={e.name}>{e.name}</Option>)}
            </Select>
            <span>报修人：</span> <Input style={{ width: 120, marginRight: 10 }} onChange={(e) => { store.username = e.target.value }} placeholder='全部' />
            <Button type='primary' style={{ marginRight: 10 }} onClick={this.fetchList}>查询</Button>
            <Button type='primary'onClick={()=>{this.export()}} >导出</Button>
          </div>
          <div style={{ marginTop: 10 }}>
            <span>状态：</span>
            <Select defaultValue={status} style={{ width: 100, marginRight: 10 }} onChange={(v) => { store.status = v }} >
              <Option value={3}>全部</Option>
              <Option value={1}>流程中</Option>
              <Option value={2}>通过</Option>
              <Option value={-1}>不通过</Option>
            </Select>
            <Button type='primary' onClick={() => { store.addParams.AddVisible = true }}>新增</Button>
          </div>
          <div style={{ marginTop: 10 }}>
            <Table columns={this.columns} dataSource={dataSource} bordered rowKey='create_time' pagination={{ current: current, onChange: (e) => { this.fetchList(e) }, total: total, }} ></Table>
          </div>
        </Card>
        <Append props={addParams} />
      </Fragment>
    )
  }
  componentDidMount() {
    document.title = '故障报修';
    this.fetchList(1);
  }
  fetchList = (page) => {
    let { department, time_begin, time_end, status, username } = store;
    let t_begin = moment(time_begin).format('YYYY-MM-DD')
    let t_end = moment(time_end).format('YYYY-MM-DD');
    request({
      url: '/api/v1/repair/list',
      method: 'GET',
      data: {
        department,
        username,
        status,
        time_begin:t_begin,
        time_end: t_end,
        page,
        size:10
      },
      beforeSend: (xml) => {
        xml.setRequestHeader('token', localStorage.getItem('token'))
      },
      success: (res) => {
        store.dataSource = res.data;
        store.current = res.current_page;
        store.total=res.total;
      }
    })
  }
 
  goDetail = (record) => {
    nextStore.dataSource.clear();
    nextStore.dataSource.push(record);
    let { history } = this.props;
    let id = record.id;
    history.push(`/good/repairProgress/${id}`);
  }
  export = () => {
    let { department, time_begin, time_end, status, username, } = store;
    exportFile({
      url: '/api/v1/repair/list',
      data: {
        department,
        username,
        status,
        time_begin: moment(time_begin).format('YYYY-MM-DD'),
        time_end: moment(time_end).format('YYYY-MM-DD'),
      }
    })
  }
 
}

export default withRouter(Repaired)