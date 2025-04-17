// File: api/terabox.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || !url.includes("terabox.com/s/")) {
    return res.status(400).json({ error: 'Invalid Terabox share URL' });
  }

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0',
      'Referer': url,
    };

    const shareRes = await fetch(url, { headers });
    const html = await shareRes.text();

    const uk = html.match(/uk\s*=\s*"(\d+)"/)[1];
    const shareid = html.match(/shareid\s*=\s*"(\d+)"/)[1];
    const sign = html.match(/sign\s*=\s*"([a-zA-Z0-9]+)"/)[1];
    const timestamp = html.match(/timestamp\s*=\s*"(\d+)"/)[1];
    const fsid = html.match(/fs_id\":(\d+)/)[1];

    const downloadUrl = `https://data.terabox.com/rest/2.0/share/download?method=locatedownload&app_id=250528&shareid=${shareid}&uk=${uk}&sign=${sign}&timestamp=${timestamp}&fid_list=[${fsid}]`;

    const apiRes = await fetch(downloadUrl, { headers });
    const data = await apiRes.json();

    if (data?.list?.[0]?.dlink) {
      return res.status(200).json({ direct_link: data.list[0].dlink });
    } else {
      return res.status(500).json({ error: 'Failed to fetch download link', response: data });
    }

  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
}
