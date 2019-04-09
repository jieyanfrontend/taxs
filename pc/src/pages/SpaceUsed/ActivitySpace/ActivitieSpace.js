import React, { Component, Fragment } from 'react';
import { Input, Table, Select, Button, DatePicker, Card } from 'antd';
import { observer } from 'mobx-react'
import store from './store';
import request from '../../../helpers/request';
import Add from './modal/add';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import nextStore from './ActProgress/store';
import exportFile from '../../../helpers/export-file';

const selectItem = [
  { name: '1号气排球场' },
  { name: '2号气排球场' },
  { name: '1号羽毛球场' },
  { name: '2号羽毛球场' },
  { name: '1号网球场' },
  { name: '2号网球场' },
  { name: '1号乒乓球场' },
  { name: '2号乒乓球场' },
  { name: '1号健身室' },
  { name: '2号健身室' },
  { name: '1号棋牌室' },
  { name: '2号棋牌室' },
  { name: '英式台球' },
  { name: '美式台球' },
  { name: '健身舞室' },
  { name: '篮球' },
]
const { RangePicker } = DatePicker;
const _status = {
  '-1': '不通过',
  '0': '保存中',
  '1': '流程中',
  '2': '通过'
}
@observer
class ActivitySpace extends Component {
  columns = [
    {
      title: '日期',
      dataIndex: 'create_time'
    },
    {
      title: '申请人',
      dataIndex: 'username'
    },
    {
      title: '使用单位',
      dataIndex: 'unit'
    },
    {
      title: '使用时间',
      dataIndex: 'time_begin'
    },
    {
      title: '使用人数',
      dataIndex: 'user_count'
    },
    {
      title: '场地名称',
      dataIndex: 'space'
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (text) => (<span>{_status[text]}</span>)
    },
    {
      title: '操作',
      render: (text, record, columns) => (<span><a onClick={() => { this.goDetail(record) }}>查看进度</a></span>)
    }
  ]

  render() {
    let { department, dataSource, time_begin, time_end, status, space, addParams, total, current } = store;
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
            <span>申请人：</span> <Input style={{ width: 120, marginRight: 10 }} onChange={(e) => { store.username = e.target.value }} placeholder='全部' />
            <Button type='primary' style={{ marginRight: 10 }} onClick={this.fetchList} >查询</Button>
            <Button type='primary' onClick={this.export} >导出</Button>
          </div>
          <div style={{ marginTop: 10 }}>
            <span>状态：</span>
            <Select defaultValue={status} style={{ width: 100, marginRight: 10 }} onChange={(v) => { store.status = v }} >
              <Option value={3}>全部</Option>
              <Option value={1}>流程中</Option>
              <Option value={2}>通过</Option>
              <Option value={-1}>不通过</Option>
            </Select>
            <span>场地名称：</span><Select defaultValue={space} style={{ width: 150, marginRight: 10 }}>
              <Option value={'全部'}>全部</Option>
              {selectItem.map(e => <Option value={e.name}>{e.name}</Option>)}
            </Select>
            <Button type='primary' onClick={() => { store.addParams.AddVisible = true }} >新增</Button>
          </div>
          <div style={{ marginTop: 10 }}>
            <Table columns={this.columns} dataSource={dataSource} rowKey='id' bordered pagination={{ current: current, onChange: (e) => { this.fetchList(e) }, total: total, }}></Table>
          </div>
        </Card>
        <Add props={addParams} />
      </Fragment>
    )
  }
  componentDidMount() {
    document.title = '场地使用';
    this.fetchList(1);
  }
  fetchList = (page) => {
    let { department, time_begin, time_end, status, username, space } = store;
    request({
      url: '/api/v1/recreational/list',
      method: 'GET',
      data: {
        department,
        username,
        status,
        space,
        time_begin: moment(time_begin).format('YYYY-MM-DD'),
        time_end: moment(time_end).format('YYYY-MM-DD'),
        page,
        size: 10
      },
      beforeSend: (xml) => {
        xml.setRequestHeader('token', localStorage.getItem('token'));
      },
      success: (res) => {
        store.dataSource = res.data;
        store.current = res.current_page;
        store.total = res.total;
      }
    })
  }

  goDetail = (record) => {
    nextStore.dataSource.clear();
    nextStore.dataSource.push(record);
    let { history } = this.props;
    let id = record.id;
    history.push(`/space/actProgress/${id}`);
  }
  export = () => {
    let { department, time_begin, time_end, status, username, space } = store;
    exportFile({
      url: '/api/v1/recreational/export',
      data: {
        department,
        username,
        status,
        space,
        time_begin: moment(time_begin).format('YYYY-MM-DD'),
        time_end: moment(time_end).format('YYYY-MM-DD'),
      }
    })
  }
  cancel = (id) => {
    request({
      url: '/api/v1/flow/check/pass',
      method: 'POSt',
      data: {
        wf_fid: id,
        check_con: '',
        flow_id: '',
        run_id: '',
        flow_process: '',
        run_process: '',
        npid: '',
        submit_to_save: 'cancel',
        wf_type: 'space_recreational_t'
      },
      beforeSend: (xml) => {
        xml.setRequestHeader('token', localStorage.getItem('token'))
      },
      success: (res) => {
        console.log(res);
      }

    })

  }
}


export default withRouter(ActivitySpace)