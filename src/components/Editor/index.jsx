/* eslint-disable import/no-extraneous-dependencies */
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Editor as DraftEditor } from 'react-draft-wysiwyg';
import {
  ContentState,
  convertToRaw,
  convertFromHTML,
  convertFromRaw,
  EditorState,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import './style.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export const stateFromRaw = (raw) => EditorState.createWithContent(convertFromRaw(raw));
export const stateFromHtml = (raw) => {
  const { contentBlocks, entityMap } = convertFromHTML(raw);
  const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
  return EditorState.createWithContent(contentState);
};
export const stateToRaw = (state) => convertToRaw(state.getCurrentContent());
export const stateToHtml = (state) => draftToHtml(convertToRaw(state.getCurrentContent()));

const Editor = ({
  initialState,
  onChange,
}) => {
  const [value, setValue] = useState(initialState || EditorState.createEmpty());

  // function for show the plain html and save editorState
  const handleChange = useCallback((editorState) => {
    setValue(editorState);
    if (onChange) {
      onChange(editorState);
    }
  }, []);

  return (
    <DraftEditor
      readOnly={!onChange}
      editorState={value}
      editorClassName="h-full w-full px-5 pb-5 cursor-text overflow-auto"
      onEditorStateChange={handleChange}
    />
  );
};

Editor.propTypes = {
  initialState: PropTypes.instanceOf(EditorState),
  onChange: PropTypes.func,
};

Editor.defaultProps = {
  initialState: null,
  onChange: null,
};

export default Editor;
