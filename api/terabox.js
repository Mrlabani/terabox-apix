const axios = require('axios');
const { URL } = require('url');
const stream = require('stream');
const { promisify } = require('util');
const pipe = promisify(stream.pipeline);

const VALID_DOMAINS = [
  'terabox.com', 'nephobox.com', '4funbox.com', 'mirrobox.com',
  'momerybox.com', 'teraboxapp.com', '1024tera.com',
  'terabox.app', 'gibibox.com', 'goaibox.com',
  'terasharelink.com', 'teraboxlink.com', 'terafileshare.com'
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/92.0.4515.159 Mobile Safari/537.36'
};

async function fetchDownloadLink(url) {
  try {
    const parsed = new URL(url);
    const domainValid = VALID_DOMAINS.some(domain => parsed.hostname.includes(domain));
    if (!domainValid) {
      return { status: 'error', message: 'Invalid TeraBox domain', credit: '@Labani' };
    }

    const res = await axios.get(url, { headers, maxRedirects: 5 });
    const finalUrl = res.request.res.responseUrl;
    const surlMatch = finalUrl.match(/surl=([a-zA-Z0-9_-]+)/);
    if (!surlMatch) {
      return { status: 'error', message: 'Could not extract surl', credit: '@Labani' };
    }
    const surl = surlMatch[1];
    const listAPI = `https://www.terabox.com/share/list?app_id=250528&shorturl=${surl}&root=1`;
    const listRes = await axios.get(listAPI, { headers });

    const files = listRes.data.list || [];
    if (files.length === 0) {
      return { status: 'error', message: 'No files found in the folder', credit: '@Labani' };
    }

    const file = files[0];
    const name = file.server_filename;
    const fs_id = file.fs_id;
    const downloadAPI = `https://www.terabox.com/api/fastdownload?app_id=250528&shorturl=${surl}&fs_id=${fs_id}`;
    const downloadRes = await axios.get(downloadAPI, { headers });

    if (!downloadRes.data.urls || downloadRes.data.urls.length === 0) {
      return { status: 'error', message: 'Could not fetch download link', credit: '@Labani' };
    }

    return {
      status: 'success',
      credit: '@Labani',
      filename: name,
      download_url: downloadRes.data.urls[0].url
    };
  } catch (err) {
    return { status: 'error', message: err.message, credit: '@Labani' };
  }
}

module.exports = async (req, res) => {
  let url = req.query.url || (req.body && req.body.url);
  if (!url) {
    return res.status(400).json({ status: 'error', message: 'Missing URL', credit: '@Labani' });
  }

  const result = await fetchDownloadLink(url);

  if (result.status === 'error') {
    return res.status(400).json(result);
  }

  // Proxy the file download
  try {
    const downloadStream = await axios.get(result.download_url, {
      headers: { ...headers, 'Accept-Encoding': 'gzip, deflate, br' },
      responseType: 'stream'
    });

    // Set the content type and filename header
    res.setHeader('Content-Type', downloadStream.headers['content-type']);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);

    // Stream the file to the response
    await pipe(downloadStream.data, res);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Error proxying the download', credit: '@Labani' });
  }
};
