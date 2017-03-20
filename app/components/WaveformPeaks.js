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

        if(this.props.playing && !prevProps.playing) {
            this.audio.play();
        } else if(!this.props.playing && prevProps.playing) {
            this.audio.pause();
        }
    }

    addSegments() {
        // Need to optimize this
        console.log('addSegments')
        const peaks = this.peaks;
        const { segments, fileName } = this.props;

        if(peaks.segments && peaks.segments.add && peaks.segments.removeAll) {

            peaks.segments.removeAll()
            segments.forEach(({ startTimeSeconds, endTimeSeconds, id }, index) => {
                peaks.segments.add({
                    startTime: startTimeSeconds, 
                    endTime: endTimeSeconds, 
                    color: Colors[index], 
                    labelText: `${fileName}_${index + 1}`,
                    id,
                    editable: true
                });
            });
        }
    }

    adjustContainer(container, callback = () => {}) {
        console.log('adjustContainer', container);
        const maxWidth = this.audio.duration * 92;
        let width = '100%';
        if(container.offsetWidth > maxWidth) {
            console.log('have to shrink waveform container');
            width = `${maxWidth}px`; 
        }

        this.setState({ width }, callback);
    }

    onAudio(audio) {
        console.log('save audio ref', audio);
        this.audio = audio;
        this.audio.addEventListener('loadedmetadata', () => {
            console.log('audio loadedmetadata', 'src', audio.currentSrc, 'duration', audio.duration);
            this.container.then((container) => { 
                this.adjustContainer(container, () => {
                    this.initPeaks(container, audio);
                });
            });
        });
        this.audio.addEventListener('timeupdate', (e) => {
            console.log('audio timeupdate', this.audio.currentTime);
            // this isn't very smooth; switch to requestAnimationFrame
            this.props.handlePosChange(this.audio.currentTime);
        });
    }

    onContainer(container) {
        console.log('save container ref');
        this.containerSet = true;
        this.resolveContainerPromise(container);
    }

    initPeaks(container, audio) {
        console.log('initPeaks');
        
        if(this.peaks) {
            console.log('destroy peaks');
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
                    id,
                    editable: true
                };
            })
        });

        this.peaks.on('error', (err) => {
            console.log('peaks had an error', err);
        });

        this.peaks.on('segments.ready', () => {
            console.log('peaks segments ready');
            //this.addSegments();
            this.timeoutId = window.setTimeout(() => {
                this.setState({ loading: false });
            }, 400);
        });

        this.peaks.on('user_seek.overview', (pos) => {
            console.log('user_seek.overview', pos);
        });

        this.peaks.on('user_seek.zoomview', (pos) => {
            console.log('user_seek.zoomview', pos);
        });
        
    }

    render() {
        
        const { filePath, pos, handlePosChange, playing } = this.props;
        const { loading, width } = this.state;
        console.log('render waveform. loading: ', loading);
        
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