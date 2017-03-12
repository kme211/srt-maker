// @flow
import React, { Component } from 'react';
import styles from './Editor.css';
import TranscriptModal from './TranscriptModal';
import Transcript from './Transcript';
import Waveform from './Waveform';
import getTimeString from '../utils/getTimeString';

class Editor extends Component {
    props: {
       file: {filePath: string, timing: [], id: string},
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
            tempTranscriptText: '',
            tempTiming: [],
            currentTimingIndex: -1
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
    }

    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyDown)
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.file.id !== this.props.file.id) {
            this.setState({
                playing: false,
                pos: 0,
                currentTimingIndex: -1
            });
        }
    }

    handleKeyDown(e) {
        if(this.state.transcriptModalIsOpen) return;
        const block = this.props.file.timing[this.state.currentTimingIndex];

        const key = e.key;

        switch(key) {
            case 'a': 
                return block && this.handleTimingChange.call(this, 'startTime');
            case 'd': 
                return block && this.handleTimingChange.call(this, 'endTime');
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
    handlePosChange(e) {
        this.setState({ pos: e.originalArgs[0] });
    }

    updateTempTranscriptText(e) {
        this.setState({ tempTranscriptText: e.target.value });
    }

    updateTempTiming(newTiming) {
        this.setState({ tempTiming: newTiming });
    }

    handleTimingChange(prop) {
        const { file } = this.props;
        const { currentTimingIndex, pos } = this.state;
        const currentBlock = file.timing[currentTimingIndex];
        this.props.updateTiming({ 
            id: file.id, 
            updatedBlock: Object.assign({}, currentBlock, { [prop]: getTimeString(pos) })
        });
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

    setCurrentTimingIndex(index) {
        this.setState({ currentTimingIndex: index });
    }

    exportCurrentFile() {
        const { file, exportToSrt } = this.props;
        exportToSrt([file.id]);
    }

    render() {
        const { file } = this.props;
        const timing = file.timing;
        const { playing, pos, tempTranscriptText, currentTimingIndex, tempTiming } = this.state;
        const block = timing[currentTimingIndex];
        const fileName = file.filePath.split('\\').pop();
        const { startTime, endTime } = block || { startTime: 'not set', endTime: 'not set' };
        const complete = timing.every(block => block.startTime !== 'not set' && block.endTime !== 'not set');
        return (
            <div className={styles.editor}>
                <div className={styles.waveform}>
                    <Waveform 
                        filePath={file.filePath}
                        pos={pos}
                        playing={playing}
                        handlePosChange={this.handlePosChange}
                    />
                </div>
                <div className={styles.time}>
                    {currentTimingIndex >= 0 && <div className={styles.timeBlock}>Start time: <div className={styles.timeValue}>{startTime}</div></div>}
                    <div className={styles.timeBlock}>Current time: <div className={styles.timeValue}>{getTimeString(pos)}</div></div>
                    {currentTimingIndex >= 0 && <div className={styles.timeBlock}>End time: <div className={styles.timeValue}>{endTime}</div></div>}
                </div>
                <div className={styles.buttonPanel}>
                    {currentTimingIndex >= 0 && <button className={styles.setTimeBtn} onClick={this.handleTimingChange.bind(this, 'startTime')}>Set start</button>}
                    <button onClick={this.handleTogglePlay}>{playing ? <i className="fa fa-pause" aria-hidden="true"></i> : <i className="fa fa-play" aria-hidden="true"></i>}</button>
                    {currentTimingIndex >= 0 && <button className={styles.setTimeBtn} onClick={this.handleTimingChange.bind(this, 'endTime')}>Set end</button>}
                </div>
                <div className={styles.transcript}>
                    {timing.length ?  <Transcript timing={timing} currentTimingIndex={currentTimingIndex} setCurrentTimingIndex={this.setCurrentTimingIndex} /> : <button onClick={this.openModal}>Add transcript</button>}
                    
                </div>

                <TranscriptModal 
                    isOpen={this.state.transcriptModalIsOpen}
                    text={tempTranscriptText}
                    closeModal={this.closeModal}
                    fileName={fileName}
                    updateTempTranscriptText={this.updateTempTranscriptText}
                    tempTiming={tempTiming}
                    updateTempTiming={this.updateTempTiming}
                    resetTranscript={this.resetTranscript}
                    saveTranscript={this.saveTranscript} />

                {complete && <button onClick={this.exportCurrentFile}>Export</button>}
            </div>
        );
    }
}

export default Editor;