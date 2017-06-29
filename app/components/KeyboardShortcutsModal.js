import React from 'react';
import Modal from 'react-modal';
import styles from './KeyboardShortcutsModal.css';

const KeyboardShortcutsModal = ({ isOpen, closeHandler }) => (
  <Modal
          isOpen={isOpen}
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
              maxWidth: '600px'
            }
          }}
          contentLabel="KeyboardShortcuts"
        >
          <div className={styles.keyboardShortcuts}>
            <h1>Keyboard shortcuts</h1>
            <p><code>a</code> set start time</p>
            <p><code>d</code> set end time</p>
            <p><code>w</code> select previous text block</p>
            <p><code>s</code> select next text block</p>
            <p><code>spacebar</code> toggle play/pause</p>
            <button onClick={closeHandler}>Close</button>
          </div>
        </Modal>
);

export default KeyboardShortcutsModal;