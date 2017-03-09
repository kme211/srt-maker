// @flow
import React, { Component } from 'react';
import styles from './AudioList.css';

class AudioList extends Component {
    props: {
       files: string[],
       currentFileId: string,
       onClick: Function
    };

    render() {
        const { files, onClick, currentFileId } = this.props;
        
        return (
            <ul className={styles.list}>
                {files.map((file, index) => {
                    const itemStyles = currentFileId === file.id ? styles.listItemSelected : styles.listItem;
                    const complete = file.timing.length ? file.timing.every(block => block.startTime !== 'not set' && block.endTime !== 'not set') : false;
                    return (
                        <li 
                            key={index} 
                            className={itemStyles} 
                            onClick={onClick.bind(null, file.id)}>
                            
                            {file.filePath.split('\\').pop()}
                            {complete && <i className="fa fa-check" aria-hidden="true"></i>}
                        </li>
                    )
                })}
            </ul>
        );
    }
}

export default AudioList;