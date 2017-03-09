// @flow
import React, { Component } from 'react';
import styles from './Editor.css';
import Modal from 'react-modal';
import Transcript from './Transcript';
import Waveform from './Waveform';

class Editor extends Component {
    props: {
       file: {filePath: string, timing: [], id: string},
       setTranscriptText: Function,
       updateTiming: Function
    };

    constructor(props) {
        super(props);

        this.state = {
            playing: false,
            pos: 0,
            transcriptModalIsOpen: false,
            tempTranscriptText: '',
            currentTimingIndex: -1
        };

        this.handleTogglePlay = this.handleTogglePlay.bind(this);
        this.handlePosChange = this.handlePosChange.bind(this);

        this.setCurrentTimingIndex = this.setCurrentTimingIndex.bind(this);
        this.handleTimingChange = this.handleTimingChange.bind(this);
        this.updateTempTranscriptText = this.updateTempTranscriptText.bind(this);
        this.saveTranscript = this.saveTranscript.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyDown)
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.fileId !== this.props.fileId) {
            this.setState({
                playing: false,
                pos: 0,
                currentTimingIndex: -1
            });
        }
    }

    handleKeyDown(e) {
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
        this.setState({ transcriptModalIsOpen: true });
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

    handleTimingChange(prop) {
        const { file } = this.props;
        const { currentTimingIndex, pos } = this.state;
        console.log('pos', pos)
        const currentBlock = file.timing[currentTimingIndex];
        this.props.updateTiming({ 
            id: file.id, 
            updatedBlock: Object.assign({}, currentBlock, { [prop]: pos.toFixed(2) })
        });
    }

    saveTranscript() {
        console.log('saveTranscript');
        this.props.setTranscriptText({ 
            id: this.props.file.id, 
            text: this.state.tempTranscriptText
        });
        this.setState({ currentTimingIndex: 0 });
        this.closeModal();
    }

    setCurrentTimingIndex(index) {
        this.setState({ currentTimingIndex: index });
    }

    render() {
        const { file } = this.props;
        const timing = file.timing;
        const { playing, pos, tempTranscriptText, currentTimingIndex } = this.state;
        const block = timing[currentTimingIndex];
        const { startTime, endTime } = block || { startTime: 'not set', endTime: 'not set' };
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
                    <div className={styles.timeBlock}>Current time: <div className={styles.timeValue}>{pos.toFixed(2)}</div></div>
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

                <Modal
                    isOpen={this.state.transcriptModalIsOpen}
                    onRequestClose={this.closeModal}
                    style={{
                        overlay: {
                            zIndex: 3,
                            background: 'rgba(0,0,0,0.5)'
                        },
                        content: {
                            background: 'rgba(0,0,0,0.8)'
                        }
                    }}
                    contentLabel="Transcript">

                    <h1 className={styles.modalHeader}>Transcript for {file.filePath.split('\\').pop()}</h1>
                    <textarea className={styles.modalTextarea} rows={5} value={tempTranscriptText} onChange={this.updateTempTranscriptText} placeholder="Audio transcript..."/>
                    <button onClick={this.saveTranscript}>Save</button>
                    <button onClick={this.closeModal}>Cancel</button>

                </Modal>
            </div>
        );
    }
}

export default Editor;