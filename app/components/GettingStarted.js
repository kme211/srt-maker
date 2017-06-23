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
                    Add some audio files by 
                    clicking on the <code>Add audio</code> button in the lower left corner.
                </p>
            </div>
        );
    }
}

export default GettingStarted;