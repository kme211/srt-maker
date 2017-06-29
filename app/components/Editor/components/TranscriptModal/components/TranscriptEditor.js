// @flow
import React, { Component } from 'react';
import styles from './TranscriptEditor.css';
import cuid from 'cuid';

class TranscriptEditor extends Component {
  props: {
    transcript: string,
    updateTempTiming: Function,
    tempTiming: string[]
  };

  constructor(props) {
    super(props);

    this.addBlock = this.addBlock.bind(this);
    this.removeBlock = this.removeBlock.bind(this);
    this.updateBlock = this.updateBlock.bind(this);
  }

  componentDidMount() {
    const { tempTiming, transcript, updateTempTiming } = this.props;
    if (tempTiming.length) return; // don't run rest of function if user is editing transcript
    const textArr = transcript.match(/[^\.!\?]+[\.!\?]+/g) || [transcript];
    const timing = textArr.map(text => ({
      text,
      id: cuid()
    }));
    this.props.updateTempTiming(timing);
  }

  addBlock(e) {
    const id: string = e.target.dataset.id;
    const { tempTiming, updateTempTiming } = this.props;
    const index: number = tempTiming.findIndex(block => block.id === id);
    const newTiming = [
      ...tempTiming.slice(0, index + 1),
      { text: '', id: cuid() },
      ...tempTiming.slice(index + 1)
    ];
    updateTempTiming(newTiming);
  }

  removeBlock(e) {
    const id: string = e.target.dataset.id;
    const { tempTiming, updateTempTiming } = this.props;
    const index: number = tempTiming.findIndex(block => block.id === id);
    const newTiming = [
      ...tempTiming.slice(0, index),
      ...tempTiming.slice(index + 1)
    ];
    updateTempTiming(newTiming);
  }

  updateBlock(e) {
    const id: string = e.target.dataset.id;
    const newText: string = e.target.value;
    const { tempTiming, updateTempTiming } = this.props;
    const index: number = tempTiming.findIndex(block => block.id === id);
    const block = tempTiming[index];
    const newTiming = [
      ...tempTiming.slice(0, index),
      Object.assign({}, block, { text: newText }),
      ...tempTiming.slice(index + 1)
    ];
    updateTempTiming(newTiming);
  }

  render() {
    const { tempTiming, updateTempTiming } = this.props;
    return (
      <div className={styles.transcriptEditor}>
        {tempTiming.length > 0 &&
          tempTiming.map((block, index) => (
            <div className={styles.row} key={index}>
              <textarea
                value={block.text}
                rows={2}
                className={styles.textBlock}
                data-id={block.id}
                onChange={this.updateBlock}
              />
              <button
                className={styles.addButton}
                onClick={this.addBlock}
                data-id={block.id}
              >
                <div>+</div> Add block after
                </button>
              <button
                className={styles.removeButton}
                onClick={this.removeBlock}
                data-id={block.id}
              >
                <div>-</div> Remove block
                </button>
            </div>
            ))}
      </div>
    );
  }
}

export default TranscriptEditor;
