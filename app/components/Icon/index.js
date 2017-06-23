import React from "react";
import styles from './index.css';

const Icon = ({ icon, ...props }) => {
  const svg = require(`./icons/${icon}.svg`);
  return <span className={styles.icon} {...props} dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default Icon;