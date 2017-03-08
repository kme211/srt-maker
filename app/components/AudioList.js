// @flow
import React, { Component } from 'react';
import styles from './AudioList.css';

class AudioList extends Component {
    props: {
       files: string[]
    };

    render() {
        const { files } = this.props;
        return (
            <ul className={styles.list}>
                {files.map((file, index) => <li key={index} className={styles.listItem}>{file.filePath.split('\\').pop()}</li>)}
            </ul>
        );
    }
}

export default AudioList;