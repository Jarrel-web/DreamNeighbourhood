import dotenv from 'dotenv';
dotenv.config();
const curl = require('curlrequest');

const url = "https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1";
export const access_key = process.env.URA_ACCESS_KEY;
let token = null;

export const getUraToken = async () => {
    return new Promise((resolve, reject) => {
        if (token) {
            console.log("Returning cached URA token");
            resolve(token);
            next();
            return;
        }

        curl.request({
            url: url,
            method: 'GET',
            headers: {
                'AccessKey': access_key
            }
    }, function (err, stdout) {
        if (err) {
            console.error("Request failed:", err);
            reject(err);
        }

        const response = JSON.parse(stdout);
        token = response.Result;
        resolve(token);
        next();
        });
    })
}
