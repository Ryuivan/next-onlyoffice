import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <Link
        href={`/editor?name=${encodeURIComponent(
          "Document_Approval_System.docx"
        )}`}
      >
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Edit docx file
        </button>
      </Link>

      <Link
        href={`/editor?name=${encodeURIComponent(
          "1750127979386-[DRAFT V3] URS RIM.pdf"
        )}`}
      >
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          View pdf file
        </button>
      </Link>

      <Link href={`/editor?name=${encodeURIComponent("test_amp.xlsx")}`}>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Edit xlsx file
        </button>
      </Link>

      <Link href={`/editor?name=${encodeURIComponent("test.pptx")}`}>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Edit pptx file
        </button>
      </Link>
    </div>
  );
}
