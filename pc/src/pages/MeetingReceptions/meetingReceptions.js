import React, { Component, Fragment } from 'react';
import { Table, Input, Select, DatePicker, Button, Card } from 'antd';
import store from './store';
import request from '../../helpers/request';
import { observer } from 'mobx-react';
import {withRouter} from 'react-router-dom'
import nextStore from './Progress/store';
import Add from './modal/add';
import exportFile from '../../helpers/export-file';
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
class MeetingReception extends Component {
  columns = [
    {
      title: '日期',
      dataIndex: 'create_time',
      render:(text) => <span>{moment(text).format('YYYY-MM-DD HH:mm')}</span>
    },
    {
      title: '申请人',
      dataIndex: 'username'
    },
    {
      title: '部门',
      dataIndex: 'department'
    },
    {
      title: '公函字号',
      dataIndex: 'letter_size'
    },
    {
      title: '公函标题',
      dataIndex: 'letter_title'
    },
    {
      title: '来访单位',
      dataIndex: 'unit'
    },
    {
      title: '领队人姓名',
      dataIndex: 'leader'
    },
    {
      title:'职务',
      dataIndex:'post'
    },
    {
      title:'级别',
      dataIndex:'grade'
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
    let { department, dataSource, time_begin, time_end, status,addParams,total,current } = store;
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
            <Button type='primary' style={{ marginRight: 10 }} onClick={this.fetchList}>查询</Button>
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
            <Button type='primary' onClick={()=>{store.addParams.AddVisible = true}} >新增</Button>

          </div>
          <div style={{ marginTop: 10 }}>
            <Table columns={this.columns} dataSource={dataSource} bordered rowKey='id' pagination={{ current: current, onChange: (e) => { this.fetchList(e) }, total: total, }} ></Table>
          </div>
        </Card>
        <Add props={addParams} />
      </Fragment>
    )
  }
  componentDidMount() {
    this.fetchList(1);
    document.title = '公务接待';
  }
  fetchList = (page) => {
    let { department, time_begin, time_end, status, username } = store;
    request({
      url: '/api/v1/meeting/recept/list',
      method: 'GET',
      data: {
        department,
        username,
        status,
        time_begin: moment(time_begin).format('YYYY-MM-DD'),
        time_end: moment(time_end).format('YYYY-MM-DD'),
        page,
        size:10
      },
      beforeSend: (xml) => {
        xml.setRequestHeader('token', localStorage.getItem('token'))
      },
      success: (res) => {
        store.dataSource = res.data;
        store.total= res.total;
        store.current = res.current_page;
      }
    })
  }
  goDetail = (record) => {
    nextStore.dataSource.clear();
    nextStore.dataSource.push(record);
    let { history } = this.props;
    let id = record.id;
    history.push(`/meetingProgress/${id}`);
  }
  export = () => {
    let { department, time_begin, time_end, status, username } = store;
    exportFile({
      url: '/api/v1/meeting/recept/export',
      data: {
        department,
        username,
        status,
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
        wf_type: 'meeting_recept_t'
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

export default withRouter(MeetingReception)