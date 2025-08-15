"use client";

import { DocumentEditor } from "@onlyoffice/document-editor-react";

interface EditorProps {
  config: any;
}

const Editor = ({ config }: EditorProps) => {
  const onDocumentReady = async () => {
    const documentEditor = window.DocEditor?.instances?.["docxEditor"];

    if (documentEditor) {
      try {
        console.log("Editor is ready");
      } catch (error) {
        console.error(`Error retrieving file metadata: ${error}`);
      }
    }
  };

  const onLoadComponentError = (
    errorCode: number,
    errorDescription: string
  ) => {
    console.error(
      `Error loading component (${errorCode}): ${errorDescription}`
    );
  };

  return (
    <div className="min-h-screen min-w-screen h-screen w-screen">
      <DocumentEditor
        id="docxEditor"
        documentServerUrl="http://localhost:8080"
        config={config}
        events_onDocumentReady={onDocumentReady}
        onLoadComponentError={onLoadComponentError}
        width="100%"
        type="desktop"
      />
    </div>
  );
};

export default Editor;
