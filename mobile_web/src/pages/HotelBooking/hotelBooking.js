import React from 'react';
import store from './store';
import { observer } from 'mobx-react';
import request from '../../helpers/request';
import { Switch, Calendar, DatePicker, List, Picker, WhiteSpace, InputItem, Card, WingBlank, Radio, Flex, Button, TextareaItem } from 'antd-mobile';
import moment from 'moment';

const meeting_counts = [
  {
    label: '1',
    value: '1',
  },
  {
    label: '2',
    value: '2',
  },
  {
    label: '3',
    value: '3',
  },
  {
    label: '4',
    value: '4',
  },
  {
    label: '5',
    value: '5',
  },
  {
    label: '6',
    value: '6',
  },
  {
    label: '7',
    value: '7',
  },
  {
    label: '8',
    value: '8',
  },
  {
    label: '9',
    value: '9',
  },
  {
    label: '10',
    value: '10',
  }
];


@observer
class HotelBookingCom extends React.Component {
  componentDidMount() {
    // this.getUser();
  }
  handleData = (e) => {

    let { unit, time_begin, time_end, hotel, male, female, single_room, double_room, members } = store;
    //   meals =  meals.replace(/[\r\n]/g, 'A');
    male = parseInt(male);
    female = parseInt(female);
    single_room = parseInt(single_room);
    double_room = parseInt(double_room);
    request({
      url: '/api/v1/hotel/save',
      method: 'POST',
      data: {
        unit,
        time_begin: moment(time_begin).format('YYYY-MM-DD'),
        time_end: moment(time_end).format('YYYY-MM-DD'),
        hotel,
        male,
        female,
        single_room,
        double_room,
        members
      },
      beforeSend: (xml) => {
        xml.setRequestHeader('token', sessionStorage.getItem('token'))
      },
      success: (res) => {
        alert('提交成功')
        store.tabSelect.selectedTab = 'redTab';
        this.getNeedList();
        this.fetchList(1);
      }
    })
  };
  getNeedList = () => {
    request({
      url: '/api/v1/flow/ready',
      method: 'GET',
      data: {
        wf_type: 'hotel_t',
      },
      beforeSend: (xml) => {
        xml.setRequestHeader('token', sessionStorage.getItem('token'))
      },
      success: (res) => {
        store.needList = res;
      }
    })
  }

  fetchList = (page) => {
    request({
      url: '/api/v1/flow/complete',
      method: 'GET',
      data: {
        wf_type: 'hotel_t',
        page: page,
        size: 10
      },
      beforeSend: (xml) => {
        xml.setRequestHeader('token', sessionStorage.getItem('token'))
      },
      success: (res) => {
        store.dataSource = res.data;
        store.total = res.last_page
      }
    })
  }
  render() {
    return (
      <div>
        <List className="calendar-list" style={{ backgroundColor: 'white' }}>
          <DatePicker
            mode="date"
            title="开始时间"
            extra="Optional"
            value={store.time_begin}
            onChange={date => store.time_begin = date}
            onOk={date => store.time_begin = date}
          >
            <List.Item arrow="horizontal">开始时间</List.Item>
          </DatePicker>
          <DatePicker
            mode="date"
            title="结束时间"
            extra="Optional"
            value={store.time_end}
            onChange={date => store.time_end = date}
            onOk={date => store.time_end = date}
          >
            <List.Item arrow="horizontal">结束时间</List.Item>
          </DatePicker>
          <InputItem
            placeholder="请输入"
            onChange={(e) => { store.unit = e }}
          >来访单位</InputItem>
          <InputItem
            placeholder="请输入"
            onChange={(e) => { store.hotel = e }}
          >拟入住酒店</InputItem>
          <Flex style={{ padding: '15px' }}>
            <Flex.Item>
              <Picker
                data={meeting_counts}
                cols={1}
                className="forss"
                value={store.male}
                onChange={(e) => { store.male = e }}
              >
                <List.Item arrow="horizontal">男：</List.Item>
              </Picker>
            </Flex.Item>
            <Flex.Item>
              <Picker
                data={meeting_counts}
                cols={1}
                className="forss"
                value={store.female}
                onChange={(e) => { store.female = e }}
              >
                <List.Item arrow="horizontal">女：</List.Item>
              </Picker>
            </Flex.Item>
          </Flex>
          <Flex style={{ padding: '15px' }}>
            <Flex.Item>
              <Picker
                data={meeting_counts}
                cols={1}
                className="forss"
                value={store.single_room}
                onChange={(e) => { store.single_room = e }}
              >
                <List.Item arrow="horizontal">单人房：</List.Item>
              </Picker>
            </Flex.Item>
            <Flex.Item>
              <Picker
                data={meeting_counts}
                cols={1}
                className="forss"
                value={store.double_room}
                onChange={(e) => { store.double_room = e }}
              >
                <List.Item arrow="horizontal">双人房：</List.Item>
              </Picker>
            </Flex.Item>
          </Flex>
          <List renderHeader={() => '人员名单'}>
            <TextareaItem
              placeholder="请用英文逗号隔开"
              rows={5}
              value={store.members}
              onChange={e => { store.members = e }}
            />
          </List>
        </List>
        <Button style={{ position: 'absolute', width: '100%', bottom: 0 }} type="primary" onClick={this.handleData}>提交</Button>
      </div>
    );
  }
}
export default HotelBookingCom;