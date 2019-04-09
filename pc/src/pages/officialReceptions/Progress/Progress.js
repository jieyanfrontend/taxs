import React, { Component, Fragment } from 'react';
import { Card, Table, Button,Modal, Badge } from 'antd';
import { observer } from 'mobx-react';
import store from './store';
import request from '../../../helpers/request';
import moment from 'moment';
import Approval from './ApprovalModal/Modal';
import { withRouter } from 'react-router-dom';

const confirm = Modal.confirm;

const _status = {
  '-1': '不通过',
  '0': '审批中',
  '1': '流程中',
  '2': '通过'
}

const basicMsg = [
  {
    title: '日期',
    dataIndex: 'create_time'
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
    title: '公务时间',
    key: 'id',
    render: (text, record) => (<span>{record.time_begin}——{record.time_end}</span>)
  },
  {
    title: '来访单位',
    dataIndex: 'unit'
  },
  {
    title: '拟入住酒店',
    dataIndex: 'hotel'
  },
  {
    title: '男',
    dataIndex: 'male'
  },
  {
    title: '女',
    dataIndex: 'female'
  },
  {
    title: '单人房',
    dataIndex: 'single_room'
  },
  {
    title: '双人房',
    dataIndex: 'double_room'
  },
  {
    title: '人员名单',
    dataIndex: 'members'
  },
  {
    title: '状态',
    dataIndex: 'status',
    render: (text,record,index) => (record.check == 1 ? <span><Badge offset={[7,-5]} dot>{_status[text]}</Badge></span>
      :<span>{_status[text]}</span>)
  },
]

const proColumns = [
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

@observer
class DinningPg extends Component {
  componentDidMount() {
    this.fetchList();
  }
  render() {
    let { params, data, info, dataSource } = store;
    let { id } = this.props.match.params;
    let { proDataSource, meals } = info;
    console.log(proDataSource);
    let { history } = this.props;
    let _check = data.check === 1;
    let _cancel = data.cancel === 1;
    return (
      <Fragment>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 15, }}>
            <Button style={{ marginRight: 15 }} onClick={() => { history.goBack() }} >返回</Button>
            {_cancel ? <Button style={{ marginRight: 15 }} onClick={() => { this.showDeleteConfirm() } }>撤销</Button> : null}
            {_check ? <Button type='primary' onClick={() => store.params.visible = true}>审批</Button> : null}
          </div>
          <div style={{ marginBottom: 60 }}>
            <Table title={() => <div style={{ textAlign: 'center', fontSize: 20 }}>基本信息</div>} columns={basicMsg} dataSource={dataSource} pagination={false} bordered rowKey='id'></Table>
          </div>
          <div>
            <Table title={() => <div style={{ textAlign: 'center', fontSize: 20 }}>申请进度</div>} columns={proColumns} dataSource={proDataSource} bordered rowKey='id' ></Table>
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
        wf_type: 'hotel_t',
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
      complete: () => {
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
  cancel = () => {
    let { id } = this.props.match.params;
    let { data } = store;
    let run_id = data.info.run_id;
    let {history} = this.props;
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
        wf_type: 'hotel_t'
      },
      beforeSend: (xml) => {
        xml.setRequestHeader('token', localStorage.getItem('token'))
      },
      success: (res) => {
        history.push('/hotelBooking')
      }
    })
  }
  // getDetail = () => {
  //   let { id } = this.props.match.params;
  //   request({
  //     url: '/api/v1/official',
  //     method: 'GET',
  //     data: {
  //       id
  //     },
  //     beforeSend: (xml) => {
  //       xml.setRequestHeader('token', localStorage.getItem('token'))
  //     },
  //     success: (res) => {
  //       console.log(res);
  //       let meals_list = res.meals;
  //       let meals_time = res.meal_type;
  //       meals_list.forEach(e => {
  //         Object.assign(e, { meals_time });
  //       })
  //       console.log(meals_list);
  //       store.info.meals = meals_list;
  //     }
  //   })
  // }
}

export default withRouter(DinningPg)