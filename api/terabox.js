const axios = require('axios');
const { URL } = require('url');

// Check if URL matches any of the given patterns
function checkUrlPatterns(url) {
    const patterns = [
        /ww\.mirrobox\.com/,
        /www\.nephobox\.com/,
        /freeterabox\.com/,
        /www\.freeterabox\.com/,
        /1024tera\.com/,
        /4funbox\.co/,
        /www\.4funbox\.com/,
        /mirrobox\.com/,
        /nephobox\.com/,
        /terabox\.app/,
        /terabox\.com/,
        /www\.terabox\.ap/,
        /www\.terabox\.com/,
        /www\.1024tera\.co/,
        /www\.momerybox\.com/,
        /teraboxapp\.com/,
        /momerybox\.com/,
        /tibibox\.com/,
        /www\.tibibox\.com/,
        /www\.teraboxapp\.com/
    ];

    return patterns.some(pattern => pattern.test(url));
}

// Extract URLs from a given string
function getUrlsFromString(string) {
    const pattern = /https?:\/\/\S+/g;
    const urls = [...string.match(pattern) || []].filter(url => checkUrlPatterns(url));
    return urls.length > 0 ? urls[0] : [];
}

// Find the text between two strings
function findBetween(data, first, last) {
    const startIdx = data.indexOf(first);
    if (startIdx === -1) return null;
    const endIdx = data.indexOf(last, startIdx + first.length);
    return endIdx === -1 ? null : data.substring(startIdx + first.length, endIdx);
}

// Extract the "surl" parameter from the URL
function extractSurlFromUrl(url) {
    const parsedUrl = new URL(url);
    const surl = parsedUrl.searchParams.get('surl');
    return surl || false;
}

// Get data from the URL
async function getData(url) {
    let netloc = new URL(url).hostname;
    url = url.replace(netloc, '1024terabox.com');
    
    try {
        let response = await axios.get(url);
        if (response.status !== 200) return false;
        
        const defaultThumbnail = findBetween(response.data, 'og:image" content="', '"');
        
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "Origin": "https://ytshorts.savetube.me",
            "Alt-Used": "ytshorts.savetube.me",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        };
        
        response = await axios.post('https://ytshorts.savetube.me/api/v1/terabox-downloader', {
            url: url
        }, { headers });

        if (response.status !== 200) return false;
        
        const responses = response.data.response || [];
        if (responses.length === 0) return false;
        
        const resolutions = responses[0].resolutions || {};
        const download = resolutions['Fast Download'] || '';
        const video = resolutions['HD Video'] || '';
        
        response = await axios.head(video);
        const contentLength = response.headers['content-length'] || 0;
        
        let fname = null;
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const match = /filename="(.+)"/.exec(contentDisposition);
            fname = match ? match[1] : null;
        }
        
        response = await axios.head(download);
        const directLink = response.headers['location'];
        
        return {
            file_name: fname || null,
            link: video || null,
            direct_link: directLink || download || null,
            thumb: defaultThumbnail || null,
            size: contentLength ? getFormattedSize(parseInt(contentLength)) : null,
            sizebytes: contentLength ? parseInt(contentLength) : null
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return false;
    }
}

// Convert size to a human-readable format
function getFormattedSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

// Define API endpoint
module.exports = async (req, res) => {
    const { url } = req.query;
    
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    const data = await getData(url);

    if (!data) {
        return res.status(500).json({ error: 'Failed to retrieve data for the given URL' });
    }

    res.json(data);
};
