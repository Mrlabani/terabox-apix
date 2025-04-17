import axios from "axios";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.includes("/s/")) {
    return res.status(400).json({ error: "Missing or invalid Terabox URL" });
  }

  try {
    const shorturl = url.match(/\/s\/([a-zA-Z0-9]+)/)[1];

    const infoRes = await axios.get(
      "https://api.terabox.com/rest/2.0/share/linkinfo",
      {
        params: {
          method: "linkinfo",
          shorturl,
          app_id: "250528",
        },
        headers: {
          "User-Agent": USER_AGENT,
        },
      }
    );

    const file = infoRes.data?.list?.[0];
    if (!file) throw new Error("No file found");

    const { path, uk, shareid } = file;

    const downloadRes = await axios.get(
      "https://api.terabox.com/rest/2.0/share/download",
      {
        params: {
          app_id: "250528",
          method: "locatedownload",
          path,
          uk,
          shareid,
        },
        headers: {
          "User-Agent": USER_AGENT,
        },
      }
    );

    const dlink = downloadRes.data?.list?.[0]?.dlink;
    if (!dlink) throw new Error("Failed to get download link");

    return res.status(200).json({
      filename: file.server_filename,
      size: file.size,
      download: dlink,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}
