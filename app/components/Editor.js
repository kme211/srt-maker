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
    }

    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('animationEnd', (e) => {
            console.log('animationEnd', e)
        })
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
        const { currentTimingIndex } = this.state;
        const timing = this.props.file.timing;
        const maxTimingIndex = timing.length - 1;
        const block = timing[currentTimingIndex];

        const key = e.key;

        switch(key) {
            case 'a': 
                return block && this.handleTimingChange.call(this, 'startTime');
            case 'd': 
                return block && this.handleTimingChange.call(this, 'endTime');
            case 's':
                return currentTimingIndex < maxTimingIndex && this.setState({ currentTimingIndex: currentTimingIndex + 1 });
            case 'w':
                return currentTimingIndex > 0 && this.setState({ currentTimingIndex: currentTimingIndex - 1 });
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

    updateTempTiming(newTiming: {id: string, text: string}[]) {
        this.setState({ tempTiming: newTiming });
    }

    handleTimingChange(prop: string) {
        const validationErrors = [];
        const { file } = this.props;
        const { currentTimingIndex, pos } = this.state;
        const currentBlock = file.timing[currentTimingIndex];
        const currentPos = +pos;
        const currentEndTime = +currentBlock.endTimeSeconds;
        const currentStartTime = +currentBlock.startTimeSeconds;
        if(prop === 'startTime' && currentEndTime >= 0) {
            if(currentPos === currentEndTime) {
                validationErrors.push({ id: 0, button: prop, msg: 'Start time and end time cannot be equal.' });
            }
            if(currentPos > currentEndTime) {
                validationErrors.push({ id: 1, button: prop, msg: 'Start time cannot be greater than the end time.' });
            }
        } else if(prop ===  'endTime' && currentStartTime >= 0) {
            if(currentPos === currentStartTime) {
                validationErrors.push({ id: 2, button: prop, msg: 'Start time and end time cannot be equal.' });
            }
            if(currentPos < currentStartTime) {
                validationErrors.push({ id: 3, button: prop, msg: 'End time cannot be less than start time.' });
            }
        }

        this.setState({ validationErrors });

        if(validationErrors.length === 0) {
            this.props.updateTiming({ 
                id: file.id, 
                updatedBlock: Object.assign({}, currentBlock, { [prop]: getTimeString(pos), [prop + 'Seconds']: pos })
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

    exportCurrentFile() {
        const { file, exportToSrt } = this.props;
        exportToSrt([file.id]);
    }

    render() {
        const { file } = this.props;
        const timing = file.timing;
        const { playing, pos, tempTranscriptText, currentTimingIndex, tempTiming, validationErrors } = this.state;
        const setStartTimeBtnClass = validationErrors.find(err => err.button === 'startTime') ? styles.setTimeBtnShake : styles.setTimeBtn;
        const setEndTimeBtnClass = validationErrors.find(err => err.button === 'endTime') ? styles.setTimeBtnShake : styles.setTimeBtn;
        const block = timing[currentTimingIndex];
        const sep = file.filePath.match('\\\\') ? '\\' : '/';
        const fileName = file.filePath.split(sep).pop();
        const { startTime, endTime } = block || { startTime: 'not set', endTime: 'not set' };
        const complete = timing.length ? timing.every(block => block.startTime !== 'not set' && block.endTime !== 'not set') : false;
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

                <div className={styles.validationErrors}>
                    {validationErrors.map((err) => <div key={err.id}>{err.msg}</div>)}
                </div>

                <div className={styles.buttonPanel}>
                    {currentTimingIndex >= 0 && <button className={setStartTimeBtnClass} onClick={this.handleTimingChange.bind(this, 'startTime')}>Set start</button>}
                    <button onClick={this.handleTogglePlay}>{playing ? <i className="fa fa-pause" aria-hidden="true"></i> : <i className="fa fa-play" aria-hidden="true"></i>}</button>
                    {currentTimingIndex >= 0 && <button className={setEndTimeBtnClass} onClick={this.handleTimingChange.bind(this, 'endTime')}>Set end</button>}
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

                <div className={styles.buttonPanelBottom}><button disabled={!complete} onClick={this.exportCurrentFile}>Export</button></div>    
                
            </div>
        );
    }
}

export default Editor;