import React, { useRef, useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import Swal from 'sweetalert2';

const EditorWithFormatting = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const editorRef = useRef(null); // Ensure this is used correctly

  const customStyleMap = {
    RED: { color: "red" },
  };

  useEffect(() => {
    const savedData = localStorage.getItem("editorContent");
    if (savedData) {
      const contentState = convertFromRaw(JSON.parse(savedData));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    localStorage.setItem(
      "editorContent",
      JSON.stringify(convertToRaw(contentState))
    );
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Content saved successfully!',
    });
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleBeforeInput = (chars, editorState) => {
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey(blockKey);
    const blockText = block.getText();

    if (blockText === "#" && chars === " ") {
      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        "" // Replace with empty string
      );
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );
      setEditorState(transformBlock(newEditorState, "header-two"));
      return "handled";
    }
    if (blockText === "*" && chars === " ") {
      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        ""
      );
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );
      setEditorState(transformBlock(newEditorState, "BOLD"));
      return "handled";
    }
    if (blockText === "**" && chars === " ") {
      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        ""
      );
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );
      setEditorState(transformBlock(newEditorState, "RED"));
      return "handled";
    }
    if (blockText === "***" && chars === " ") {
      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        ""
      );
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );
      setEditorState(transformBlock(newEditorState, "UNDERLINE"));
      return "handled";
    }
    return "not-handled";
  };

  const transformBlock = (editorState, style) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    // Step 1: Remove all inline styles
    const currentStyle = editorState.getCurrentInlineStyle();
    let newEditorState = currentStyle.reduce((state, style) => {
      return RichUtils.toggleInlineStyle(state, style);
    }, editorState);

    // Step 2: Reset block type
    newEditorState = RichUtils.toggleBlockType(newEditorState, "unstyled");

    // Step 3: Apply the desired style
    switch (style) {
      case "header-two":
        newEditorState = RichUtils.toggleBlockType(
          newEditorState,
          "header-two"
        );
        break;
      case "BOLD":
        newEditorState = RichUtils.toggleInlineStyle(newEditorState, "BOLD");
        break;
      case "RED":
        newEditorState = RichUtils.toggleInlineStyle(newEditorState, "RED");
        break;
      case "UNDERLINE":
        newEditorState = RichUtils.toggleInlineStyle(
          newEditorState,
          "UNDERLINE"
        );
        break;
      default:
        break;
    }

    return newEditorState;
  };

  return (
    <>
      <h3 style={{ margin: "20px", fontWeight: "600", textAlign: "center" }}>
        Demo editor by Vanika
      </h3>

      <div
        style={{
          border: "1px solid #007BFF",
          padding: "15px",
          minHeight: "300px",
          cursor: "text",
          margin: "20px",
          position: "relative", // Add this
        }}
        onClick={() => editorRef.current.focus()}
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={customStyleMap}
        />
        <button
          onClick={handleSave}
          style={{
            position: "absolute", // Make it fixed inside parent
            bottom: "10px", // Fixed distance from bottom
            right: "10px", // Fixed distance from right
            padding: "5px 15px",
            fontSize: "14px",
            border: "1px 5px 3px 1px solid #000",
            background: "white",
            cursor: "pointer",
            borderRadius: "0px",
            boxShadow: "3px 3px rgba(0, 0, 0, 1)",
          }}
        >
          Save
        </button>
      </div>
    </>
  );
};

export default EditorWithFormatting;
