// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.css';
import { ipcRenderer } from 'electron';
import AudioList from './AudioList';
import Editor from './Editor';
import GettingStarted from './GettingStarted';
import cuid from 'cuid';
import Icon from './Icon';
import { version } from '../package.json';
import Header from './Header';
import FilesSavedModal from './FilesSavedModal';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import getRandomColor from '../utils/getRandomColor';

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
      fileName: null,
      sessionLastSaved: null,
      sessionStatus: null,
      currentFileId: '',
      keyboardShortcutsModalOpen: false,
      filesSavedNames: [],
      error: null
    };

    this.updateTime = this.updateTime.bind(this);
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
    window.setTimeout(this.updateTime, 60000); // refresh fuzzy session time
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

    ipcRenderer.on('session-saving', event => {
      const fileName = this.state.fileName;
      event.sender.send(
        'session-data',
        JSON.stringify(this.props.files),
        fileName
      );
      this.setState({ sessionStatus: 'Saving...' });
    });

    ipcRenderer.on('session-loaded', (event, data, fileName) => {
      this.props.addFiles(JSON.parse(data));
      this.setState({
        fileName,
        sessionLastSaved: Date.now(),
        sessionStatus: 'Opened'
      });
    });

    ipcRenderer.on('session-saved', (event, fileName) => {
      const sessionName = fileName.split('\\').pop().replace('.json', '');
      this.setState({
        fileName,
        sessionLastSaved: Date.now(),
        sessionStatus: 'Saved'
      });
    });

    ipcRenderer.on('files-saved', (event, filePath, filesSavedNames) => {
      this.setState({ filesSavedNames });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.files.length && this.props.files.length) {
      this.setState({ currentFileId: this.props.files[0].id });
    }
    if (this.state.fileName && prevProps.files !== this.props.files) {
      ipcRenderer.send('session-updated');
    }
  }

  updateTime() {
    this.forceUpdate();
    window.setTimeout(this.updateTime, 60000);
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

  openDialog(e) {
    e.target.blur();
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
    const colors = tempTiming.map(block => block.color);
    const timing = tempTiming.map(block => {
      if (block.color) return block; // don't set defaults if defaults have already been set
      const color = getRandomColor(colors);
      colors.push(color);
      return Object.assign({}, block, {
        startTime: 'not set',
        endTime: 'not set',
        color
      });
    });
    this.props.updateFile({ id, timing });
  }

  updateTiming({ id, updatedBlock, clear }) {
    const file = this.props.files.find(file => file.id === id);
    let timing;

    if (clear) {
      timing = file.timing.map(block =>
        Object.assign({}, block, {
          startTime: 'not set',
          endTime: 'not set',
          startTimeSeconds: undefined,
          endTimeSeconds: undefined
        })
      );
    } else {
      const index = file.timing.findIndex(
        block => block.id === updatedBlock.id
      );
      timing = [
        ...file.timing.slice(0, index),
        updatedBlock,
        ...file.timing.slice(index + 1)
      ];
    }

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
      filesSavedNames,
      fileName,
      sessionStatus,
      sessionLastSaved
    } = this.state;
    const currentFile = files.find(file => file.id === currentFileId);
    const sessionName = fileName
      ? fileName.split('\\').pop().replace('.json', '')
      : 'Untitled session*';
    const batchExportEnabled = !!this.getCompleteFiles().length;

    return (
      <div>
        <div className={styles.container} data-tid="container">

          <div className={styles.main}>
            <Header
              version={version}
              sessionName={sessionName}
              sessionStatus={sessionStatus}
              sessionLastSaved={sessionLastSaved}
            />

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

        <FilesSavedModal
          fileNames={filesSavedNames}
          closeHandler={this.closeSavedMessage}
        />

        <KeyboardShortcutsModal
          isOpen={keyboardShortcutsModalOpen}
          closeHandler={this.toggleKeyboardShortcutsModal}
        />

      </div>
    );
  }
}

export default Home;
