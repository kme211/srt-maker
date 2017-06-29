import React from 'react';
import styles from './styles.css';
import SessionInfo from './components/SessionInfo';

const Header = ({ sessionName, sessionStatus, sessionLastSaved, version }) => (
  <header className={styles.header}>
    <h2>
      srt maker
      {' '}
      <span className={styles.header__version}>v{version}</span>
    </h2>
    <SessionInfo
      name={sessionName}
      status={sessionStatus}
      lastSaved={sessionLastSaved}
    />
  </header>
);

export default Header;