// @flow
import React, { Component } from 'react';
import Peaks from '../../node_modules/peaks.js/peaks.js';
import Colors from './Colors';

class WaveformPeaks extends Component {
    props: {
       filePath: string,
       pos: number,
       handlePosChange: Function,
       playing: boolean
    };

    constructor(props) {
        super(props);

        this.ctx = new AudioContext();

        this.resolveContainerPromise = null;

        this.container = new Promise((resolve, reject) => {
            this.resolveContainerPromise = resolve;
        });

        this.onAudio = this.onAudio.bind(this);
        this.onContainer = this.onContainer.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        //console.log('componentDidUpdate')
        if(prevProps.filePath !== this.props.filePath) {
            this.audio.src = this.props.filePath;
        }

        if(this.props.playing && !prevProps.playing) {
            this.audio.play();
        } else if(!this.props.playing && prevProps.playing) {
            this.audio.pause();
        }
    }

    addSegments() {
        const peaks = this.peaks;
        const { segments, fileName } = this.props;

        if(peaks.segments && peaks.segments.add && peaks.segments.removeAll) {
            // Need to optimize this
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

    onAudio(audio) {
        console.log('save audio ref');
        this.audio = audio;
        this.audio.addEventListener('loadedmetadata', () => {
            console.log('audio loadedmetadata', audio.currentSrc);
            this.container.then((container) => {
                this.initPeaks(container, audio);
            });
        });
        this.audio.addEventListener('timeupdate', (e) => {
            console.log('audio timeupdate', this.audio.currentTime);
            this.props.handlePosChange(this.audio.currentTime);
        });
    }

    onContainer(container) {
        console.log('save container ref');
        this.resolveContainerPromise(container);
    }

    initPeaks(container, audio) {
        console.log('initPeaks');
        if(this.peaks) {
            console.log('destroy peaks');
            this.peaks.destroy();
            this.peaks = null;
        }
        
        const ctx = this.ctx;

        this.peaks = Peaks.init({
            container: container,
            mediaElement: audio,
            audioContext: ctx,
            height: 150,
            zoomWaveformColor: 'rgba(0, 225, 128, 1)',
            playheadColor: '#D62B70'
        });

        this.peaks.on('error', (err) => {
            console.log('peaks had an error', err);
        });

        this.peaks.on('segments.ready', () => {
            console.log('peaks segments ready');
            this.addSegments();
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
        console.log('render ', filePath)
        
        return (
            <div>
                <div id="peaks-container" ref={(container) => { !this.peaks && this.onContainer(container); }}></div>
                <audio ref={(audio) => { !this.peaks && this.onAudio(audio); }}  src={filePath}>
                </audio>
            </div>
        );
    }
}

export default WaveformPeaks;