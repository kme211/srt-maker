// @flow
import React, { Component } from 'react';
import Wavesurfer from 'react-wavesurfer';

class Waveform extends Component {
    props: {
       filePath: string,
       pos: number,
       handlePosChange: Function,
       playing: boolean
    };

    render() {
        const { filePath, pos, handlePosChange, playing } = this.props;
        
        return (
            <Wavesurfer
                audioFile={filePath}
                pos={pos}
                onPosChange={handlePosChange}
                playing={playing}
            />
        );
    }
}

export default Waveform;