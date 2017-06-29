import React from 'react';
import getRelativeTimeAgo from '../../../utils/getRelativeTimeAgo';
import styles from './SessionInfo.css';

const SessionInfo = ({ name, status, lastSaved }) => (
  <div className={styles.session}>
    <div className={styles.session__name}>{name}</div>
    <div
      className={
        lastSaved ? styles.session__saveTime : styles.session__saveTimeDanger
      }
    >
      {lastSaved
        ? `${status} ${getRelativeTimeAgo(lastSaved)}`
        : '*Session has not been saved yet. Ctrl-S to save.'}
    </div>
  </div>
);

export default SessionInfo;
