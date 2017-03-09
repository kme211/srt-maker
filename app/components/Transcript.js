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
                    const itemClass = currentTimingIndex === index ? styles.textBlockSelected : (complete ? styles.textBlockComplete : styles.textBlock);
                    return (
                        <span 
                            key={index} 
                            onClick={setCurrentTimingIndex.bind(null, index)} 
                            className={itemClass}>
                            {block.text}
                        </span>
                    );
                })}
            </ul>
        );
    }
}

export default Transcript;