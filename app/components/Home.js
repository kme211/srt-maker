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
import Icon from './Icon';
import { version } from '../package.json';
import FilesSavedModal from './FilesSavedModal';

class Home extends Component {
  props: {
    addFiles: () => void,
    updateFile: () => void,
    files: Array
  };

  state: {
    currentFileId: string,
    keyboardShortcutsModalOpen: boolean,
    filesSavedNames: array
  };

  constructor(props) {
    super(props);

    this.state = {
      currentFileId: '',
      keyboardShortcutsModalOpen: false,
      filesSavedNames: [],
      error: null
    };

    this.closeSavedMessage = this.closeSavedMessage.bind(this);
    this.getCompleteFiles = this.getCompleteFiles.bind(this);
    this.batchExport = this.batchExport.bind(this);
    this.exportToSrt = this.exportToSrt.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.updateCurrentFileId = this.updateCurrentFileId.bind(this);
    this.setTranscriptText = this.setTranscriptText.bind(this);
    this.updateTiming = this.updateTiming.bind(this);
    this.toggleKeyboardShortcutsModal = this.toggleKeyboardShortcutsModal.bind(
      this
    );
  }

  componentDidMount() {
    ipcRenderer.on('mp3-selected', (event, fileNames) => {
      if (fileNames) {
        const files = fileNames.map(filePath => ({
          filePath,
          id: cuid(),
          timing: []
        }));
        this.props.addFiles(files);
      }
    });

    ipcRenderer.on('session-filename', event => {
      event.sender.send('session-data', JSON.stringify(this.props.files));
    });

    ipcRenderer.on('session-loaded', (event, data) => {
      this.props.addFiles(JSON.parse(data));
    });

    ipcRenderer.on('files-saved', (event, filePath, filesSavedNames) => {
      this.setState({ filesSavedNames });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.files.length && this.props.files.length) {
      this.setState({ currentFileId: this.props.files[0].id });
    }
  }

  exportToSrt(files) {
    const data = files.map(file => {
      const { timing, filePath, id } = file;
      return {
        id,
        timing,
        fileName: `${filePath.split('\\').pop().slice(0, -4)}.srt`
      };
    });

    ipcRenderer.send('export-to-srt', data);
  }

  getCompleteFiles() {
    const allBlocksSet = block =>
      block.startTime !== 'not set' && block.endTime !== 'not set';
    const timingComplete = file => {
      if (!file.timing.length) return false;
      return file.timing.every(allBlocksSet);
    };

    return this.props.files.filter(timingComplete);
  }

  batchExport() {
    this.exportToSrt(this.getCompleteFiles());
  }

  openDialog() {
    ipcRenderer.send('add-mp3');
  }

  updateCurrentFileId(id: string) {
    this.setState({
      currentFileId: id
    });
  }

  closeSavedMessage() {
    this.setState({ filesSavedNames: [] });
  }

  setTranscriptText({ id, tempTiming }) {
    // id: string, tempTiming: {id: string, text: string}[]
    const timing = tempTiming.map(block =>
      Object.assign({}, block, {
        startTime: 'not set',
        endTime: 'not set'
      })
    );
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
    this.setState(prevState => ({
      keyboardShortcutsModalOpen: !prevState.keyboardShortcutsModalOpen
    }));
  }

  render() {
    const { files } = this.props;
    const {
      currentFileId,
      keyboardShortcutsModalOpen,
      filesSavedNames
    } = this.state;
    const currentFile = files.find(file => file.id === currentFileId);
    const batchExportEnabled = !!this.getCompleteFiles().length;

    return (
      <div>
        <div className={styles.container} data-tid="container">

          <div className={styles.main}>
            <header className={styles.header}>
              <h2>
                srt maker <span className={styles.version}>v{version}</span>
              </h2>
            </header>

            <div className={styles.middle}>
              <div className={styles.leftBar}>
                <AudioList
                  files={files}
                  currentFileId={currentFileId}
                  onClick={this.updateCurrentFileId}
                />
              </div>

              {currentFileId.length
                ? <Editor
                  file={currentFile}
                  setTranscriptText={this.setTranscriptText}
                  updateTiming={this.updateTiming}
                  exportToSrt={this.exportToSrt}
                />
                : <GettingStarted />}
            </div>

            <div className={styles.bottomBar}>
              <div className={styles.buttonGroup}>
                <button className="btn btn-default" onClick={this.openDialog}>
                  <Icon icon="add" aria-hidden="true" /> Add audio
                </button>
                <button
                  className="btn btn-default"
                  onClick={this.batchExport}
                  disabled={!batchExportEnabled}
                >
                  <Icon icon="export" aria-hidden="true" /> Batch export
                </button>
              </div>

              <button
                className="btn btn-default"
                onClick={this.toggleKeyboardShortcutsModal}
              >
                <Icon icon="keys" aria-hidden="true" /> Keyboard shortcuts
              </button>
            </div>
          </div>

        </div>

        <FilesSavedModal fileNames={filesSavedNames} closeHandler={this.closeSavedMessage} />

        <Modal
          isOpen={keyboardShortcutsModalOpen}
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
            <button onClick={this.toggleKeyboardShortcutsModal}>Close</button>
          </div>
        </Modal>

      </div>
    );
  }
}

export default Home;
