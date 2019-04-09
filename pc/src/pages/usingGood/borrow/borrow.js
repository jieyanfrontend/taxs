import React, { Component, Fragment } from 'react';
import { Table, Input, Select, DatePicker, Button, Card, } from 'antd';
import { observer } from 'mobx-react';
import store from './store';
import request from '../../../helpers/request';
import Append from './modal/append';
import { withRouter } from "react-router-dom";
import nextStore from './Progress/store';
import exportFile from '../../../helpers/export-file';
import moment from 'moment';
import GoodDetail from './detail';

const { RangePicker } = DatePicker;
const Option = Select.Option;
const _status = {
  '-1': '不通过',
  '0': '保存中',
  '1': '流程中',
  '2': '通过'
}

@observer
class Borrow extends Component {
  columns = [
    {
      title: '日期',
      dataIndex: 'create_time'
    },
    {
      title: '领用人',
      dataIndex: 'username'
    },
    {
      title: '部门',
      dataIndex: 'department'
    },
    {
      title: '手机号码',
      dataIndex: 'phone'
    },
    {
      title: '使用方式',
      render: () => <span>借用</span>
    },
    {
      title: '领用物品',
      render: (text, record) => <span> <a onClick={() => { this.getDetails(record); return false; }} >查看</a></span>
    },
    {
      title: '领用日期',
      dataIndex: 'time_begin'
    },
    {
      title: '归还日期(借用)',
      dataIndex: 'time_end'
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
    let { department, status, dataSource, time_begin, time_end, addParams, total, current, details } = store;
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
            <span>领用人：</span> <Input style={{ width: 120, marginRight: 10 }} onChange={(e) => { store.username = e.target.value }} placeholder='全部' />
            <Button type='primary' style={{ marginRight: 10 }} onClick={() => { store.addParams.AddVisible = true }}>申请</Button>
            <Button type='primary' style={{ marginRight: 10 }} onClick={() => this.fetchList(1)}>查询</Button>
            <Button type='primary' onClick={() => { this.export() }} >导出</Button>
          </div>
          <div style={{ marginTop: 10 }}>
            <span>状态：</span>
            <Select defaultValue={status} style={{ width: 100, marginRight: 10 }} onChange={(v) => { store.status = v }} >
              <Option value={3}>全部</Option>
              <Option value={1}>流程中</Option>
              <Option value={2}>通过</Option>
              <Option value={-1}>不通过</Option>
            </Select>
            <span>品名：</span> <Input style={{ width: 100, marginRight: 10 }} onChange={(e) => { store.sku = e.target.value }} placeholder='全部' />
            <span>类别：</span> <Input style={{ width: 100, marginRight: 10 }} onChange={(e) => { store.category = e.target.value }} placeholder='全部' />
          </div>
          <div style={{ marginTop: 10 }}>
            <Table columns={this.columns} dataSource={dataSource} bordered rowKey='id' pagination={{ current: current, onChange: (e) => { this.fetchList(e) }, total: total, }} ></Table>
          </div>
        </Card>
        <Append props={addParams} />
        <GoodDetail props={details} />
      </Fragment>
    )
  }
  componentDidMount() {
    document.title = '借用申请';
    this.fetchList(1);
    this.getSkusUse();
  }
  getSkusUse = () => {
    request({
      url: '/api/v1/sku/list/use',
      method: 'GET',
      success: (res) => {
        let useList = res.filter(e => e.use_type == '借用');
        store.useList = useList;
      }
    })
  }
  fetchList = (page) => {
    let { department, time_begin, time_end, status, username, category, sku } = store;
    let t_begin = moment(time_begin).format('YYYY-MM-DD')
    let t_end = moment(time_end).format('YYYY-MM-DD');
    request({
      url: '/api/v1/sku/apply/list',
      method: 'GET',
      data: {
        type: 'borrow_t',
        category,
        department,
        sku,
        username,
        status,
        time_begin: t_begin,
        time_end: t_end,
        page,
        size: 10
      },
      beforeSend: (xml) => {
        xml.setRequestHeader('token', localStorage.getItem('token'))
      },
      success: (res) => {
        store.dataSource = res.data;
        store.current = res.current_page;
        store.total = res.total;
      }
    })
  }
  getDetails = (record) => {
    let id = record.id;
    request({
      url: '/api/v1/sku/apply/detail',
      method: 'GET',
      data: {
        id,
        type: 'borrow_t'
      },
      beforeSend: (xml) => {
        xml.setRequestHeader('token', localStorage.getItem('token'))
      },
      success: (res) => {
        store.detailsArr = res;
        store.details.visible = true;
      }
    })
  }
  goDetail = (record) => {
    nextStore.dataSource.clear();
    nextStore.dataSource.push(record);
    let { history } = this.props;
    let id = record.id;
    history.push(`/good/borrowPg/${id}`);
  }
  export = () => {
    let { department, time_begin, time_end, status, username, category, sku } = store;
    let t_begin = moment(time_begin).format('YYYY-MM-DD')
    let t_end = moment(time_end).format('YYYY-MM-DD');
    exportFile({
      url: '/api/v1/access/export',
      data: {
        department,
        sku,
        type: 'borrow_t',
        category,
        username,
        status,
        time_begin: moment(time_begin).format('YYYY-MM-DD'),
        time_end: moment(time_end).format('YYYY-MM-DD'),
      }
    })
  }

}

export default withRouter(Borrow)