const axios = require("axios");
const https = require("https-proxy-agent");
const proxies = require("./proxy.json");
const url = "https://voting.playbuzz.com/poll/";

const data = {
    questionId: "",
    resultId: "",
    sectionId: ""
};

const vote = async () => {
    let index= Math.floor(Math.random() * proxies.proxies.length);
    for (; ;) {
        const proxyObj = proxies.proxies[ index ];
        let proxy = `http://${proxyObj.ip}:proxyObj.port`;
        let agent = new https(proxy);

          let source = axios.CancelToken.source();
          setTimeout(() => {
              source.cancel();
              // Timeout Logic
          }, 10000);
        
        let config = {
            url: url,
            data: data,
            method: "POST",
            proxy: {
                host: proxyObj.ip,
                port: proxyObj.port
            },
            "content-type": "application/json",
            cancelToken: source.token
        };

        try {
            const response = await axios(config);
            let results = JSON.parse(response.data);
            console.log("Choice 1", results[ "" ]);
            console.log("Choice 2", results[ "" ]);
        } catch (error) {
            console.log(error);
            index = Math.floor(Math.random() * proxies.proxies.length);
        }
    }
};

for (let i = 0; i < 100; i++){
    vote().then();
}
