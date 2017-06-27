// @flow
import React, { Component } from 'react';
import styles from './Transcript.css';

class Transcript extends Component {
    props: {
       timing: [{text: string, startTime: string, endTime: string}],
       setCurrentTimingIndex: Function,
       currentTimingIndex: number
    };

    render() {
        const { timing, setCurrentTimingIndex, currentTimingIndex } = this.props;   
        
        return (
            <ul>
                {timing.map((block, index) => {
                    const { startTime, endTime } = block;
                    const complete = startTime !== 'not set' && endTime !== 'not set';
                    const itemClass = currentTimingIndex === index ? styles.textBlockSelected : styles.textBlock;
                    const color = block.color;
                    const inlineStyles = complete ? { background: color, border: `2px solid ${color}` } : {};
                    return (
                        <span 
                            key={index} 
                            onClick={setCurrentTimingIndex.bind(null, index)} 
                            className={itemClass}
                            style={inlineStyles}>
                            {block.text}
                        </span>
                    );
                })}
            </ul>
        );
    }
}

export default Transcript;