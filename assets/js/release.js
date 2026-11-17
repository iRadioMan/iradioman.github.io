(() => {
  const API = 'https://api.github.com/repos/iRadioMan/CryptoLite/releases?per_page=1';
  const FALLBACK = 'https://github.com/iRadioMan/CryptoLite/releases';
  const formats = [
    { key: 'exe', test: /\.exe$/i },
    { key: 'appimage', test: /\.AppImage$/i },
    { key: 'deb', test: /\.deb$/i },
  ];

  const formatSize = (bytes) => {
    if (!Number.isFinite(bytes)) return '';
    const mb = bytes / 1024 / 1024;
    return `${mb.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} МБ`;
  };

  fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((releases) => {
      const release = Array.isArray(releases) ? releases[0] : null;
      if (!release || !Array.isArray(release.assets)) return;

      for (const format of formats) {
        const asset = release.assets.find((item) => format.test.test(item.name));
        const link = document.querySelector(`[data-download="${format.key}"]`);
        if (link) link.href = asset ? asset.browser_download_url : FALLBACK;
        const size = document.querySelector(`[data-size="${format.key}"]`);
        if (size) size.textContent = asset ? formatSize(asset.size) : '—';
      }

      const version = document.querySelector('[data-release-version]');
      if (version && release.tag_name) {
        version.textContent = release.tag_name
          .replace(/^v/, '')
          .replace(/-alpha$/i, ' (alpha)');
      }
    })
    .catch(() => {
      // Статические ссылки на 0.7.11 остаются рабочими.
    });
})();
