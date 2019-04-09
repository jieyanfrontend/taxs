import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import globalStore from '../globalStore';

const { SubMenu } = Menu;



class SiderMenu extends Component {
  render() {
    return (
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        style={{ height: '100%', borderRight: 0 }}
      >
        <SubMenu key="sub1" title={<span><Icon type="profile" theme="twoTone" />会议签到</span>}>
          <Menu.Item key="1"><Link to='/meetings'>新增会议</Link></Menu.Item>
          <Menu.Item key="2"><Link to='/checkIn'>签到明细</Link></Menu.Item>
        </SubMenu>
        <SubMenu key="sub2" title={<span><Icon type="home" theme="twoTone" />门禁权限</span>}>
          <Menu.Item key="3"><Link to='/entrance/authority'>门禁权限申请</Link></Menu.Item>
        </SubMenu>
        <SubMenu key="sub3" title={<span><Icon type="video-camera" theme="twoTone" />场地使用</span>}>
          <Menu.Item key="4"><Link to='/space/activity'>文体活动场地</Link></Menu.Item>
          <Menu.Item key="5"><Link to='/space/fnRoom'>多功能演播室</Link></Menu.Item>
        </SubMenu>
        <SubMenu key="sub4" title={<span><Icon type="book" theme="twoTone" />教育培训</span>}>
          <Menu.Item key="6"><Link to='/education/meetingplace'>会场预定</Link></Menu.Item>
        </SubMenu>
        {/* <SubMenu key="sub5" title={<span><Icon type="notification" theme="twoTone" />公务接待</span>}>
        </SubMenu> */}

        <SubMenu key="sub6" title={<span><Icon type="mail" theme="twoTone" />公务接待</span>}>
          <Menu.Item key="7"><Link to='/meetingReception'>围餐预定</Link></Menu.Item>
          <Menu.Item key="8"><Link to='/buffetReception'>自助餐预定</Link></Menu.Item>
          <Menu.Item key="9"><Link to='/hotelBooking'>酒店预定</Link></Menu.Item>
        </SubMenu>
        <SubMenu key="sub7" title={<span><Icon type="car" theme="twoTone" />公务用车</span>}>
          <Menu.Item key="9"><Link to='/useCar'>公务用车</Link></Menu.Item>
        </SubMenu>
      </Menu>
      // <Icon type="appstore" theme="twoTone" />
    )
  }
}

export default SiderMenu