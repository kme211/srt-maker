import React from 'react';
import Modal from 'react-modal';
import styles from './FilesSavedModal.css';
import Icon from './Icon';

const FilesSavedModal = ({ fileNames, closeHandler }) => (
  <Modal
    isOpen={fileNames.length ? true : false}
    style={{
      overlay: {
        zIndex: 3,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      },
      content: {
        background: '#080707',
        position: 'static',
        maxWidth: '600px',
        textAlign: 'center'
      }
    }}
    contentLabel="SavedMessage"
  >
    <Icon icon="checkmark" aria-hidden="true" style={{fontSize: '2em', color: '#A9C52F'}}/>
    <h2>Files saved!</h2>
     
    <ul className={styles.list}>
      {fileNames.map(name => <li className={styles.listItem} key={name}>{name}</li>)}
    </ul>
    <button onClick={closeHandler}>Close</button>
  </Modal>
);

export default FilesSavedModal;
