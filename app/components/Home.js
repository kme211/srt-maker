// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.css';
import { ipcRenderer } from 'electron';
import AudioList from './AudioList';
import Editor from './Editor';
import GettingStarted from './GettingStarted';
import cuid from 'cuid';
import Modal from 'react-modal';

class Home extends Component {
  props: {
    addFiles: () => void,
    updateFile: () => void,
    files: array
  };

  constructor(props) {
    super(props);

    this.state = {
      currentFileId: '',
      keyboardShortcutsModalOpen: false
    };

    this.exportToSrt = this.exportToSrt.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.updateCurrentFileId = this.updateCurrentFileId.bind(this);
    this.setTranscriptText = this.setTranscriptText.bind(this);
    this.updateTiming = this.updateTiming.bind(this);
    this.toggleKeyboardShortcutsModal = this.toggleKeyboardShortcutsModal.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('mp3-selected', (event, fileNames) => {
      if(fileNames) {
        const files = fileNames.map((filePath) => {
          return {
            filePath,
            id: cuid(),
            timing: []
          }
        });
        this.props.addFiles(files)
      }
    });

    ipcRenderer.on('session-filename', (event) => {
      event.sender.send('session-data', JSON.stringify(this.props.files));
    });

    ipcRenderer.on('session-loaded', (event, data) => {
      this.props.addFiles(JSON.parse(data));
    });
  }

  exportToSrt(ids: string[]) {
    const data = [];
    for(let id of ids) {
      const file = this.props.files.find(file => file.id === id);
      const { timing, filePath } = file;
      data.push({
        id,
        timing,
        fileName: filePath.split('\\').pop().slice(0, -4) + '.srt'
      });
    }
      
      ipcRenderer.send('export-to-srt', data);
    }

  openDialog() {
    ipcRenderer.send('add-mp3');
  }

  updateCurrentFileId(id) {
    this.setState({
      currentFileId: id
    });
  }

  setTranscriptText({ id, tempTiming }) {
    // id: string, tempTiming: {id: string, text: string}[]
    const timing = tempTiming.map((block) => {
        return Object.assign({}, block, { startTime: 'not set', endTime: 'not set' });
      });
    this.props.updateFile({ id, timing });
  }

  updateTiming({ id, updatedBlock }) {
    // id: string, updatedBlock: {id: string, text: string, startTime: string, endTime: string}
    const file = this.props.files.find(file => file.id === id);
    const index = file.timing.findIndex(block => block.id === updatedBlock.id);
    const timing = [
      ...file.timing.slice(0, index),
      updatedBlock,
      ...file.timing.slice(index + 1)
    ];
    this.props.updateFile({ id, timing });
  }

  toggleKeyboardShortcutsModal() {
    this.setState((prevState) => {
      return { keyboardShortcutsModalOpen: !prevState.keyboardShortcutsModalOpen };
    });
  }

  render() {
    const { files } = this.props;
    const { currentFileId, keyboardShortcutsModalOpen } = this.state;
    const currentFile = files.find(file => file.id === currentFileId);
    return (
      <div>
        <div className={styles.container} data-tid="container">
          

          <div className={styles.main}>
            <header className={styles.header}>
              <h2>srt maker</h2>
            </header>

            <div className={styles.middle}>
              <div className={styles.leftBar}>
                <AudioList files={files} currentFileId={currentFileId} onClick={this.updateCurrentFileId} />
              </div>

              {currentFileId.length ? <Editor file={currentFile} setTranscriptText={this.setTranscriptText} updateTiming={this.updateTiming} exportToSrt={this.exportToSrt}/> : <GettingStarted/>}
            </div>

            <div className={styles.bottomBar}>
                <button className="btn btn-default" onClick={this.openDialog}><i className="fa fa-plus" aria-hidden="true"></i> Add audio</button>
                <button className="btn btn-default" onClick={this.toggleKeyboardShortcutsModal}><i className="fa fa-keyboard-o" aria-hidden="true"></i> Keyboard shortcuts</button>
            </div>
          </div>

          
          
        </div>

        <Modal
          isOpen={keyboardShortcutsModalOpen}
          style={{
              overlay: {
                  zIndex: 3,
                  background: 'rgba(0,0,0,0.5)'
              },
              content: {
                  background: 'rgba(0,0,0,0.8)'
              }
          }}
          contentLabel="KeyboardShortcuts">
          <div className={styles.keyboardShortcuts}>
            <h1>Keyboard shortcuts</h1>
            <p><code>a</code> set start time</p>
            <p><code>d</code> set end time</p>
            <p><code>w</code> select previous text block</p>
            <p><code>s</code> select next text block</p>
            <p><code>spacebar</code> toggle play/pause</p>
            <button onClick={this.toggleKeyboardShortcutsModal}>Close</button>
          </div>
        </Modal>

        
      </div>
    );
  }
}

export default Home;