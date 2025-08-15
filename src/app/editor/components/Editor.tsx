/**
 * Editor.tsx
 *
 * Komponen wrapper untuk OnlyOffice Document Editor di React.
 * Digunakan untuk menampilkan dan mengedit dokumen menggunakan server OnlyOffice.
 */

"use client";

import { DocumentEditor } from "@onlyoffice/document-editor-react";

interface EditorProps {
  /**
   * Konfigurasi untuk OnlyOffice Document Editor.
   * Format config mengikuti dokumentasi resmi:
   * https://api.onlyoffice.com/editors/config
   */
  config: any;
}

const Editor = ({ config }: EditorProps) => {
  /**
   * Event yang dipanggil ketika dokumen sudah siap di-load di editor.
   * Bisa digunakan untuk inisialisasi, logging, atau panggilan API tambahan.
   */
  const onDocumentReady = async () => {
    // Akses instance editor melalui window.DocEditor
    const documentEditor = window.DocEditor?.instances?.["docxEditor"];

    if (documentEditor) {
      try {
        console.log("Editor is ready");
        // Di sini bisa ditambahkan logika lain seperti
        // pengambilan metadata file atau penyesuaian UI.
      } catch (error) {
        console.error(`Error retrieving file metadata: ${error}`);
      }
    }
  };

  /**
   * Event handler jika terjadi error saat memuat komponen editor.
   * Biasanya error ini terkait koneksi ke document server OnlyOffice.
   */
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
        id="docxEditor" // ID unik untuk instance editor
        documentServerUrl="http://localhost:8080" // URL ke Document Server OnlyOffice
        config={config} // Config editor
        events_onDocumentReady={onDocumentReady} // Event: dokumen siap
        onLoadComponentError={onLoadComponentError} // Event: gagal load
        width="100%" // Lebar penuh
        type="desktop" // Mode desktop (bisa diganti 'mobile' untuk tampilan mobile)
      />
    </div>
  );
};

export default Editor;
