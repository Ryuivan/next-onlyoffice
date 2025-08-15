/**
 * page.tsx
 *
 * Halaman utama untuk menampilkan OnlyOffice Editor.
 * Mengambil konfigurasi editor berdasarkan parameter `name` di URL,
 * lalu me-render komponen Editor dengan config tersebut.
 */

import { getOnlyOfficeConfig } from './actions';
import Editor from './components/Editor';

interface EditorPageProps {
  /**
   * searchParams berisi query string dari URL.
   * Contoh URL: /editor?name=Document.docx
   */
  searchParams: Promise<{
    name: string;
  }>;
}

const EditorPage = async ({ searchParams }: EditorPageProps) => {
  // Ambil query parameter "name" dari URL
  const { name } = await searchParams;

  // Decode nama file agar karakter seperti spasi (%20) terbaca dengan benar
  const decodedName = decodeURIComponent(name);

  // Ambil konfigurasi OnlyOffice untuk file ini
  // Config ini akan digunakan oleh komponen Editor
  const config = await getOnlyOfficeConfig(decodedName);

  // Render komponen Editor dengan konfigurasi yang sudah diambil
  return <Editor config={config} />;
};

export default EditorPage;
