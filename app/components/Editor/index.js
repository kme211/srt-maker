// @flow
import React, { Component } from 'react';
import styles from './styles.css';
import TranscriptModal from './components/TranscriptModal';
import Transcript from './components/Transcript';
import WaveformPeaks from './components/WaveformPeaks';
import getTimeString from '../../utils/getTimeString';
import getValidationErrors from '../../utils/getValidationErrors';
import ScrollArea from 'react-scrollbar';
import Icon from '../Icon';

class Editor extends Component {
  props: {
    file: { filePath: string, timing: [], id: string },
    setTranscriptText: Function,
    updateTiming: Function,
    exportToSrt: Function
  };

  constructor(props) {
    super(props);

    this.state = {
      playing: false,
      pos: 0,
      transcriptModalIsOpen: false,
      transcriptTextError: null,
      tempTranscriptText: '',
      tempTiming: [],
      currentTimingIndex: -1,
      validationErrors: []
    };

    this.handleTogglePlay = this.handleTogglePlay.bind(this);
    this.handlePosChange = this.handlePosChange.bind(this);

    this.setCurrentTimingIndex = this.setCurrentTimingIndex.bind(this);
    this.handleTimingChange = this.handleTimingChange.bind(this);
    this.updateTempTranscriptText = this.updateTempTranscriptText.bind(this);
    this.updateTempTiming = this.updateTempTiming.bind(this);
    this.saveTranscript = this.saveTranscript.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.resetTranscript = this.resetTranscript.bind(this);
    this.exportCurrentFile = this.exportCurrentFile.bind(this);
    this.clearTiming = this.clearTiming.bind(this);
    this.editTranscript = this.editTranscript.bind(this);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.file.id !== this.props.file.id) {
      this.setState({
        playing: false,
        pos: 0,
        currentTimingIndex: -1
      });
    }
  }

  handleKeyDown(e) {
    if (this.state.transcriptModalIsOpen) return;
    const { currentTimingIndex } = this.state;
    const timing = this.props.file.timing;
    const maxTimingIndex = timing.length - 1;
    const block = timing[currentTimingIndex];

    const key = e.key;

    switch (key) {
      case 'a':
        return block && this.handleTimingChange.call(this, 'startTime');
      case 'd':
        return block && this.handleTimingChange.call(this, 'endTime');
      case 's':
        return (
          currentTimingIndex < maxTimingIndex &&
          this.setState({ currentTimingIndex: currentTimingIndex + 1 })
        );
      case 'w':
        return (
          currentTimingIndex > 0 &&
          this.setState({ currentTimingIndex: currentTimingIndex - 1 })
        );
      case ' ':
        return this.handleTogglePlay();
    }
  }

  openModal() {
    this.setState({
      transcriptModalIsOpen: true,
      tempTranscriptText: '',
      tempTiming: []
    });
  }

  closeModal() {
    this.setState({ transcriptModalIsOpen: false });
  }

  handleTogglePlay() {
    this.setState({
      playing: !this.state.playing
    });
  }

  handlePosChange(pos) {
    this.setState({ pos });
  }

  updateTempTranscriptText(e) {
    if (e.target.value.length === 1) {
      return this.setState({
        transcriptTextError: 'Oops, the transcript must be pasted in!'
      });
    }
    this.setState({
      tempTranscriptText: e.target.value,
      transcriptTextError: null
    });
  }

  updateTempTiming(newTiming) {
    this.setState({ tempTiming: newTiming });
  }

  handleTimingChange(prop: string) {
    const { file } = this.props;
    const { currentTimingIndex, pos } = this.state;
    const validationErrors = getValidationErrors(
      file.timing,
      currentTimingIndex,
      +pos,
      prop
    );

    this.setState({ validationErrors });

    if (validationErrors.length === 0) {
      this.props.updateTiming({
        id: file.id,
        updatedBlock: Object.assign({}, file.timing[currentTimingIndex], {
          [prop]: getTimeString(pos),
          [`${prop}Seconds`]: pos
        })
      });
    }
  }

  resetTranscript() {
    this.setState({ tempTranscriptText: '' });
  }

  saveTranscript() {
    this.props.setTranscriptText({
      id: this.props.file.id,
      tempTiming: this.state.tempTiming
    });
    this.setState({ currentTimingIndex: 0 });
    this.closeModal();
  }

  setCurrentTimingIndex(index: number) {
    this.setState({ currentTimingIndex: index });
  }

  exportCurrentFile(e) {
    e.target.blur();
    const { file, exportToSrt } = this.props;
    exportToSrt([file]);
  }

  clearTiming(e) {
    e.target.blur();
    const { file, updateTiming } = this.props;
    updateTiming({ id: file.id, clear: true });
  }

  editTranscript(e) {
    e.target.blur();
    const { file } = this.props;
    this.setState({ transcriptModalIsOpen: true, tempTiming: [].concat(file.timing) });
  }

  render() {
    const { file } = this.props;
    const timing = file.timing;

    const {
      playing,
      pos,
      tempTranscriptText,
      currentTimingIndex,
      tempTiming,
      validationErrors,
      transcriptTextError
    } = this.state;
    const setStartTimeBtnClass = validationErrors.find(
      err => err.button === 'startTime'
    )
      ? styles.setTimeBtnShake
      : styles.setTimeBtn;
    const setEndTimeBtnClass = validationErrors.find(
      err => err.button === 'endTime'
    )
      ? styles.setTimeBtnShake
      : styles.setTimeBtn;
    const block = timing[currentTimingIndex];
    const sep = file.filePath.match('\\\\') ? '\\' : '/';
    const fileName = file.filePath.split(sep).pop();
    const { startTime, endTime } = block || {
      startTime: 'not set',
      endTime: 'not set'
    };
    const complete = timing.length
      ? timing.every(
          block => block.startTime !== 'not set' && block.endTime !== 'not set'
        )
      : false;
    const waveformSegments = timing.filter(
      block => block.startTimeSeconds >= 0 && block.endTimeSeconds
    );

    return (
      <div className={styles.editor}>
        <div className={styles.waveform}>
          <WaveformPeaks
            filePath={file.filePath}
            fileName={fileName.slice(0, -4)}
            pos={pos}
            playing={playing}
            handlePosChange={this.handlePosChange}
            segments={waveformSegments}
          />
        </div>
        <div className={styles.time}>
          {currentTimingIndex >= 0 &&
            <div className={styles.timeBlock}>
              Start time: <div className={styles.timeValue}>{startTime}</div>
            </div>}
          <div className={styles.timeBlock}>
            Current time:
            {' '}
            <div className={styles.timeValue}>{getTimeString(pos)}</div>
          </div>
          {currentTimingIndex >= 0 &&
            <div className={styles.timeBlock}>
              End time: <div className={styles.timeValue}>{endTime}</div>
            </div>}
        </div>

        <div className={styles.validationErrors}>
          {validationErrors.map(err => <div key={err.id}>{err.msg}</div>)}
        </div>

        <div className={styles.buttonPanel}>
          {currentTimingIndex >= 0 &&
            <button
              className={setStartTimeBtnClass}
              onClick={this.handleTimingChange.bind(this, 'startTime')}
            >
              <Icon icon="bookmark" />Set start
            </button>}
          <button onClick={this.handleTogglePlay}>
            {playing
              ? <Icon icon="pause" aria-hidden="true" />
              : <Icon icon="play" aria-hidden="true" />}
          </button>
          {currentTimingIndex >= 0 &&
            <button
              className={setEndTimeBtnClass}
              onClick={this.handleTimingChange.bind(this, 'endTime')}
            >
              <Icon icon="bookmark" />Set end
            </button>}
        </div>
        <ScrollArea
          className={styles.transcript}
          speed={0.8}
          horizontal={false}
        >
          {timing.length
            ? <Transcript
              timing={timing}
              currentTimingIndex={currentTimingIndex}
              setCurrentTimingIndex={this.setCurrentTimingIndex}
            />
            : <button onClick={this.openModal}>Add transcript</button>}

        </ScrollArea>

        <TranscriptModal
          isOpen={this.state.transcriptModalIsOpen}
          text={tempTranscriptText}
          error={transcriptTextError}
          closeModal={this.closeModal}
          fileName={fileName}
          updateTempTranscriptText={this.updateTempTranscriptText}
          tempTiming={tempTiming}
          updateTempTiming={this.updateTempTiming}
          resetTranscript={this.resetTranscript}
          saveTranscript={this.saveTranscript}
        />

        <div className={styles.buttonPanelBottom}>
          <button disabled={!complete} onClick={this.exportCurrentFile}>
            Export
          </button>
          <button onClick={this.editTranscript}>
            Edit transcript
          </button>
          <button onClick={this.clearTiming}>
            Clear timing
          </button>
        </div>

      </div>
    );
  }
}

export default Editor;
