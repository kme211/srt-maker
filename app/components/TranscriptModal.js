// @flow
import React, { Component } from 'react';
import styles from './TranscriptModal.css';
import Modal from 'react-modal';
import TranscriptTextarea from './TranscriptTextarea';
import TranscriptEditor from './TranscriptEditor';

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
        const { isOpen, closeModal, fileName, text, resetTranscript, updateTempTranscriptText, tempTiming, updateTempTiming, saveTranscript } = this.props;
        return (
             <Modal
                isOpen={isOpen}
                onRequestClose={closeModal}
                style={{
                    overlay: {
                        zIndex: 3,
                        background: 'rgba(0,0,0,0.5)'
                    },
                    content: {
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }
                }}
                contentLabel="Transcript">

                <h1 className={styles.header}>Transcript for {fileName}</h1>
                
                <div>
                    {text.length === 0 ? <TranscriptTextarea value={text} onChange={updateTempTranscriptText} /> : 
                    <TranscriptEditor transcript={text} tempTiming={tempTiming} updateTempTiming={updateTempTiming} />}
                </div>

                <div className={styles.buttonPanel}>
                    <button onClick={saveTranscript}>Save</button>
                    <button onClick={closeModal}>Cancel</button>
                    {text.length > 0 && <button onClick={resetTranscript} className="danger">Reset</button>}
                </div>

            </Modal>
        );
    }
}

export default TranscriptModal;