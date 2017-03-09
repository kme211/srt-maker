// @flow
import React, { Component } from 'react';
import styles from './GettingStarted.css';

class GettingStarted extends Component {
    props: {
       files: string[],
       currentFileId: string,
       onClick: Function
    };

    render() {
        
        return (
            <div className={styles.gettingStarted}>
                <h1>Welcome!</h1>
                <p>
                    Looks like this is the first time you've used srt maker. First you need to add some audio files by 
                    clicking on the <code>Add audio</code> button in the lower left corner.
                </p>
            </div>
        );
    }
}

export default GettingStarted;