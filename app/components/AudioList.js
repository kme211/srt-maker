// @flow
import React, { Component } from 'react';
import styles from './AudioList.css';
import ScrollArea from 'react-scrollbar';

class AudioList extends Component {
    props: {
       files: string[],
       currentFileId: string,
       onClick: Function
    };

    render() {
        const { files, onClick, currentFileId } = this.props;
        
        return (
            <ScrollArea
                speed={0.8}
                className={styles.audioFiles}
                horizontal={false}
                >
                <h3>Audio files <span>({files.length})</span></h3>
                <ul>
                    {files.map((file, index) => {
                        const itemStyles = currentFileId === file.id ? styles.listItemSelected : styles.listItem;
                        const complete = file.timing.length ? file.timing.every(block => block.startTime !== 'not set' && block.endTime !== 'not set') : false;
                        const sep = file.filePath.match('\\\\') ? '\\' : '/';
                        const fileName = file.filePath.split(sep).pop();
                        return (
                            <li 
                                key={index} 
                                className={itemStyles} 
                                onClick={onClick.bind(null, file.id)}>
                                
                                {fileName}
                                {complete && <i className="fa fa-check" aria-hidden="true"></i>}
                            </li>
                        )
                    })}
                </ul>
            </ScrollArea>
        );
    }
}

export default AudioList;