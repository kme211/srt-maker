// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.css';
import { ipcRenderer } from 'electron';
import AudioList from './AudioList';

class Home extends Component {
  props: {
    addFiles: () => void,
    files: array
  };

  constructor(props) {
    super(props);

    this.openDialog = this.openDialog.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('mp3-selected', (event, fileNames) => {
      console.log('mp3-selected', event, fileNames)
      if(fileNames) this.props.addFiles(fileNames)
    });
  }

  openDialog() {
    console.log('openDialog');
    ipcRenderer.send('add-mp3');
  }

  render() {
    return (
      <div>
        <div className={styles.container} data-tid="container">
          

          <div className={styles.main}>
            <header className={styles.header}>
              <h2>srt maker</h2>
            </header>
            <div className={styles.leftBar}>
              <h3>Audio</h3>
              {this.props.files.length && <AudioList files={this.props.files} />}
            </div>

            <div className={styles.editor}>
              Nothing selected
            </div>

            <div className={styles.bottomBar}>
                <button className="btn btn-default" onClick={this.openDialog}>Add audio</button>
            </div>
          </div>

          
          
        </div>
        
      </div>
    );
  }
}

export default Home;