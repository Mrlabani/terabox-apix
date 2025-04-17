const axios = require('axios');

module.exports = async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    let netloc = new URL(url).hostname;
    url = url.replace(netloc, '1024terabox.com');
    
    const cookies = "lang=en; ab_ymg_result={\"data\":\"5b4f6e16688d4790d5d09950de4e2d28838bc7d4c6ad0d55bad22851b954d7984ccb8e94a8810e8c76c87cf6f68d5de0d2c7a12bbbcfc424915b25febc81c1f51af206b3ba0878eab79a656fc555831b7d852b246ee1098f5c8829f6e0a803ba3415bd3d68f3cad40d925567175e876c12aca6a7d9b6d558c77d669731805555\"; _ga_06ZNKL8C2E=GS1.1.1743909487.1.0.1743909494.53.0.0; ndut_fmt=B7BCF8A31186C8E16295CE3B1F139D1F3861794754FA9564D663D0E69979740A; ndus=YQhUH3CteHui19ddq22TnR9As3IFgLrtB2u-Eo_X; _ga=GA1.1.125440866.1743909487; ab_sr=1.0.1_YzA4NTcyODQyMjVhZGFhMTg3NDQzNTVjZTkzNjRjYzEzZDFjY2VjZjNlOTBjNjI1ZGM5N2ZiNzU5YmM3OTA2MmUyZjQ3YzNkZmU1NDMzNmNjOGEwZDllZmI0NmU2ZGQ3MmRmM2MyMWQzNzg2ZmY2MzNmNWRmMTY1MjExZWU2Y2MxMTU2YmU0YTk3MzJmY2FkMTZhZGQ0ZGI4MzY4NjM4Mg==; __bid_n=196091a13aa3362f7d4207; __stripe_mid=6118749f-f349-42b5-9eb5-a09372b70524a3b215; __stripe_sid=aef7a7e4-8e21-48b7-bf7f-d734b30d50e0a5744f; browserid=P5LzxPJ5vEebYYgqGFAW8vUmwWd4qRJauy9LPyVWEv1yIAujF57waIr7Et3VFGLbQidzZImuERLJy6d9; csrfToken=P0ebonINBnMofIiJ71uQykoE";

    try {
        let response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/json",
                "Origin": "https://ytshorts.savetube.me",
                "Alt-Used": "ytshorts.savetube.me",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "Cookie": cookies // Add cookies here
            }
        });
        
        if (response.status !== 200) return res.status(500).json({ error: 'Error fetching data' });

        return res.status(200).json({ data: response.data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
