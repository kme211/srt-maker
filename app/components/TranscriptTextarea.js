// @flow
import React, { Component } from 'react';
import styles from './TranscriptTextarea.css';

class TranscriptTextarea extends Component {
    props: {
       value: string,
       onChange: Function
    };

    render() {
        const { value, onChange } = this.props;
        return (
            <textarea 
                className={styles.transcriptTextarea} 
                rows={5} 
                value={value} 
                onChange={onChange} 
                placeholder="Audio transcript..."
            />
        );
    }
}

export default TranscriptTextarea;