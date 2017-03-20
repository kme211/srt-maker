// @flow
import React, { Component } from 'react';
import Peaks from '../../node_modules/peaks.js/peaks.js';
//import Peaks from 'peaks.js';
import styles from './WaveformPeaks.css';
import Colors from './Colors';
import LoadingDots from './LoadingDots';

class WaveformPeaks extends Component {
    props: {
       filePath: string,
       pos: number,
       handlePosChange: Function,
       playing: boolean
    };

    constructor(props) {
        super(props);

        this.state = {
            width: '100%',
            loading: true
        };

        this.ctx = new AudioContext();

        this.resolveContainerPromise = null;

        this.container = new Promise((resolve, reject) => {
            this.resolveContainerPromise = resolve;
        });

        this.container.then((container) => {
            window.addEventListener('resize', this.adjustContainer.bind(this, container));
        });

        this.onAudio = this.onAudio.bind(this);
        this.updateCurrentTime = this.updateCurrentTime.bind(this);
        this.onContainer = this.onContainer.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.filePath !== this.props.filePath) {
            window.clearTimeout(this.timeoutId);
            this.audio.src = this.props.filePath;
            this.setState({
                width: '100%',
                loading: true
            });
        }

        if(prevProps.segments !== this.props.segments) {
            this.updateSegments();
        }

        if(this.props.playing && !prevProps.playing) {
            this.audio.play();
            this.updateCurrentTime();
        } else if(!this.props.playing && prevProps.playing) {
            this.audio.pause();
        }
    }

    componentWillMount() {
        this.ctx.close();
    }

    updateCurrentTime() {
        this.props.handlePosChange(this.audio.currentTime);
        if(!this.props.playing) return;
        window.requestAnimationFrame(this.updateCurrentTime);
    }

    updateSegments() {
        const peaks = this.peaks;
        if(!peaks.segments) return;
        const { segments, fileName } = this.props;
        const peaksSegments = peaks.segments.getSegments();
        segments.forEach(({ id, startTimeSeconds: startTime, endTimeSeconds: endTime }, index) => {
            const peaksSegment = peaksSegments.find(s => s.id === id);
            if(!peaksSegment || peaksSegment.startTime !== startTime || peaksSegment.endTime !== endTime) {
                peaks.segments.removeById(id);
                peaks.segments.add({
                    startTime: startTime, 
                    endTime: endTime, 
                    color: Colors[index], 
                    labelText: `${fileName}_${index + 1}`,
                    id
                })
            }
        });
    }

    adjustContainer(container, callback) {
        const maxWidth = this.audio.duration * 92;
        let width = '100%';
        if(container.offsetWidth > maxWidth) {
            width = `${maxWidth}px`; 
        }
        this.setState({ width }, callback);
    }

    onAudio(audio) {
        this.audio = audio;
        this.audio.addEventListener('loadedmetadata', () => {
            this.container.then((container) => { 
                this.adjustContainer(container, () => {
                    this.initPeaks(container, audio);
                });
            });
        });
        this.audio.addEventListener('timeupdate', (e) => {
            this.updateCurrentTime();
        });
    }

    onContainer(container) {
        this.containerSet = true;
        this.resolveContainerPromise(container);
    }

    initPeaks(container, audio) {
        
        if(this.peaks) {
            this.peaks.destroy();
            this.peaks = null;
        }

        const { segments, fileName } = this.props;        
        const ctx = this.ctx;

        this.peaks = Peaks.init({
            container: container,
            mediaElement: audio,
            audioContext: ctx,
            height: 100,
            zoomWaveformColor: 'rgba(0, 225, 128, 1)',
            playheadColor: '#D62B70',
            segments: segments.map(({ startTimeSeconds, endTimeSeconds, id }, index) => {
                return {
                    startTime: startTimeSeconds, 
                    endTime: endTimeSeconds, 
                    color: Colors[index], 
                    labelText: `${fileName}_${index + 1}`,
                    id
                };
            })
        });

        this.peaks.on('error', (err) => {
            console.log('peaks had an error', err);
        });

        this.peaks.on('segments.ready', () => {
            this.timeoutId = window.setTimeout(() => {
                this.setState({ loading: false });
            }, 400);
        });
        
    }

    render() {
        
        const { filePath, pos, handlePosChange, playing } = this.props;
        const { loading, width } = this.state;
        
        return (
            <div className={styles.container}>

                {loading && <div className={styles.loader}><LoadingDots/></div>}
                
                <div id="peaks-container" ref={(container) => { !this.containerSet && this.onContainer(container); }} className={styles.waveform} style={{ width: width }}>
                </div>
                <audio ref={(audio) => { !this.audio && this.onAudio(audio); }}  src={filePath}/>
            </div>
        );
    }
}

export default WaveformPeaks;