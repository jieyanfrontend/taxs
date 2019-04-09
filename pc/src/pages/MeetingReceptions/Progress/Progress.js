import React, { Component, Fragment } from 'react';
import { Button, Table, Card, Modal } from 'antd';
import { observer } from 'mobx-react';
import Approval from './ApprovalModal/Modal';
import request from '../../../helpers/request';
import moment from 'moment';
import { withRouter } from "react-router-dom";
import store from './store';

const confirm = Modal.confirm;
const _status = {
  '-1': '不通过',
  '0': '保存中',
  '1': '流程中',
  '2': '通过'
}

@observer
class MeetingPlaceProgress extends Component {
  columns = [
    {
      width: 200,
      title: '日期',
      dataIndex: 'create_time',
      render: (text) => <span>{moment(text).format('YYYY-MM-DD HH:mm')}</span>
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
      title: '级别',
      dataIndex: 'grade'
    },
    {
      title: '厅级人数',
      dataIndex: 'departmental',
      render: (text) => (<span>{text}人</span>)
    },
    {
      title: '处级人数',
      dataIndex: 'section',
      render: (text) => (<span>{text}人</span>)
    },
    {
      title: '处级以下人数',
      dataIndex: 'under_section',
      render: (text) => (<span>{text}人</span>)
    },
    {
      title: '会议人数',
      dataIndex: 'count',
      render: (text) => (<span>{text}人</span>)
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (text) => (<span>{_status[text]}</span>)
    },
  ]
  detailColumns = [

    {
      title: '单位',
      dataIndex: 'unit'
    },
    {
      title: '姓名',
      dataIndex: 'name'
    },
    {
      title: '职务',
      dataIndex: 'post'
    },
  ];
  meal_columns = [
    {
      title: '时间',
      dataIndex: 'recept_time'
    },
    {
      title: '项目内容',
      dataIndex: 'content'
    },
    {
      title: '地点',
      dataIndex: 'address'
    },
    {
      title: '费用',
      dataIndex: 'money'
    },
  ];
  proColumns = [
    {
      title: '序号',
      dataIndex: 'id',
    },
    {
      title: '处理人',
      dataIndex: 'user'
    },
    {
      title: '处理步骤',
      dataIndex: 'step',
      render: (text) => {
        var splits = text.split("(", 1).toString();
        return (
          <span>{splits}</span>
        )
      }
    },
    {
      title: '送达时间',
      dataIndex: 'dateline',
      render: (text) => (<span>{moment(text * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>)
    },
    {
      title: '处理时间',
      dataIndex: 'handleTime'
    },
    {
      title: '耗时',
      dataIndex: 'waste'
    },
    {
      title: '处理意见',
      dataIndex: 'content'
    }
  ]

  componentDidMount() {
    this.fetchList();
    this.getDetail();
  }
  render() {
    let { params, data, dataSource, info, users, detail } = store;
    let { id } = this.props.match.params;
    let { proDataSource, } = info;
    let _check = data.check === 1;
    let _cancel = data.cancel === 1;
    let { history } = this.props;
    let accompany = dataSource[0].accompany;
    return (
      <Fragment>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 15 }}>
            <Button style={{ marginRight: 15 }} onClick={() => { history.goBack() }}>返回</Button>
            {_cancel ? <Button style={{ marginRight: 15 }} onClick={() => { this.showDeleteConfirm() }}>撤销</Button> : null}
            {_check ? <Button type='primary' onClick={() => store.params.visible = true}>审批</Button> : null}
          </div>
          <div style={{ marginBottom: 60 }}>
            <Table title={() => <div style={{ textAlign: 'center', fontSize: 20 }}>基本信息</div>} rowKey='id' columns={this.columns} dataSource={dataSource} bordered pagination={false} ></Table>
            <Table footer={() => (<span>陪同人员名单:{accompany}</span>)} rowKey='name' columns={this.detailColumns} dataSource={users} bordered pagination={false} ></Table>
            <Table rowKey='recept_time' columns={this.meal_columns} dataSource={detail} bordered pagination={false} ></Table>
          </div>
          <div>
            <Table title={() => <div style={{ textAlign: 'center', fontSize: 20 }}>申请进度</div>} rowKey='id' columns={this.proColumns} dataSource={proDataSource} pagination={false} bordered ></Table>
          </div>
        </Card>
        <Approval params={params} props={data} wf_fid={id} />
      </Fragment>
    )
  }
  fetchList = () => {
    let { id } = this.props.match.params;
    var pro = [];
    request({
      url: '/api/v1/flow/info',
      method: 'GET',
      data: {
        wf_type: 'meeting_recept_t',
        wf_fid: id
      },
      beforeSend: (xml) => {
        xml.setRequestHeader('token', localStorage.getItem('token'))
      },
      success: (res) => {
        store.data = res;
        store.info.log = res.info.log;
        store.info.preprocess = res.info.preprocess;
        store.info.proDataSource.clear();
        let step = Object.values(store.info.preprocess);
        store.info.log.forEach((e, index) => {
          if (step[index]) {
            pro.push(Object.assign({}, e, { 'step': step[index] }))
          } else {
            pro.push(Object.assign({}, e, { 'step': '结束' }))
          }
        });
        pro.shift();
        store.info.proDataSource = pro;
      },
    })
  }
  getDetail = () => {
    let { id } = this.props.match.params;
    request({
      url: '/api/v1/meeting/recept',
      method: 'GET',
      data: {
        id
      },
      success: (res) => {
        console.log(res);
        store.detail = res.detail;
        store.users = res.users;
      }
    })
  }
  cancel = () => {
    let { id } = this.props.match.params;
    let { data } = store;
    let run_id = data.info.run_id;
    let { history } = this.props;
    request({
      url: '/api/v1/flow/check/pass',
      method: 'POST',
      data: {
        wf_fid: id,
        check_con: '',
        flow_id: '',
        run_id,
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
        history.push('/meetingReception')
      }
    })
  }
  showDeleteConfirm = () => {
    confirm({
      title: '是否撤销该申请',
      content: '撤销后将不可撤回',
      okText: '是',
      okType: 'danger',
      cancelText: '否',
      onOk: () => {
        this.cancel();
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }
}

export default withRouter(MeetingPlaceProgress);