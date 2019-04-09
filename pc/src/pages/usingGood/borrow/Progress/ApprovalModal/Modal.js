import React, { Component, Fragment } from 'react';
import { Modal, Radio, Input, Form, Table } from 'antd';
import { observer } from 'mobx-react';
import store from '../store';
import request from '../../../../../helpers/request'

const { TextArea } = Input;
const RadioGroup = Radio.Group;

@observer
class Approval extends Component {
  columns = [
    {
      title: '日期',
      dataIndex: 'create_time'
    },
    {
      title: '品名',
      dataIndex: 'sku'
    },
    {
      title: '类别',
      dataIndex: 'category'
    },
    {
      title: '规格型号',
      dataIndex: 'format'
    },
    {
      title: '借用数量',
      dataIndex: 'count'
    },
    {
      title: '归还时间',
      dataIndex: 'time_end'
    },
  ]
  render() {
    let { params, form } = this.props;
    let { getFieldDecorator, isFieldTouched, getFieldError, getFieldsError } = form;
    let { visible, loading } = params
    let { info, dataSource } = store;
    let { proDataSource } = info;
    let step = proDataSource.length;
    console.log(step);
    return (
      <Fragment>
        <Modal title={step == 3 ? '归还' : '审批'} visible={visible} onCancel={this.handleCancel} onOk={this.handleOk} okText='确定' cancelText='取消'>
          {
            step == 3 ?
              <Form>
                {getFieldDecorator('submit_to_save',{initialValue:'ok'})}
                {getFieldDecorator('check_con',{initialValue:''})}
                <Table columns={this.columns} dataSource={dataSource} ></Table>
              </Form>
              :
              <Form>
                <div style={{ textAlign: 'center' }}>
                  {
                    getFieldDecorator('submit_to_save')(
                      <RadioGroup name='submit_to_save'>
                        <Radio value='back' style={{ marginRight: 15 }}>{step == 4 ? '未还':'不通过'}</Radio>
                        <Radio value='ok'>{step == 4 ? '已还' : '通过'}</Radio>
                      </RadioGroup>
                    )
                  }
                </div>
                <div style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <span style={{ lineHeight: 7 }} >审批意见：</span>
                  {
                    getFieldDecorator('check_con')(<TextArea rows={4} style={{ width: '60%', marginTop: 15 }} ></TextArea>)
                  }
                </div>
              </Form>
          }
        </Modal>
      </Fragment>
    )
  }



  handleCancel = () => {
    store.params.visible = false
  }

  handleOk = () => {
    let { props, wf_fid } = this.props;
    let { info } = props;
    let { flow_id, run_id, flow_process, run_process, nexprocess } = info;
    let values = this.props.form.getFieldsValue();
    let { check_con, submit_to_save } = values;
    request({
      url: '/api/v1/flow/check/pass',
      method: 'POST',
      data: {
        check_con,
        flow_id,
        run_id,
        flow_process,
        run_process,
        npid: nexprocess.id,
        wf_fid,
        submit_to_save,
        wf_type: 'borrow_t '
      },
      beforeSend: (xml) => {
        xml.setRequestHeader('token', localStorage.getItem('token'))
      },
      success: () => {
        store.params.visible = false;
        store.data.check = 2
        this.fetchList();
      },
      complete: (res) => {
      }
    })
  }
  fetchList = () => {
    let { props, wf_fid } = this.props;
    var pro = [];
    request({
      url: '/api/v1/flow/info',
      method: 'GET',
      data: {
        wf_type: 'borrow_t ',
        wf_fid: wf_fid
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
}

export default Form.create()(Approval)