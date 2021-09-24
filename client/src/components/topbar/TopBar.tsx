import React from 'react';
import {Language, NotificationsNone, Settings} from '@material-ui/icons'
import './topbar.css';

export const TopBar = () => {
  return (
    <div className='topbar'>
      <div className='topbarWrapper'>
        <div className='topleft'>
          <div className='logo'>Order Manager</div>
        </div>
        <div className='topRight'>
          <div className='topbarIconContainer'>
            <NotificationsNone></NotificationsNone>
            <span className="topIconBadge">2</span>
          </div>
          <div className='topbarIconContainer'>
            <Language></Language>
            <span className="topIconBadge">2</span>
          </div>
          <div className='topbarIconContainer'>
            <Settings></Settings>
          </div>
          <img src="/images/avatar.png" alt="" className='topAvatar' />
        </div>

      </div>
    </div>
  );
};
