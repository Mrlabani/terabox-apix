const axios = require('axios');
const { URL } = require('url');

const VALID_DOMAINS = [
  'terabox.com', 'nephobox.com', '4funbox.com', 'mirrobox.com',
  'momerybox.com', 'teraboxapp.com', '1024tera.com',
  'terabox.app', 'gibibox.com', 'goaibox.com',
  'terasharelink.com', 'teraboxlink.com', 'terafileshare.com'
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/92.0.4515.159 Mobile Safari/537.36'
};

async function getDirectLink(url) {
  try {
    const parsed = new URL(url);
    const domainValid = VALID_DOMAINS.some(domain => parsed.hostname.includes(domain));
    if (!domainValid) {
      return { status: 'error', message: 'Invalid TeraBox domain', credit: '@Labani' };
    }

    // Try to follow redirect to get surl
    const res = await axios.get(url, { headers, maxRedirects: 5 });
    const realUrl = res.request.res.responseUrl;
    const surlMatch = realUrl.match(/surl=([a-zA-Z0-9_-]+)/);

    if (!surlMatch) {
      return { status: 'error', message: 'Could not extract surl', credit: '@Labani' };
    }

    const surl = surlMatch[1];
    const apiUrl = `https://www.terabox.com/share/list?app_id=250528&shorturl=${surl}&root=1`;
    const meta = await axios.get(apiUrl, { headers });

    if (!meta.data.list || meta.data.list.length === 0) {
      return { status: 'error', message: 'No files found', credit: '@Labani' };
    }

    const files = meta.data.list.map(file => ({
      name: file.server_filename,
      size: file.size,
      fs_id: file.fs_id
    }));

    return {
      status: 'success',
      credit: '@Labani',
      surl,
      files
    };

  } catch (err) {
    return { status: 'error', message: err.message, credit: '@Labani' };
  }
}

module.exports = async (req, res) => {
  let url = null;

  if (req.method === 'POST') {
    url = req.body.url;
  } else if (req.method === 'GET') {
    url = req.query.url;
  } else {
    return res.status(405).json({ status: 'error', message: 'Only GET and POST allowed', credit: '@Labani' });
  }

  if (!url) {
    return res.status(400).json({ status: 'error', message: 'Missing URL', credit: '@Labani' });
  }

  const result = await getDirectLink(url);
  res.status(result.status === 'success' ? 200 : 400).json(result);
};
