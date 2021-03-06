// @flow
import React, { Component } from 'react';
import styles from './AudioList.css';
import ScrollArea from 'react-scrollbar';
import Icon from './Icon';

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
                {!files.length && <div className={styles.emptyState}>No audio added yet!</div>}
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
                                {complete && <Icon style={{marginLeft: '4px'}} icon="checkmark" aria-hidden="true"/>}
                            </li>
                        )
                    })}
                </ul>
            </ScrollArea>
        );
    }
}

export default AudioList;