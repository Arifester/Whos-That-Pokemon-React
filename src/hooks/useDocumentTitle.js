// src/hooks/useDocumentTitle.js
import { useEffect } from 'react';

function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]); // Efek akan berjalan kembali jika judulnya berubah
}

export default useDocumentTitle;
