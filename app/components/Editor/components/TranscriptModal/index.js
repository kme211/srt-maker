// @flow
import React, { Component } from 'react';
import styles from './styles.css';
import Modal from 'react-modal';
import TranscriptTextarea from './components/TranscriptTextarea';
import TranscriptEditor from './components/TranscriptEditor';

class TranscriptModal extends Component {
  props: {
    isOpen: Function,
    closeModal: Function,
    fileName: string,
    text: string,
    resetTranscript: Function,
    updateTempTranscriptText: Function,
    saveTranscript: Function
  };

  render() {
    const {
      error,
      isOpen,
      closeModal,
      fileName,
      text,
      resetTranscript,
      updateTempTranscriptText,
      tempTiming,
      updateTempTiming,
      saveTranscript
    } = this.props;
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
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
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'static',
            width: '600px'
          }
        }}
        contentLabel="Transcript"
      >

        <h1 className={styles.header}>Transcript for {fileName}</h1>

        <div>
          {!text.length && !tempTiming.length
            ? <TranscriptTextarea
              value={text}
              onChange={updateTempTranscriptText}
            />
            : <TranscriptEditor
              transcript={text}
              tempTiming={tempTiming}
              updateTempTiming={updateTempTiming}
            />}
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.buttonPanel}>
          <button onClick={saveTranscript}>Save</button>
          <button onClick={closeModal}>Cancel</button>
          {text.length > 0 &&
            <button onClick={resetTranscript} className="danger">Reset</button>}
        </div>

      </Modal>
    );
  }
}

export default TranscriptModal;
